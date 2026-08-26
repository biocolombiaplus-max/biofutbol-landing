// ── VISITA GUIADA DE LA DEMO ──
// Recorrido paso a paso, ligero y sin librerías externas: cambia de pestaña
// solo, resalta el elemento de cada paso con un "spotlight", y muestra una
// tarjeta con explicación + Anterior/Siguiente/Saltar. Pensado para que
// cualquier interesado entienda la app completa en menos de 2 minutos.

const TOUR_PASOS = [
  { tab: "inicio", selector: "#tab-inicio #heroStats", titulo: "Tu panel, de un vistazo", texto: "Cuántos socios tienes, cuántos partidos van jugados y quién debe — todo lo importante, en la primera pantalla." },
  { tab: "inicio", selector: "#tab-inicio #nextTrainingCard", titulo: "El próximo entrenamiento, imposible de perder", texto: "Brilla solo, respeta los festivos colombianos, y desde aquí mismo activas la asistencia con un toque." },
  { tab: "inicio", selector: "#tab-inicio .quick-grid", titulo: "Todo tu club, a un toque", texto: "Cada módulo de la app accesible desde el inicio — nadie en tu equipo se pierde buscando dónde hacer algo." },
  { tab: "socios", selector: "#tab-socios #listaSocios", titulo: "Cada jugador, con su estado de pago al día", texto: "Verde, amarillo o rojo: sabes quién está al día y a quién recordarle, sin cuadernos ni Excel." },
  { tab: "profesores", selector: "#tab-profesores #listaProfesores", titulo: "Un acceso propio para cada profesor", texto: "Cada entrenador ve solo sus categorías, toma su propia asistencia y consulta a sus alumnos — sin tocar nada administrativo." },
  { tab: "imagenes", selector: "#tab-imagenes .tpl-pills", titulo: "Imágenes profesionales en segundos", texto: "Convocatorias, resultados, cumpleaños, torneos... generadas con el escudo y los colores de tu club, listas para WhatsApp e Instagram." },
  { tab: "patrocinadores", selector: "#tab-patrocinadores #listaPatrocinadores", titulo: "Consigue y muestra a tus patrocinadores", texto: "Dale visibilidad a los negocios que apoyan tu escuela — y úsalo para conseguir más aliados." },
  { tab: "entrenamientos", selector: "#tab-entrenamientos #asistenciaCard", titulo: "Asistencia en vivo, sin quitarle tiempo al entrenador", texto: "Se activa con un toque y todos quedan presentes por defecto — el profe solo marca a quien falta." },
  { tab: "fixture", selector: "#tab-fixture #listaPartidos", titulo: "Fixture y resultados, compartibles con un clic", texto: "Programa el partido y envía toda la info a los papás: fecha, hora, cancha, uniforme y hasta el arbitraje." },
  { tab: "tabla", selector: "#tab-tabla #tablaPosiciones", titulo: "Tabla de posiciones siempre actualizada", texto: "Se calcula sola con cada resultado que registras — cero cálculos a mano." },
  { tab: "torneos", selector: "#tab-torneos #listaTorneos", titulo: "Controla cada torneo de principio a fin", texto: "Inscripciones, tarjetas, sanciones y recordatorios de pago — con imágenes que incluyen el logo del torneo." },
  { tab: "informes", selector: "#tab-informes #excSocio", titulo: "Hasta las excusas del colegio, resueltas", texto: "Genera una constancia deportiva profesional en PDF y envíasela al papá o la mamá por WhatsApp en segundos." },
  { tab: "miclub", selector: "#tab-miclub #mcLogoBox", titulo: "100% personalizable a tu club", texto: "Tu escudo, tus colores, tu mensualidad, tus datos de pago — la app se adapta a ti, no al revés." }
];

let tourPasoActual = -1;
let tourResizeHandler = null;

function tourCrearElementos() {
  if (document.getElementById("tourSpotlight")) return;
  const spot = document.createElement("div");
  spot.id = "tourSpotlight";
  spot.className = "tour-spotlight";
  document.body.appendChild(spot);

  const card = document.createElement("div");
  card.id = "tourCard";
  card.className = "tour-card";
  card.innerHTML =
    '<div class="tc-step" id="tourStepTxt"></div>' +
    '<h4 id="tourTitulo"></h4>' +
    '<p id="tourTexto"></p>' +
    '<div class="tc-actions">' +
    '<button type="button" class="btn btn-ghost btn-sm" id="tourAnterior">Anterior</button>' +
    '<div class="tc-dots" id="tourDots"></div>' +
    '<button type="button" class="btn btn-primary btn-sm" id="tourSiguiente">Siguiente</button>' +
    '</div>' +
    '<a href="#" id="tourSaltar" class="tour-saltar">Saltar recorrido</a>';
  document.body.appendChild(card);

  document.getElementById("tourAnterior").addEventListener("click", tourAnterior);
  document.getElementById("tourSiguiente").addEventListener("click", tourSiguiente);
  document.getElementById("tourSaltar").addEventListener("click", function (e) { e.preventDefault(); tourFinalizar(); });

  document.getElementById("tourDots").innerHTML = TOUR_PASOS.map(function (_, i) {
    return '<span class="tc-dot" data-i="' + i + '"></span>';
  }).join("");
}

