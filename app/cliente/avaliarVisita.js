// app/avaliar-visita.jsx

import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import { useRef, useState } from 'react';
import {
  Alert,
  Button,
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

    const imagem =
      await cameraRef.current.takePictureAsync();

    setFotos((prev) => [...prev, imagem.uri]);
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
        'Avaliação salva com sucesso!'
      );

      router.replace('/cliente/lista');
    } catch (error) {
      console.log(
        'Erro ao salvar avaliação:',
        error
      );

      Alert.alert(
        'Erro',
        'Não foi possível salvar a avaliação.'
      );
    } finally {
      setSalvando(false);
    }
  }

  if (!permissaoCamera) {
    return <View />;
  }

  if (!permissaoCamera.granted) {
    return (
      <View style={styles.centralizado}>
        <Text style={styles.texto}>
          Permissão da câmera necessária.
        </Text>

        <Button
          title="Permitir câmera"
          onPress={solicitarPermissaoCamera}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>
        Avaliar Visita
      </Text>

      <Text style={styles.subtitulo}>
        {titulo || 'Imóvel'}
      </Text>

      <Text style={styles.label}>
        Fotos da visita
      </Text>

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
        <Text style={styles.botaoTexto}>
          Tirar Foto
        </Text>
      </TouchableOpacity>

      {fotos.length > 0 && (
        <>
          <Text style={styles.label}>
            {fotos.length} foto(s)
            capturada(s)
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
          >
            {fotos.map((foto, index) => (
              <Image
                key={index}
                source={{ uri: foto }}
                style={styles.preview}
              />
            ))}
          </ScrollView>
        </>
      )}

      <Text style={styles.label}>
        Nível de interesse
      </Text>

      <View style={styles.estrelas}>
        {[1, 2, 3, 4, 5].map((valor) => (
          <TouchableOpacity
            key={valor}
            onPress={() =>
              setInteresse(valor)
            }
          >
            <Text
              style={[
                styles.estrela,
                valor <= interesse &&
                  styles.estrelaAtiva,
              ]}
            >
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>
        O que você achou?
      </Text>

      <TextInput
        style={styles.input}
        multiline
        numberOfLines={5}
        placeholder="Descreva sua experiência na visita..."
        value={comentario}
        onChangeText={setComentario}
      />

      <TouchableOpacity
        style={[
          styles.botaoPrincipal,
          salvando && { opacity: 0.6 },
        ]}
        disabled={salvando}
        onPress={salvarAvaliacao}
      >
        <Text style={styles.botaoTexto}>
          {salvando
            ? 'Salvando...'
            : 'Salvar Avaliação'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },

  centralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  texto: {
    fontSize: 16,
    marginBottom: 16,
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  subtitulo: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  cameraContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },

  camera: {
    flex: 1,
  },

  preview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },

  estrelas: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  estrela: {
    fontSize: 36,
    color: '#DDD',
    marginRight: 8,
  },

  estrelaAtiva: {
    color: '#F5B301',
  },

  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },

  botaoPrincipal: {
    backgroundColor: '#A17CEB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },

  botaoSecundario: {
    backgroundColor: '#6C63FF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },

  botaoTexto: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});