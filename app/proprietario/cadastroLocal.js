import * as Location from "expo-location";
import { useState,useEffect} from "react";
import {
  Button,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  TextInput,
  Image,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Adicione no topo do arquivo

import { supabase } from '../../database/supabase';
export default function CadastroLocal() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [endereco, setEndereco] = useState("");

  const [comodos, setComodos] = useState(""); // texto livre
  const [planta, setPlanta] = useState(null); // arquivo da planta
  const [visitas, setVisitas] = useState(""); // datas e horários em texto
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

        // Campos simplificados em texto
        comodos: comodos.trim(),
        visitas_disponiveis: visitas.trim(),

        // Arquivo da planta
        planta_nome: planta?.name || null,
        planta_uri: planta?.uri || null,

        // Fotos tiradas pela câmera
        fotos: listaFotos,

        // Geolocalização
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

    // Limpar formulário
    setTitulo("");
    setDescricao("");
    setPreco("");
    setEndereco("");
    setComodos("");
    setVisitas("");
    setPlanta(null);
    setLocalizacao(null);
    await AsyncStorage.removeItem("cadastro_imovel");
    // Redirecionar
    router.replace("/proprietario/dashboard");
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Título do imóvel"
          value={titulo}
          onChangeText={setTitulo}
        />

        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          placeholder="Descrição do imóvel"
          value={descricao}
          onChangeText={setDescricao}
          multiline
        />

        <TextInput
          style={styles.input}
          placeholder="Preço"
          value={preco}
          onChangeText={setPreco}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Endereço"
          value={endereco}
          onChangeText={setEndereco}
        />

        <TouchableOpacity
          style={styles.botaoSecundario}
          onPress={obterLocalizacao}
        >
          <Text>Obter Localização</Text>
        </TouchableOpacity>

        {localizacao && (
          <>
            <Text>Latitude: {localizacao.latitude}</Text>

            <Text>Longitude: {localizacao.longitude}</Text>
          </>
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
          value={comodos}
          onChangeText={setComodos}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={styles.botaoSecundario}
          onPress={selecionarPlanta}
        >
          <Text>
            {planta
              ? `Planta: ${planta.name}`
              : "Selecionar planta (imagem ou PDF)"}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={
            "Datas e horários disponíveis para visitas:\n" +
            "10/06/2026 - 14:00\n" +
            "11/06/2026 - 09:30\n" +
            "12/06/2026 - 16:00"
          }
          value={visitas}
          onChangeText={setVisitas}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={styles.botaoSecundario}
          onPress={async () => {
            await salvarFormulario();

            router.push({
              pathname: "/proprietario/recursos",
              params: {
                fotos: JSON.stringify(listaFotos),
              },
            });
          }}
        >
          <Text>
            {listaFotos.length > 0
              ? `${listaFotos.length} foto(s) adicionada(s)`
              : "Adicionar fotos"}
          </Text>
        </TouchableOpacity>
        <ScrollView horizontal>
          {listaFotos.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 8,
                margin: 10,
              }}
            />
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.botao} onPress={cadastrarProduto}>
          <Text style={styles.textoBranco}>Cadastrar Imóvel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    gap: 20,
  },
  banner: {
    width: "100%",
    height: 250,
  },
  input: {
    width: "100%",
    padding: 16,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#818181",
  },
  botao: {
    width: "100%",
    backgroundColor: "#A17CEB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
  },
  textoBranco: {
    color: "#FDF9FC",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    fontWeight: "bold",
    color: "#868686",
  },
  textArea: {
    minHeight: 120,
  },

  botaoSecundario: {
    width: "100%",
    padding: 16,
    borderWidth: 1,
    borderColor: "#A17CEB",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#F7F1FF",
  },
  camera: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },

  imagem: {
    flex: 1,
    borderRadius: 10,
    marginBottom: 20,
  },
});
