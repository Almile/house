import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Text, View, StyleSheet, Dimensions, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function App() {
  const [localizacao, setLocalizacao] = useState(null);

  async function obterLocalizacao() {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (granted) {
      const posicao = await Location.getCurrentPositionAsync();
      setLocalizacao(posicao.coords);
    }
  }

  return (
    <View style={styles.container}>
      <Button title="Obter Localização" onPress={obterLocalizacao} />

      {localizacao && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.mapa}
            initialRegion={{
              latitude: localizacao.latitude,
              longitude: localizacao.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker
              coordinate={{
                latitude: localizacao.latitude,
                longitude: localizacao.longitude,
              }}
              description='sssssssssss'
              title='vocenoafofi'
              onPress={()=>{console.log("con");router.push('/recursos')}}
            >
                <Image 
                  source={require('../../assets/download.jpg')} 
                  style={styles.imagemPin} 
                />
            </Marker>
          </MapView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 50 },
  mapContainer: { flex: 1, width: '100%' },
  mapa: { 
    width: Dimensions.get('window').width, 
    height: Dimensions.get('window').height * 0.7 
  },
  
  // ESTILOS DO MARCADOR
  marcadorCustomizado: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagemPin: {
    width: 50,
    height: 50,
    borderRadius: 25, // Metade da largura/altura para ficar redondo
    borderWidth: 3,
    borderColor: 'white', // Dá um destaque em volta da foto
  },
  setaBaixo: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white', // Mesma cor da borda da foto
    marginTop: -3, // Sobe um pouquinho para encostar na foto
  },
});