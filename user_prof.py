import json
import os
import requests
from bs4 import BeautifulSoup
from collections import defaultdict
import time

USER_PROFILES_FILE = "user_profiles.json"

def load_user_profiles():
    """Load all user profiles from the JSON file, ensuring it's a dictionary."""
    if not os.path.exists(USER_PROFILES_FILE):
        return {}
    try:
        with open(USER_PROFILES_FILE, "r") as f:
            # Handle empty file case
            content = f.read()
            if not content:
                return {}
            data = json.loads(content)
            # Ensure the loaded data is a dictionary
            if not isinstance(data, dict):
                print(f"Warning: {USER_PROFILES_FILE} did not contain a dictionary. Resetting.")
                return {}
            return data
    except json.JSONDecodeError:
        print(f"Warning: {USER_PROFILES_FILE} is malformed. Starting with an empty profile.")
        return {}

def save_user_profiles(profiles):
    """Save all user profiles to the JSON file."""
    with open(USER_PROFILES_FILE, "w") as f:
        json.dump(profiles, f, indent=2)

def _get_or_create_user_profile(user_id):
    """Helper to get a user profile or create a default one."""
    profiles = load_user_profiles()
    if user_id not in profiles:
        profiles[user_id] = {
            "quiz_history": [],
            "chat_sessions": {}
        }
    elif "chat_sessions" not in profiles[user_id]:
        profiles[user_id]["chat_sessions"] = {}
    return profiles, profiles[user_id]

# --- New Chat Session Management Functions ---

def create_chat_session(user_id: str) -> str:
    """Creates a new, empty chat session for a user."""
    profiles, user_profile = _get_or_create_user_profile(user_id)
    chat_id = f"session_{int(time.time())}"
    user_profile["chat_sessions"][chat_id] = {
        "id": chat_id,
        "title": "New Chat",
        "history": []
    }
    save_user_profiles(profiles)
    return chat_id

def get_chat_sessions(user_id: str) -> list:
    """Returns a list of all chat sessions for a user (id and title only)."""
    _, user_profile = _get_or_create_user_profile(user_id)
    sessions = user_profile.get("chat_sessions", {})
    # Return a list of {"id": "...", "title": "..."}
    return [{"id": s["id"], "title": s["title"]} for s in sessions.values()]

def get_chat_history(user_id: str, chat_id: str) -> list:
    """Returns the full message history for a specific chat session."""
    _, user_profile = _get_or_create_user_profile(user_id)
    session = user_profile.get("chat_sessions", {}).get(chat_id)
    return session["history"] if session else []

def delete_chat_session(user_id: str, chat_id: str):
    """Deletes a specific chat session for a user."""
    profiles, user_profile = _get_or_create_user_profile(user_id)
    if chat_id in user_profile.get("chat_sessions", {}):
        del user_profile["chat_sessions"][chat_id]
        save_user_profiles(profiles)

def add_message_to_chat(user_id: str, chat_id: str, user_message: str, bot_message: str):
    """Adds a new user/bot message pair to a chat session's history."""
    profiles, user_profile = _get_or_create_user_profile(user_id)
    session = user_profile.get("chat_sessions", {}).get(chat_id)
    if not session:
        return # Or raise an error

    # If this is the first message, use it to set the title
    if not session["history"]:
        session["title"] = user_message[:50] # Use first 50 chars as title

    session["history"].append({"user": user_message, "bot": bot_message})
    save_user_profiles(profiles)


# --- Existing Functions ---

def add_quiz_result(user_id, quiz_session_data):
    """Save a quiz session's results for a user."""
    profiles, _ = _get_or_create_user_profile(user_id)
    print(f"DEBUG: Before appending, quiz_history for {user_id}: {profiles[user_id]['quiz_history']}")
    profiles[user_id]["quiz_history"].append(quiz_session_data)
    print(f"DEBUG: After appending, quiz_history for {user_id}: {profiles[user_id]['quiz_history']}")
    save_user_profiles(profiles)

