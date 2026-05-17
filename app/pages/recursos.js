import { CameraView, useCameraPermissions } from 'expo-camera';
import {  View,  Button,  Text,  Image,  StyleSheet} from 'react-native';
import {  useRef,  useState} from 'react';
import { router } from 'expo-router';

export default function Recursos() {
  const [permissaoCamera, solicitarPermissaoCamera] = useCameraPermissions();
  const [foto, setFoto] = useState('');
  const cameraRef = useRef(null);

  async function tirarFoto() {
    if (!cameraRef.current) return;
    const imagem = await cameraRef.current.takePictureAsync();

    setFoto(imagem.uri);
  }

  if (!permissaoCamera) {
    return <View />;
  }

  if (!permissaoCamera.granted) {
    return (
      <View style={styles.container}>

        <Text>
          Permissão da câmera necessária
        </Text>

        <Button
          title="Permitir câmera"
          onPress={solicitarPermissaoCamera}
        />

      </View>
    );
  }

  return (
    <View style={styles.container}>

      {foto === '' ? (
        <>          

          <CameraView
            ref={cameraRef}
            style={styles.camera}
          />
          <Button
            title="Tirar Foto"
            onPress={tirarFoto}
          />

        </>
      ) : (

        <>
          
          <Image
            source={{ uri: foto }}
            style={styles.imagem}
          />
          <Button
            title="Tirar Outra Foto"
            onPress={() => setFoto('')}
          />
            <Button
            title="Enviar"
            onPress={() => router.push({
            pathname: '/imagem',
            params: { foto: foto }
            })}
          />
        </>
      )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
  },

  camera: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },

  imagem: {
    flex: 1,
    borderRadius: 10,
    marginBottom: 20,
  },

});