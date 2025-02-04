let language = 'es';
let wordLength = 0;
let initialWord = '';
let attemptCount = 1;
let previousWord = '';
const maxAttempts = 6;

function selectLanguage(lang) {
    language = lang;
    document.getElementById('language-selection').style.display = 'none';
    document.getElementById('game-dashboard').style.display = 'block';
}

function startGame() {
    wordLength = parseInt(document.getElementById('word-length').value);
    if (wordLength > 0) {
        document.getElementById('feedback').setAttribute('maxlength', wordLength);
        attemptCount = 1;
        generateInitialWord(wordLength);
    } else {
        alert('Por favor, ingresa una cantidad válida de caracteres.');
    }
}

function generateInitialWord(length) {
    fetch('/generate_word', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ length: length, language: language })
    })
    .then(response => response.json())
    .then(data => {
        initialWord = data.word;
        previousWord = initialWord;
        document.getElementById('initial-word').innerText = `Intento ${attemptCount}: ${initialWord}`;
        document.getElementById('game-area').style.display = 'block';
        document.getElementById('valid-words').innerText = `Palabras candidatas: ${data.valid_words.join(', ')}`;
    });
}

function submitFeedback() {
    const feedback = document.getElementById('feedback').value.toUpperCase();
    if (feedback.length === wordLength && /^[BMC]+$/.test(feedback)) {
        if (feedback === 'B'.repeat(wordLength)) {
            document.getElementById('initial-word').innerText = `¡Felicidades! Palabra encontrada: ${initialWord}`;
        } else {
            attemptCount++;
            if (attemptCount > maxAttempts) {
                alert('Lo siento, has alcanzado el máximo de intentos.');
                resetGame();
                return;
            }
            fetch('/generate_word', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    length: wordLength,
                    language: language,
                    feedback: feedback,
                    previous_word: initialWord
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.word.includes("NO SE ENCONTRÓ")) {
                    alert('¡Palabra no encontrada! Reiniciando...');
                    resetGame();
                } else {
                    previousWord = data.word;
                    initialWord = data.word;
                    document.getElementById('initial-word').innerText = `Intento ${attemptCount}: ${data.word}`;
                    document.getElementById('feedback').value = '';
                    document.getElementById('valid-words').innerText = `Palabras candidatas: ${data.valid_words.join(', ')}`;
                }
            });
        }
    } else {
        alert('El feedback debe tener la misma longitud que la palabra y solo contener las letras B, M, C.');
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
    document.getElementById('initial-word').innerText = '';
    document.getElementById('feedback').value = '';
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('language-selection').style.display = 'block';
    document.getElementById('game-dashboard').style.display = 'none';
}

const coords = { x: 0, y: 0 };
const circles = document.querySelectorAll(".circle");

const colors = [
  "#FFD700", // Gold (Starting point)
  "#FFB300", // Brighter Gold for more highlight
  "#FF9900", // Deepened Gold for contrast
  "#FF6600", // Orange that contrasts well with blue tones
  "#FF2D00", // Vivid red-orange for strong contrast
  "#FF0033", // Intense red for extra visibility
  "#FD5C5C", // Lightened red with a bit of pink
  "#E90063", // Pinkish-red
  "#D50073", // Vivid pink
  "#C20085", // Deep magenta for visibility and pop
  "#9C00A0", // Rich purple
  "#6A11CB", // Deep Blue (Last point)
  "#2575fc", // Sky Blue (First point)
];

circles.forEach(function (circle, index) {
  circle.x = 0;
  circle.y = 0;
  circle.style.backgroundColor = colors[index % colors.length];
});

window.addEventListener("mousemove", function(e){
  coords.x = e.clientX;
  coords.y = e.clientY;
  
});

function animateCircles() {
  
  let x = coords.x;
  let y = coords.y;
  
  circles.forEach(function (circle, index) {
    circle.style.left = x - 12 + "px";
    circle.style.top = y - 12 + "px";
    
    circle.style.scale = (circles.length - index) / circles.length;
    
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
    let curX = 0;
    let curY = 0;
    let tgX = 0;
    let tgY = 0;

    function move() {
        curX += (tgX - curX) / 20;
        curY += (tgY - curY) / 20;
        interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
        requestAnimationFrame(() => {
            move();
        });
    }

    window.addEventListener('mousemove', (event) => {
        tgX = event.clientX;
        tgY = event.clientY;
    });

    move();
});