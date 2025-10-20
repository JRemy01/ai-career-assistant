import json
import os

def load_memory():
    """Load conversation history from JSON file.

    Returns:
        List of message dictionaries, empty list if file doesn't exist
    """
    if not os.path.exists("memory.json"):
        return []
    with open("memory.json", "r") as f:
        return json.load(f)


def save_memory(messages):
    """Save conversation history to JSON file."""
    with open("memory.json", "w") as f:
        json.dump(messages, f, indent=2)
    

def add_consversation(user_input, bot_response):
    conservations = load_memory()
    conservations.append({"user":user_input, "bot":bot_response})
    save_memory(conservations)
    # Load existing memory
    # Append new conversation
    # Save updated