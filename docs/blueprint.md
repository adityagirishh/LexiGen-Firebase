# **App Name**: LexiGen

## Core Features:

- Document Upload: Secure document uploading through the Firebase Hosting frontend.
- Document Embedding: Generate document embeddings using a Vertex AI Prediction Endpoint running a fine-tuned legal model tool. The embedding is the vector representation of the document. The fine-tuned model converts legal text into meaningful vectors.
- Case Retrieval: Query Vertex AI Matching Engine to find the most similar existing court cases, and return to the frontend. The returned results help synthesize the final report tool.
- Memo Generation: Synthesize the key facts, legal concepts, and relevant precedents to generate a well-structured 'Preliminary Case Memorandum' via Gemini Pro on Vertex AI.
- Interactive Review: Interactive dashboard for users to review the generated memorandum, with clear citations and links to source material. Also displays document summary and identified laws.
- Secure Authentication: User authentication via Firebase Authentication.
- Version Control and Audit Trail for Documents: Maintain a clear history of changes and versions for legal documents, allowing users to view previous versions, track who uploaded/modified them, and revert if necessary.
- Contextual Search within Retrieved Cases: Allow users to perform a keyword search within the returned case documents (or their summaries) to quickly pinpoint specific relevant sections within large case documents.
- Memo Generation Refinement & Iteration: Allow users to provide feedback on the generated memo and re-run Gemini Pro with refined instructions to improve the quality and relevance of the generated memo.
- Defined "Identified Laws" Feature: Make "identified laws" a prominent and interactive feature. Link directly to relevant legal statutes or codes from the memo, or have a dedicated section listing them with brief explanations.
- Multi-Document Analysis for Memo Generation: Allow users to select multiple uploaded documents to be considered by Gemini Pro for memo generation, fostering a more holistic analysis.
- Export Options for Memoranda: Provide various export formats for the generated memos (e.g., PDF, Word, plain text), maintaining formatting and citations.
- Onboarding and Tooltips: Implement clear onboarding and contextual tooltips (especially for AI features like "Document Embedding AI" or "Case Retrieval AI").
- Visual Feedback for AI Processes: Provide clear visual feedback (loading spinners, progress bars, estimated completion times) during document processing, embedding generation, and memo generation.
- Interactive Memo Review Dashboard Improvements: Improvements to the interactive memo review dashboard (collapsible sections, in-line annotations/highlighting, dynamic source linking, summary & identified laws display).
- Error Handling and User Guidance: Implement robust error messages that are user-friendly and provide actionable advice instead of generic technical errors.
- Accessibility: Ensure the application is accessible to users with disabilities (keyboard navigation, proper ARIA labels, sufficient color contrast, and screen reader compatibility).
- Utilize the App Prototyping Agent: Utilize the App Prototyping agent in Firebase Studio by describing the features and structure in natural language to generate a foundational Next.js app with integrated Firebase services.
- Direct Code Editing and AI Assistance: Use the built-in VS Code-based IDE within Firebase Studio to directly edit your Next.js and TypeScript code. Leverage Gemini's AI assistance for code generation, debugging, and refactoring.
- Genkit Monitoring Integration: Ensure Genkit monitoring is set up for deployed features in Firebase Studio to monitor generative AI features directly in the Firebase Console.
- Firebase Security Rules for Data Access: Configure Firestore Security Rules to precisely control who can read and write to document collections, ensuring only authenticated users can access their uploaded documents and generated memos.
- Firebase Storage Security Rules: Implement granular security rules for Firebase Storage to control access to uploaded documents, ensuring only authorized users can view or download specific files.
- Firebase App Hosting for Seamless Deployment: Leverage Firebase App Hosting for easy and reliable deployment of your Next.js frontend.

## Style Guidelines:

- Primary color: Navy blue (#000080), reflecting trust and stability. Use a slightly lighter shade for interactive elements.
- Background color: White (#FFFFFF), providing a clean and professional backdrop.
- Accent color: Soft amber (#FFB300), analogous to navy blue, for highlighting important insights and CTAs, for high contrast and user guidance.
- Secondary accent color: A muted teal (#45A29E) for less prominent interactive elements and visual variety.
- Body text: 'PT Sans' (sans-serif) for readability and a modern, neutral feel.
- Headline text: 'Literata' (serif) to give the feeling of tradition, law and literature, but ensure it's highly legible at various sizes.
- Use clear and professional icons from a standard library (e.g., Material Design Icons) to represent legal concepts and actions. Maintain consistency in style and weight.
- Ensure a clean, organized layout to promote clarity, using a grid system to organize content effectively. Focus on making the information accessible and easy to follow, with ample whitespace.