import * as Location from "expo-location";
import { listarImoveis } from "../../database/database";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { listarImoveisVisitadosDoUsuario } from "../../database/database";

export default function MapaCliente() {
  const [localizacao, setLocalizacao] = useState(null);
  const [imoveis, setImoveis] = useState([]);
  const mapRef = useRef(null);
  const [visitados, setVisitados] = useState([]);
  useEffect(() => {
    obterLocalizacao();
    carregarImoveis();
  }, []);

  async function obterLocalizacao() {
    const { granted } = await Location.requestForegroundPermissionsAsync();

    if (!granted) {
      Alert.alert(
        "Permissão negada",
        "Sem localização, o mapa não funcionará corretamente.",
      );
      return;
    }

    const posicao = await Location.getCurrentPositionAsync({});
    setLocalizacao(posicao.coords);
  }

  async function carregarImoveis() {
    try {
      const [imoveisData, visitadosData] = await Promise.all([
        listarImoveis(),
        listarImoveisVisitadosDoUsuario(),
      ]);

      const idsVisitados = visitadosData.map((v) => v.imovel_id);

      setVisitados(idsVisitados);

      const imoveisComLocalizacao = (imoveisData || []).filter(
        (item) => item.latitude != null && item.longitude != null,
      );

      setImoveis(imoveisComLocalizacao);
    } catch (error) {
      console.log("Erro ao carregar:", error);
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
        latitude: item.latitude,
        longitude: item.longitude,
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
    if (localizacao) {
      setTimeout(ajustarMapa, 500);
    }
  }, [localizacao, imoveis]);

  if (!localizacao) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Obtendo localização...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

        {imoveis.map((item) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: Number(item.latitude),
              longitude: Number(item.longitude),
            }}
            title={item.titulo}
            description={item.descricao}
            onPress={() =>
              router.push({
                pathname: "/cliente/detalhesImovel",
                params: {
                  id: item.id,
                  titulo: item.titulo,
                },
              })
            }
          >
            <View style={styles.imovelMarker}>
              <Image
                source={{
                  uri:
                    item.fotos?.[0] ||
                    "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
                }}
                style={styles.imagemPin}
              />
              <View style={styles.setaBaixo} />
            </View>
          </Marker>
        ))}

        {imoveis.map((item) => {
          const isVisitado = visitados.includes(item.id);

          return (
            <Marker
              key={item.id}
              coordinate={{
                latitude: Number(item.latitude),
                longitude: Number(item.longitude),
              }}
              onPress={() =>
                router.push({
                  pathname: "/cliente/detalhesImovel",
                  params: { id: item.id },
                })
              }
            >
              <View
                style={[
                  styles.imovelMarker,
                  isVisitado && styles.visitadoMarker,
                ]}
              >
                {isVisitado ? (
                  <View style={styles.checkContainer}>
                    <Text style={styles.check}>✔</Text>
                  </View>
                ) : (
                  <Image
                    source={{
                      uri:
                        item.fotos?.[0] ||
                        "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
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

      <View style={styles.botaoContainer}>
        <Pressable>
          <MaterialIcons name="refresh" size={24} color={"white"} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  mapa: {
    width: Dimensions.get("window").width,
    height: "100%",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 18,
    fontWeight: "600",
  },

  usuarioMarker: {
    alignItems: "center",
    justifyContent: "center",
  },

  usuarioPonto: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E76F51",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },

  imovelMarker: {
    alignItems: "center",
  },

  imagemPin: {
    width: 30,
    height: 30,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFF",
  },

  setaBaixo: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 16,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#ffffff",
    marginTop: -4,
  },

  botaoContainer: {
    position: "absolute",
    bottom: 40,
    right: 40,
    alignSelf: "center",
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 50,
    padding: 6,
  },
  checkContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
  },

  check: {
    fontSize: 18,
    color: "#2E7D32",
    fontWeight: "bold",
  },

  visitadoMarker: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
});
