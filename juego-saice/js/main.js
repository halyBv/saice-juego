// === Referencias a pantallas ===
const pantallaInicio = document.getElementById("pantalla-inicio");
const pantallaJuego = document.getElementById("pantalla-juego");
const pantallaFinal = document.getElementById("pantalla-final");

// === Botones ===
const btnJugar = document.getElementById("btnJugar");
const btnReiniciar = document.getElementById("btnReiniciar");

// === Elementos dinámicos ===
const zonaJuego = document.getElementById("zona-juego");
const mensajeFinal = document.getElementById("mensaje-final");

// === Variables ===
let etapaActual = 0;
let puntuacion = 0;
let jugador = "";
// Variable para contar correctos pendientes en la etapa actual
let correctosPendientes = 0; 
// NUEVA: Variable para contar errores cometidos en la etapa actual
let erroresEnEtapa = 0; 

// === Etapas del juego (NUEVA ESTRUCTURA) ===
const etapas = [
  {
    nombre: "utensilios", // ETAPA 1: Selección de utensilios
    texto: "Arrastra los utensilios necesarios para un Saice.",
    correctos: ["olla", "cuchillo", "tabla_picar"],
    incorrectos: ["cuchara", "batidora", "espatula"]
  },
  {
    nombre: "ingredientes", // ETAPA 2: Selección de ingredientes principales
    texto: "Arrastra los ingredientes principales al cesto.",
    correctos: ["carne", "papa", "aji", "arveja", "cebolla"],
    incorrectos: ["pan", "dulce", "jugo"]
  },
  {
    nombre: "corte", // ETAPA 3: Preparación (corte)
    texto: "Arrastra la carne, papa y cebolla a la tabla para cortarlos.",
    correctos: ["carne", "papa", "cebolla"],
    incorrectos: ["arveja", "aji", "vaso"]
  },
  {
    nombre: "cocina", // ETAPA 4: Cocinando el guiso
    texto: "Arrastra los ingredientes para cocinar el guiso en la olla.",
    correctos: ["carne", "papa", "aji", "cebolla", "arveja"],
    incorrectos: ["agua", "leche"] // "agua" aquí podría ser un ingrediente válido para guisar, considera si es incorrecto o simplemente no arrastrable.
  },
  {
    nombre: "servir_acompanamiento", // ETAPA 5: Acompañamientos
    texto: "Arrastra los acompañamientos bolivianos al plato base.",
    correctos: ["arroz_cocido", "papa_entera", "chuño"],
    incorrectos: ["fideo", "platano", "pure"]
  },
  {
    nombre: "servir_final", // ETAPA 6: Servir el plato final
    texto: "Arrastra el Saice al plato servido para terminar.",
    correctos: ["saice_guiso"],
    incorrectos: ["sopa"]
  }
];

// === Mostrar pantalla específica ===
function mostrarPantalla(pantalla) {
  document.querySelectorAll(".pantalla").forEach(p => p.classList.add("oculto"));
  pantalla.classList.remove("oculto");
}

// === Iniciar juego ===
btnJugar.addEventListener("click", () => {
  jugador = prompt("Ingresa tu nombre para comenzar:");
  if (!jugador) jugador = "Jugador Anónimo";

  etapaActual = 0;
  puntuacion = 0;
  mostrarPantalla(pantallaJuego);
  mostrarEtapa();
});

// === Reiniciar al final ===
btnReiniciar.addEventListener("click", () => {
  mostrarPantalla(pantallaInicio);
});

// === FUNCIÓN PARA REINICIAR LA ETAPA ACTUAL ===
function reiniciarEtapa() {
    // Vuelve a generar el DOM para la etapa actual, refrescando los ingredientes y contadores
    mostrarEtapa();
}

