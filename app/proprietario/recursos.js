import { CameraView, useCameraPermissions } from 'expo-camera';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function Recursos() {
  const [permissaoCamera, solicitarPermissaoCamera] = useCameraPermissions();
  const [fotos, setFotos] = useState([]);
  const cameraRef = useRef(null);

  async function tirarFoto() {
    if (!cameraRef.current) return;

    const imagem = await cameraRef.current.takePictureAsync();
    setFotos([...fotos, imagem.uri]);
  }

  if (!permissaoCamera) {
    return <View style={styles.containerPreload} />;
  }

  if (!permissaoCamera.granted) {
    return (
      <View style={styles.containerPermissao}>
        <MaterialIcons name="photo-camera" size={64} color="#1B263B" />
        <Text style={styles.tituloPermissao}>Precisamos da sua câmera</Text>
        <Text style={styles.subtituloPermissao}>
          Para adicionar fotos ao anúncio do seu imóvel, precisamos de autorização para acessar a câmera.
        </Text>
        <TouchableOpacity style={styles.botaoPrincipal} onPress={solicitarPermissaoCamera}>
          <Text style={styles.textoBranco}>Permitir Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} />
        
        <View style={styles.containerDisparo}>
          <TouchableOpacity style={styles.botaoDisparar} onPress={tirarFoto}>
            <View style={styles.mioloDisparar} />
          </TouchableOpacity>
        </View>
      </View>

      {fotos.length > 0 ? (
        <View style={styles.painelInferior}>
          <View style={styles.headerPainel}>
            <Text style={styles.contadorTexto}>
              {fotos.length} foto(s) capturada(s)
            </Text>
            <TouchableOpacity onPress={() => setFotos([])} style={styles.botaoLimpar}>
              <Text style={styles.textoLimpar}>Limpar tudo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.containerPreview}>
            <Image
              source={{ uri: fotos[fotos.length - 1] }}
              style={styles.imagemPreview}
            />
            {fotos.length > 1 && (
              <View style={styles.badgeMaisFotos}>
                <Text style={styles.textoBadge}>+{fotos.length - 1}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.botaoPrincipal}
            onPress={() =>
              router.navigate({
                pathname: '/proprietario/cadastroLocal',
                params: {
                  fotos: JSON.stringify(fotos),
                },
              })
            }
          >
            <MaterialIcons name="check" size={20} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.textoBranco}>Concluir e Enviar Fotos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.painelDica}>
          <Text style={styles.textoDica}>Toque no botão central para capturar imagens do imóvel.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B263B', 
  },
  containerPreload: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  containerPermissao: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  tituloPermissao: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B263B',
    marginTop: 12,
  },
  subtituloPermissao: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  containerDisparo: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoDisparar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  mioloDisparar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
  },
  painelInferior: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  headerPainel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contadorTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B263B',
  },
  botaoLimpar: {
    paddingVertical: 4,
  },
  textoLimpar: {
    color: '#E76F51',
    fontWeight: 'bold',
    fontSize: 14,
  },
  containerPreview: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EEE',
  },
  imagemPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgeMaisFotos: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(27, 38, 59, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  textoBadge: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  painelDica: {
    backgroundColor: '#1B263B',
    padding: 24,
    alignItems: 'center',
  },
  textoDica: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontSize: 14,
  },
  botaoPrincipal: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#1B263B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  textoBranco: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});