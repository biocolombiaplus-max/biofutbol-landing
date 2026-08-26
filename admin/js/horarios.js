// ── HORARIOS DE ENTRENAMIENTO ──
// Utilidades compartidas para calcular y mostrar el próximo entrenamiento
// a partir de una lista de horarios semanales ({ dia, horaInicio, horaFin,
// categoria, sedeId }).

const DIAS_SEMANA_ORDEN = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DIAS_SEMANA_JS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function formatoHora12(hhmm) {
  if (!hhmm) return "";
  const partes = hhmm.split(":");
  let h = Number(partes[0]), m = partes[1];
  const ampm = h >= 12 ? "p.m." : "a.m.";
  h = h % 12; if (h === 0) h = 12;
  return h + ":" + m + " " + ampm;
}

function horariosFechaISO(fecha) {
  const y = fecha.getFullYear(), m = String(fecha.getMonth() + 1).padStart(2, "0"), d = String(fecha.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

// Encuentra, desde ahora, la próxima ocurrencia real (fecha+hora) de cada
// horario recurrente + cada entrenamiento adicional (extra), y devuelve la
// más cercana. Si se pasa una categoría, solo considera lo que aplica a esa
// categoría o a "todas las categorías" (sin categoría definida).
// opts = { cancelaciones: [{fecha, horarioId}], extras: [{fecha,horaInicio,horaFin,categoria,sedeId}], entrenaFestivos }
function proximoEntrenamiento(horarios, categoria, opts) {
  opts = opts || {};
  const cancelaciones = opts.cancelaciones || [];
  const extras = opts.extras || [];
  const entrenaFestivos = opts.entrenaFestivos !== false;
  const ahora = new Date();
  let mejor = null, mejorFecha = null, esExtra = false;

  let lista = horarios || [];
  if (categoria) lista = lista.filter(function (h) { return !h.categoria || h.categoria === categoria; });

  lista.forEach(function (h) {
    const diaIdx = DIAS_SEMANA_JS.indexOf(h.dia);
    if (diaIdx === -1 || !h.horaInicio) return;
    const partes = h.horaInicio.split(":");
    const hh = Number(partes[0]), mm = Number(partes[1]);
    for (let offset = 0; offset < 15; offset++) {
      const candidato = new Date(ahora);
      candidato.setDate(ahora.getDate() + offset);
      candidato.setHours(hh, mm, 0, 0);
      if (candidato.getDay() !== diaIdx || candidato < ahora) continue;
      if (!entrenaFestivos && typeof festivoColombiaEn === "function" && festivoColombiaEn(candidato)) continue;
      const fechaISO = horariosFechaISO(candidato);
      const cancelado = cancelaciones.some(function (c) { return c.fecha === fechaISO && (!c.horarioId || c.horarioId === h.id); });
      if (cancelado) continue;
      if (!mejorFecha || candidato < mejorFecha) { mejorFecha = candidato; mejor = h; esExtra = false; }
      break;
    }
  });

  let listaExtras = extras;
  if (categoria) listaExtras = listaExtras.filter(function (e) { return !e.categoria || e.categoria === categoria; });
  listaExtras.forEach(function (e) {
    if (!e.fecha || !e.horaInicio) return;
    const partes = e.horaInicio.split(":");
    const candidato = new Date(e.fecha + "T00:00:00");
    candidato.setHours(Number(partes[0]), Number(partes[1]), 0, 0);
    if (candidato < ahora) return;
    if (!mejorFecha || candidato < mejorFecha) {
      mejorFecha = candidato;
      mejor = Object.assign({}, e, { dia: DIAS_SEMANA_JS[candidato.getDay()] });
      esExtra = true;
    }
  });

  return mejor ? { horario: mejor, fecha: mejorFecha, esExtra: esExtra } : null;
}

function formatoProximoEntrenamiento(resultado) {
  if (!resultado) return null;
  const hoy0 = new Date(); hoy0.setHours(0, 0, 0, 0);
  const fecha0 = new Date(resultado.fecha); fecha0.setHours(0, 0, 0, 0);
  const dias = Math.round((fecha0 - hoy0) / 86400000);
  let diaTxt = resultado.horario.dia;
  if (dias === 0) diaTxt = "Hoy";
  else if (dias === 1) diaTxt = "Mañana";
  return diaTxt + " · " + formatoHora12(resultado.horario.horaInicio);
}

// Pinta la tarjeta "Próximo entrenamiento" + "También entrena" en las
// páginas de padres/socio (mi-panel.html y portal-socio.html), que
// comparten los mismos IDs de elementos: entrenoCard, ntBody, ntSub,
// otrosHorarios.
function pintarEntrenamientos(horarios, categoria, sedes, opts) {
  if (!horarios || !horarios.length) return;
  sedes = sedes || {};
  const resultado = proximoEntrenamiento(horarios, categoria, opts) || proximoEntrenamiento(horarios, null, opts);
  if (!resultado) return;

  document.getElementById("entrenoCard").style.display = "block";
  document.getElementById("ntBody").textContent = formatoProximoEntrenamiento(resultado);
  const rango = formatoHora12(resultado.horario.horaInicio) + (resultado.horario.horaFin ? " – " + formatoHora12(resultado.horario.horaFin) : "");
  const subPartes = [resultado.horario.categoria || "Todas las categorías", rango];
  if (resultado.horario.sedeId && sedes[resultado.horario.sedeId]) subPartes.push(sedes[resultado.horario.sedeId]);
  if (resultado.esExtra) subPartes.push("Entrenamiento especial");
  document.getElementById("ntSub").textContent = subPartes.join(" · ");

  const otros = horarios.filter(function (h) { return h !== resultado.horario && (!h.categoria || h.categoria === categoria); });
  if (otros.length) {
    const ordenados = otros.slice().sort(function (a, b) {
      return DIAS_SEMANA_ORDEN.indexOf(a.dia) - DIAS_SEMANA_ORDEN.indexOf(b.dia);
    });
    document.getElementById("otrosHorarios").style.display = "block";
    document.getElementById("otrosHorarios").innerHTML = "<b style='color:var(--white)'>También entrena:</b>" +
      ordenados.map(function (h) {
        return "<div>" + h.dia + " · " + formatoHora12(h.horaInicio) + (h.horaFin ? " – " + formatoHora12(h.horaFin) : "") + "</div>";
      }).join("");
  }
}
