import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, Keyboard} from 'react-native';
import { cadastrarUsuario, conectarBD } from "../database/database";
import { useEffect, useState } from "react";
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('cliente');

  async function carregar(){
    const valor = await AsyncStorage.getItem('nm_user');
    const value = await AsyncStorage.getItem('email_user');
    if(valor) setNome(valor);
    if(value) setEmail(value);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function cadastrar() {
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();
    const senhaLimpa = senha.trim();

    if (!nomeLimpo || !emailLimpo || !senhaLimpa) {
      alert('Preencha todos os campos');
      return;
    }

    const sucesso = await cadastrarUsuario(
      nomeLimpo,
      emailLimpo,
      senhaLimpa,
      tipo
    );
  if (sucesso) {
    await AsyncStorage.setItem('nm_user', nomeLimpo);
    await AsyncStorage.setItem('email_user', emailLimpo);
    await AsyncStorage.setItem('usuario_logado', 'true');
    await AsyncStorage.setItem('tipo_usuario', tipo);

    alert('Usuário cadastrado com sucesso!');

    if (tipo === 'proprietario') {
      router.replace('/proprietario/dashboard');
    } else {
      router.replace('/cliente/home');
    }
  } 
  }
  return (
    <KeyboardAvoidingView  style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Image source={require('../assets/onda.png')} style={styles.banner} />
      <View style={styles.container}>
        <TextInput style={styles.input} placeholder="Digite seu email"  value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          value={nome}
          onChangeText={setNome}
        />

        <View style={styles.tipoContainer}>
  <TouchableOpacity
    style={[
      styles.tipoBotao,
      tipo === 'cliente' && styles.tipoSelecionado,
    ]}
    onPress={() => setTipo('cliente')}
  >
    <Text
      style={[
        styles.tipoTexto,
        tipo === 'cliente' && styles.tipoTextoSelecionado,
      ]}
    >
      Comprador
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.tipoBotao,
      tipo === 'proprietario' && styles.tipoSelecionado,
    ]}
    onPress={() => setTipo('proprietario')}
  >
    <Text
      style={[
        styles.tipoTexto,
        tipo === 'proprietario' && styles.tipoTextoSelecionado,
      ]}
    >
      Proprietário
    </Text>
  </TouchableOpacity>
</View> 

        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity style={styles.botao} onPress={cadastrar} >
          <Text style={styles.textoBranco}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/')}>
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
  },
  // Adicione estes estilos

tipoContainer: {
  flexDirection: 'row',
  width: '100%',
  gap: 10,
},

tipoBotao: {
  flex: 1,
  padding: 12,
  borderWidth: 1,
  borderColor: '#A17CEB',
  borderRadius: 8,
  alignItems: 'center',
},

tipoSelecionado: {
  backgroundColor: '#A17CEB',
},

tipoTexto: {
  color: '#A17CEB',
  fontWeight: 'bold',
},

tipoTextoSelecionado: {
  color: '#FFFFFF',
}
});