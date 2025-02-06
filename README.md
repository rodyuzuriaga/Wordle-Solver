# [🚀Demo Wordle Solver:](https://wordle-solver-six.vercel.app/) Mi Aliado para Ganar en Wordle

## Descripción General
<img src="https://github.com/blackcater/blackcater/raw/main/images/Hi.gif" height="20" />Hola! soy [**Rody**](http://linkedin.com/in/rody-uzuriaga-avil%C3%A9s-6b1409263) y creé **Wordle Solver** para ayudarte a resolver Wordle de forma rápida y eficiente. Utilicé algoritmos avanzados para filtrar y seleccionar las mejores palabras candidatas y quise que la herramienta fuera visual y práctica.

![Wordle Solver Demo](https://github.com/user-attachments/assets/886efc7e-332d-47c7-8b67-a4859299ae39)

> [!NOTE]
> Lee detenidamente este documento, ya que contiene información importante sobre el proyecto.

---

## Inspiración
La idea surgió tras descubrir el canal [Programa con Arnau](https://www.youtube.com/@ProgramaConArnauOficial) y su método para optimizar la resolución de Wordle. Su contenido me motivó a desarrollar una solución propia.

---

## Objetivos
- Resolver Wordle de manera eficiente.
- Mejorar la experiencia del usuario con una interfaz amigable y soporte multilingüe.

---

## Proceso de Desarrollo

### Investigación y Selección de Algoritmos
Exploré varios métodos para encontrar la mejor estrategia para filtrar palabras:

- **Aho-Corasick**:  
  Ideal para búsquedas rápidas de múltiples patrones en un solo recorrido.

- **Trie**:  
  Estructura eficiente para almacenar y buscar palabras.

- **Búsqueda Binaria**:  
  Excelente para listas ordenadas; es rápida pero requiere un diccionario ordenado.

- **Tablas Hash (Set)**:  
  Búsquedas rápidas y eliminación de duplicados; muy práctica pero consume más memoria.

> [!TIP]
> Usa la línea de comandos para detectar y resolver errores durante el desarrollo.

**Justificación:**  
Opté por **Aho-Corasick** porque ofrece una búsqueda eficiente cuando se tienen grandes volúmenes de palabras, lo que se ajusta bien a la naturaleza de Wordle.

---

## Estructura del Proyecto

```
wordle-solver/
├── resources/           # Diccionarios de palabras
│   ├── common_english.txt
│   ├── common_spanish.txt
│   ├── english.txt
│   └── spanish.txt
├── static/              # Assets del frontend
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── script.js
├── templates/           # Plantillas HTML
│   └── index.html
├── app.py               # Servidor Flask
├── wordle_solver.py     # Lógica principal del algoritmo
├── requirements.txt     # Dependencias del proyecto
├── vercel.json          # Configuración de despliegue en Vercel
└── LICENSE              # Licencia del proyecto
```

> [!WARNING]
> **NO BORRAR** el archivo `package.json` si decides trabajar en el frontend.

---

## Cómo Ejecutar el Proyecto

### Requisitos Previos
Instala las dependencias con:
```bash
pip install -r requirements.txt
```

### Iniciar el Servidor
```bash
python app.py
```

### Abrir en el Navegador
Visita: `http://localhost:5000`

> [!IMPORTANT]
> Lee las guías de contribución antes de enviar un pull request.

---

## Ejemplo del Algoritmo Usado (`wordle_solver.py`)

A continuación, un fragmento comentado para que puedas entender el código:

```python
from collections import defaultdict
import unicodedata
import random
import ahocorasick

class WordleSolver:
    def __init__(self, language='es'):
        # Inicializo el idioma y cargo los diccionarios
        self.language = language
        self.words_by_length = self.load_dictionary()
        self.common_words = self.load_common_words()
        self.used_words = set()  # Para no repetir palabras ya usadas
        self.automaton = self.build_automaton()  # Construyo el autómata para búsquedas rápidas

    def load_dictionary(self):
        # Selecciona el archivo de palabras según el idioma
        filename = 'resources/spanish.txt' if self.language == 'es' else 'resources/english.txt'
        words_by_length = defaultdict(list)
        with open(filename, 'r', encoding='utf-8') as f:
            for line in f:
                word = self.normalize_word(line.strip().upper())
                if word.isalpha():
                    words_by_length[len(word)].append(word)
        return words_by_length

    def load_common_words(self):
        # Carga las palabras más comunes
        common_words = set()
        filename = 'resources/common_spanish.txt' if self.language == 'es' else 'resources/common_english.txt'
        with open(filename, 'r', encoding='utf-8') as f:
            for line in f:
                word = self.normalize_word(line.strip().upper())
                if word.isalpha():
                    common_words.add(word)
        return common_words

    def normalize_word(self, word):
        # Normaliza la palabra quitando acentos y caracteres especiales
        return ''.join(
            c for c in unicodedata.normalize('NFD', word)
            if unicodedata.category(c) != 'Mn'
        )

    def build_automaton(self):
        # Construye el autómata de Aho-Corasick para búsqueda rápida de palabras
        A = ahocorasick.Automaton()
        for length, words in self.words_by_length.items():
            for word in words:
                A.add_word(word, word)
        A.make_automaton()
        return A

    # Métodos adicionales para filtrar palabras y seleccionar la mejor opción

    def select_initial_word_with_vowels(self, words):
        # Selecciona una palabra inicial que contenga la mayor cantidad de vocales
        vowels = set('AEIOU')
        words_with_vowels = [(word, len(set(word) & vowels)) for word in words]
        max_vowels = max(words_with_vowels, key=lambda x: x[1])[1]
        best_words = [word for word, count in words_with_vowels if count == max_vowels]
        return random.choice(best_words)

    def filter_words(self, feedback, previous_word, blocked=None):
        # Filtra las palabras candidatas según el feedback del usuario
        blocked = set(blocked) if blocked else set()
        constraints = {
            'exact': {},
            'present': defaultdict(set),
            'excluded': set(),
            'counts': defaultdict(int)
        }

        for i, (char, fb) in enumerate(zip(previous_word, feedback)):
            # 'B' = Bien, 'C' = Cambiar posición, 'M' = Mal (excluida)
            if fb == 'B':
                constraints['exact'][i] = char
                constraints['counts'][char] += 1
            elif fb == 'C':
                constraints['present'][char].add(i)
                constraints['counts'][char] += 1
            else:  # fb == 'M'
                constraints['excluded'].add(char)

        valid_words = []
        for word in self.words_by_length[len(previous_word)]:
            if word in self.used_words:
                continue
            valid = True

            # Excluir palabras que contengan letras bloqueadas
            if any(letter in word for letter in blocked):
                continue

            # Verificar posiciones exactas
            for pos, char in constraints['exact'].items():
                if word[pos] != char:
                    valid = False
                    break

            # Verificar letras presentes en posiciones incorrectas
            if valid:
                for char, positions in constraints['present'].items():
                    if char not in word:
                        valid = False
                        break
                    for pos in positions:
                        if word[pos] == char:
                            valid = False
                            break

            # Excluir palabras que contengan letras no permitidas
            if valid:
                for char in constraints['excluded']:
                    if char in word:
                        valid = False
                        break

            # Verificar la cantidad mínima de ocurrencias de cada letra
            if valid:
                for char, count in constraints['counts'].items():
                    if word.count(char) < count:
                        valid = False
                        break

            if valid:
                valid_words.append(word)

        # Priorizar las palabras comunes
        common_valid_words = [word for word in valid_words if word in self.common_words]
        return common_valid_words if common_valid_words else valid_words

    def mark_word_as_used(self, word):
        # Marca la palabra como usada para no repetirla
        self.used_words.add(word)

    def score_word(self, word, feedback, previous_word):
        # Asigna un puntaje a la palabra en función del feedback recibido
        score = 0
        for i, (char, fb) in enumerate(zip(previous_word, feedback)):
            if fb == 'B' and word[i] == char:
                score += 2
            elif fb == 'C' and char in word and word[i] != char:
                score += 1
        return score

    def select_best_word(self, valid_words, feedback, previous_word):
        # Selecciona la mejor palabra de entre las candidatas basándose en su puntaje
        scored_words = [(word, self.score_word(word, feedback, previous_word)) for word in valid_words]
        scored_words.sort(key=lambda x: x[1], reverse=True)
        common_scored_words = [word for word, score in scored_words if word in self.common_words]
        return common_scored_words[0] if common_scored_words else scored_words[0][0] if scored_words else None
```

> [!CAUTION]
> No ejecutes el código sin antes comentar o probar los casos de prueba, para evitar resultados inesperados.

---

## Limitaciones y Trabajo Futuro
- **Rendimiento**: La búsqueda actual es O(n).  
- **Optimización**: Se planea mejorar el filtrado y uso de memoria.  
- **Futuro**: Implementar técnicas de Machine Learning para mejorar la selección de palabras.

---

### Resumen de Complejidades
| Estructura | Búsqueda  | Inserción | Filtrado        |
|------------|-----------|-----------|-----------------|
| Trie       | O(m)      | O(m)      | O(m + k)        |
| Tabla Hash | O(1)      | O(1)      | O(n)            |
| BST        | O(log n)  | O(log n)  | O(log n + k)    |

- **m**: Longitud de la palabra.
- **n**: Número de palabras en el diccionario.
- **k**: Número de palabras válidas después del filtrado.

### Conclusión
- **Recomendación**: Implementar un **Trie** para filtrar palabras de forma eficiente en próximas versiones.  
- **Alternativa**: Usar una **tabla hash** para lograr para búsquedas rápidas.

---

### *¡Gracias por leer este documento y por considerar colaborar o dar feedback!*

---