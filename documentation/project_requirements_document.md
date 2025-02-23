# Project Requirements Document: Tongue Twisters Challenge

## 1. Project Overview

Tongue Twisters Challenge is a web-based platform designed to help children with speech impediments improve their articulation by practicing fun and engaging tongue twisters. The idea is to create a simple yet effective platform where users can listen to prompts, record their speech, receive immediate and actionable feedback, and track their progress. The approach uses speech recognition through a trusted API to analyze pronunciation and provide personalized tips for improvement.

The platform is being built to address the specific challenge of speech clarity in children with speech impediments. By turning practice into an engaging activity complete with gamification elements like badges and rewards, the application aims to motivate users to practice consistently. The key objectives include secure user management, a clear and minimalistic interface for ease of use, and an effective system to analyze and provide feedback on user speech using Google’s Speech-to-Text API.

## 2. In-Scope vs. Out-of-Scope

**In-Scope:**

*   User registration and authentication using email and Google authentication (via Clerk).
*   Secure user accounts with individual progress tracking.
*   A dashboard displaying tongue twister tiles categorized by difficulty (Easy, Intermediate, Advanced) with filtering options.
*   Real-time speech analysis using Google’s Speech-to-Text API to provide immediate feedback on clarity, pronunciation accuracy, and improvement tips.
*   A progress dashboard that displays metrics such as practice frequency, clarity improvements, and gamification rewards (badges).
*   Monthly updates with new or updated tongue twisters, initially curated by the platform.

**Out-of-Scope:**

*   Advanced data protection or privacy measures for voice recordings (to be considered in later versions).
*   A system for user-submitted tongue twisters (community contribution and moderation to be added in future phases).
*   Integration of roles such as admin, therapist, or parent; the application will focus on single-user functionality for progress tracking.
*   Support for languages other than English.
*   Extensive third-party integrations beyond those specified (e.g., additional AI services beyond Google’s Speech-to-Text).

## 3. User Flow

A new user will start by landing on the registration page where they can sign up using either their email or Google account. Once registered, the user will be directed to the dashboard, which presents a clear and minimalistic interface. Here, the dashboard displays various tongue twister tiles, each labeled with difficulty levels such as Easy, Intermediate, or Advanced. Users can easily filter these tiles to find a tongue twister that matches their desired challenge level.

After selecting a tongue twister, the application will transition to a practice screen. On this screen, the user initiates the speech recording and practices speaking the tongue twister. The integrated speech recognition system listens to the recitation and provides immediate feedback on pronunciation, highlighting areas for improvement along with actionable tips. Once the practice session is concluded, the user is taken back to the dashboard where the progress dashboard displays updated metrics such as clarity scores, practice frequency, and earned badges or rewards.

## 4. Core Features

*   **User Authentication & Accounts:**\
    Secure sign-up and log-in functionality using email and Google authentication via Clerk.
*   **Dashboard with Tongue Twister Tiles:**\
    A well-organized dashboard that displays tongue twister tiles categorized into Easy, Intermediate, and Advanced levels with filtering options.
*   **Real-Time Speech Analysis:**\
    Integration with Google’s Speech-to-Text API that listens to user speech, analyzes pronunciation accuracy, and provides immediate feedback including highlighting mispronounced words and suggesting improvement tips (e.g., exercises, slower speech, mouth positioning).
*   **Progress Tracking Dashboard:**\
    A progress section that displays metrics like clarity improvement scores, practice frequency, total practice time, and comparative audio playback features.
*   **Gamification Elements:**\
    Gamification features such as badges and rewards for consistent practice, achieving new difficulty levels, or improving clarity scores to motivate users.
*   **Curated Content Management:**\
    A system for monthly updates where new or refined tongue twisters are added to the platform to keep the content engaging.

## 5. Tech Stack & Tools

*   **Frontend:**

    *   Next.js 14: for server-side rendering and an enhanced React experience.
    *   TypeScript: for type safety and clarity in coding.
    *   Tailwind CSS: for rapid styling with a utility-first approach.
    *   shadcn/UI & Radix UI: for building accessible and customizable UI components.
    *   Lucide Icons: for a modern, consistent iconography.

*   **Backend & Storage:**

    *   Supabase: for database management, providing a simple, secure, and scalable backend.
    *   Clerk: for handling user authentication and secure user data.

*   **AI & Speech Recognition:**

    *   Google Speech-to-Text API: for analyzing user speech in real time and delivering pronunciation feedback.

*   **Development Tools:**

    *   Windsurf: as the modern IDE with integrated AI coding capabilities to assist with development, debugging, and code reviews.

## 6. Non-Functional Requirements

*   **Performance:**\
    The application should respond to user interactions within 1-2 seconds, especially during speech analysis and feedback delivery.
*   **Security:**\
    Even though full privacy measures for voice recordings are deferred, the user authentication and data storage mechanisms must follow standard security practices to protect user data.
*   **Usability:**\
    The interface must be clean, minimalistic, and easy to navigate with clear fonts and neutral color schemes, ensuring it is accessible to children.
*   **Reliability:**\
    The speech recognition and feedback system should maintain high accuracy and be available with minimal downtime, aiming for over 99% uptime.
*   **Scalability:**\
    The backend architecture via Supabase should support an increasing number of users as practice sessions and data grow over time.

## 7. Constraints & Assumptions

*   **Constraints:**

    *   The application will initially not implement complex voice data privacy or GDPR-level data protection measures, but the architecture should allow for future upgrades.
    *   Only the English language is supported for tongue twisters and feedback.
    *   The system depends on the availability and performance of Google's Speech-to-Text API for real-time analysis.

*   **Assumptions:**

    *   New tongue twisters and content updates will be managed on a monthly basis by the content team.
    *   Users will be primarily children, so the interface needs to be highly intuitive and engaging with gamification elements to encourage continuous use.
    *   The project will not require multiple user roles beyond the standard user account.

## 8. Known Issues & Potential Pitfalls

*   **API Rate Limits:**\
    The Google Speech-to-Text API may have rate limits which could affect real-time speech feedback during peak usage. Consider implementing request caching or a queuing mechanism to mitigate these issues.
*   **Speech Recognition Accuracy:**\
    Variability in pronunciation, background noise, and accents could lead to inaccurate feedback. Mitigations include encouraging users to practice in quiet environments and considering fallback manual review features in future versions.
*   **User Engagement:**\
    As the primary users are children, ensuring the platform remains engaging is critical. A potential pitfall is losing user interest if the feedback is too technical or not gamified enough. Designing a kid-friendly interface with visual rewards and simple language is a must.
*   **Scalability & Performance:**\
    With the growth in voice recordings and practice sessions, the backend infrastructure must be robust to handle increased data and processing requirements. Monitoring and scaling the Supabase database proactively will be necessary.
*   **Voice Data Privacy:**\
    Even though advanced data protection measures are out-of-scope for now, any future plans need to integrate stricter privacy controls to handle voice recordings securely.

This Project Requirements Document is intended to serve as a comprehensive guide for the Tongue Twisters Challenge project. It provides a clear blueprint to develop subsequent documents for tech stack, frontend guidelines, backend structure, and detailed implementation plans. Every effort has been made to eliminate ambiguity and ensure that the essential requirements and guidelines are well understood from the outset.
