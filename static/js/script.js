let language = 'es';
let wordLength = 5; // Longitud inicial (se actualizará si se cambia en el desplegable)
let intentos = [];
let palabraActual = ""; // Almacena la palabra en edición
let feedbackActual = []; // Colores del intento en edición
let edicionActiva = false; // Indica si se está editando

function selectLanguage(lang) {
    console.log(`Idioma seleccionado: ${lang}`);
    resetGame(false).then(() => {
        language = lang;
        document.getElementById('language-selection').style.display = 'none';
        document.getElementById('game-dashboard').style.display = 'block';
        document.querySelector('.retry-btn').style.display = 'block';
    });
}

function agregarIntento(palabra) {
    if (!palabra || palabra.length !== wordLength) return alert(`Debe ser una palabra de ${wordLength} letras`);
    intentos.push({ palabra, feedback: Array(wordLength).fill('_') }); // Inicializa con feedback '_'
    palabraActual = palabra;
    feedbackActual = Array(wordLength).fill('_');
    edicionActiva = true; // Activa la edición del nuevo intento

    console.log('Intentos:', intentos); // Verificar el estado de los intentos
    console.log(`Feedback inicial actualizado: ${feedbackActual}`); // Añadir log para verificar el feedback
    document.getElementById('game-area').style.display = 'flex'; // Mostrar el área de juego

    actualizarUI();
    edicionActiva = false; // Desactivar la edición después de actualizar el feedback
}

function eliminarIntentoActual() {
    if (intentos.length > 0) {
        intentos.pop();
        if (intentos.length > 0) {
            let ultimo = intentos[intentos.length - 1];
            palabraActual = ultimo.palabra;
            feedbackActual = [...ultimo.feedback];
        } else {
            palabraActual = "";
            feedbackActual = [];
            edicionActiva = false; // Se desactiva la edición si no hay intentos
            document.getElementById('game-area').style.display = 'none'; // Ocultar el área de juego si no hay intentos
        }
        actualizarUI();
    }
}

function actualizarFeedback(index, color) {
    feedbackActual[index] = color;
    intentos[intentos.length - 1].feedback = [...feedbackActual];
    console.log(`Feedback actualizado: ${feedbackActual}`); // Añadir log para verificar el feedback
    actualizarUI();
}

function mostrarSugerencias() {
    if (edicionActiva) return; // No permitir obtener sugerencias si ya estás editando

    console.log("Obteniendo lista de palabras sugeridas...");

    const loadingOverlay = document.getElementById("loading-overlay");
    loadingOverlay.style.display = "flex"; // Mostrar animación de carga

    fetch('/generate_word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: language, length: wordLength, intentos: intentos }) // Asegúrate de que intentos es una lista
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Palabras sugeridas recibidas:", data.words);
        if (data.words && data.words.length > 0) {
            let container = document.getElementById("valid-words");
            container.innerHTML = "";
            container.style.display = 'flex'; // Mostrar la sección de palabras válidas

            data.words.forEach(palabra => { // Limitar a 10 palabras
                let wordContainer = document.createElement("div");
                wordContainer.className = 'word-container';

                let wordText = document.createElement("span");
                wordText.className = 'word-text';
                wordText.innerText = palabra; // Las palabras ya están en mayúsculas

                let selectButton = document.createElement("button");
                selectButton.className = 'select-word-button';
                selectButton.innerHTML = '↩';
                selectButton.onclick = () => {
                    console.log(`Palabra seleccionada: ${palabra}`);
                    agregarIntento(palabra);
                    container.innerHTML = ""; // Limpiar las sugerencias después de elegir
                    container.style.display = 'none'; // Ocultar la sección de palabras válidas
                    document.getElementById('game-area').style.display = 'flex'; // Mostrar el área de juego

                    // Llenar el feedback con puros '_'
                    feedbackActual = Array(wordLength).fill('_');
                    intentos[intentos.length - 1].feedback = [...feedbackActual];
                    //console.log(`Feedback inicial actualizado: ${feedbackActual}`); // Añadir log para verificar el feedback
                    actualizarUI();
                    edicionActiva = false; // Desactivar la edición después de actualizar el feedback
                };

                wordContainer.appendChild(wordText);
                wordContainer.appendChild(selectButton);
                container.appendChild(wordContainer);
            });
        } else {
            console.log("No se encontró una palabra válida");
            alert('No se encontró una palabra válida');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error en la comunicación con el servidor.');
    })
    .finally(() => {
        loadingOverlay.style.display = "none"; // Ocultar la animación de carga
    });
}

