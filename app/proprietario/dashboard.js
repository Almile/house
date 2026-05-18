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

export default function Dashboard() {
  const [imoveis, setImoveis] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarImoveis();
  }, []);

  async function carregarImoveis() {
    try {
      setCarregando(true);

      // Obtém usuário logado
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Usuário não autenticado.');
        router.replace('/index');
        return;
      }

      // Busca apenas os imóveis do proprietário logado.
      // Porque humanos adoram cadastrar dados e depois querer vê-los. Surpreendente.
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

        <Text style={styles.titulo}>{item.titulo}</Text>

        <Text style={styles.preco}>
          R$ {Number(item.preco).toFixed(2)}
        </Text>

        {item.endereco ? (
          <Text style={styles.endereco}>{item.endereco}</Text>
        ) : null}

        <Text numberOfLines={3} style={styles.descricao}>
          {item.descricao}
        </Text>
      </View>
    );
  }

  // Região inicial do mapa
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
          latitude: -23.9931, // Praia Grande, porque pelo menos alguém sabe onde está.
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
                  />
                ))}
            </MapView>

            <TouchableOpacity
              style={styles.botao}
              onPress={() =>
                router.push('/proprietario/cadastroLocal')
              }
            >
              <Text style={styles.textoBranco}>
                Cadastrar Imóvel
              </Text>
            </TouchableOpacity>

            

            {imoveis.length === 0 && !carregando && (
              <Text style={styles.vazio}>
                Nenhum imóvel cadastrado.
              </Text>
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
    backgroundColor: '#fff',
  },

  tituloPagina: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  mapa: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },

  botao: {
    width: '100%',
    backgroundColor: '#A17CEB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },

  botaoSair: {
    width: '100%',
    backgroundColor: '#E05D5D',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
  },

  textoBranco: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    elevation: 2,
  },

  imagem: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },

  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  preco: {
    fontSize: 18,
    color: '#A17CEB',
    fontWeight: 'bold',
    marginBottom: 6,
  },

  endereco: {
    color: '#666',
    marginBottom: 6,
  },

  descricao: {
    color: '#444',
    lineHeight: 20,
  },

  vazio: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    marginBottom: 20,
  },
});