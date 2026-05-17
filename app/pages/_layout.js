import { Stack } from 'expo-router';

export default function Layout(){
  return (
    <Stack screenOptions={{
        headerStyle: { backgroundColor: '#A17CEB'},
        headerTransparent: true,
        headerTintColor: '#fff',
        headerTitleAlign: 'left'
      }}>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
    </Stack>
    
  )
}