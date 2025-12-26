

from memory import add_conversation, load_memory, save_memory

import requests, json
import re
from mcq import mcq_assessment

def chat(message, history=None, model="mistral"):
    url = "http://localhost:11434/api/generate"
    
    # Add a system instruction to help the bot remember and use the user's name
    system_instruction = (
        "You are an AI Career Coach, a specialized assistant designed to help students and professionals navigate their careers in Data and Artificial Intelligence. "
        "Your goal is to provide accurate information about career paths, assess user knowledge, and recommend learning resources. "
        "Be encouraging, professional, and focus your answers strictly on topics related to Data and AI careers."
        " Don't forget to check the conversation history to provide contextually relevant responses."
        "Give small and organize responses "
    )
    if history:
        history_prompt = "\n".join([
            f"User: {h['user']}\nBot: {h['bot']}" for h in history
        ])
        full_prompt = f"{system_instruction}\n{history_prompt}\nUser: {message}"
    else:
        full_prompt = f"{system_instruction}\nUser: {message}"
    payload = {"model": model, "prompt": full_prompt, "stream": False}
    response = requests.post(url, json=payload)
    data = response.json()
    return data["response"]



