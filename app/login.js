import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { loginUsuario } from '../database/database';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function verificarLogin() {
    const logado = await AsyncStorage.getItem('logado');
    const emailSalvo = await AsyncStorage.getItem('email_user');

    if (emailSalvo) {
      setEmail(emailSalvo);
    }

    if (logado === 'true') {
      router.replace('pages/modal');
    }
  }

  useEffect(() => {
    verificarLogin();
  }, []);

  async function entrar() {
    const sucesso = await loginUsuario(
      email.trim().toLowerCase(),
      senha.trim()
    );

    if (sucesso) {
      await AsyncStorage.setItem('logado', 'true');
      await AsyncStorage.setItem(
        'email_user',
        email.trim().toLowerCase()
      );

      router.replace('/home');
    } else {
      alert('E-mail ou senha inválidos');
    }
  }

  async function sair() {
    await AsyncStorage.removeItem('logado');
  }


  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Image source={require('../assets/onda.png')} style={styles.banner} />
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Digite seu email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity style={styles.botao} onPress={entrar} >
          <Text style={styles.textoBranco}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/cadastro')}>
          <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal:20,
    gap:20
  },
  banner:{
    width:'100%',
    height:250,
  },
  input:{
    width:'100%',
    padding:16,
    fontSize:16,
    borderRadius:8,
    borderWidth:1,
    borderColor: '#818181',
  },
  botao:{
    width:'100%',
    backgroundColor: '#A17CEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:20,
    padding:12,
    borderRadius:8,
  },
  textoBranco:{
    color:'#FDF9FC',
    fontWeight:'bold',
    fontSize:16
  },
  link:{
    fontWeight:'bold',
    color: '#868686',
  }
});