def save_user_profiles(profiles):
    """Save all user profiles to the JSON file."""
    print(f"DEBUG: Saving profiles: {profiles}")
    with open(USER_PROFILES_FILE, "w") as f:
        json.dump(profiles, f, indent=2)

def analyze_performance(user_id):
    """Analyze a user's performance history to identify weak areas based on topic and difficulty."""
    profiles = load_user_profiles()
    if user_id not in profiles:
        return {"error": "User profile not found."}
    
    user_profile = profiles[user_id]
    quiz_history = user_profile.get("quiz_history", [])

    if not quiz_history:
        return {"error": "No quiz history available for analysis."}

    topic_performance = defaultdict(lambda: defaultdict(lambda: {'correct': 0, 'total': 0}))
    for session in quiz_history:
        for result in session.get("results", []):
            topic = result.get("topic")
            difficulty = result.get("difficulty")
            correct = result.get("correct")
            if topic and difficulty is not None:
                topic_performance[topic][difficulty]['total'] += 1
                if correct:
                    topic_performance[topic][difficulty]['correct'] += 1

    if not topic_performance:
        return {"message": "Not enough data to provide a performance analysis."}

    performance_summary = {}
    weak_areas = []
    WEAK_THRESHOLD_PERCENTAGE = 60
    MIN_QUESTIONS_FOR_ANALYSIS = 3

    for topic, difficulties in topic_performance.items():
        total_correct = 0
        total_questions = 0
        difficulty_breakdown = {}
        for diff, stats in difficulties.items():
            total_correct += stats['correct']
            total_questions += stats['total']
            if stats['total'] > 0:
                accuracy = (stats['correct'] / stats['total']) * 100
                difficulty_breakdown[diff] = f"{accuracy:.1f}% ({stats['correct']}/{stats['total']})"

        if total_questions > 0:
            overall_accuracy = (total_correct / total_questions) * 100
            performance_summary[topic] = {
                "summary": f"{overall_accuracy:.1f}% overall ({total_correct}/{total_questions})",
                "details": difficulty_breakdown
            }
            if total_questions >= MIN_QUESTIONS_FOR_ANALYSIS and overall_accuracy < WEAK_THRESHOLD_PERCENTAGE:
                weak_areas.append({"topic": topic, "accuracy": overall_accuracy})

    if not weak_areas:
        message = "Great job! No significant weak areas identified."
    else:
        message = "Based on your quiz history, here are some areas where you could improve:"
        weak_areas = sorted(weak_areas, key=lambda x: x['accuracy'])

    return {
        "message": message,
        "performance_by_topic": performance_summary,
        "weakest_areas": [area['topic'] for area in weak_areas]
    }

# Fallback generic resources
GENERIC_RESOURCES = [
    {
        "title": "Introduction to Data Science",
        "url": "https://www.ibm.com/training/path/data-science-foundations",
        "description": "A popular introductory course covering the basics of data science.",
        "topics_covered": ["data science"],
        "difficulty_level": "beginner",
    },
    {
        "title": "Machine Learning Crash Course",
        "url": "https://developers.google.com/machine-learning/crash-course",
        "description": "Google's fast-paced, practical introduction to machine learning.",
        "topics_covered": ["machine learning"],
        "difficulty_level": "intermediate",
    },
    {
        "title": "Deep Learning Specialization",
        "url": "https://www.coursera.org/specializations/deep-learning",
        "description": "A comprehensive program by Andrew Ng on deep learning concepts and applications.",
        "topics_covered": ["deep learning"],
        "difficulty_level": "advanced",
    },
    {
        "title": "Statistics for Data Science",
        "url": "https://www.edx.org/course/statistics-and-r",
        "description": "Learn statistical concepts essential for data analysis using R.",
        "topics_covered": ["statistics"],
        "difficulty_level": "intermediate",
    },
    {
        "title": "Data Engineering with Google Cloud",
        "url": "https://www.cloudskillsboost.google/paths/16",
        "description": "Master data engineering skills using Google Cloud Platform.",
        "topics_covered": ["data engineering"],
        "difficulty_level": "intermediate",
    },
    {
        "title": "AI Ethics: Global Perspectives",
        "url": "https://www.coursera.org/learn/ai-ethics",
        "description": "Explore ethical considerations and societal impacts of artificial intelligence.",
        "topics_covered": ["AI ethics"],
        "difficulty_level": "intermediate",
    },
]


