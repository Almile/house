import * as Location from "expo-location";
import { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../database/supabase";
import { MaterialIcons } from "@expo/vector-icons";

export default function CadastroLocal() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [endereco, setEndereco] = useState("");
  const [comodos, setComodos] = useState("");
  const [planta, setPlanta] = useState(null);
  const [visitas, setVisitas] = useState("");
  const [localizacao, setLocalizacao] = useState(null);

  const { fotos } = useLocalSearchParams();
  const listaFotos = fotos ? JSON.parse(fotos) : [];

  async function obterLocalizacao() {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (granted) {
      const posicao = await Location.getCurrentPositionAsync();
      setLocalizacao(posicao.coords);
    }
  }

  async function selecionarPlanta() {
    const resultado = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
    });

    if (!resultado.canceled) {
      setPlanta(resultado.assets[0]);
    }
  }

  async function salvarFormulario() {
    const dados = {
      titulo,
      descricao,
      preco,
      endereco,
      comodos,
      visitas,
      planta,
      localizacao,
    };
    await AsyncStorage.setItem("cadastro_imovel", JSON.stringify(dados));
  }

  async function carregarFormulario() {
    const dadosSalvos = await AsyncStorage.getItem("cadastro_imovel");
    if (!dadosSalvos) return;

    const dados = JSON.parse(dadosSalvos);
    setTitulo(dados.titulo || "");
    setDescricao(dados.descricao || "");
    setPreco(dados.preco || "");
    setEndereco(dados.endereco || "");
    setComodos(dados.comodos || "");
    setVisitas(dados.visitas || "");
    setPlanta(dados.planta || null);
    setLocalizacao(dados.localizacao || null);
  }

  useEffect(() => {
    carregarFormulario();
  }, []);

  async function cadastrarProduto() {
    if (!titulo.trim() || !descricao.trim() || !preco.trim()) {
      alert("Preencha título, descrição e preço.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Usuário não autenticado.");
      return;
    }

    const precoNumero = parseFloat(preco.replace(",", "."));
    if (isNaN(precoNumero)) {
      alert("Preço inválido.");
      return;
    }

    const { error } = await supabase.from("imoveis").insert([
      {
        proprietario_id: user.id,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        preco: precoNumero,
        endereco: endereco.trim(),
        comodos: comodos.trim(),
        visitas_disponiveis: visitas.trim(),
        planta_nome: planta?.name || null,
        planta_uri: planta?.uri || null,
        fotos: listaFotos,
        latitude: localizacao?.latitude ?? null,
        longitude: localizacao?.longitude ?? null,
      },
    ]);

    if (error) {
      console.log("Erro ao cadastrar imóvel:", error.message);
      alert("Erro ao cadastrar imóvel.");
      return;
    }

    alert("Imóvel cadastrado com sucesso!");
    setTitulo("");
    setDescricao("");
    setPreco("");
    setEndereco("");
    setComodos("");
    setVisitas("");
    setPlanta(null);
    setLocalizacao(null);
    await AsyncStorage.removeItem("cadastro_imovel");
    router.replace("/proprietario/dashboard");
  }

  return (
    <ScrollView style={styles.background} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Text style={styles.tituloPagina}>Anunciar Novo Imóvel</Text>

        <TextInput
          style={styles.input}
          placeholder="Título do imóvel (ex: Apartamento Vista Mar)"
          placeholderTextColor="#A0AAB5"
          value={titulo}
          onChangeText={setTitulo}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descrição detalhada do imóvel"
          placeholderTextColor="#A0AAB5"
          value={descricao}
          onChangeText={setDescricao}
          multiline
          textAlignVertical="top"
        />

        <TextInput
          style={styles.input}
          placeholder="Preço (Ex: 450000)"
          placeholderTextColor="#A0AAB5"
          value={preco}
          onChangeText={setPreco}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Endereço Completo"
          placeholderTextColor="#A0AAB5"
          value={endereco}
          onChangeText={setEndereco}
        />

        <TouchableOpacity
          style={styles.botaoSecundario}
          onPress={obterLocalizacao}
        >
          <MaterialIcons name="my-location" size={20} color="#1B263B" />
          <Text style={styles.textoBotaoSecundario}>
            Obter Localização por GPS
          </Text>
        </TouchableOpacity>

        {localizacao && (
          <View style={styles.badgeLocalizacao}>
            <MaterialIcons name="check-circle" size={16} color="#E76F51" />
            <Text style={styles.textoLocalizacao}>
              Coordenadas registradas com sucesso
            </Text>
          </View>
        )}

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={
            "Cômodos e características:\n" +
            "- 3 quartos\n" +
            "- 2 banheiros\n" +
            "- 120 m²\n" +
            "- Piscina"
          }
          placeholderTextColor="#A0AAB5"
          value={comodos}
          onChangeText={setComodos}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={styles.botaoSecundario}
          onPress={selecionarPlanta}
        >
          <MaterialIcons name="architecture" size={20} color="#1B263B" />
          <Text style={styles.textoBotaoSecundario}>
            {planta
              ? `Planta: ${planta.name}`
              : "Selecionar Planta (Imagem ou PDF)"}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={
            "Datas e horários disponíveis para visitas:\n" +
            "10/06/2026 - 14:00\n" +
            "11/06/2026 - 09:30"
          }
          placeholderTextColor="#A0AAB5"
          value={visitas}
          onChangeText={setVisitas}
          multiline
          textAlignVertical="top"
        />

        {/* Adicionar Fotos */}
        <TouchableOpacity
          style={styles.botaoSecundario}
          onPress={async () => {
            await salvarFormulario();
            router.push({
              pathname: "/proprietario/recursos",
              params: { fotos: JSON.stringify(listaFotos) },
            });
          }}
        >
          <MaterialIcons name="collections" size={20} color="#1B263B" />
          <Text style={styles.textoBotaoSecundario}>
            {listaFotos.length > 0
              ? `${listaFotos.length} foto(s) adicionada(s)`
              : "Adicionar Fotos da Galeria"}
          </Text>
        </TouchableOpacity>

        {listaFotos.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.carrosselFotos}
          >
            {listaFotos.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.fotoThumb} />
            ))}
          </ScrollView>
        )}

        <TouchableOpacity
          style={styles.botaoPrincipal}
          onPress={cadastrarProduto}
        >
          <Text style={styles.textoBranco}>Cadastrar Imóvel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  container: {
    padding: 24,
    gap: 16,
  },
  tituloPagina: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B263B",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    padding: 16,
    fontSize: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
    color: "#333",
  },
  textArea: {
    minHeight: 110,
  },
  botaoSecundario: {
    flexDirection: "row",
    width: "100%",
    padding: 16,
    borderWidth: 1,
    borderColor: "#1B263B",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF1F5",
    gap: 8,
  },
  textoBotaoSecundario: {
    color: "#1B263B",
    fontWeight: "600",
    fontSize: 15,
  },
  badgeLocalizacao: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF0ED",
    padding: 12,
    borderRadius: 8,
    gap: 6,
    marginTop: -4,
  },
  textoLocalizacao: {
    color: "#E76F51",
    fontSize: 14,
    fontWeight: "500",
  },
  carrosselFotos: {
    marginTop: 4,
    flexDirection: "row",
  },
  fotoThumb: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  botaoPrincipal: {
    width: "100%",
    backgroundColor: "#1B263B",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    padding: 18,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  textoBranco: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
