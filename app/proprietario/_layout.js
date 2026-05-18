import { Stack } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../../database/supabase';

export default function Layout() {

  async function sair() {
      try {
        await supabase.auth.signOut();
  
        await AsyncStorage.multiRemove([
          'logado',
          'usuario_logado',
          'tipo_usuario',
          'nm_user',
          'email_user',
          'cadastro_imovel',
        ]);
  
        router.replace('/');
      } catch (error) {
        console.log('Erro ao sair:', error);
        alert('Erro ao fazer logout.');
      }
    }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1B263B' },
        headerTintColor: '#fff',
        headerTitleAlign: 'left',
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerRight: () => (
            <Pressable onPress={sair}>
  <MaterialIcons name="logout" size={24} color="white" />
</Pressable>
          ),
        }}
      />
    </Stack>
  );
}