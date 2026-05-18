import { Tabs } from "expo-router";
import { Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../database/supabase";

export default function Layout() {
  async function sair() {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.multiRemove([
        "logado",
        "usuario_logado",
        "tipo_usuario",
        "nm_user",
        "email_user",
        "cadastro_imovel",
      ]);
      router.replace("/");
    } catch (error) {
      console.log("Erro ao sair:", error);
      alert("Erro ao fazer logout.");
    }
  }

return (
    <Tabs
      screenOptions={{
        headerTintColor: "#fff",
        headerTitleAlign: "left",
        headerStyle: { backgroundColor: "#1B263B" },
        tabBarActiveTintColor: "#E76F51",
        tabBarInactiveTintColor: "#415A77",
        tabBarStyle: { backgroundColor: "#FFFFFF" }
  }}
>
    
      {/* TELAS VISÍVEIS NO MENU */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Agendamentos",
          tabBarLabel: "Agendamentos",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-month" size={size} color={color} />
          ),
          headerRight: () => (
            <Pressable onPress={sair} style={{ marginRight: 15 }}>
              <MaterialIcons name="logout" size={24} color="white" />
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="mapa"
        options={{
          title: "Locais",
          tabBarLabel: "Locais",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="map" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="lista"
        options={{
          title: "Minha lista",
          tabBarLabel: "Minha lista",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="list" size={size} color={color} />
          ),
        }}
      />

      {/* TELAS ESCONDIDAS DO MENU */}
      <Tabs.Screen
        name="avaliarVisita" // Nome do arquivo que está na pasta tabs
        options={{
          href: null, // ISSO ESCONDE O BOTÃO DO MENU
          title: "Avaliar Visita",
          headerShown: true, // Se quiser que o cabeçalho apareça
        }}
      />

      <Tabs.Screen
        name="detalhesImovel"
        options={{
          href: null, // Também fica invisível no menu
        }}
      />
    </Tabs>
  );
}