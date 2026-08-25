// ── UTILIDADES DE EDAD, CRECIMIENTO Y NUTRICIÓN ──
// Nota importante: los cálculos de IMC y las guías de este archivo son de
// carácter GENERAL Y ORIENTATIVO. No reemplazan una valoración de un
// pediatra o nutricionista, quienes usan tablas oficiales (OMS/CDC) con el
// sexo, la edad exacta en meses y el historial completo del niño o joven.

function calcularEdad(fechaNacISO) {
  if (!fechaNacISO) return null;
  const nac = new Date(fechaNacISO);
  if (isNaN(nac.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

function calcularIMC(pesoKg, estaturaCm) {
  if (!pesoKg || !estaturaCm) return null;
  const m = estaturaCm / 100;
  return pesoKg / (m * m);
}

function bandaEdad(edad) {
  if (edad === null || edad === undefined) return "adultos";
  if (edad <= 8) return "ninos";
  if (edad <= 12) return "preadolescentes";
  if (edad <= 15) return "adolescentes";
  if (edad <= 17) return "juveniles";
  return "adultos";
}

const NOMBRE_BANDA = {
  ninos: "Niños (5-8 años)",
  preadolescentes: "Pre-adolescentes (9-12 años)",
  adolescentes: "Adolescentes (13-15 años)",
  juveniles: "Juveniles (16-17 años)",
  adultos: "Adultos (18+ años)"
};

const GUIA_NUTRICIONAL = {
  ninos: {
    enfoque: "Energía suficiente para entrenar y crecer, sin excesos, formando buenos hábitos.",
    tips: [
      "Desayuno con huevo + arepa o pan integral + fruta + leche o yogurt.",
      "En el entretiempo o después de entrenar: banano o fruta de temporada.",
      "Almuerzo con proteína (pollo, carne o pescado), arroz o papa, fríjol o lenteja y verduras.",
      "Hidratación con agua durante todo el entrenamiento, no solo al final.",
      "Evitar gaseosas, paquetes y dulces en exceso, sobre todo antes de jugar."
    ]
  },
  preadolescentes: {
    enfoque: "Apoyar el desarrollo muscular temprano y sostener el ritmo de entrenamientos más exigentes.",
    tips: [
      "Aumentar un poco la porción de proteína: huevo, pollo, atún o carne en el almuerzo y la cena.",
      "Carbohidratos de buena calidad antes de entrenar: arroz, plátano, avena o arepa.",
      "Snack post-entreno: yogurt con fruta o un huevo cocido.",
      "Hidratación constante, incluso si no siente sed.",
      "Incluir frutas y verduras de distintos colores durante el día."
    ]
  },
  adolescentes: {
    enfoque: "Mayor gasto calórico por el crecimiento acelerado y la exigencia física del entrenamiento.",
    tips: [
      "Reforzar la proteína en cada comida principal: huevo, pollo, atún, carne o leguminosas (fríjol, lenteja, garbanzo).",
      "Carbohidratos complejos como base de energía: arroz, papa, yuca, plátano y avena.",
      "Grasas saludables con moderación: aguacate, maní, mantequilla de maní.",
      "Comer algo con proteína y carbohidrato dentro de la primera hora después de entrenar o jugar.",
      "Dormir bien también hace parte de la recuperación — no solo la comida."
    ]
  },
  juveniles: {
    enfoque: "Rendimiento y recuperación, ajustando las porciones según la posición y la intensidad de cada semana.",
    tips: [
      "Planear la comida antes del partido con carbohidratos de fácil digestión (arroz, plátano, pan) y poca grasa.",
      "Priorizar la recuperación: proteína + carbohidrato en la primera hora después de jugar.",
      "Mantener buena hidratación antes, durante y después del entrenamiento, especialmente en climas cálidos.",
      "Incluir variedad de frutas y verduras para la recuperación muscular.",
      "Evitar comidas muy pesadas o fritas cerca de la hora de entrenar."
    ]
  },
  adultos: {
    enfoque: "Nutrición deportiva general, enfocada en energía, rendimiento y recuperación.",
    tips: [
      "Distribuir bien la proteína durante el día: huevo, pollo, carne, pescado o leguminosas en cada comida principal.",
      "Carbohidratos de calidad como base energética: arroz, papa, yuca, avena y frutas.",
      "Hidratación constante antes, durante y después del entrenamiento.",
      "Grasas saludables con moderación: aguacate, frutos secos, aceite de oliva.",
      "Ajustar las porciones según la carga de entrenamiento de la semana."
    ]
  }
};

// Recetario que rota semana a semana (4 semanas), con ingredientes fáciles
// de conseguir en el mercado colombiano.
const RECETARIO_SEMANAL = [
  {
    titulo: "Semana 1",
    desayuno: "Huevos revueltos + arepa + jugo de mora sin azúcar",
    almuerzo: "Pechuga de pollo a la plancha + arroz + fríjoles + ensalada + jugo de maracuyá",
    snack: "Banano + un puñado de maní",
    cena: "Sopa de verduras con pollo desmechado + arepa pequeña"
  },
  {
    titulo: "Semana 2",
    desayuno: "Avena caliente con banano y canela + huevo cocido",
    almuerzo: "Carne de res guisada + papa + lentejas + ensalada de tomate y aguacate",
    snack: "Yogurt con fruta picada",
    cena: "Tortilla de huevo con verduras + arepa"
  },
  {
    titulo: "Semana 3",
    desayuno: "Calentado (arroz, fríjol y huevo) + jugo de guayaba",
    almuerzo: "Pescado o atún + arroz + patacón + ensalada",
    snack: "Mango o papaya picada",
    cena: "Crema de ahuyama + huevo + pan integral"
  },
  {
    titulo: "Semana 4",
    desayuno: "Pan integral con huevo y queso + jugo de naranja natural",
    almuerzo: "Pollo al horno + yuca + ensalada + jugo de lulo",
    snack: "Batido de banano con leche",
    cena: "Arroz con verduras salteadas + pechuga desmechada"
  }
];

function semanaDelAnio() {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), 0, 1);
  const dias = Math.floor((hoy - inicio) / 86400000);
  return Math.ceil((dias + inicio.getDay() + 1) / 7);
}

function recetaDeLaSemana() {
  const idx = semanaDelAnio() % RECETARIO_SEMANAL.length;
  return RECETARIO_SEMANAL[idx];
}