// === Mostrar etapa ===
function mostrarEtapa() {
  const etapa = etapas[etapaActual];
  
  // Determina la imagen de utensilio para la zona de drop
  // Simplificado para usar el nombre base para los "servir_X"
  let utensilioZonaDropNombre = etapa.nombre;
  if (utensilioZonaDropNombre.includes("servir")) {
    utensilioZonaDropNombre = "servir"; // Usa 'servir.png' para ambas etapas de servir
  }

  // Estructura de la zona de juego con imagen de utensilio
  zonaJuego.innerHTML = `
    <h2>${etapa.texto}</h2> 
    <div class="contenedor">
      <div id="zona-arrastrar" class="zona-drop">
        <img src="img/utensilios/${utensilioZonaDropNombre}.png" alt="${etapa.nombre}" class="utensilio-imagen">
        <div id="mensajes-drop">Arrastra aquí</div>
      </div>
      <div class="ingredientes"></div>
    </div>
  `;

  // Inicializar el contador de correctos pendientes para esta etapa
  correctosPendientes = etapa.correctos.length; 
  // RESETEAR CONTADOR DE ERRORES AL INICIO DE CADA ETAPA
  erroresEnEtapa = 0;

  const contenedorIng = zonaJuego.querySelector(".ingredientes");
  // Mezclar todos los elementos de la etapa (correctos e incorrectos)
  const todos = [...etapa.correctos, ...etapa.incorrectos].sort(() => Math.random() - 0.5);

  todos.forEach(nombre => {
    const div = document.createElement("div");
    
    // DETERMINAR LA CARPETA DE LA IMAGEN (utensilios o ingredientes)
    let carpetaImg = (etapa.nombre === "utensilios") ? "utensilios" : "ingredientes";
    
    // Usar imagen y texto para el elemento. Reemplazamos '_' por espacio para el texto.
    div.innerHTML = `<img src="img/${carpetaImg}/${nombre}.png" alt="${nombre}"><p>${nombre.replace(/_/g, ' ')}</p>`;
    div.classList.add("item");
    div.draggable = true;
    div.dataset.nombre = nombre;

    div.addEventListener("dragstart", e => {
      e.dataTransfer.setData("nombre", nombre);
    });

    contenedorIng.appendChild(div);
  });

  const zonaDrop = document.getElementById("zona-arrastrar");
  const mensajesDrop = document.getElementById("mensajes-drop");

  zonaDrop.addEventListener("dragover", e => e.preventDefault());

  zonaDrop.addEventListener("drop", e => {
    e.preventDefault();
    const nombre = e.dataTransfer.getData("nombre");
    const itemArrastrado = document.querySelector(`.ingredientes [data-nombre='${nombre}']`);

    if (etapa.correctos.includes(nombre)) {
      puntuacion += 10; // Puntos por cada acierto
      correctosPendientes--; 
      mensajesDrop.innerHTML = `<p>✅ ¡${nombre.replace(/_/g, ' ')} agregado!</p>`;
      
      // Quitar el elemento de la lista de arrastre si es correcto
      itemArrastrado?.remove();
      
      // Si ya se agregaron todos los correctos, avanzar
      if (correctosPendientes === 0) { 
        
        let mensajeAlerta = "¡Muy Bien! 🎉 Has completado la etapa de " + etapa.nombre.toUpperCase().replace(/_/g, ' ') + ".";
        
        // BONUS POR ETAPA PERFECTA (sin errores)
        if (erroresEnEtapa === 0) {
            puntuacion += 50; 
            mensajeAlerta += " ¡Y sin ningún error! (+50 puntos de bonus)";
        } else {
            mensajeAlerta += ` Tuviste ${erroresEnEtapa} error(es) en esta etapa.`;
        }

        alert(mensajeAlerta); 
        
        mensajesDrop.innerHTML = `<p>¡Etapa completada! Continúa...</p>`;
        setTimeout(() => siguienteEtapa(), 500);
      }

    } else {
      // Ingrediente incorrecto
      erroresEnEtapa++; // Incrementa el contador de errores de la etapa
      puntuacion = Math.max(0, puntuacion - 20); // Penalización más alta
      
      // ALERTA Y REINICIO DE FASE POR ERROR ⚠️
      alert("¡Error! El elemento " + nombre.replace(/_/g, ' ') + " no es correcto para esta etapa. ¡Se reiniciará la fase! Inténtalo de nuevo. (-20 puntos)");
      
      reiniciarEtapa(); 
      return; 
    }

    // Si quedan items, se muestra un mensaje temporal de la acción
    setTimeout(() => {
        if (correctosPendientes > 0) {
            mensajesDrop.innerHTML = `Arrastra aquí (${correctosPendientes} pendientes)`;
        }
    }, 1500);
  });
  
  // Mostrar los pendientes al inicio
  mensajesDrop.innerHTML = `Arrastra aquí (${correctosPendientes} pendientes)`;
}

// === Siguiente etapa ===
function siguienteEtapa() {
  etapaActual++;
  if (etapaActual < etapas.length) {
    mostrarEtapa();
  } else {
    terminarJuego();
  }
}

// === Terminar juego ===
function terminarJuego() {
  guardarPuntuacion(jugador, puntuacion);
  mostrarPantalla(pantallaFinal);
  
  // Limpiar y mostrar mensaje final
  mensajeFinal.innerHTML = `¡Excelente trabajo, ${jugador}! Has obtenido ${puntuacion} puntos 🎉`;
  
  // Eliminar y volver a mostrar el ranking para que no se duplique
  // (asegura que no haya múltiples listas de ranking si se reinicia el juego varias veces)
  document.querySelector('#pantalla-final ul')?.remove();
  document.querySelector('#pantalla-final h3:last-of-type')?.remove();
  mostrarPuntuaciones();
}

// === Guardar puntuaciones en localStorage ===
function guardarPuntuacion(nombre, puntos) {
  let registros = JSON.parse(localStorage.getItem("puntuacionesSaice")) || [];
  registros.push({ nombre, puntos });
  registros.sort((a, b) => b.puntos - a.puntos);
  registros = registros.slice(0, 5); // Solo guarda el top 5
  localStorage.setItem("puntuacionesSaice", JSON.stringify(registros));
}

// === Mostrar ranking ===
function mostrarPuntuaciones() {
  let registros = JSON.parse(localStorage.getItem("puntuacionesSaice")) || [];
  let html = "<h3>🏆 Mejores Cocineros del Saice</h3><ul>";

  if (registros.length === 0) {
    html += `<li>Aún no hay puntuaciones. ¡Sé el primero!</li>`;
  } else {
    registros.forEach((r, index) => {
      html += `<li>${index + 1}. ${r.nombre} — ${r.puntos} pts</li>`;
    });
  }

  html += "</ul>";
  // Insertar después del mensaje final, para que el ranking siempre esté debajo.
  pantallaFinal.querySelector('#mensaje-final').insertAdjacentHTML("afterend", html);
}