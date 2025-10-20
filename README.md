# MCQ Bot

This project is a command-line Multiple Choice Question (MCQ) assessment bot powered by a language model (e.g., Mistral). It generates MCQs on various data science and AI topics, adapts difficulty based on user performance, and keeps score.

## Features
- Generates MCQs on topics like machine learning, deep learning, statistics, and more
- Three difficulty levels: easy, medium, hard
- Adaptive difficulty: increases or decreases based on your answers
- Provides explanations for each answer
- Tracks and displays your total score

## Requirements
- Python 3.7+
- `requests` library
- A running language model API (e.g., Mistral) accessible at `http://localhost:11434/api/generate`

## Installation
1. Clone this repository:
   ```sh
   git clone <your-repo-url>
   cd <repo-folder>
   ```
2. (Optional) Create and activate a virtual environment:
   ```sh
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```sh
   pip install requests
   ```

## Usage
Run the MCQ bot from the command line:

```sh
python bot.py
```

Or, to use the MCQ assessment and scoring functions directly:

```python
from mcq import mcq_assessment, mcq_score

# Generate a single MCQ
mcq = mcq_assessment(topic="statistics", difficulty="medium")
print(mcq)

# Run a full MCQ quiz
score = mcq_score(round=10)
print(f"Your score: {score}")
```

## File Overview
- `bot.py` — Main entry point for the chat/MCQ bot
- `mcq.py` — MCQ generation and scoring logic
- `memory.py` — Handles saving and loading conversation history

## Notes
- The bot expects the language model API to return MCQs in JSON format with keys: `question`, `options`, `correct_answer`, and `explanation`.
- If the model response cannot be parsed, an error will be raised.

## License
MIT License
