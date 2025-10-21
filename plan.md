# Project Plan: AI Career Assistant

This document outlines a 6-phase agile development plan for the AI assistant project.

## Phase 1: Foundation & Core Conversation (Sprint 1)

*   **Goal:** Establish a basic, conversational bot that can answer simple questions about Data & AI careers.
*   **Status:** Largely complete.

*   **Completed Features:**
    *   [x] **Project Structure:** Initial project structure with `bot.py`, `memory.py`, and `memory.json` is in place.
    *   [x] **Conversational Loop:** A functional chat loop is implemented in `bot.py`.
    *   [x] **Conversation Memory:** The bot can load, save, and append conversations to `memory.json`, maintaining context.
    *   [x] **NLP Integration:** The bot is connected to a local LLM (`mistral`) to understand and respond to user input.
    *   [x] **Basic Commands:** A `/clear` command to reset conversation history is implemented.

*   **Remaining Tasks:**
    *   [x] Refine the system prompt to be more specific to the AI Career Assistant's persona.
    *   [ ] ~~Create a dedicated knowledge base for common Data & AI career questions.~~ (Deferred)

## Phase 2: MCQ Assessment Module (Sprint 2)

*   **Goal:** Enable the assistant to assess user knowledge through multiple-choice questions.
*   **Features:**
    *   [ ] Design and implement a data structure for storing MCQs (question, options, correct answer, topic).
    *   [ ] Build a question bank with a variety of MCQs covering key Data & AI concepts.
    *   [ ] Develop the logic to present questions to the user and evaluate their answers.
    *   [ ] Provide immediate feedback to the user after each question.

## Phase 3: Performance Tracking & Analysis (Sprint 3)

*   **Goal:** Track and store user performance to identify areas for improvement.
*   **Features:**
    *   [ ] Create a user profile system to store performance data over time.
    *   [ ] Implement logic to save quiz results and track scores by topic (e.g., Python, SQL, Statistics).
    *   [ ] Develop an algorithm to analyze performance history and identify the user's weakest areas.
    *   [ ] Allow users to view their performance summary.

## Phase 4: Personalized Course Recommendation (Sprint 4)

*   **Goal:** Recommend learning resources based on the user's identified weak areas.
*   **Features:**
    *   [ ] Build a curated database of online courses, tutorials, and articles, mapping each resource to specific skills/topics.
    *   [ ] Implement a recommendation engine that matches the user's weak areas to the most relevant learning resources.
    *   [ ] Present personalized recommendations to the user in a clear and helpful manner.

## Phase 5: Live Web Integration & Refinement (Sprint 5)

*   **Goal:** Enhance the course recommendations with up-to-date information from the web and refine the user experience.
*   **Features:**
    *   [ ] Implement a web scraping or API integration module to fetch current course information (e.g., from Coursera, Udemy, edX).
    *   [ ] Integrate the live data into the recommendation engine to ensure suggestions are current.
    *   [ ] Conduct user acceptance testing (UAT) to gather feedback.
    *   [ ] Refine the overall conversation flow, UI/UX, and prepare for a beta release.

## Phase 6: Job Search & Live Event Integration (Sprint 6)
 
*   **Goal:** Help users find relevant job openings and stay informed about professional networking events.
*   **Features:**
    *   [ ] **Job Search Integration:** Implement a module to search for jobs on platforms like LinkedIn, Indeed, etc., based on the user's profile and career goals.
    *   [ ] **Event Notifications:** Integrate with APIs or scrape websites (e.g., Meetup, Eventbrite) to find and inform users about relevant career fairs, workshops, and "professional salons."
    *   [ ] **Resume/CV Helper:** Add a feature to provide tips and suggestions for improving the user's resume or CV.
