from bot import chat, add_consversation, load_memory, save_memory
from mcq import mcq_assessment
import re

def detect_mcq_request(user_input):
    # Detect if user wants a full quiz or a single MCQ
    quiz_patterns = [
        r"(full|complete|long|big)? ?quiz",
        r"quiz session",
        r"test session",
        r"give me (a|an)? ?(full|complete|long|big)? ?quiz",
        r"i want to take a quiz",
        r"start a quiz",
        r"give me a quiz"
    ]
    for pat in quiz_patterns:
        if re.search(pat, user_input, re.IGNORECASE):
            return "__FULL_QUIZ__"
    patterns = [
        r"test me on ([\w\s]+)",
        r"quiz me about ([\w\s]+)",
        r"give me a quiz on ([\w\s]+)",
        r"ask me a question about ([\w\s]+)"
    ]
    for pat in patterns:
        match = re.search(pat, user_input, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def main():
    while True:
        user = input("You: ")
        history = load_memory()
        if user.lower() in {"exit", "quit"}:
            break
        if user.lower() == "/clear":
            messages = []
            save_memory(messages)
            print("Conversation history cleared.")
            continue


        mcq_request = detect_mcq_request(user)
        if mcq_request == "__FULL_QUIZ__":
            try:
                rounds = input("How many questions do you want in your quiz? (default 10): ").strip()
                rounds = int(rounds) if rounds.isdigit() else 10
                score = 0
                correct_answers = 0
                wrong_answers = 0
                difficulty_map = {"easy": 1, "medium": 2, "hard": 3}
                current_difficulty = "easy"
                topics = ["data science", "machine learning", "deep learning", "statistics", "data engineering", "AI ethics"]
                for i in range(rounds):
                    topic = topics[i % len(topics)]
                    difficulty = "easy" if i < rounds // 3 else "medium" if i < 2 * rounds // 3 else "hard"
                    try:
                        mcq = mcq_assessment(topic=topic, difficulty=difficulty, chat_fn=chat)
                    except Exception as e:
                        print(f"Could not generate MCQ for {topic}: {e}")
                        continue
                    print(f"\nQ{i+1} ({difficulty.title()}): {mcq['question']}")
                    j=0
                    for opt in mcq['options']:
                        j+= 1
                        print(f"{j+1}", opt)
                    user_answer = input("Your answer (1/2/3/4): ").strip().upper()
                    if user_answer == mcq["correct_answer"]:
                        print("Correct!")
                        score += difficulty_map[difficulty] * 10
                        correct_answers += 1
                        wrong_answers = 0
                        if correct_answers % 10 == 0:
                            current_difficulty = "medium" if current_difficulty == "easy" else "hard"
                            print(f"\n🔥 Great job! Difficulty increased to {current_difficulty.upper()}!\n")
                    else:
                        print(f"Wrong! The correct answer was {mcq['correct_answer']}. Explanation: {mcq['explanation']}")
                        wrong_answers += 1
                        if wrong_answers == 5:
                            current_difficulty = "easy" if current_difficulty == "medium" else "medium"
                            wrong_answers = 0
                            print(f"\n⬇️ You seem to be struggling — difficulty lowered to {current_difficulty.upper()}.\n")
                print(f"\n🏁Your total score after {rounds} questions is: {score} points.")
                add_consversation(user, f"Full MCQ quiz completed. Score: {score}")
            except Exception as e:
                print("Sorry, I couldn't run a full quiz right now.", e)
            continue
        elif mcq_request:
            try:
                mcq = mcq_assessment(topic=mcq_request, chat_fn=chat)
                print(f"\nMCQ on {mcq_request.title()}:")
                print(mcq['question'])
                j=0
                for opt in mcq['options']:
                    j+= 1
                    print(f"{j+1}", opt)
                user_answer = input("Your answer (1/2/3/4): ").strip().upper()
                if user_answer == mcq["correct_answer"]:
                    print("Correct!")
                else:
                    print(f"Wrong! The correct answer was {mcq['correct_answer']}. Explanation: {mcq['explanation']}")
                add_consversation(user, f"MCQ given on {mcq_request}. User answered: {user_answer}")
            except Exception as e:
                print("Sorry, I couldn't generate an MCQ right now.", e)
            continue

        bot_response = chat(user, history=history)
        print("Bot:", bot_response)
        add_consversation(user, bot_response)
        history = load_memory()

if __name__ == "__main__":
    main()
