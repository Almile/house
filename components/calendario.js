// utils/calendario.js

import * as Calendar from "expo-calendar";
import { Alert } from "react-native";

export async function salvarVisitaNoCalendario({
  titulo,
  data_visita,
  endereco,
}) {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permissão negada", "Não foi possível acessar o calendário.");
      return false;
    }

    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT,
    );

    const calendario =
      calendars.find((cal) => cal.allowsModifications) || calendars[0];

    if (!calendario) {
      Alert.alert("Erro", "Nenhum calendário disponível.");
      return false;
    }

    const inicio = new Date(data_visita);

    if (isNaN(inicio.getTime())) {
      Alert.alert("Erro", "Data da visita inválida.");
      return false;
    }

    const fim = new Date(inicio.getTime() + 60 * 60 * 1000);

    await Calendar.createEventAsync(calendario.id, {
      title: `Visita: ${titulo || "Imóvel"}`,
      startDate: inicio,
      endDate: fim,
      notes: "Agendado via House Hunt.",
      location: endereco || "Endereço não informado",
      timeZone: "America/Sao_Paulo",
    });

    return true;
  } catch (error) {
    console.log("Erro ao salvar no calendário:", error);

    Alert.alert("Erro", "Não foi possível salvar no calendário.");

    return false;
  }
}
