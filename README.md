# AI Career Assistant

This project is a full-stack AI-powered career assistant designed to help users navigate their careers in Data and Artificial Intelligence. It features a conversational AI, dynamic quiz generation, performance tracking, and live, scraped recommendations for courses, jobs, and events.

## Architecture

The application is composed of two main parts:

1.  **Backend (Python & FastAPI):** A Python server that uses FastAPI to provide a web API. It handles all the core logic, including:
    *   Interacting with a local LLM for chat and quiz generation.
    *   Analyzing user performance.
    *   Scraping the web for live recommendations for courses, jobs, and events.

2.  **Frontend (Next.js & React):** A modern, responsive web interface built with Next.js and shadcn/ui. It communicates with the Python backend to provide a rich user experience.

## Features

*   **Conversational AI:** A chat interface for asking career-related questions.
*   **Dynamic Quizzes:** Generates Multiple Choice Questions on-the-fly to test user knowledge.
*   **Performance Tracking:** Saves quiz results and analyzes user performance to identify strengths and weaknesses.
*   **Live Recommendations:** Dynamically scrapes the web to recommend relevant courses, jobs, and events based on user performance and needs.
*   **Polished UI:** A professional and easy-to-use dashboard interface.

## Running the Application

To run the application, you need to run both the backend and frontend servers simultaneously in two separate terminals.

### Prerequisites
- Python 3.7+
- Node.js and `pnpm`
- A running local LLM API (like Ollama with the Mistral model) accessible at `http://localhost:11434`

---

### 1. Backend Server (Terminal 1)

1.  **Navigate to the project root:**
    ```sh
    cd /path/to/your/Project
    ```
2.  **(Optional but Recommended)** Create and activate a virtual environment:
    ```sh
    python3 -m venv .venv
    source .venv/bin/activate
    ```
3.  **Install Python dependencies:**
    ```sh
    pip install -r requirements.txt
    ```
4.  **Run the FastAPI server:**
    ```sh
    uvicorn api:app --reload
    ```
    The backend will be running at `http://127.0.0.1:8000`. Keep this terminal running.

---

### 2. Frontend Server (Terminal 2)

1.  **Open a new terminal.**
2.  **Navigate to the frontend directory:**
    ```sh
    cd /path/to/your/Project/ai-career-assistant
    ```
3.  **Install Node.js dependencies:**
    ```sh
    pnpm install
    ```
4.  **Run the Next.js development server:**
    ```sh
    pnpm dev
    ```
    The frontend will be running at `http://localhost:3000`. Keep this terminal running.

---

### 3. Access the Application

Open your web browser and navigate to:

**[http://localhost:3000](http://localhost:3000)**

You should now see and be able to interact with the full AI Career Assistant application.
