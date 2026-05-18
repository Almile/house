import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { loginUsuario } from "../database/database";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function verificarLogin() {
    const usuarioLogado = await AsyncStorage.getItem("usuario_logado");

    const usuarioJson = await AsyncStorage.getItem("usuario");

    if (usuarioLogado === "true" && usuarioJson) {
      const usuario = JSON.parse(usuarioJson);

      if (usuario.tipo === "proprietario") {
        router.replace("/proprietario/dashboard");
      } else {
        router.replace("/cliente/home");
      }
    }
  }

  useEffect(() => {
    verificarLogin();
  }, []);

  async function entrar() {
    const usuario = await loginUsuario(
      email.trim().toLowerCase(),
      senha.trim(),
    );

    if (!usuario) {
      alert("E-mail ou senha inválidos");
      return;
    }

    await AsyncStorage.setItem("usuario", JSON.stringify(usuario));
    await AsyncStorage.setItem("usuario_logado", "true");

    if (usuario.tipo === "proprietario") {
      router.replace("/proprietario/dashboard");
    } else {
      router.replace("/cliente/home");
    }
  }

  async function sair() {
    await AsyncStorage.removeItem("logado");
  }

  return (
<View style={{ flex: 1 }}>
  
  <Image source={require('../assets/fundo.jpg')} style={styles.fundo} />

  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
      <View style={styles.container}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
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

        <TouchableOpacity style={styles.botao} onPress={entrar}>
          <Text style={styles.textoBranco}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/cadastro")}>
          <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
    fundo:{
    position:'absolute',
    width:'100%',
    height:'100%',
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff00",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 20,
  },
logo: {
  width: '80%',
  height: 180,
  resizeMode: "contain",
  marginBottom: 20,
},
  banner: {
    width: "100%",
    height: 250,
  },
  input: {
    width: "100%",
    padding: 16,
    fontSize: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1B263B",
    backgroundColor: "#ffffff50",
  },
  botao: {
    width: "100%",
    backgroundColor: "#E76F51",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
  },
  textoBranco: {
    color: "#FDF9FC",
    fontWeight: "bold",
    fontSize: 20,
  },
  link: {
    fontWeight: "bold",
    color: "#868686",
  },
});
