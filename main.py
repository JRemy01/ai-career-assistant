from bot import chat, add_conversation, load_memory, save_memory
from mcq import mcq_assessment
import re
from user_prof import add_quiz_result # New import
from datetime import datetime # Added for timestamp

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


def display_performance_summary(user_id):
    """Displays the user's detailed performance summary, including difficulty breakdown."""
    from user_prof import analyze_performance

    analysis_results = analyze_performance(user_id)

    print("\n--- Your Performance Summary ---")
    if analysis_results.get("error"):
        print(analysis_results["error"])
        return

    print(analysis_results.get("message", "Here is your performance breakdown:"))
    
    performance_data = analysis_results.get("performance_by_topic")
    if not performance_data:
        print("No performance data to display. Take a quiz to get started!")
        print("------------------------------\n")
        return

    print("\nPerformance by Topic:")
    for topic, data in performance_data.items():
        print(f"\n  ▶ {topic.title()}: {data['summary']}")
        if 'details' in data:
            for difficulty, result in data['details'].items():
                print(f"    - {difficulty.title()}: {result}")

    weakest_areas = analysis_results.get("weakest_areas")
    if weakest_areas:
        print("\nIdentified Weakest Areas:")
        for area in weakest_areas:
            print(f"  - {area.title()}")
    
    print("\n------------------------------\n")


def display_recommendations(user_id):
    """Displays personalized learning resource recommendations for the user."""
    from user_prof import recommend_resources # Import here to avoid circular dependency

    recommendations = recommend_resources(user_id)

    print("\n--- Personalized Learning Recommendations ---")
    if not recommendations:
        print("No specific recommendations available at this time. Keep taking quizzes to help us identify your needs!")
        return

    print("Based on your performance, here are some resources that might help you improve:")
    for i, resource in enumerate(recommendations):
        print(f"\n{i+1}. Title: {resource.get('title', 'N/A')}")
        print(f"   Description: {resource.get('description', 'N/A')}")
        print(f"   Topics: {', '.join([t.title() for t in resource.get('topics_covered', [])])}")
        print(f"   Difficulty: {resource.get('difficulty_level', 'N/A').title()}")
        print(f"   Link: {resource.get('url', 'N/A')}")
    print("-------------------------------------------\n")


def main():
    user_id = "default_user" # Placeholder for user ID
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
        if user.lower() == "/summary":
            display_performance_summary(user_id)
            continue
        if user.lower() == "/recommend": # New command for recommendations
            display_recommendations(user_id)
            continue


        mcq_request = detect_mcq_request(user)
        if mcq_request == "__FULL_QUIZ__":
            try:
                rounds = input("How many questions do you want in your quiz? (default 10): ").strip()
                rounds = int(rounds) if rounds.isdigit() else 10
                score = 0
                
                # For adaptive difficulty
                correct_answers_in_a_row = 0
                wrong_answers_in_a_row = 0
                current_difficulty = "easy"

                failed_mcq_generations = 0
                difficulty_map = {"easy": 1, "medium": 2, "hard": 3}
                topics = ["data science", "machine learning", "deep learning", "statistics", "data engineering", "AI ethics"]
                quiz_results = [] # To store individual question results

                for i in range(rounds):
                    topic = topics[i % len(topics)]
                    
                    try:
                        mcq = mcq_assessment(topic=topic, difficulty=current_difficulty, chat_fn=chat)
                        failed_mcq_generations = 0 # Reset counter on successful generation
                    except (ValueError, Exception) as e:
                        print(f"Could not generate MCQ for {topic}: {e}")
                        failed_mcq_generations += 1
                        if failed_mcq_generations >= 3:
                            print("\n❌ Too many consecutive failures to generate MCQs. Ending quiz.\n")
                            break # Exit the quiz loop
                        continue

                    print(f"\nQ{i+1} ({current_difficulty.title()}): {mcq['question']}")
                    for j, opt in enumerate(mcq['options']):
                        print(f"{j+1}. {opt}")

                    user_answer = input("Your answer (1/2/3/4): ").strip()
                    
                    correct = False
                    if user_answer.isdigit() and (1 <= int(user_answer) <= 4):
                        if user_answer == mcq["correct_answer"]:
                            print("✅ Correct!")
                            score += difficulty_map[current_difficulty] * 10
                            correct = True
                            correct_answers_in_a_row += 1
                            wrong_answers_in_a_row = 0
                            if correct_answers_in_a_row >= 3:
                                current_difficulty = "medium" if current_difficulty == "easy" else "hard"
                                correct_answers_in_a_row = 0
                                print(f"\n🔥 Great job! Difficulty increased to {current_difficulty.upper()}!\n")
                        else:
                            print(f"❌ Wrong! The correct answer was {mcq['correct_answer']}. Explanation: {mcq['explanation']}")
                            wrong_answers_in_a_row += 1
                            correct_answers_in_a_row = 0
                            if wrong_answers_in_a_row >= 2:
                                current_difficulty = "easy" if current_difficulty == "medium" else "medium"
                                wrong_answers_in_a_row = 0
                                print(f"\n⬇️ You seem to be struggling — difficulty lowered to {current_difficulty.upper()}.\n")
                    else:
                        print("Invalid input. Please enter a number between 1 and 4.")
                        wrong_answers_in_a_row += 1 # Also count as wrong for difficulty adjustment
                        correct_answers_in_a_row = 0


                    # Append individual question result
                    quiz_results.append({
                        "topic": topic,
                        "difficulty": current_difficulty,
                        "correct": correct
                    })

                print(f"\n🏁 Your total score after {len(quiz_results)} questions is: {score} points.")
                add_conversation(user, f"Full MCQ quiz completed. Score: {score}")

                # Save quiz session results to user profile
                quiz_session_data = {
                    "timestamp": str(datetime.now()),
                    "type": "full_quiz",
                    "score": score,
                    "results": quiz_results
                }
                add_quiz_result(user_id, quiz_session_data) # Save the results

            except Exception as e:
                print(f"Sorry, I couldn't run a full quiz right now. Error: {e}")
            continue

        elif mcq_request:
            try:
                mcq = mcq_assessment(topic=mcq_request, chat_fn=chat)
                print(f"\nMCQ on {mcq_request.title()}:")
                print(mcq['question'])
                for j, opt in enumerate(mcq['options']):
                    print(f"{j+1}. {opt}")

                user_answer = input("Your answer (1/2/3/4): ").strip()
                
                correct = False
                if user_answer.isdigit() and (1 <= int(user_answer) <= 4):
                    if user_answer == mcq["correct_answer"]:
                        print("✅ Correct!")
                        correct = True
                    else:
                        print(f"❌ Wrong! The correct answer was {mcq['correct_answer']}. Explanation: {mcq['explanation']}")
                else:
                    print("Invalid input. Please enter a number between 1 and 4.")

                add_conversation(user, f"MCQ given on {mcq_request}. User answered: {user_answer}")

                # Save single MCQ result to user profile
                quiz_session_data = {
                    "timestamp": str(datetime.now()),
                    "type": "single_mcq",
                    "results": [{
                        "topic": mcq_request,
                        "difficulty": "medium", # Assume medium for single MCQs or get from mcq_assessment
                        "correct": correct
                    }]
                }
                add_quiz_result(user_id, quiz_session_data) # Save the results

            except Exception as e:
                print(f"Sorry, I couldn't generate an MCQ right now. Error: {e}")
            continue

        bot_response = chat(user, history=history)
        print("Bot:", bot_response)
        add_conversation(user, bot_response)
        history = load_memory()

if __name__ == "__main__":
    main()