function tourIniciar() {
  tourCrearElementos();
  document.getElementById("tourSpotlight").style.display = "block";
  document.getElementById("tourCard").style.display = "block";
  tourResizeHandler = function () { if (tourPasoActual >= 0) tourPosicionar(TOUR_PASOS[tourPasoActual]); };
  window.addEventListener("resize", tourResizeHandler);
  tourMostrarPaso(0);
}

function tourFinalizar() {
  const spot = document.getElementById("tourSpotlight");
  const card = document.getElementById("tourCard");
  if (spot) spot.style.display = "none";
  if (card) card.style.display = "none";
  if (tourResizeHandler) { window.removeEventListener("resize", tourResizeHandler); tourResizeHandler = null; }
  tourPasoActual = -1;
}

function tourSiguiente() {
  if (tourPasoActual >= TOUR_PASOS.length - 1) { tourFinalizar(); return; }
  tourMostrarPaso(tourPasoActual + 1);
}

function tourAnterior() {
  if (tourPasoActual <= 0) return;
  tourMostrarPaso(tourPasoActual - 1);
}

function tourMostrarPaso(i) {
  tourPasoActual = i;
  const paso = TOUR_PASOS[i];
  const btnTab = document.querySelector('.tab-btn[data-tab="' + paso.tab + '"]');
  if (btnTab && !btnTab.classList.contains("on")) btnTab.click();

  document.getElementById("tourStepTxt").textContent = "Paso " + (i + 1) + " de " + TOUR_PASOS.length;
  document.getElementById("tourTitulo").textContent = paso.titulo;
  document.getElementById("tourTexto").textContent = paso.texto;
  document.getElementById("tourAnterior").style.visibility = i === 0 ? "hidden" : "visible";
  document.getElementById("tourSiguiente").textContent = i === TOUR_PASOS.length - 1 ? "Terminar" : "Siguiente";
  document.querySelectorAll("#tourDots .tc-dot").forEach(function (d, di) { d.classList.toggle("on", di === i); });

  setTimeout(function () { tourPosicionar(paso); }, 260);
}

function tourPosicionar(paso) {
  const el = document.querySelector(paso.selector);
  const spot = document.getElementById("tourSpotlight");
  const card = document.getElementById("tourCard");
  if (!el || !spot || !card) return;

  el.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(function () {
    const r = el.getBoundingClientRect();
    const pad = 10;
    spot.style.left = (r.left - pad) + "px";
    spot.style.top = (r.top - pad) + "px";
    spot.style.width = (r.width + pad * 2) + "px";
    spot.style.height = (r.height + pad * 2) + "px";

    const cardW = Math.min(320, window.innerWidth - 32);
    card.style.width = cardW + "px";
    let top = r.bottom + 18;
    if (top + 220 > window.innerHeight) top = Math.max(16, r.top - 236);
    let left = Math.min(Math.max(16, r.left), window.innerWidth - cardW - 16);
    card.style.top = top + "px";
    card.style.left = left + "px";
  }, 320);
}

function tourMostrarBienvenida() {
  const div = document.createElement("div");
  div.className = "tour-welcome";
  div.id = "tourWelcome";
  div.innerHTML =
    '<div class="tour-welcome-card">' +
    '<div style="font-size:2.2rem;margin-bottom:10px">⚽</div>' +
    '<h3 style="font-size:1.2rem;font-weight:900;margin-bottom:10px">¡Bienvenido a la demo de BioFutbol!</h3>' +
    '<p style="font-size:.9rem;color:var(--gray);line-height:1.6;margin-bottom:22px">Te mostramos, en menos de 2 minutos, cómo se ve y funciona la app completa — con datos de ejemplo de Unión Tenerife F.C. Al final, activa BioFutbol en tu propio club.</p>' +
    '<button type="button" class="btn btn-primary btn-block" id="tourBtnEmpezar"><i class="fa-solid fa-play"></i> Empezar recorrido guiado</button>' +
    '<button type="button" class="btn btn-ghost btn-block" id="tourBtnExplorar" style="margin-top:10px">Prefiero explorar libremente</button>' +
    '</div>';
  document.body.appendChild(div);
  document.getElementById("tourBtnEmpezar").addEventListener("click", function () {
    div.remove();
    tourIniciar();
  });
  document.getElementById("tourBtnExplorar").addEventListener("click", function () { div.remove(); });
}
