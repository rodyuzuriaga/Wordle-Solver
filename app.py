from flask import Flask, request, jsonify, render_template
import random
from wordle_solver import cargar_diccionarios, WordleSolver

app = Flask(__name__)

# Almacenar temporalmente los datos seleccionados
selected_language = 'es'
selected_length = 5
intento = 0
solver = None
intentos = []  # Variable global

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_word', methods=['POST'])
def generate_word():
    global intento, solver
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No se enviaron datos'}), 400

        language = data.get('language', selected_language)
        length = data.get('length', selected_length)
        intentos_recibidos = data.get('intentos', [])  # Renombrar la variable local

        if not isinstance(intentos_recibidos, list):
            return jsonify({'error': 'El campo intentos debe ser una lista'}), 400

        print(f"Idioma: {language}, Longitud: {length}, Intento: {intento}")

        # Cargar diccionarios según el idioma y longitud
        diccionario_total = cargar_diccionarios(language, length, intento)
        print(f"Diccionario cargado con {len(diccionario_total)} palabras")

        # Inicializar el solver con el diccionario combinado si es el primer intento
        if solver is None:
            solver = WordleSolver(diccionario_total, word_length=length)
        else:
            solver.reset()  # Reiniciar las restricciones previas
            solver.word_list = diccionario_total

        # Procesar el feedback de los intentos anteriores
        for intento_recibido in intentos_recibidos:
            solver.process_feedback(intento_recibido['palabra'], intento_recibido['feedback'])
            print(f"Feedback procesado para la palabra {intento_recibido['palabra']}: {intento_recibido['feedback']}")

        # Obtener un máximo de 10 palabras sugeridas
        sugerencias = solver.get_suggested_words()
        mejores_palabras = random.sample(sugerencias, min(10, len(sugerencias))) if sugerencias else []
        print(f"Palabras sugeridas: {mejores_palabras}")

        print(type(intento), intento)  # Imprimir el tipo y valor de intento
        intento += 1  # Incrementar el número de intentos

        return jsonify({'words': mejores_palabras})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/process_feedback', methods=['POST'])
def process_feedback():
    global solver, intentos
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No se enviaron datos'}), 400

        word = data.get('word')
        feedback = data.get('feedback')

        if not word or not feedback:
            return jsonify({'error': 'Faltan datos'}), 400

        # Verificar si solver está instanciado
        if solver is None:
            return jsonify({'error': 'Solver no está instanciado'}), 500

        solver.process_feedback(word, feedback)
        solver.filter_words()
        solver.mark_word_as_used(word)

        # Asegurarse de que intentos es una lista
        if not isinstance(intentos, list):
            intentos = []

        intentos.append({'palabra': word, 'feedback': feedback})

        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/reset_game', methods=['POST'])
def reset_game():
    global intentos, solver, intento
    intentos = []
    solver = None
    intento = 0
    print("Juego reiniciado. Verificando solver:", solver)
    return jsonify({'message': 'Juego reiniciado correctamente'})

if __name__ == '__main__':
    app.run(debug=True)
