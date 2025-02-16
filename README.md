# [🚀Wordle Solver:](https://wordle-solver-six.vercel.app/) Mi Aliado para Ganar en Wordle

## Descripción General
<img src="https://github.com/blackcater/blackcater/raw/main/images/Hi.gif" height="20" />Hola! soy [**Rody**](http://linkedin.com/in/rody-uzuriaga-avil%C3%A9s-6b1409263) y creé **Wordle Solver**, una herramienta visual y práctica que te ayuda a encontrar la mejor palabra en cada intento.

![Wordle Solver Demo](https://github.com/user-attachments/assets/f20a414b-e0d6-4167-a4a7-afeb2c9cb70e)

**Wordle Solver** es una herramienta diseñada para ayudar a resolver Wordle de manera rápida y eficiente. Se basa en un sistema de filtrado que utiliza el feedback (representado con los símbolos `_` para “no aparece”, `?` para “aparece pero en posición equivocada” y `+` para “aparece en la posición correcta”) para descartar palabras y sugerir las mejores opciones. La herramienta utiliza diccionarios de palabras en distintos idiomas y longitudes, con una diferenciación especial entre las palabras comunes (pre-filtradas y priorizadas) y las ampliadas.

> [!NOTE]
> Lee detenidamente este documento, ya que contiene información importante sobre el proyecto.

---

## Inspiración
La idea surgió tras descubrir el canal [Programa con Arnau](https://www.youtube.com/@ProgramaConArnauOficial) y su método para optimizar la resolución de Wordle. Su contenido me motivó a desarrollar una solución propia.

---

## Objetivos
- **Filtrado Eficiente:** Utilizar un sistema basado en listas y conjuntos para descartar palabras en función del feedback recibido.
- **Prioridad en Palabras Comunes:** Sugerir primero palabras del diccionario “common”, los cuales han sido pre-filtrados por frecuencia y longitud.
- **Interfaz Intuitiva:** Proveer una experiencia visual y práctica para el usuario, con soporte multilingüe.

---

## Proceso de Desarrollo

### Investigación y Selección de Algoritmos
Exploré varios métodos para encontrar la mejor estrategia para filtrar palabras:

- **Trie**:  
  Estructura eficiente para almacenar y buscar palabras.

- **Búsqueda Binaria**:  
  Excelente para listas ordenadas; es rápida pero requiere un diccionario ordenado.

- **Tablas Hash (Set)**:  
  Búsquedas rápidas y eliminación de duplicados; muy práctica pero consume más memoria.

> [!NOTE]
> Uso de Tablas Hash en el Proyecto
> - excluded_letters: Se utiliza un set para almacenar las letras que no deben aparecer en la palabra.
> - required_letters: Se utiliza un set para almacenar las letras que deben estar en la palabra.
> - position_constraints: Se utiliza un diccionario con sets para manejar las restricciones de posición.

**Justificación:**  
Opté por **Tablas Hash (Set)** porque ofrece una búsqueda eficiente y rápida, lo que se ajusta bien a la naturaleza de Wordle.

---

## Estructura del Proyecto

```
wordle-solver/
├── resources/           # Diccionarios de palabras
│   ├── 5_caracteres/
│   │   ├── common_english_5.txt
│   │   ├── common_spanish_5.txt
│   │   ├── english_5.txt
│   │   └── spanish_5.txt
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
## Diccionarios Utilizados

- **Para palabras de 5 caracteres:**  
  - *Comunes*:  
    - `resources/5_caracteres/common_spanish_5.txt`  
    - `resources/5_caracteres/common_english_5.txt`  
  - *Ampliados*:  
    - `resources/5_caracteres/spanish_5.txt`  
    - `resources/5_caracteres/english_5.txt`

- **Para palabras de 4, 6, 7, 8, 9, 10, 11 caracteres:**  
  - *Comunes*:  
    - `resources/common_spanish.txt`  
    - `resources/common_english.txt`  
  - *Ampliados*:  
    - `resources/spanish.txt`  
    - `resources/english.txt`

Las palabras se cargan y normalizan (se eliminan acentos, excepto la Ñ, y se convierten a mayúsculas) al iniciarse el programa. Además, se eliminan duplicados usando estructuras de conjunto para asegurar que cada palabra aparezca una única vez.

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

### 📌 PASOS DEL PROGRAMA
1. **Selección de idioma.**
2. **Mostrar el tablero del juego (game-dashboard).**
3. **El usuario elige:**
   - Obtener una lista de palabras sugeridas.
   - Escribir manualmente una palabra.
4. **Activar el área de juego con la primera palabra.**
5. **El usuario cambia los colores según su feedback.**
6. **Al siguiente clic en `generate-word-btn`, se activa `valid-words` y se reduce la lista según el feedback.**

---
## Método Actual

### Reglas de Feedback
- `_` (Gris): La letra **no está en la palabra**.
- `?` (Amarillo): La letra **está en la palabra, pero no en esa posición**.
- `+` (Verde): La letra **está en la palabra y en la posición correcta**.

### Filtros Aplicados al Ingresar una Nueva Palabra
- **Eliminar palabras no viables** según las restricciones.
- **Actualizar las opciones sugeridas**.

### Reglas de Filtrado Según el Feedback
- Letras **excluidas**: Las letras con `_` no deben aparecer en la palabra.
- Letras **requeridas**: Las letras con `?` o `+` deben estar en la palabra.
- Posiciones **exactas**: Las letras con `+` deben estar en la posición exacta.
- Posiciones **prohibidas**: Las letras con `?` no deben estar en esa posición.

### Procesamiento Interno del Solver
- **Inicialización:**
  - `reset()`: Reinicia restricciones y estado del solver.
  - `process_feedback()`: Procesa el feedback y actualiza restricciones.
- **Filtrado:**
  - `filter_words()`: Filtra palabras válidas según restricciones.
  - `get_suggested_words()`: Devuelve palabras sugeridas tras el filtrado.
- **Manejo de Restricciones:**
  - `excluded_letters`: Letras que **no deben aparecer**.
  - `required_letters`: Letras que **deben aparecer**.
  - `position_constraints`: Restricciones de posición.
- **Uso de Palabras:**
  - `mark_word_as_used()`: Marca palabras como usadas para no sugerirlas nuevamente.

### Ejemplo de Aplicación del Feedback
Para la palabra **"pato"** con feedback `_?+_`:
- `p` no está en la palabra (`_`).
- `a` está en la palabra, pero no en la segunda posición (`?`).
- `t` está en la posición correcta (`+`).
- `o` no está en la palabra (`_`).

Las palabras sugeridas serán aquellas que cumplan estas condiciones.

### Mejoras Adicionales
- **Validación de Feedback:**
  - Solo debe contener `_`, `?`, y `+`.
  - Debe coincidir en longitud con la palabra ingresada.
- **Priorización de Palabras Comunes:**
  - Se dará prioridad a palabras de los diccionarios comunes antes de usar los ampliados.


---

## Ejemplo del Algoritmo Usado (`wordle_solver.py`)

A continuación, un fragmento comentado para que puedas entender el código:

```python
from collections import defaultdict
import unicodedata
import random

class WordleSolver:
    def __init__(self, word_list, word_length=5):
        self.word_list = word_list
        self.word_length = word_length
        self.reset()

    def reset(self):
        """Reinicia las restricciones y el estado del solver."""
        self.excluded_letters = set()  # Letras que no están en la palabra
        self.required_letters = set()  # Letras que deben estar en la palabra
        self.position_constraints = {}  # Restricciones de posición
        self.used_words = set()  # Palabras ya usadas

    def process_feedback(self, word, feedback):
        """Procesa el feedback y actualiza las restricciones."""
        if len(word) != self.word_length or len(feedback) != self.word_length:
            raise ValueError("La palabra y el feedback deben tener la misma longitud.")

        print(f"Procesando feedback para la palabra {word}: {feedback}")

        for i, (letter, symbol) in enumerate(zip(word, feedback)):
            if symbol == "_":
                # La letra no está en la palabra
                if letter not in self.required_letters:
                    self.excluded_letters.add(letter)
            elif symbol == "?":
                # La letra está en la palabra, pero no en esta posición
                self.required_letters.add(letter)
                if i not in self.position_constraints:
                    self.position_constraints[i] = set()
                self.position_constraints[i].add(letter)
            elif symbol == "+":
                # La letra está en la posición correcta
                self.required_letters.add(letter)
                self.position_constraints[i] = letter
            else:
                raise ValueError(f"Símbolo no válido: {symbol}")

        # Verificar que no haya contradicciones entre letras excluidas y requeridas
        self.excluded_letters -= self.required_letters

        # Imprimir los conjuntos de letras excluidas, requeridas y las restricciones de posición
        print(f"Letras excluidas (no deberían estar en ninguna posición): {self.excluded_letters}")
        print(f"Letras requeridas (deben estar en alguna posición): {self.required_letters}")
        print(f"Restricciones de posición: {self.position_constraints}")

    def filter_words(self):
        """Filtra las palabras válidas basadas en las restricciones actuales."""
        print(f"Filtrando palabras con restricciones: {self.excluded_letters}, {self.required_letters}, {self.position_constraints}")
        
        # Imprimir el total de palabras disponibles antes del filtro
        print(f"Total palabras disponibles antes del filtro: {len(self.word_list)}")
        print("Ejemplo de palabras antes del filtro:", self.word_list[:10])  # Muestra las 10 primeras

        valid_words = []
        for word in self.word_list:
            print(f"Verificando palabra: {word}")  # Nueva línea de depuración
            if word in self.used_words:
                continue  # Saltar palabras ya usadas

            # Verificar letras excluidas
            if any(letter in self.excluded_letters for letter in word):
                print(f"Palabra descartada por letras excluidas: {word}")  # Nueva línea de depuración
                continue

            # Verificar letras requeridas
            if not all(letter in word for letter in self.required_letters):
                print(f"Palabra descartada por letras requeridas: {word}")  # Nueva línea de depuración
                continue

            # Verificar restricciones de posición
            valid = True
            for i, constraint in self.position_constraints.items():
                if i >= len(word):
                    continue  # Evitar error de índice
                if isinstance(constraint, set):
                    # Restricción de posición prohibida (símbolo "?")
                    if word[i] in constraint:
                        print(f"Palabra descartada por restricción de posición prohibida: {word}")  # Nueva línea de depuración
                        valid = False
                        break
                else:
                    # Restricción de posición exacta (símbolo "+")
                    if word[i] != constraint:
                        print(f"Palabra descartada por restricción de posición exacta: {word}")  # Nueva línea de depuración
                        valid = False
                        break

            if valid:
                valid_words.append(word)

        # Imprimir el total de palabras después del filtro
        print(f"Total palabras después del filtro: {len(valid_words)}")
        print("Ejemplo de palabras después del filtro:", valid_words[:10])  # Muestra las 10 primeras

        print(f"Palabras sugeridas después de filtrar: {valid_words}")  # ✅ Nueva línea para depuración
        return valid_words

    def get_suggested_words(self):
        """Obtiene una lista de palabras sugeridas basadas en las restricciones."""
        valid_words = self.filter_words()
        return valid_words

    def mark_word_as_used(self, word):
        """Marca una palabra como usada."""
        self.used_words.add(word)
```

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

🚀 **Conclusión sobre Estructuras**  
- Para una base de datos de palabras grande (> 10,000), **Trie** o **Tabla Hash** son mejores.   
- Para optimizar aún más, se podría usar una combinación de **Trie para indexar palabras** y **una tabla hash para acceso rápido a candidatos filtrados**.  

---

### *¡Gracias por leer este documento y por considerar colaborar o dar feedback!*
