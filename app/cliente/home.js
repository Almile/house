import { useEffect, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { listarAgendamentosDoUsuario } from '../../database/database';

export default function Home() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  async function carregarAgendamentos() {
    try {
      setCarregando(true);
      const dados = await listarAgendamentosDoUsuario();
      
      // Filtra apenas o que não foi visitado ou cancelado
      const pendentes = (dados || []).filter(
        (item) => item.status !== 'visitado' && item.status !== 'cancelado'
      );

      setAgendamentos(pendentes);
    } catch (error) {
      console.log('Erro ao carregar agendamentos:', error);
    } finally {
      setCarregando(false);
    }
  }

  function renderItem({ item }) {
    const imovel = item.imoveis || {};
    const fotoPrincipal = imovel.fotos?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994';

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Image source={{ uri: fotoPrincipal }} style={styles.imagem} />
          
          <View style={styles.infoContainer}>
            <Text style={styles.titulo} numberOfLines={1}>
              {imovel.titulo || 'Imóvel'}
            </Text>
            <Text style={styles.endereco} numberOfLines={2}>
              {imovel.endereco || 'Endereço não informado'}
            </Text>
            <Text style={styles.data}>
              📅 {new Date(item.data_visita).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
            <TouchableOpacity
          style={styles.botao}
          onPress={() =>
            router.push({
              pathname: '/cliente/avaliarVisita',
              params: {
                agendamento_id: item.id,
                imovel_id: item.imovel_id,
                titulo: imovel.titulo,
              },
            })
          }
        >
          <Text style={styles.textoBranco}>Marcar como visitado</Text>
        </TouchableOpacity>
          </View>
        </View>

        
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {carregando && <ActivityIndicator color="#E76F51" style={{ marginTop: 20 }} />}
      
      <FlatList
        data={agendamentos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshing={carregando}
        onRefresh={carregarAgendamentos}
        ListEmptyComponent={
          !carregando && <Text style={styles.vazio}>Nenhuma visita agendada.</Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagem: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  endereco: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  data: {
    fontSize: 13,
    color: '#E76F51',
    fontWeight: '600',
  },
  botao: {
    backgroundColor: '#415A77',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  textoBranco: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  vazio: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
});