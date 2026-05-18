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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Image source={require("../assets/onda.png")} style={styles.banner} />
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

        <TouchableOpacity style={styles.botao} onPress={entrar}>
          <Text style={styles.textoBranco}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/cadastro")}>
          <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 20,
  },
  banner: {
    width: "100%",
    height: 250,
  },
  input: {
    width: "100%",
    padding: 16,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#818181",
  },
  botao: {
    width: "100%",
    backgroundColor: "#A17CEB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
  },
  textoBranco: {
    color: "#FDF9FC",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    fontWeight: "bold",
    color: "#868686",
  },
});
