# Project Plan: AI Career Assistant

This document outlines a 6-phase agile development plan for the AI assistant project. All phases are now complete.

## Phase 1: Foundation & Core Conversation (Sprint 1)

*   **Status:** Complete.
*   **Backend:**
    *   [x] Project Structure: Initial project structure is in place.
    *   [x] Conversational Loop: A functional chat loop is implemented.
    *   [x] Conversation Memory: The bot can load, save, and append conversations.
    *   [x] NLP Integration: The bot is connected to a local LLM.
    *   [x] API Endpoint: `/api/chat` endpoint created with FastAPI.
*   **Frontend:**
    *   [x] UI Component: `ChatInterface` component is built.
    *   [x] API Connection: Frontend is connected to the `/api/chat` backend endpoint.

## Phase 2: MCQ Assessment Module (Sprint 2)

*   **Status:** Complete.
*   **Backend:**
    *   [x] MCQ Generation: `mcq_assessment` function generates MCQs on-the-fly.
    *   [x] API Endpoint: `/api/quiz` endpoint created to serve questions.
*   **Frontend:**
    *   [x] UI Component: `QuizzesTab` component is built.
    *   [x] API Connection: Frontend is connected to the `/api/quiz` backend endpoint.

## Phase 3: Performance Tracking & Analysis (Sprint 3)

*   **Status:** Complete.
*   **Backend:**
    *   [x] User Profile System: `user_prof.py` and `user_profiles.json` created.
    *   [x] Performance Analysis: Algorithm to analyze history and find weak areas is implemented.
    *   [x] API Endpoints: `/api/quiz/result` (POST) and `/api/performance/{user_id}` (GET) created.
*   **Frontend:**
    *   [x] UI Component: `ProgressTab` component is built.
    *   [x] API Connection: Frontend is connected to the performance and result endpoints.

## Phase 4: Personalized Course Recommendation (Sprint 4)

*   **Status:** Complete.
*   **Backend:**
    *   [x] Curated Database: `course_ressource.json` created for fallback.
    *   [x] Recommendation Engine: `recommend_resources` function implemented.
    *   [x] API Endpoint: `/api/recommendations/{user_id}` endpoint created.
*   **Frontend:**
    *   [x] UI Component: `CoursesTab` component is built.
    *   [x] API Connection: Frontend is connected to the recommendations endpoint.

## Phase 5: Live Web Integration & Refinement (Sprint 5)

*   **Status:** Complete.
*   **Backend:**
    *   [x] Implemented web scraping to fetch current course information for recommendations.
    *   [x] Integrated the live data into the recommendation engine.
*   **Frontend:**
    *   [x] UI Component: The `CoursesTab` component is built and displays live data.
*   **General:**
    *   [ ] Conduct user acceptance testing (UAT) to gather feedback. (User task)
    *   [ ] Refine the overall conversation flow and UI/UX. (User task)

## Phase 6: Job Search & Live Event Integration (Sprint 6)

*   **Status:** Complete.
*   **Backend:**
    *   [x] Implemented web scraping to fetch live job listings.
    *   [x] Implemented web scraping to fetch live event listings.
    *   [x] Created `/api/jobs` and `/api/events` endpoints.
*   **Frontend:**
    *   [x] UI Component: `JobsEventsTab` component is built.
    *   [x] API Connection: UI is connected to the backend endpoints and displays live data.
