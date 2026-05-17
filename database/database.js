import { supabase } from './supabase';

export async function cadastrarUsuario(nome, email, senha,tipo = 'cliente') {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha, 
    });

    if (error) {
      console.log('Erro ao cadastrar:', error.message);
      return false;
    }

    const user = data.user;

    if (user) {
      const { error: profileError } = await supabase
    .from('usuarios')
    .upsert([
      {
        id: user.id,
        nome,
        email,
        tipo,
      },
    ]);

      if (profileError) {
        console.log('Erro ao salvar perfil:', profileError.message);
      }
    }

    return true;
  } catch (error) {
    console.log('Erro ao adicionar usuário:', error);
    return false;
  }
}

export async function loginUsuario(email, senha) {
  try {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

    if (error) return null;

    const user = data.user;

    const { data: perfil } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    return perfil; // contém nome, email e tipo
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function obterUsuarioAtual() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}

export async function logoutUsuario() {
  await supabase.auth.signOut();
}