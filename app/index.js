import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, Keyboard} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

export default function Home() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  function cadastrar() {}

  return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >

          <Image source={require('../assets/onda.png')} style={styles.banner} />

          <View style={styles.container}>
            <TextInput
              style={styles.input}
              placeholder="Digite seu email"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              value={nome}
              onChangeText={setNome}
            />

            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.botao}
              onPress={cadastrar}
            >
              <Text style={styles.textoBranco}>Cadastrar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.link}>Já tem conta? Faça login</Text>
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