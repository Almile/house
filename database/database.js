import { supabase } from "./supabase";

export async function cadastrarUsuario(nome, email, senha, tipo = "cliente") {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    });
    if (error) {
      console.log("Erro ao cadastrar:", error.message);
      return false;
    }

    const user = data.user;

    if (user) {
      const { error: profileError } = await supabase.from("usuarios").upsert([
        {
          id: user.id,
          nome,
          email,
          tipo,
        },
      ]);

      if (profileError) {
        console.log("Erro ao salvar perfil:", profileError.message);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.log("Erro ao adicionar usuário:", error);
    return false;
  }
}

export async function loginUsuario(email, senha) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      console.log("Erro no login:", error.message);
      return null;
    }

    const user = data.user;

    const { data: perfil, error: perfilError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .single();

    if (perfilError) {
      console.log("Erro ao buscar perfil:", perfilError.message);
      return null;
    }

    return perfil;
  } catch (error) {
    console.log("Erro no login:", error);
    return null;
  }
}

export async function obterUsuarioAtual() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.log("Erro ao obter usuário:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.log("Erro ao obter usuário atual:", error);
    return null;
  }
}

export async function logoutUsuario() {
  try {
    await supabase.auth.signOut();
    return true;
  } catch (error) {
    console.log("Erro ao sair:", error);
    return false;
  }
}

function normalizarHorarios(visitas_disponiveis) {
  if (!visitas_disponiveis) {
    return [];
  }

  if (Array.isArray(visitas_disponiveis)) {
    return visitas_disponiveis
      .map((item) => converterDataParaISO(item))
      .filter(Boolean);
  }
  if (typeof visitas_disponiveis === "string") {
    return visitas_disponiveis
      .split(/\n|,|;/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((item) => converterDataParaISO(item))
      .filter(Boolean);
  }

  return [];
}

function converterDataParaISO(valor) {
  const tentativaDireta = new Date(valor);
  if (!isNaN(tentativaDireta.getTime())) {
    return tentativaDireta.toISOString();
  }

  const regex = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/;

  const match = valor.match(regex);

  if (!match) {
    console.log("Data inválida:", valor);
    return null;
  }

  const [, dia, mes, ano, hora = "00", minuto = "00"] = match;

  const data = new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia),
    Number(hora),
    Number(minuto),
  );

  if (isNaN(data.getTime())) {
    console.log("Data inválida:", valor);
    return null;
  }

  return data.toISOString();
}

export async function cadastrarImovel({
  titulo,
  descricao,
  preco,
  endereco = "",
  quartos = 0,
  banheiros = 0,
  vagas = 0,
  area_m2 = 0,
  latitude = null,
  longitude = null,
  visitas_disponiveis = [],
  imagem = null,
}) {
  try {
    if (!titulo || !descricao || !preco) {
      return {
        sucesso: false,
        mensagem: "Preencha os campos obrigatórios.",
      };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        sucesso: false,
        mensagem: "Usuário não autenticado.",
      };
    }

    const { data, error } = await supabase
      .from("imoveis")
      .insert([
        {
          proprietario_id: user.id,
          titulo,
          descricao,
          preco: parseFloat(preco),
          endereco,
          latitude,
          longitude,

          visitas_disponiveis: normalizarHorarios(visitas_disponiveis),

          fotos: imagem ? [imagem] : [],
        },
      ])
      .select()
      .single();
    if (error) {
      console.log("Erro ao cadastrar imóvel:", error);
      return {
        sucesso: false,
        mensagem: "Erro ao cadastrar imóvel.",
      };
    }

    return {
      sucesso: true,
      dados: data,
      mensagem: "Imóvel cadastrado com sucesso!",
    };
  } catch (error) {
    console.log("Erro ao cadastrar imóvel:", error);
    return {
      sucesso: false,
      mensagem: "Erro inesperado ao cadastrar imóvel.",
    };
  }
}

export async function listarImoveis() {
  try {
    const { data, error } = await supabase
      .from("imoveis")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Erro ao listar imóveis:", error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.log("Erro ao listar imóveis:", error);
    return [];
  }
}

