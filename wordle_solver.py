import codecs
import unicodedata
from collections import defaultdict

total_cargadas = 0

def quitar_acentos(palabra):
    palabra_normalizada = unicodedata.normalize('NFKD', palabra)
    resultado = []
    for c in palabra_normalizada:
        if unicodedata.combining(c) and resultado and resultado[-1] in "Nn":
            # Si encontramos un carácter combinable y antes hay una "N", verificamos si es una "Ñ"
            if c == "\u0303":  # Código Unicode de la tilde nasal (~)
                resultado[-1] = "Ñ" if resultado[-1] == "N" else "ñ"
            continue  # Saltamos este carácter combinable
        if not unicodedata.combining(c):
            resultado.append(c)
    return ''.join(resultado).upper()

def cargar_diccionario(ruta_archivo, longitud):
    global total_cargadas
    with codecs.open(ruta_archivo, 'r', encoding='utf-8', errors='ignore') as archivo:
        todas = [linea.strip() for linea in archivo]
        normalizadas = [quitar_acentos(p) for p in todas]

        # Debugging: verificar palabras antes y después de la normalización
        print("Ejemplo de palabras originales:", todas[:10])
        print("Ejemplo de palabras normalizadas:", normalizadas[:10])

        total_cargadas += len(normalizadas)
        filtradas = [p for p in normalizadas if len(p) == longitud]
    
    print(f"{ruta_archivo}: {len(filtradas)} palabras después de filtrar por longitud")
    return filtradas

def cargar_diccionarios(idioma, longitud, intento):
    if longitud == 5:
        if idioma == 'es':
            comunes = cargar_diccionario('resources/5_caracteres/common_spanish_5.txt', longitud)
            ampliados = cargar_diccionario('resources/5_caracteres/spanish_5.txt', longitud)
        else:
            comunes = cargar_diccionario('resources/5_caracteres/common_english_5.txt', longitud)
            ampliados = cargar_diccionario('resources/5_caracteres/english_5.txt', longitud)
    else:
        if idioma == 'es':
            comunes = cargar_diccionario('resources/common_spanish.txt', longitud)
            ampliados = cargar_diccionario('resources/spanish.txt', longitud)
        else:
            comunes = cargar_diccionario('resources/common_english.txt', longitud)
            ampliados = cargar_diccionario('resources/english.txt', longitud)
    
    # Imprimir la cantidad de palabras únicas en cada diccionario
    print(f"Comunes únicas: {len(set(comunes))}, Ampliados únicas: {len(set(ampliados))}")
    print(f"Total combinadas antes de filtrado: {len(set(comunes).union(set(ampliados)))}")

    palabras_finales = list(set(comunes + ampliados))
    print(f"Palabras almacenadas finalmente: {len(palabras_finales)}")  # Línea de depuración
    return palabras_finales

def revisar_caracteres_extranos(ruta_archivo):
    contador_caracteres_extranos = 0
    with codecs.open(ruta_archivo, "r", encoding="utf-8", errors="ignore") as archivo:
        for linea in archivo:
            if not linea.strip().isascii():
                contador_caracteres_extranos += 1
    print(f"{ruta_archivo}: {contador_caracteres_extranos} líneas con caracteres extraños")

# Revisa caracteres extraños en los archivos de diccionario
revisar_caracteres_extranos("resources/5_caracteres/spanish_5.txt")
revisar_caracteres_extranos("resources/5_caracteres/common_spanish_5.txt")

# Imprimir el total de palabras cargadas antes de filtrar por longitud
print(f"Total palabras antes de filtro de longitud: {total_cargadas}")

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
#            #print(f"Verificando palabra: {word}")  # Nueva línea de depuración
            if word in self.used_words:
                continue  # Saltar palabras ya usadas

            # Verificar letras excluidas
            if any(letter in self.excluded_letters for letter in word):
#                #print(f"Palabra descartada por letras excluidas: {word}")  # Nueva línea de depuración
                continue

            # Verificar letras requeridas
            if not all(letter in word for letter in self.required_letters):
#                #print(f"Palabra descartada por letras requeridas: {word}")  # Nueva línea de depuración
                continue

            # Verificar restricciones de posición
            valid = True
            for i, constraint in self.position_constraints.items():
                if i >= len(word):
                    continue  # Evitar error de índice
                if isinstance(constraint, set):
                    # Restricción de posición prohibida (símbolo "?")
                    if word[i] in constraint:
#                        #print(f"Palabra descartada por restricción de posición prohibida: {word}")  # Nueva línea de depuración
                        valid = False
                        break
                else:
                    # Restricción de posición exacta (símbolo "+")
                    if word[i] != constraint:
#                        #print(f"Palabra descartada por restricción de posición exacta: {word}")  # Nueva línea de depuración
                        valid = False
                        break

            if valid:
                valid_words.append(word)

        # Imprimir el total de palabras después del filtro
        print(f"Total palabras después del filtro: {len(valid_words)}")
#        #print("Ejemplo de palabras después del filtro:", valid_words[:10])  # Muestra las 10 primeras

#        #print(f"Palabras sugeridas después de filtrar: {valid_words}")  # ✅ Nueva línea para depuración
        return valid_words

    def get_suggested_words(self):
        """Obtiene una lista de palabras sugeridas basadas en las restricciones."""
        valid_words = self.filter_words()
        return valid_words

    def mark_word_as_used(self, word):
        """Marca una palabra como usada."""
        self.used_words.add(word)
