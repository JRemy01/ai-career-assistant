import json
from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import requests
from bs4 import BeautifulSoup

# Existing Functions
from bot import chat
from mcq import mcq_assessment
from user_prof import (
    add_quiz_result, 
    analyze_performance, 
    recommend_resources,
    create_chat_session,
    get_chat_sessions,
    get_chat_history,
    delete_chat_session,
    add_message_to_chat
)

# FastAPI app initialisation
app = FastAPI(
    title = "AI Career Coach API",
    description = "An API for an AI Career Coach Assistant application.",
    veersion = "1.0.0",
)

# CORSMiddleware setup
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---
class ChatMessage(BaseModel):
    user: str
    bot: str

class NewChatMessageRequest(BaseModel):
    message: str

class ChatSessionInfo(BaseModel):
    id: str
    title: str

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Career Assistant API"}

# --- New Chat Session Endpoints ---

@app.get("/api/chats/{user_id}", response_model=List[ChatSessionInfo])
async def get_user_chat_sessions(user_id: str):
    """Gets a list of all chat sessions for a user."""
    return get_chat_sessions(user_id)

@app.post("/api/chats/{user_id}", response_model=ChatSessionInfo)
async def create_new_chat_session(user_id: str):
    """Creates a new, empty chat session for a user."""
    new_chat_id = create_chat_session(user_id)
    return {"id": new_chat_id, "title": "New Chat"}

@app.get("/api/chats/{user_id}/{chat_id}", response_model=List[ChatMessage])
async def get_specific_chat_history(user_id: str, chat_id: str):
    """Gets the message history for a specific chat session."""
    return get_chat_history(user_id, chat_id)

@app.delete("/api/chats/{user_id}/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_a_chat_session(user_id: str, chat_id: str):
    """Deletes a specific chat session."""
    delete_chat_session(user_id, chat_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@app.post("/api/chats/{user_id}/{chat_id}/messages", response_model=ChatMessage)
async def post_message_to_chat(user_id: str, chat_id: str, request: NewChatMessageRequest):
    """Posts a new message to a chat, gets a bot response, and saves the turn."""
    history = get_chat_history(user_id, chat_id)
    bot_response = chat(request.message, history=history)
    add_message_to_chat(user_id, chat_id, request.message, bot_response)
    return {"user": request.message, "bot": bot_response}


# --- Other Endpoints (Quizzes, Performance, etc.) ---

class QuizQuestion(BaseModel):
    question : str
    options : List[str]
    correct_answer : str
    explanation : str
    topic : str # Added topic field

class QuizResult(BaseModel):
    topic : str
    difficulty : str
    correct : bool

class QuizSubmission(BaseModel):
    user_id : str
    timestamp : str
    type : str
    score : Optional[int] = None
    results : List[QuizResult]


@app.get("/api/quiz", response_model = QuizQuestion)
async def get_quiz_question(topic : str = "random", difficulty : str = "easy"):
    """
    Generates and returns a quiz question based on the specified topic and difficulty.
    """
    if topic == "random":
        import random
        topics = ["data science", "machine learning", 
      "deep learning", "statistics", "data engineering", "AI ethics"]
        topic = random.choice(topics)

    try : 
        question_data = mcq_assessment(topic = topic, difficulty=difficulty, chat_fn=chat)
        return question_data
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Error generating quiz question: {str(e)}")
    

@app.post("/api/quiz/result")
async def submit_quiz_result(submission : QuizSubmission):
    """
    Receive and save the results of a quiz session for a user
    """
    try : 
        add_quiz_result(submission.user_id,submission.dict())
        return {"status": "success", "message": "Quiz results saved."}
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Error saving quiz results: {str(e)}")
    

class PerformanceDetail(BaseModel):
    summary : str
    details : dict[str, str]

class PerformanceAnalysis(BaseModel):
    message : str
    performance_by_topic : dict[str, PerformanceDetail]
    weakest_areas : List[str]

@app.get("/api/performance/{user_id}", response_model=PerformanceAnalysis)
async def get_performance_analysis(user_id: str):
    """
    Analyzes and returns a user's performance data.
    """
    print("\n--- Starting Performance Analysis ---")
    try:
        # Step 1: Call the analysis function
        print(f"Analyzing performance for user: {user_id}")
        analysis_data = analyze_performance(user_id)
        print(f"1. Raw data from analyze_performance: {analysis_data}")

        # Step 2: Check for logical errors from the function
        if "error" in analysis_data:
            print(f"2. Function returned a known error: {analysis_data['error']}")
            # If there's no quiz history, return an empty analysis for the frontend to handle
            if analysis_data["error"] == "No quiz history available for analysis.":
                return PerformanceAnalysis(
                    message=analysis_data["error"],
                    performance_by_topic={},
                    weakest_areas=[]
                )
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail=analysis_data["error"])

        # Step 3: Manually validate against the Pydantic model
        print("3. Data looks okay, attempting to validate with Pydantic model...")
        validated_data = PerformanceAnalysis.model_validate(analysis_data)
        print("4. Pydantic validation successful!")
        
        return validated_data

    except Exception as e:
        # Step 4: Catch and print ANY other exception
        print("\n--- AN UNEXPECTED ERROR OCCURRED ---")
        import traceback
        traceback.print_exc() # This will force a traceback to be printed
        print("-------------------------------------\n")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

class CourseResource(BaseModel):
    title: str
    url: str
    description: str
    topics_covered: List[str]
    difficulty_level: str

@app.get("/api/recommendations/{user_id}", response_model=List[CourseResource])
async def get_recommendations(user_id: str):
    """
    Generates and returns a list of recommended learning resources
    based on the user's weakest areas.
    """
    try:
        # This function already returns a list of course dictionaries
        # that match the CourseResource model.
        resources = recommend_resources(user_id)
        return resources
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

class Job(BaseModel):
    id: int
    title: str
    company: str
    location: str
    type: str

class Event(BaseModel):
    id: int
    title: str
    description: str
    url: str

def load_jobs_and_events():
    """A helper function to load data from the new JSON file."""
    try:
        with open("jobs_and_events.json", "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"jobs": [], "events": []}

@app.get("/api/jobs", response_model=List[Job])
async def get_jobs():
    """Returns a list of job opportunities from a static JSON file."""
    data = load_jobs_and_events()
    return data.get("jobs", [])

@app.get("/api/events", response_model=List[Event])
async def get_events():
    """Returns a list of upcoming events by scraping Google."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    search_query = "online data science events"
    search_url = f"https://www.google.com/search?q={search_query.replace(' ', '+')}"
    events = []
    try:
        response = requests.get(search_url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        for i, result in enumerate(soup.find_all('div', class_='g')):
            title_element = result.find('h3')
            link_element = result.find('a')
            description_element = result.find('div', style="display: -webkit-box")

            if title_element and link_element and description_element:
                title = title_element.get_text()
                url = link_element['href']
                description = description_element.get_text()

                if "›" in title or not url.startswith('http'):
                    continue
                
                events.append({
                    "id": i,
                    "title": title,
                    "description": description,
                    "url": url
                })
    except Exception as e:
        print(f"Could not perform event search: {e}")

    return events[:10]