function actualizarUI() {
    let container = document.getElementById("intentos-container");
    container.innerHTML = ""; // Limpia la UI

    let todasVerdes = true;

    intentos.forEach((intento, idx) => {
        let intentoDiv = document.createElement("div");
        intentoDiv.className = 'intento-container';

        intento.palabra.split('').forEach((letra, index) => {
            let button = document.createElement("button");
            button.className = 'word-btngame';
            button.innerText = letra;
            button.style.backgroundColor = intento.feedback[index] === '_' ? '#6c757d' : intento.feedback[index] === '?' ? '#ffc107' : '#22c55e';
            button.style.color = intento.feedback[index] === '?' ? 'black' : 'white';
            if (intento.feedback[index] !== '+') {
                todasVerdes = false;
            }
            if (idx === intentos.length - 1) {
                button.onclick = () => {
                    edicionActiva = true; // Activa la edición al hacer clic en el botón
                    let newColor = intento.feedback[index] === '_' ? '?' : intento.feedback[index] === '?' ? '+' : '_';
                    actualizarFeedback(index, newColor);
                    edicionActiva = false; // Desactiva la edición después de actualizar el feedback
                };
            }
            intentoDiv.appendChild(button);
        });

        if (idx === intentos.length - 1) {
            if (intento.feedback.every(feedback => feedback === '+')) {
                let btnCheck = document.createElement("button");
                btnCheck.className = 'check-word-button';
                btnCheck.textContent = "✔";
                intentoDiv.appendChild(btnCheck);
                todasVerdes = true;
            } else {
                let btnEliminar = document.createElement("button");
                btnEliminar.className = 'remove-word-button';
                btnEliminar.textContent = "✖";
                btnEliminar.onclick = eliminarIntentoActual;
                intentoDiv.appendChild(btnEliminar);
                todasVerdes = false;
            }
        } else {
            let btnCheck = document.createElement("button");
            btnCheck.className = 'check-word-button';
            btnCheck.textContent = "✔";
            intentoDiv.appendChild(btnCheck);
        }

        container.appendChild(intentoDiv);
    });

    // Mostrar mensaje de felicitación si todas las palabras están validadas en verde
    if (todasVerdes && intentos.length > 0) {
        let mensajeFelicitacion = document.createElement("div");
        mensajeFelicitacion.className = 'felicitacion';
        mensajeFelicitacion.innerText = "¡Felicidades! Palabra encontrada";
        container.appendChild(mensajeFelicitacion);
    }

    // No bloquear el botón de agregar intentos
    document.getElementById("start-game-btn").disabled = false;
}

function resetGame(resetLanguage = true) {
    console.log('Reiniciando juego...');
    return fetch('/reset_game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        intentos = []; // Vaciar el array de intentos
        palabraActual = "";
        feedbackActual = [];
        edicionActiva = false;

        const userWordElement = document.getElementById('user-word');
        const sugerenciasContainer = document.getElementById('sugerencias-container');
        const intentosContainer = document.getElementById('intentos-container');
        const gameArea = document.getElementById('game-area');
        const languageSelection = document.getElementById('language-selection');
        const gameDashboard = document.getElementById('game-dashboard');
        const retryBtn = document.querySelector('.retry-btn');
        const validWordsContainer = document.getElementById('valid-words'); // Obtener el contenedor de valid-words

        if (userWordElement) userWordElement.value = '';
        if (sugerenciasContainer) sugerenciasContainer.innerHTML = '';
        if (intentosContainer) intentosContainer.innerHTML = '';
        if (validWordsContainer) validWordsContainer.style.display = 'none'; // Ocultar el contenedor de valid-words
        if (gameArea) gameArea.style.display = 'none'; // Ocultar el área de juego

        if (resetLanguage) {
            if (languageSelection) languageSelection.style.display = 'block';
            if (gameDashboard) gameDashboard.style.display = 'none';
            if (retryBtn) retryBtn.style.display = 'none';
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Error en la comunicación con el servidor.');
    });
}

