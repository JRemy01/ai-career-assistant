import json
import os
import requests
import random

def mcq_assessment(topic = "machine learning", difficulty = "easy", chat_fn=None):
    """Conduct a multiple-choice question assessment on a given topic and difficulty.

    Args:
        topic (str): The subject area for the MCQs.
        difficulty (str): The difficulty level of the questions ("easy", "medium", "hard").

    Returns:
        dict: A dictionary containing the question, options, correct answer, and explanation.
    """
    prompt = (
        f"Generate a multiple-choice question on the topic of '{topic}' at a '{difficulty}' difficulty level. "
        "Provide four options (1, 2, 3, 4), indicate the correct answer, and include a brief explanation. "
        "Reply ONLY in valid JSON with keys: question, options, correct_answer, explanation. Do not include any text outside the JSON object."
    )
    if chat_fn is None:
        raise ValueError("A chat function must be provided to mcq_assessment.")
    model_response = chat_fn(prompt, model="mistral")
    try :
        mcq_assessment = json.loads(model_response)
        return mcq_assessment
    except json.JSONDecodeError:
        raise ValueError("Failed to parse MCQ data from response.")
   

    

# --- MCQ Score Calculation --- #

def mcq_score(round = 20):
    difficulty_map = {
        "easy": 1,
        "medium": 2,
        "hard": 3
    }
    current_difficulty = "easy"
    score = 0
    correct_answers = 0
    wrong_answers = 0
    topics = ["data science", "machine learning", "deep learning", "statistics", "data engineering", "AI ethics"]

    # You must pass chat_fn when calling mcq_assessment from main.py
    raise NotImplementedError("Call mcq_score from main.py with chat_fn argument.")