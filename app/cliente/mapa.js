import * as Location from "expo-location";
import { listarImoveis } from "../../database/database";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { listarImoveisVisitadosDoUsuario } from "../../database/database";

export default function MapaCliente() {
  const [localizacao, setLocalizacao] = useState(null);
  const [imoveis, setImoveis] = useState([]);
  const [visitados, setVisitados] = useState([]);
  const [atualizando, setAtualizando] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    inicializarMapa();
  }, []);

  async function inicializarMapa() {
    await obterLocalizacao();
    await carregarImoveis();
  }

  async function obterLocalizacao() {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();

      if (!granted) {
        Alert.alert(
          "Permissão negada",
          "Sem autorização de localização, o mapa não conseguirá carregar a sua região atual.",
        );
        return;
      }

      // Adicionado configuração balanceada contra travamento por satélite demorado
      const posicao = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (posicao && posicao.coords) {
        setLocalizacao(posicao.coords);
      }
    } catch (error) {
      console.log("Erro ao obter dados de GPS nativo:", error);
      Alert.alert(
        "Erro de Sinal",
        "Não foi possível obter a sua posição via GPS. Certifique-se de que a localização do aparelho está ativa."
      );
    }
  }

  async function carregarImoveis() {
    try {
      setAtualizando(true);
      const [imoveisData, visitadosData] = await Promise.all([
        listarImoveis(),
        listarImoveisVisitadosDoUsuario(),
      ]);

      const idsVisitados = (visitadosData || []).map((v) => v.imovel_id);
      setVisitados(idsVisitados);

      const imoveisComLocalizacao = (imoveisData || []).filter(
        (item) => item.latitude != null && item.longitude != null,
      );

      setImoveis(imoveisComLocalizacao);
    } catch (error) {
      console.log("Erro ao carregar banco de imóveis:", error);
    } finally {
      setAtualizando(false);
    }
  }

  function ajustarMapa() {
    if (!mapRef.current || !localizacao) return;

    const coordenadas = [
      {
        latitude: localizacao.latitude,
        longitude: localizacao.longitude,
      },
      ...imoveis.map((item) => ({
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
      })),
    ];

    mapRef.current.fitToCoordinates(coordenadas, {
      edgePadding: {
        top: 80,
        right: 80,
        bottom: 80,
        left: 80,
      },
      animated: true,
    });
  }

  useEffect(() => {
    if (localizacao && imoveis.length > 0) {
      const timer = setTimeout(ajustarMapa, 600);
      return () => clearTimeout(timer);
    }
  }, [localizacao, imoveis]);

  if (!localizacao) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B263B" />
        <Text style={styles.loadingText}>Carregando mapa da região...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ATENÇÃO: Deixado SEM a propriedade provider={PROVIDER_GOOGLE} de propósito */}
      <MapView
        ref={mapRef}
        style={styles.mapa}
        initialRegion={{
          latitude: localizacao.latitude,
          longitude: localizacao.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={false}
      >
        {/* Marcador do Usuário */}
        <Marker
          coordinate={{
            latitude: localizacao.latitude,
            longitude: localizacao.longitude,
          }}
          title="Você está aqui"
          description="Sua localização atual"
        >
          <View style={styles.usuarioMarker}>
            <View style={styles.usuarioPonto} />
          </View>
        </Marker>

        {/* Marcadores de Imóveis Consolidados (Sem duplicações na View) */}
        {imoveis.map((item) => {
          const isVisitado = visitados.includes(item.id);

          return (
            <Marker
              key={`imovel-pin-${item.id}`}
              coordinate={{
                latitude: Number(item.latitude),
                longitude: Number(item.longitude),
              }}
              title={item.titulo}
              description={item.descricao}
              onPress={() =>
                router.push({
                  pathname: "/cliente/detalhesImovel",
                  params: { id: item.id, titulo: item.titulo },
                })
              }
            >
              <View style={[styles.imovelMarker, isVisitado && styles.visitadoMarker]}>
                {isVisitado ? (
                  <View style={styles.checkContainer}>
                    <MaterialIcons name="check" size={18} color="#FFFFFF" />
                  </View>
                ) : (
                  <Image
                    source={{
                      uri: item.fotos?.[0] || "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
                    }}
                    style={styles.imagemPin}
                  />
                )}

                {!isVisitado && <View style={styles.setaBaixo} />}
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Botão de Atualizar Tela */}
      <View style={styles.botaoContainer}>
        <Pressable 
          style={({ pressed }) => [styles.botaoAtualizar, pressed && styles.botaoPressionado]} 
          onPress={inicializarMapa}
          disabled={atualizando}
        >
          {atualizando ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialIcons name="refresh" size={24} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  mapa: {
    width: Dimensions.get("window").width,
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B263B",
  },
  usuarioMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  usuarioPonto: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E76F51",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  imovelMarker: {
    alignItems: "center",
  },
  imagemPin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: "#1B263B",
    backgroundColor: "#FFF",
  },
  setaBaixo: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#1B263B",
    marginTop: -2,
  },
  botaoContainer: {
    position: "absolute",
    bottom: 32,
    right: 24,
  },
  botaoAtualizar: {
    backgroundColor: "#1B263B",
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  botaoPressionado: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  checkContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2E7D32",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  visitadoMarker: {
    opacity: 0.75,
  },
});
