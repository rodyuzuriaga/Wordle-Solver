let language = 'es';
let wordLength = 0;
let initialWord = '';
let attemptCount = 1;
let previousWord = '';
const maxAttempts = 6;
let blockedLetters = []; // acumula letras marcadas como "M"

function selectLanguage(lang) {
    language = lang;
    document.getElementById('language-selection').style.display = 'none';
    document.getElementById('game-dashboard').style.display = 'block';
}

function startGame() {
    wordLength = parseInt(document.getElementById('word-length').value);
    document.getElementById('game-area').style.display = 'none'; // Siempre ocultar el área de juego primero
    document.getElementById('feedback').value = ''; // Limpiar el feedback del último intento
    
    if (wordLength > 0) {
        document.getElementById('feedback').setAttribute('maxlength', wordLength);
        attemptCount = 1;
        blockedLetters = [];
        generateInitialWord(wordLength);
    } else {
        // Solo mostrar el mensaje de validación
        document.getElementById('validation-message').innerText = 'No se encontró una palabra válida. Intente otra cantidad de caracteres.';
        document.getElementById('validation-message').style.display = 'block';
    }
}

function updateGameUI(data, resetFeedback = false) {
    if (data.word.includes("NO SE ENCONTRÓ")) {
        document.getElementById('validation-message').innerText = 'No se encontró una palabra válida. Intente de nuevo.';
        document.getElementById('validation-message').style.display = 'block';
        document.getElementById('game-area').style.display = 'none'; // Deshabilitar el cuadro de texto
    } else {
        previousWord = data.word;
        initialWord = data.word;
        document.getElementById('initial-word').innerText = `Intento ${attemptCount}: ${data.word}`;
        document.getElementById('game-area').style.display = 'block';
        document.getElementById('validation-message').style.display = 'none'; // Ocultar mensaje de validación
        if (resetFeedback) {
            document.getElementById('feedback').value = '';
        }
        document.getElementById('valid-words').innerText =
            data.valid_words && data.valid_words.length > 0
                ? `Palabras candidatas: ${[...new Set(data.valid_words)].join(', ')}`
                : 'Sin palabras candidatas por ahora';
    }
}

function generateInitialWord(length) {
    fetch('/generate_word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ length: length, language: language })
    })
    .then(response => response.json())
    .then(data => updateGameUI(data))
    .catch(err => {
        console.error('Error:', err);
        document.getElementById('validation-message').innerText = 'Error en la comunicación con el servidor.';
        document.getElementById('validation-message').style.display = 'block';
        document.getElementById('game-area').style.display = 'none'; // Deshabilitar el cuadro de texto
    });
}

function submitFeedback() {
    const feedback = document.getElementById('feedback').value.toUpperCase();
    if (feedback.length === wordLength && /^[BMC]+$/.test(feedback)) {
        // Actualizar bloqueados: para cada 'M' agregarlos (sin duplicados)
        [...feedback].forEach((letter, index) => {
            if (letter === 'M' && !blockedLetters.includes(previousWord[index])) {
                blockedLetters.push(previousWord[index]);
            }
        });

        if (feedback === 'B'.repeat(wordLength)) {
            document.getElementById('initial-word').innerText = `¡Felicidades! Palabra encontrada: ${initialWord}`;
        } else {
            attemptCount++;
            if (attemptCount > maxAttempts) {
                document.getElementById('initial-word').innerText = 'Lo siento, has alcanzado el máximo de intentos.';
                resetGame();
                return;
            }
            fetch('/generate_word', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    length: wordLength,
                    language: language,
                    feedback: feedback,
                    previous_word: initialWord,
                    blocked: blockedLetters
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.word.includes("NO SE ENCONTRÓ")) {
                    document.getElementById('validation-message').innerText = 'No se encontró una palabra válida. Intente de nuevo.';
                    document.getElementById('validation-message').style.display = 'block';
                    document.getElementById('game-area').style.display = 'none'; // Deshabilitar el cuadro de texto
                } else {
                    updateGameUI(data, true);
                }
            })
            .catch(err => {
                console.error('Error:', err);
                document.getElementById('validation-message').innerText = 'Error en la comunicación con el servidor.';
                document.getElementById('validation-message').style.display = 'block';
                document.getElementById('game-area').style.display = 'none'; // Deshabilitar el cuadro de texto
            });
        }
    } else {
        document.getElementById('validation-message').innerText = 'El feedback debe tener la misma longitud que la palabra y solo contener las letras B, M, C.';
        document.getElementById('validation-message').style.display = 'block';
    }
}

function validateFeedback() {
    const feedbackInput = document.getElementById('feedback');
    feedbackInput.value = feedbackInput.value.toUpperCase().replace(/[^BMC]/g, '');
}

function resetGame() {
    attemptCount = 1;
    previousWord = '';
    initialWord = '';
    blockedLetters = [];
    document.getElementById('initial-word').innerText = '';
    document.getElementById('feedback').value = '';
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('language-selection').style.display = 'block';
    document.getElementById('game-dashboard').style.display = 'none';
    document.getElementById('validation-message').style.display = 'none'; // Ocultar mensaje de validación
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
  requestAnimationFrame(animateCircles);
}
animateCircles();

document.addEventListener('DOMContentLoaded', () => {
    const interBubble = document.querySelector('.interactive');
    let curX = 0, curY = 0, tgX = 0, tgY = 0;
    function move() {
        curX += (tgX - curX) / 20;
        curY += (tgY - curY) / 20;
        interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
        requestAnimationFrame(move);
    }
    window.addEventListener('mousemove', (event) => {
        tgX = event.clientX;
        tgY = event.clientY;
    });
    move();
});