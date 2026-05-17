import {StyleSheet, Text, View, Button,TouchableOpacity,TextInput } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

export default function Home(){
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  function cadastrar(){}
  
  return (
    <View style={styles.container}>
      <Text>Login</Text>

      <TextInput placeholder="Digite seu email" value={email} onChangeText={setEmail}/>
      <TextInput placeholder="Digite seu senha" value={senha} onChangeText={setSenha} secureTextEntry={true}/>
      
      <TouchableOpacity onPress={cadastrar()}>
        <Text>Cadastrar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/cadastro')}>
        <Text>não tem conta? Cadastre-se</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(241, 241, 241)',
    alignItems: 'center',
    justifyContent: 'center',
  }
});