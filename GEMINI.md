# Gemini Setup & Configuration

This project is configured to use Gemini AI for intelligent features.

## Setup Instructions

1. **Install Dependencies**: 
   ```bash
   npm install
   ```
2. **Configure API Key**:
   Set the `GEMINI_API_KEY` value in your environment or `.env.local` file.
   In AI Studio, this is managed via the Secrets panel.
3. **Run the Application**:
   ```bash
   npm run dev
   ```

## Development Context

- The Gemini API key is kept server-side in `server.ts`.
- All AI interactions must pass through the Express proxy to ensure security and key protection.
- Default Model: `gemini-1.5-flash`.
