// ── FRASES MOTIVACIONALES ──
// Para animar a los deportistas a seguir asistiendo y ayudar al club a
// retener socios que están a punto de irse o dejar de asistir.

const FRASES_MOTIVACIONALES = [
  "El talento te lleva lejos, pero la constancia te lleva a la cima. ¡No faltes al próximo entreno!",
  "Cada entrenamiento te acerca más a la versión de jugador que quieres ser.",
  "Los grandes equipos se construyen con la gente que nunca deja de mostrarse.",
  "Un mal partido no te define — dejar de intentarlo sí. ¡Vuelve a la cancha!",
  "Tu equipo te necesita en la cancha, no en la banca de tu casa.",
  "El progreso no siempre se ve rápido, pero siempre se nota con constancia.",
  "Los mejores no son los que nunca fallan, son los que siempre vuelven a entrenar.",
  "Cada gota de sudor en el entrenamiento de hoy es un paso hacia el jugador que quieres ser.",
  "No se trata de ser el mejor del equipo, se trata de ser mejor que ayer.",
  "El fútbol también se juega fuera de la cancha: con disciplina, constancia y actitud.",
  "Tu esfuerzo de hoy es la base del jugador que serás mañana. ¡Sigue así!",
  "Nadie recuerda los entrenamientos fáciles — los que te hacen crecer son los que casi te hacen rendirte.",
  "Un equipo completo juega mejor. ¡Te extrañamos en la cancha!",
  "El descanso es parte del proceso, pero rendirse nunca lo es.",
  "Grandes jugadores empezaron exactamente donde tú estás ahora: entrenando todos los días."
];

function fraseMotivacionalDelDia() {
  const dia = Math.floor(Date.now() / 86400000);
  return FRASES_MOTIVACIONALES[dia % FRASES_MOTIVACIONALES.length];
}

function fraseMotivacionalAleatoria() {
  return FRASES_MOTIVACIONALES[Math.floor(Math.random() * FRASES_MOTIVACIONALES.length)];
}
