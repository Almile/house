<h1 align="center">House Hunt</h1>

### 🏠 Sobre o House Hunt

<p align="left">
  O House Hunt é uma solução mobile moderna desenvolvida para simplificar a gestão e o agendamento de visitas a imóveis. 
O aplicativo permite que clientes encontrem propriedades, visualizem detalhes completos e marquem horários de visita de forma ágil e integrada diretamente com o calendário nativo do dispositivo.
</p>

<br>

### 🛠️ Tecnologias Usadas

![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-074D5B?style=for-the-badge&logo=supabase&logoColor=white)
![AsyncStorage](https://img.shields.io/badge/AsyncStorage-8A2BE2?style=for-the-badge&logo=databricks&logoColor=white)

<br>

### 📱 Funcionalidades Principais

* **Autenticação Segura:** Fluxo de Login e Cadastro persistido localmente via `AsyncStorage`.
* **Exploração de Imóveis:** Carrossel dinâmico de fotos e exibição detalhada de especificações, preço e localização do imóvel.
* **Agendamento Inteligente:** Seleção de horários livres com sincronização e salvamento automático no calendário do celular.
* **Avaliação de Visitas:** Módulo interno integrado com a câmera (`expo-camera`) para capturar fotos do imóvel na hora, atribuir notas por estrelas de interesse e adicionar comentários da experiência.

<br>

### 🚀 Como rodar o projeto localmente

Siga os passos abaixo para configurar e executar o aplicativo na sua máquina ou dispositivo móvel:

### 1. Clone o repositório

```bash
git clone https://github.com/Almile/house
cd house
```
2. Instale as dependências
Certifique-se de ter o Node.js instalado na sua máquina. No diretório raiz do projeto, execute:

```bash
npm install
```

3. Execute a aplicação
Inicie o servidor de desenvolvimento do Expo:

```bash
npx expo start
```

4. Visualizando o App
No celular (Expo Go): Instale o aplicativo Expo Go (disponível na Google Play Store ou App Store) e leia o código QR gerado no seu terminal.

No Emulador: Pressione a para abrir no emulador Android ou i para abrir no simulador iOS (requer Xcode/Android Studio previamente configurados).


