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

// Encuentra, desde ahora, la próxima ocurrencia real (fecha+hora) de cada
// horario dentro de los próximos 7 días, y devuelve la más cercana. Si se
// pasa una categoría, solo considera los horarios de esa categoría o los
// que aplican a "todas las categorías" (sin categoría definida).
function proximoEntrenamiento(horarios, categoria) {
  let lista = horarios || [];
  if (categoria) lista = lista.filter(function (h) { return !h.categoria || h.categoria === categoria; });
  if (!lista.length) return null;

  const ahora = new Date();
  let mejor = null, mejorFecha = null;
  lista.forEach(function (h) {
    const diaIdx = DIAS_SEMANA_JS.indexOf(h.dia);
    if (diaIdx === -1 || !h.horaInicio) return;
    const partes = h.horaInicio.split(":");
    const hh = Number(partes[0]), mm = Number(partes[1]);
    for (let offset = 0; offset < 8; offset++) {
      const candidato = new Date(ahora);
      candidato.setDate(ahora.getDate() + offset);
      candidato.setHours(hh, mm, 0, 0);
      if (candidato.getDay() === diaIdx && candidato >= ahora) {
        if (!mejorFecha || candidato < mejorFecha) { mejorFecha = candidato; mejor = h; }
        break;
      }
    }
  });
  return mejor ? { horario: mejor, fecha: mejorFecha } : null;
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
function pintarEntrenamientos(horarios, categoria, sedes) {
  if (!horarios || !horarios.length) return;
  sedes = sedes || {};
  const resultado = proximoEntrenamiento(horarios, categoria) || proximoEntrenamiento(horarios, null);
  if (!resultado) return;

  document.getElementById("entrenoCard").style.display = "block";
  document.getElementById("ntBody").textContent = formatoProximoEntrenamiento(resultado);
  const rango = formatoHora12(resultado.horario.horaInicio) + (resultado.horario.horaFin ? " – " + formatoHora12(resultado.horario.horaFin) : "");
  const subPartes = [resultado.horario.categoria || "Todas las categorías", rango];
  if (resultado.horario.sedeId && sedes[resultado.horario.sedeId]) subPartes.push(sedes[resultado.horario.sedeId]);
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
