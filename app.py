from flask import Flask, request, jsonify, render_template
from wordle_solver import WordleSolver
import random

app = Flask(__name__)

# Inicializar solvers para cada idioma
solvers = {
    'es': WordleSolver('es'),
    'en': WordleSolver('en')
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_word', methods=['POST'])
def generate_word():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No se enviaron datos'}), 400

        language = data.get('language', 'es')
        length = data.get('length')
        feedback = data.get('feedback')
        previous_word = data.get('previous_word')
        blocked = data.get('blocked', [])  # letras marcadas como mal acumuladas

        solver = solvers.get(language)
        if not solver:
            return jsonify({'error': 'No se encontró el solver para este idioma'}), 500

        # Validar que la longitud exista en el diccionario
        if length not in solver.words_by_length or not solver.words_by_length[length]:
            return jsonify({'word': 'NO SE ENCONTRÓ una palabra válida', 'valid_words': []}), 200

        # Si no se envía feedback ni previous_word, se asume inicio del juego.
        if not feedback or not previous_word:
            all_words = solver.words_by_length.get(length, [])
            if not all_words:
                return jsonify({'word': 'NO SE ENCONTRÓ una palabra válida', 'valid_words': []}), 200
            common = [w for w in all_words if w in solver.common_words]
            chosen = solver.select_initial_word_with_vowels(common) if common else solver.select_initial_word_with_vowels(all_words)
            solver.mark_word_as_used(chosen)
            return jsonify({'word': chosen, 'valid_words': []}), 200

        # Filtrar según feedback y letras bloqueadas
        valid_words = solver.filter_words(feedback, previous_word, blocked)
        next_word = solver.select_best_word(valid_words, feedback, previous_word)
        if not next_word:
            return jsonify({'word': 'NO SE ENCONTRÓ una palabra válida', 'valid_words': []}), 200

        solver.mark_word_as_used(next_word)
        return jsonify({'word': next_word, 'valid_words': list(set(valid_words))}), 200  # Eliminar duplicados
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)