import { useEffect, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../../database/supabase';
import { MaterialIcons } from '@expo/vector-icons';

export default function Dashboard() {
  const [imoveis, setImoveis] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarImoveis();
  }, []);

  async function carregarImoveis() {
    try {
      setCarregando(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Usuário não autenticado.');
        router.replace('/index');
        return;
      }

      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .eq('proprietario_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Erro ao carregar imóveis:', error.message);
        alert('Erro ao carregar imóveis.');
        return;
      }

      setImoveis(data || []);
    } catch (error) {
      console.log('Erro:', error);
    } finally {
      setCarregando(false);
    }
  }

  function renderItem({ item }) {
    const fotoPrincipal =
      item.fotos && item.fotos.length > 0 ? item.fotos[0] : null;

    return (
      <View style={styles.card}>
        {fotoPrincipal && (
          <Image
            source={{ uri: fotoPrincipal }}
            style={styles.imagem}
          />
        )}

        <View style={styles.cardContent}>
          <Text style={styles.titulo}>{item.titulo}</Text>

          <Text style={styles.preco}>
            R$ {Number(item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>

          {item.endereco ? (
            <View style={styles.enderecoContainer}>
              <MaterialIcons name="location-on" size={16} color="#E76F51" />
              <Text style={styles.endereco}>{item.endereco}</Text>
            </View>
          ) : null}

          <Text numberOfLines={3} style={styles.descricao}>
            {item.descricao}
          </Text>
        </View>
      </View>
    );
  }

  const regiaoInicial =
    imoveis.length > 0 &&
    imoveis[0].latitude &&
    imoveis[0].longitude
      ? {
          latitude: imoveis[0].latitude,
          longitude: imoveis[0].longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : {
          latitude: -23.9931,
          longitude: -46.2564,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        };

  return (
    <View style={styles.container}>
      <FlatList
        data={imoveis}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshing={carregando}
        onRefresh={carregarImoveis}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={styles.tituloPagina}>Meus Imóveis</Text>

            <MapView
              style={styles.mapa}
              initialRegion={regiaoInicial}
            >
              {imoveis
                .filter(
                  (item) => item.latitude && item.longitude
                )
                .map((item) => (
                  <Marker
                    key={item.id}
                    coordinate={{
                      latitude: item.latitude,
                      longitude: item.longitude,
                    }}
                    title={item.titulo}
                    description={item.endereco}
                    pinColor="#1B263B"
                  />
                ))}
            </MapView>

            <TouchableOpacity
              style={styles.botao}
              onPress={() =>
                router.push('/proprietario/cadastroLocal')
              }
            >
              <MaterialIcons name="add" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.textoBranco}>
                Cadastrar Imóvel
              </Text>
            </TouchableOpacity>

            {imoveis.length === 0 && !carregando && (
              <View style={styles.containerVazio}>
                <MaterialIcons name="sentiment-dissatisfied" size={40} color="#999" />
                <Text style={styles.vazio}>
                  Nenhum imóvel cadastrado ainda.
                </Text>
              </View>
            )}
          </>
        }
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  tituloPagina: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B263B',
    marginBottom: 20,
  },

  mapa: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  botao: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#1B263B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  textoBranco: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },

  imagem: {
    width: '100%',
    height: 180,
    backgroundColor: '#EEE',
  },

  cardContent: {
    padding: 16,
  },

  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B263B',
    marginBottom: 6,
  },

  preco: {
    fontSize: 18,
    color: '#E76F51',
    fontWeight: '800',
    marginBottom: 8,
  },

  enderecoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },

  endereco: {
    color: '#415A77',
    fontSize: 14,
    flex: 1,
  },

  descricao: {
    color: '#555',
    fontSize: 14,
    lineHeight: 20,
  },

  containerVazio: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 8,
  },

  vazio: {
    textAlign: 'center',
    color: '#415A77',
    fontSize: 16,
    fontStyle: 'italic',
  },
});