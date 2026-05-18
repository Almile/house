import { CameraView, useCameraPermissions } from 'expo-camera';
import {  View,  Button,  Text,  Image,  StyleSheet} from 'react-native';
import {  useRef,  useState} from 'react';
import { router } from 'expo-router';

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
    <CameraView
      ref={cameraRef}
      style={styles.camera}
    />

    <Button
      title="Tirar Foto"
      onPress={tirarFoto}
    />

    {fotos.length > 0 && (
      <>
        <Text style={{ marginVertical: 10 }}>
          {fotos.length} foto(s) capturada(s)
        </Text>

        <Image
          source={{ uri: fotos[fotos.length - 1] }}
          style={styles.imagem}
        />

<Button
  title="Enviar Fotos"
  onPress={() =>
    router.navigate({
      pathname: '/proprietario/cadastroLocal',
      params: {
        fotos: JSON.stringify(fotos),
      },
    })
  }
/>

        <Button
          title="Limpar Fotos"
          onPress={() => setFotos([])}
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