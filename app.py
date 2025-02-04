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
    data = request.json
    length = data.get('length')
    solver = solvers[data['language']]
    
    if 'feedback' in data and 'previous_word' in data:
        valid_words = solver.double_check_words(data['feedback'], data['previous_word'])
        word = solver.select_best_word(valid_words, data['feedback'], data['previous_word'])
    else:
        valid_words = solver.words_by_length[length]
        word = solver.select_initial_word(length)
    
    if word:
        solver.mark_word_as_used(word)  # Marcar la palabra como usada
    else:
        word = 'NO SE ENCONTRÓ PALABRA'
    
    return jsonify({'word': word, 'valid_words': list(set(valid_words))})

if __name__ == '__main__':
    app.run(debug=True)