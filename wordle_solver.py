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

    def select_initial_word(self, length):
        candidates = [word for word in self.common_words if len(word) == length]
        if candidates:
            return random.choice(candidates)
        return random.choice(self.words_by_length[length])

    def filter_words(self, feedback, previous_word):
        constraints = {
            'exact': {},
            'present': defaultdict(set),
            'excluded': set(),
            'counts': defaultdict(int)
        }

        for i, (char, fb) in enumerate(zip(previous_word, feedback)):
            if fb == 'B':
                constraints['exact'][i] = char
                constraints['counts'][char] += 1
            elif fb == 'C':
                constraints['present'][char].add(i)
                constraints['counts'][char] += 1
            else:
                constraints['excluded'].add(char)

        valid_words = []
        for word in self.words_by_length[len(previous_word)]:
            if word in self.used_words:
                continue  # Saltar palabras ya usadas
            valid = True
            word_counts = defaultdict(int)
            
            # Verificar posiciones exactas
            for pos, char in constraints['exact'].items():
                if word[pos] != char:
                    valid = False
                    break
                word_counts[char] += 1
            
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
                    word_counts[char] += 1
            
            # Verificar letras excluidas y conteos
            if valid:
                for char in constraints['excluded']:
                    if char in word and word.count(char) > constraints['counts'][char]:
                        valid = False
                        break
            
                for char, count in constraints['counts'].items():
                    if word.count(char) < count:
                        valid = False
                        break

            if valid:
                valid_words.append(word)

        # Priorizar palabras comunes
        common_valid_words = [word for word in valid_words if word in self.common_words]
        if common_valid_words:
            return common_valid_words
        return valid_words

    def mark_word_as_used(self, word):
        self.used_words.add(word)

    def double_check_words(self, feedback, previous_word):
        # Primer recorrido
        valid_words = self.filter_words(feedback, previous_word)
        
        # Segundo recorrido para verificar palabras usando tablas hash
        final_valid_words = []
        for word in valid_words:
            if word not in self.used_words:
                final_valid_words.append(word)
        
        return final_valid_words

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
        return scored_words[0][0] if scored_words else None