export async function buscarImovelPorId(id) {
  try {
    const { data, error } = await supabase
      .from("imoveis")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log("Erro ao buscar imóvel:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.log("Erro ao buscar imóvel:", error);
    return null;
  }
}

export async function listarImoveisDoUsuario() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("imoveis")
      .select("*")
      .eq("proprietario_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Erro ao listar imóveis do usuário:", error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.log("Erro ao listar imóveis do usuário:", error);
    return [];
  }
}

export async function atualizarImovel(id, dadosAtualizados) {
  try {
    const { data, error } = await supabase
      .from("imoveis")
      .update(dadosAtualizados)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.log("Erro ao atualizar imóvel:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.log("Erro ao atualizar imóvel:", error);
    return null;
  }
}

export async function excluirImovel(id) {
  try {
    const { error } = await supabase.from("imoveis").delete().eq("id", id);

    if (error) {
      console.log("Erro ao excluir imóvel:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.log("Erro ao excluir imóvel:", error);
    return false;
  }
}

export async function agendarVisita({ imovel_id, data_visita }) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        sucesso: false,
        mensagem: "Usuário não autenticado.",
      };
    }

    const { data, error } = await supabase
      .from("agendamentos")
      .insert([
        {
          cliente_id: user.id,
          imovel_id,
          data_visita,
          status: "pendente",
        },
      ])
      .select()
      .single();

    if (error) {
      console.log("Erro ao agendar visita:", error.message);
      return {
        sucesso: false,
        mensagem: "Erro ao agendar visita.",
      };
    }

    return {
      sucesso: true,
      dados: data,
      mensagem: "Visita agendada com sucesso!",
    };
  } catch (error) {
    console.log("Erro ao agendar visita:", error);
    return {
      sucesso: false,
      mensagem: "Erro inesperado ao agendar visita.",
    };
  }
}

export async function listarAgendamentosDoUsuario() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("agendamentos")
      .select(
        `
        *,
        imoveis (
          id,
          titulo,
          endereco,
          fotos
        )
      `,
      )
      .eq("cliente_id", user.id)
      .order("data_visita", { ascending: true });

    if (error) {
      console.log("Erro ao listar agendamentos:", error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.log("Erro ao listar agendamentos:", error);
    return [];
  }
}

export async function cancelarAgendamento(id) {
  try {
    const { error } = await supabase
      .from("agendamentos")
      .update({ status: "cancelado" })
      .eq("id", id);

    if (error) {
      console.log("Erro ao cancelar agendamento:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.log("Erro ao cancelar agendamento:", error);
    return false;
  }
}

export async function salvarAvaliacaoVisita({
  agendamento_id,
  interesse,
  comentario,
  fotos = [],
}) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        sucesso: false,
        mensagem: "Usuário não autenticado.",
      };
    }

    const { data, error } = await supabase
      .from("avaliacoes_visita")
      .insert([
        {
          agendamento_id,
          cliente_id: user.id,
          interesse,
          comentario,
          fotos,
        },
      ])
      .select()
      .single();

    if (error) {
      console.log("Erro ao salvar avaliação:", error.message);

      return {
        sucesso: false,
        mensagem: "Erro ao salvar avaliação.",
      };
    }

    const { error: updateError } = await supabase
      .from("agendamentos")
      .update({
        status: "visitado",
      })
      .eq("id", agendamento_id);

    if (updateError) {
      console.log("Erro ao atualizar agendamento:", updateError.message);
    }

    return {
      sucesso: true,
      dados: data,
      mensagem: "Avaliação salva com sucesso!",
    };
  } catch (error) {
    console.log("Erro inesperado ao salvar avaliação:", error);

    return {
      sucesso: false,
      mensagem: "Erro inesperado ao salvar avaliação.",
    };
  }
}

export async function listarVisitasVisitadas() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("agendamentos")
    .select(
      `
      id,
      data_visita,
      status,
      imoveis (
        id,
        titulo,
        endereco,
        fotos
      ),
      avaliacoes_visita (
        interesse,
        comentario,
        fotos
      )
    `,
    )
    .eq("cliente_id", user.id)
    .eq("status", "visitado")
    .order("data_visita", { ascending: false });

  if (error) {
    console.log(error.message);
    return [];
  }

  return data || [];
}

export async function listarImoveisVisitadosDoUsuario() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("agendamentos")
    .select("imovel_id")
    .eq("cliente_id", user.id)
    .eq("status", "visitado");

  if (error) {
    console.log(error.message);
    return [];
  }

  return data || [];
}
