import { useLocalSearchParams,  } from 'expo-router';
import { View, StyleSheet, Image} from 'react-native';

export default function imagem(){

  const { foto } = useLocalSearchParams();

  return (
    <View style={styles.container}>
    <Image
                source={{ uri: foto }}
                style={styles.imagem}
              />
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