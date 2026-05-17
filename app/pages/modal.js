import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Text, View, StyleSheet, Dimensions, Image } from 'react-native';

export default function modal() {


  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <Text>Titulo</Text>
        <Image source={require('../../assets/download.jpg')} style={styles.banner} />
        <Text>Localização</Text>
        <Text>description</Text>
        <Image source={require('../../assets/download.jpg')} style={styles.img} />
        <Text>planta</Text>
        <Text>nota de interesse</Text>
        <Text>data visita</Text>
        <Button title='<'></Button>
        <Button title='>'></Button>
      </View>
            <Button title="não tem conta? Cadastre-se" onPress={() => router.push('/cadastro')}/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    position:'relative',
    justifyContent:'center'
  },
  modal:{
    position:'absolute',
    backgroundColor:'pink',
    padding:20,
    width:'90%',
  },
  banner:{
    width:'100%',
    height:80,

  },
  img:{
    height:40,
    width:'50%'
  }
});