def recommend_resources(user_id):
    """Recommends learning resources based on the user's weak areas."""
    print(f"DEBUG: Starting recommend_resources for user: {user_id}")
    analysis = analyze_performance(user_id)
    print(f"DEBUG: Analysis result: {analysis}")

    if analysis.get("error"):
        print(f"DEBUG: Analysis returned an error: {analysis['error']}")
        return []
    
    weak_areas = analysis.get("weakest_areas", [])
    print(f"DEBUG: Weak areas identified: {weak_areas}")

    if not weak_areas:
        print("DEBUG: No weak areas found, returning empty recommendations.")
        return []

    recommended_resources = []
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0;Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}

    for weak_topic in weak_areas[:2]:
        print(f"DEBUG: Searching web for resources to help with '{weak_topic}'...")
        try:
            search_query = f"best online courses for {weak_topic}"
            search_url = f"https://www.google.com/search?q={search_query.replace(' ', '+')}&hl=en&gl=us"
            response = requests.get(search_url, headers=headers)
            response.raise_for_status()
            print(f"DEBUG: Raw Google search HTML for '{weak_topic}':\n{response.text[:1000]}...") # Print first 1000 chars
            
            # Updated scraping logic
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Attempt to find search results using more common and robust selectors
            # Google often uses 'div' with role 'heading' for titles, and 'a' for links
            # Or 'div' with specific data attributes
            
            # Find all potential result blocks. This is a heuristic.
            # Look for divs that contain an h3 (title) and an a tag (link)
            potential_results = []
            for h3_tag in soup.find_all('h3'):
                # Find the closest parent div that contains an 'a' tag
                parent_div = h3_tag.find_parent('div')
                while parent_div:
                    if parent_div.find('a', href=True):
                        potential_results.append(parent_div)
                        break
                    parent_div = parent_div.find_parent('div')
            
            found_results_for_topic = 0
            for result_block in potential_results[:5]: # Check more results
                title_element = result_block.find('h3')
                link_element = result_block.find('a', href=True)
                
                # Try to find a description element within the result block
                description_element = result_block.find(['span', 'div', 'p'], class_=lambda x: x and ('st' in x.split() or 's' in x.split() or 'aCOpRe' in x.split() or 'VwiC3b' in x.split()))
                
                if title_element and link_element:
                    title = title_element.get_text()
                    url = link_element['href']
                    description = description_element.get_text() if description_element else "No description available."
                    
                    # Basic filtering for valid URLs
                    if not url.startswith("http"):
                        continue
                    
                    recommended_resources.append({
                        "title": title,
                        "url": url,
                        "description": description,
                        "topics_covered": [weak_topic],
                        "difficulty_level": "mixed",
                    })
                    found_results_for_topic += 1
            print(f"DEBUG: Found {found_results_for_topic} results for '{weak_topic}'.")

        except Exception as e:
            print(f"DEBUG: Could not perform web search for '{weak_topic}': {str(e)}")
    
    # Fallback to generic resources if no specific recommendations were found
    if not recommended_resources:
        print("DEBUG: No specific recommendations found via web scraping. Providing generic resources.")
        # Filter generic resources to match weak areas if possible, otherwise return all
        filtered_generic = [
            res for res in GENERIC_RESOURCES 
            if any(topic in weak_areas for topic in res["topics_covered"])
        ]
        if filtered_generic:
            recommended_resources.extend(filtered_generic)
        else:
            recommended_resources.extend(GENERIC_RESOURCES) # If no match, just add all generic

    print(f"DEBUG: Final recommended_resources: {recommended_resources}")
    return recommended_resources
