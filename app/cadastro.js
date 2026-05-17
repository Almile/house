import {StyleSheet, Text, View, Button,TouchableOpacity,TextInput } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

export default function Home(){
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  function cadastrar(){}
  
  return (
    <View style={styles.container}>
      <Text>Cadastro</Text>

      <TextInput placeholder="Digite seu email" value={email} onChangeText={setEmail}/>
      <TextInput placeholder="Digite seu nome" value={nome} onChangeText={setNome}/>
      <TextInput placeholder="Digite seu senha" value={senha} onChangeText={setSenha} secureTextEntry={true}/>
      
      <TouchableOpacity onPress={cadastrar()}>
        <Text>Cadastrar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text>Já tem conta? Faça login</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3EDFD',
    alignItems: 'center',
    justifyContent: 'center',
  }
});