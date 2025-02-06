from collections import defaultdict
import unicodedata
import random
import ahocorasick

class WordleSolver:
    def __init__(self, language='es'):
        self.language = language
        self.words_by_length = self.load_dictionary()
        self.common_words = self.load_common_words()
        self.used_words = set()  # Almacenar palabras usadas
        self.automaton = self.build_automaton()

    def load_dictionary(self):
        filename = 'resources/spanish.txt' if self.language == 'es' else 'resources/english.txt'
        words_by_length = defaultdict(list)
        with open(filename, 'r', encoding='utf-8') as f:
            for line in f:
                word = self.normalize_word(line.strip().upper())
                if word.isalpha():
                    words_by_length[len(word)].append(word)
        return words_by_length

    def load_common_words(self):
        common_words = set()
        filename = 'resources/common_spanish.txt' if self.language == 'es' else 'resources/common_english.txt'
        with open(filename, 'r', encoding='utf-8') as f:
            for line in f:
                word = self.normalize_word(line.strip().upper())
                if word.isalpha():
                    common_words.add(word)
        return common_words

    def normalize_word(self, word):
        return ''.join(
            c for c in unicodedata.normalize('NFD', word)
            if unicodedata.category(c) != 'Mn'
        )

    def build_automaton(self):
        A = ahocorasick.Automaton()
        for length, words in self.words_by_length.items():
            for word in words:
                A.add_word(word, word)
        A.make_automaton()
        return A

    def select_initial_word_with_vowels(self, words):
        vowels = set('AEIOU')
        words_with_vowels = [(word, len(set(word) & vowels)) for word in words]
        max_vowels = max(words_with_vowels, key=lambda x: x[1])[1]
        best_words = [word for word, count in words_with_vowels if count == max_vowels]
        return random.choice(best_words)

    def filter_words(self, feedback, previous_word, blocked=None):
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

            # Bloquear palabras que contengan letras marcadas como mal en cualquier posición
            if any(letter in word for letter in blocked):
                continue

            # Verificar posiciones exactas
            for pos, char in constraints['exact'].items():
                if word[pos] != char:
                    valid = False
                    break

            # Verificar letras presentes pero en posición incorrecta
            if valid:
                for char, positions in constraints['present'].items():
                    if char not in word:
                        valid = False
                        break
                    for pos in positions:
                        if word[pos] == char:
                            valid = False
                            break

            # Excluir letras que no deben aparecer
            if valid:
                for char in constraints['excluded']:
                    if char in word:
                        valid = False
                        break

            # Verificar que la palabra contenga al menos la cantidad requerida de cada letra
            if valid:
                for char, count in constraints['counts'].items():
                    if word.count(char) < count:
                        valid = False
                        break

            if valid:
                valid_words.append(word)

        # Priorizar palabras comunes
        common_valid_words = [word for word in valid_words if word in self.common_words]
        return common_valid_words if common_valid_words else valid_words

    def mark_word_as_used(self, word):
        self.used_words.add(word)

    def score_word(self, word, feedback, previous_word):
        score = 0
        for i, (char, fb) in enumerate(zip(previous_word, feedback)):
            if fb == 'B' and word[i] == char:
                score += 2
            elif fb == 'C' and char in word and word[i] != char:
                score += 1
        return score

    def select_best_word(self, valid_words, feedback, previous_word):
        scored_words = [(word, self.score_word(word, feedback, previous_word)) for word in valid_words]
        scored_words.sort(key=lambda x: x[1], reverse=True)
        # Priorizar palabras comunes
        common_scored_words = [word for word, score in scored_words if word in self.common_words]
        return common_scored_words[0] if common_scored_words else scored_words[0][0] if scored_words else None