import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { buscarImovelPorId, agendarVisita } from "../../database/database";
import { Alert } from "react-native";
import { salvarVisitaNoCalendario } from "../../components/calendario";

export default function DetalhesImovel() {
  const { id } = useLocalSearchParams();

  const [imovel, setImovel] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [agendando, setAgendando] = useState(false);

  useEffect(() => {
    carregarImovel();
  }, [id]);

  async function carregarImovel() {
    try {
      setCarregando(true);

      const dados = await buscarImovelPorId(id);

      if (dados) {
        setImovel(dados);
      }
    } catch (error) {
      console.log("Erro ao carregar imóvel:", error);
    } finally {
      setCarregando(false);
    }
  }

  async function handleAgendarVisita(horarioSelecionado) {
    try {
      setAgendando(true);

      const resultado = await agendarVisita({
        imovel_id: imovel.id,
        data_visita: horarioSelecionado,
      });

      if (resultado.sucesso) {
        const salvouNoCalendario = await salvarVisitaNoCalendario({
          titulo: imovel.titulo,
          data_visita: horarioSelecionado,
          endereco: imovel.endereco,
        });

        Alert.alert(
          "Visita agendada!",
          salvouNoCalendario
            ? "A visita também foi salva no seu calendário."
            : "A visita foi agendada, mas não foi salva no calendário.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/cliente/home"),
            },
          ],
        );
      } else {
        Alert.alert("Erro", resultado.mensagem || "Não foi possível agendar.");
      }
    } catch (error) {
      console.log("Erro ao agendar visita:", error);

      Alert.alert("Erro", "Não foi possível agendar a visita.");
    } finally {
      setAgendando(false);
    }
  }

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#A17CEB" />
        <Text style={styles.textoCarregando}>Carregando imóvel...</Text>
      </View>
    );
  }

  if (!imovel) {
    return (
      <View style={styles.centralizado}>
        <Text style={styles.erro}>Imóvel não encontrado.</Text>
      </View>
    );
  }

  const imagem =
    imovel.fotos?.[0] ||
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994";

  const horarios = (() => {
    const valor = imovel?.visitas_disponiveis;

    if (Array.isArray(valor)) {
      return valor;
    }

    if (typeof valor === "string" && valor.trim() !== "") {
      return valor
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    return [];
  })();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {Array.isArray(imovel.fotos) && imovel.fotos.length > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.carrossel}
        >
          {imovel.fotos.map((foto, index) => (
            <Image
              key={index}
              source={{ uri: foto }}
              style={styles.imagemCarrossel}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      ) : (
        <Image
          source={{ uri: imagem }}
          style={styles.imagemCarrossel}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.card}>
        <Text style={styles.titulo}>{imovel.titulo}</Text>

        <Text style={styles.preco}>
          R$ {Number(imovel.preco || 0).toLocaleString("pt-BR")}
        </Text>

        {imovel.endereco ? (
          <Text style={styles.endereco}>{imovel.endereco}</Text>
        ) : null}

        {imovel.descricao ? (
          <Text style={styles.descricao}>{imovel.descricao}</Text>
        ) : null}
      </View>



      {/* Card de horários disponíveis */}
      <View style={styles.card}>
        <Text style={styles.subtitulo}>Horários disponíveis</Text>

        {horarios.length > 0 ? (
          horarios.map((horario, index) => (
            <View
              key={index}
              style={{
                marginBottom: 16,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#EEE",
              }}
            >
              <Text style={styles.horario}>
                • {new Date(horario).toLocaleString("pt-BR")}
              </Text>

              <TouchableOpacity
                style={[styles.botao, agendando && styles.botaoDesabilitado]}
                disabled={agendando}
                onPress={() => handleAgendarVisita(horario)}
              >
                <Text style={styles.botaoTexto}>
                  {agendando ? "Agendando..." : "Agendar este horário"}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.semHorario}>Nenhum horário cadastrado.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  content: {
    paddingBottom: 40,
  },

  centralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  textoCarregando: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },

  erro: {
    fontSize: 18,
    color: "#666",
  },

  imagem: {
    width: "100%",
    height: 280,
  },

  card: {
    backgroundColor: "#FFF",
    margin: 16,
    marginBottom: 0,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },

  preco: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#A17CEB",
    marginBottom: 12,
  },

  endereco: {
    color: "#666",
    marginBottom: 12,
  },

  descricao: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: 16,
  },

  subtitulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  info: {
    fontSize: 15,
    color: "#444",
  },

  horario: {
    fontSize: 15,
    color: "#444",
    marginBottom: 8,
  },

  semHorario: {
    color: "#888",
    fontStyle: "italic",
  },

  botao: {
    backgroundColor: "#A17CEB",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  botaoTexto: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  // Adicione estes estilos ao StyleSheet
  carrossel: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },

  imagemCarrossel: {
    width: 360, // pode trocar por Dimensions.get('window').width - 32
    height: 240,
    borderRadius: 16,
    marginRight: 12,
  },
});
