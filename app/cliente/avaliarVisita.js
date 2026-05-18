import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import { useRef, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import { salvarAvaliacaoVisita } from '../../database/database';
import { MaterialIcons } from '@expo/vector-icons';

export default function AvaliarVisita() {
  const { agendamento_id, titulo } =
    useLocalSearchParams();

  const [permissaoCamera, solicitarPermissaoCamera] =
    useCameraPermissions();

  const cameraRef = useRef(null);

  const [fotos, setFotos] = useState([]);
  const [comentario, setComentario] =
    useState('');
  const [interesse, setInteresse] =
    useState(3);
  const [salvando, setSalvando] =
    useState(false);

  async function tirarFoto() {
    if (!cameraRef.current) return;

    try {
        const imagem = await cameraRef.current.takePictureAsync();
        setFotos((prev) => [...prev, imagem.uri]);
    } catch (error) {
        Alert.alert('Erro', 'Não foi possível capturar a foto.');
    }
  }

  async function salvarAvaliacao() {
    try {
      setSalvando(true);

      const resultado =
        await salvarAvaliacaoVisita({
          agendamento_id,
          interesse,
          comentario,
          fotos,
        });

      if (!resultado.sucesso) {
        Alert.alert(
          'Erro',
          resultado.mensagem
        );
        return;
      }

      Alert.alert(
        'Sucesso',
        'Avaliação salva com sucesso!',
        [{ text: 'OK', onPress: () => router.replace('/cliente/lista') }]
      );

    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível salvar a avaliação.'
      );
    } finally {
      setSalvando(false);
    }
  }

  if (!permissaoCamera) {
    return (
        <View style={styles.centralizado}>
            <ActivityIndicator size="large" color="#1B263B" />
        </View>
    );
  }

  if (!permissaoCamera.granted) {
    return (
      <View style={styles.centralizado}>
        <MaterialIcons name="camera-alt" size={60} color="#6C63FF" style={{ marginBottom: 20 }} />
        <Text style={styles.textoPermissao}>
          Permissão da câmera necessária para capturar os registros da visita.
        </Text>

        <TouchableOpacity
          style={styles.botaoPermissao}
          onPress={solicitarPermissaoCamera}
        >
          <Text style={styles.botaoTexto}>Permitir câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subtitulo}>{titulo || 'Imóvel'}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Fotos da visita</Text>
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
          />
        </View>

        <TouchableOpacity
          style={styles.botaoSecundario}
          onPress={tirarFoto}
        >
          <MaterialIcons name="photo-camera" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.botaoTextoSecundario}>Tirar Foto</Text>
        </TouchableOpacity>

        {fotos.length > 0 && (
          <View style={styles.previewContainer}>
            <Text style={styles.labelSecundario}>
                <MaterialIcons name="check-circle" size={16} color="#2D6A4F" />{' '}
                {fotos.length} foto(s) capturada(s)
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 10 }}
            >
              {fotos.map((foto, index) => (
                <Image
                  key={index}
                  source={{ uri: foto }}
                  style={styles.preview}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Nível de interesse</Text>
        <View style={styles.estrelas}>
          {[1, 2, 3, 4, 5].map((valor) => (
            <TouchableOpacity
              key={valor}
              onPress={() => setInteresse(valor)}
              style={styles.estrelaWrapper}
            >
              <MaterialIcons
                name={valor <= interesse ? 'star' : 'star-border'}
                size={40}
                color={valor <= interesse ? '#F5B301' : '#DDD'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>O que você achou?</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={5}
          placeholder="Descreva sua experiência na visita..."
          value={comentario}
          onChangeText={setComentario}
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity
        style={[
          styles.botaoPrincipal,
          salvando && { backgroundColor: '#415A77' }, // Cor secundária ao salvar
        ]}
        disabled={salvando}
        onPress={salvarAvaliacao}
      >
        {salvando ? (
            <ActivityIndicator size="small" color="#FFF" />
        ) : (
            <Text style={styles.botaoTexto}>Salvar Avaliação</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8F9FA',
  },
  textoPermissao: {
    fontSize: 16,
    color: '#1B263B',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  botaoPermissao: {
    backgroundColor: '#E76F51',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B263B',
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 20,
    color: '#1B263B',
    marginBottom: 24,
    fontWeight:'bold',
    textAlign:'center'
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B263B',
    marginBottom: 12,
  },
  labelSecundario: {
    fontSize: 14,
    color: '#2D6A4F',
    fontWeight: '600',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  camera: {
    flex: 1,
  },
  previewContainer: {
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  preview: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#EEE',
  },
  estrelas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  estrelaWrapper: {
    padding: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    padding: 14,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#333',
    backgroundColor: '#F9F9F9',
  },
  botaoPrincipal: {
    backgroundColor: '#E76F51',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  botaoSecundario: {
    flexDirection: 'row',
    backgroundColor: '#1B263B',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botaoTextoSecundario: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
});