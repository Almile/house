import { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { listarVisitasVisitadas } from '../../database/database';

export default function Lista() {
  const [dados, setDados] = useState([]);
  const [filtro, setFiltro] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      setCarregando(true);
      const res = await listarVisitasVisitadas();
      setDados(res || []);
    } catch (error) {
      console.log('Erro ao carregar:', error);
    } finally {
      setCarregando(false);
    }
  }

  const filtrados = dados.filter((item) => {
    const interesse = item.avaliacoes_visita?.[0]?.interesse || 0;
    return filtro === 0 ? true : interesse === filtro;
  });

  function renderItem({ item }) {
    const imovel = item.imoveis || {};
    const avaliacao = item.avaliacoes_visita?.[0] || {};
    const foto = imovel.fotos?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994';

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Image source={{ uri: foto }} style={styles.img} />
          
          <View style={styles.infoContainer}>
            <Text style={styles.titulo} numberOfLines={1}>
              {imovel.titulo || 'Imóvel'}
            </Text>
            <Text style={styles.endereco} numberOfLines={1}>
              📍 {imovel.endereco || 'Sem endereço'}
            </Text>
            <Text style={styles.data}>
              📅 {new Date(item.data_visita).toLocaleDateString('pt-BR')}
            </Text>
            <View style={styles.notaBadge}>
               <Text style={styles.notaTexto}>★   {avaliacao.interesse || 0}/5</Text>
            </View>
          </View>
        </View>

        {avaliacao.comentario && (
          <Text style={styles.comentario} numberOfLines={2}>
            "{avaliacao.comentario}"
          </Text>
        )}

        {avaliacao.fotos?.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollFotos}>
            {avaliacao.fotos.map((f, i) => (
              <Image key={i} source={{ uri: f }} style={styles.fotoMini} />
            ))}
          </ScrollView>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filtros}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosContent}>
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setFiltro(n)}
              style={[styles.filtro, filtro === n && styles.filtroAtivo]}
            >
              <Text style={[styles.filtroTexto, filtro === n && styles.filtroTextoAtivo]}>
                {n === 0 ? 'Todos' : `${n} ★`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {carregando && <ActivityIndicator color="#E76F51" style={{ marginTop: 20 }} />}

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshing={carregando}
        onRefresh={carregar}
        ListEmptyComponent={!carregando && <Text style={styles.vazio}>Nenhum registro encontrado.</Text>}
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
  filtros: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filtrosContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filtro: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filtroAtivo: {
    backgroundColor: '#E76F51',
    borderColor: '#E76F51',
  },
  filtroTexto: {
    fontSize: 14,
    color: '#E76F51',
  },
  filtroTextoAtivo: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
  },
  img: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  endereco: {
    fontSize: 12,
    color: '#777',
  },
  data: {
    fontSize: 12,
    color: '#444',
  },
  notaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff7f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  comentario: {
    marginTop: 10,
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
    backgroundColor: '#F9F9F9',
    padding: 8,
    borderRadius: 6,
  },
  scrollFotos: {
    marginTop: 10,
  },
  fotoMini: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 8,
  },
  vazio: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
  },
});