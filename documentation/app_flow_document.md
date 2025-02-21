# Introduction

This application is called Tongue Twisters Challenge and it is built to help children with speech impediments improve their articulation skills. The main goal of the user journey is to engage children in practicing tongue twisters while the app listens, provides immediate feedback on their speech clarity, and offers tips to help them improve. The app uses a clean, minimalistic interface with easy-to-read fonts and clear navigation, making it simple for young users to start practicing right away.

# Onboarding and Sign-In/Sign-Up

When new users arrive on the platform, they are greeted by a welcoming landing page that explains the purpose of the app and highlights its fun approach to speech practice. The app offers straightforward registration options, allowing users to sign up using either an email address or their Google account. Once a user selects a sign-up method, they are guided through the process of creating a secure account. In case a user forgets their password, there is a clear option to recover it so they can regain access without any hassle. When returning users arrive, they simply sign in using the same methods and can easily sign out when finished.

# Main Dashboard or Home Page

After logging in, users are taken to a clean and well-organized dashboard that serves as the home base for all activities. The dashboard features tongue twister tiles, which are clearly labeled with different difficulty levels, such as Easy, Intermediate, and Advanced. These tiles are arranged for an intuitive filtering option that lets users quickly find the correct challenge based on their current skill level. The interface includes easy access to navigation menus and visual cues showing progress and earned rewards. This central hub effortlessly connects users to the main activities of speech practice and progress monitoring.

# Detailed Feature Flows and Page Transitions

From the main dashboard, a user selects a specific tongue twister to practice by clicking on one of the tiles. Once a tongue twister is chosen, the app transitions to a practice screen. On this screen, the user is prompted to start speaking the tongue twister aloud. The application then uses the Google Speech-to-Text API to listen to the user's speech, analyzing pronunciation accuracy and detecting any mispronounced words or sounds. Feedback is provided in real time, with tips such as slowing down speech, adjusting mouth positioning, or practicing specific sounds. Additionally, an audio playback feature allows users to compare their own recording with a clear example, helping them understand where improvements can be made.

After the practice session, users are redirected back to the dashboard where a dedicated progress section displays clear and comprehensive metrics. This progress page shows improvements in speech clarity, practice frequency, time spent in practice sessions, and even gamification rewards such as badges earned for consistency and improvement. Navigation throughout the app is seamless, ensuring that users can easily move between practicing a tongue twister, exploring new challenges, and reviewing their progress over time.

# Settings and Account Management

Users have access to a dedicated settings page where they can manage their personal information and update their account details effortlessly. This page allows the adjustment of preferences such as notification settings and profile details to suit individual needs. Although the current version does not include billing details or subscription payment settings, the structure is in place to accommodate future enhancements. Once users update their settings, they can return easily to the main dashboard or any other part of the app without breaking the flow of their practice journey.

# Error States and Alternate Paths

The application is designed to guide users even when things do not go as expected. If a user enters invalid data during sign-up or tries to access restricted features without proper authentication, a clear error message is displayed along with suggested actions to resolve the issue. In cases where there is a loss of connectivity, the app notifies the user through a friendly message and provides options to retry or check the network connection. On practice screens, if the speech recognition fails or does not pick up the recording clearly, the app offers a prompt to try again so that the user can maintain a smooth and continuous learning experience.

# Conclusion and Overall App Journey

From the moment a user signs up or logs in, every step in the Tongue Twisters Challenge app is designed around ease of use and motivation. The user begins by registering through a simple sign-up process and is immediately taken to a dashboard that displays a range of tongue twisters categorized by difficulty. Each selected practice session includes real-time speech analysis with actionable feedback and improvement tips, followed by a comprehensive review of progress that includes fun rewards like badges. The clear navigation between screens, error handling, and settings management ensures that the overall journey is smooth, engaging, and supportive of the goal to improve speech clarity. With each session, users receive instant feedback, monitor their progress, and are encouraged to practice more through gamification elements, making the experience both educational and fun.