function retryGame() {
    console.log('Reiniciando juego con los datos almacenados...');
    resetGame(false);
    document.getElementById('game-dashboard').style.display = 'block';
}

function updateWordLength() {
    const numInput = document.getElementById('numInput').value;
    if (numInput >= 4 && numInput <= 11) {
        wordLength = parseInt(numInput);
        document.getElementById('user-word').setAttribute('maxlength', wordLength);
        document.getElementById('user-word').setAttribute('placeholder', `Palabra de ${wordLength} letras`);
        resetGame(false);
        console.log(`Reiniciando aplicando número de caracteres: ${wordLength}`);

        const validWordsContainer = document.getElementById('valid-words'); // Obtener el contenedor de valid-words
        if (validWordsContainer) validWordsContainer.style.display = 'none'; // Ocultar el contenedor de valid-words
    } else {
        alert('Por favor, ingresa un número entre 4 y 11.');
    }
}

// Código para animar los círculos (sin cambios relevantes)
const coords = { x: 0, y: 0 };
const circles = document.querySelectorAll(".circle");
const colors = [
  "#FFD700",
  "#FFB300",
  "#FF9900",
  "#FF6600",
  "#FF2D00",
  "#FF0033",
  "#FD5C5C",
  "#E90063",
  "#D50073",
  "#C20085",
  "#9C00A0",
  "#6A11CB",
  "#2575fc",
];

circles.forEach(function (circle, index) {
  circle.x = 0;
  circle.y = 0;
  circle.style.backgroundColor = colors[index % colors.length];
});

let mouseMoving = false;
let mouseTimeout;
window.addEventListener("mousemove", function(e){
  coords.x = e.clientX;
  coords.y = e.clientY;
  mouseMoving = true;
  clearTimeout(mouseTimeout);
  mouseTimeout = setTimeout(() => { mouseMoving = false; }, 200);
});

function animateCircles() {
  if (window.innerWidth >= 768) { // Solo animar si el ancho de la pantalla es mayor o igual a 768px
    let x = coords.x;
    let y = coords.y;
    circles.forEach(function (circle, index) {
      circle.style.left = x - 12 + "px";
      circle.style.top = y - 12 + "px";
      circle.style.scale = (circles.length - index) / circles.length;
      circle.style.opacity = mouseMoving ? 1 : 0;
      circle.x = x;
      circle.y = y;
      const nextCircle = circles[index + 1] || circles[0];
      x += (nextCircle.x - x) * 0.3;
      y += (nextCircle.y - y) * 0.3;
    });
  }
  requestAnimationFrame(animateCircles);
}
animateCircles();

document.addEventListener('DOMContentLoaded', () => {
    const interBubble = document.querySelector('.interactive');
    let curX = 0, curY = 0, tgX = 0, tgY = 0;
    function move() {
        if (window.innerWidth >= 768) { // Solo animar si el ancho de la pantalla es mayor o igual a 768px
            curX += (tgX - curX) / 20;
            curY += (tgY - curY) / 20;
            interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
        }
        requestAnimationFrame(move);
    }
    window.addEventListener('mousemove', (event) => {
        tgX = event.clientX;
        tgY = event.clientY;
    });
    move();
});

document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('game-area');
    let isDown = false;
    let startX;
    let scrollLeft;

    gameArea.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - gameArea.offsetLeft;
        scrollLeft = gameArea.scrollLeft;
    });

    gameArea.addEventListener('mouseleave', () => {
        isDown = false;
    });

    gameArea.addEventListener('mouseup', () => {
        isDown = false;
    });

    gameArea.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - gameArea.offsetLeft;
        const walk = x - startX; // Relación de 1 a 1
        gameArea.scrollLeft = scrollLeft - walk;
    });

    gameArea.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - gameArea.offsetLeft;
        scrollLeft = gameArea.scrollLeft;
    });

    gameArea.addEventListener('touchend', () => {
        isDown = false;
    });

    gameArea.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - gameArea.offsetLeft;
        const walk = x - startX; // Relación de 1 a 1
        gameArea.scrollLeft = scrollLeft - walk;
    });
});

document.getElementById('start-game-btn').onclick = function() {
    agregarIntento(document.getElementById('user-word').value);
};
