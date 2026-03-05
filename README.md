# SocialSim

Practice real-life conversations with AI. Choose a scenario, chat with an AI roleplay partner, and get feedback on your confidence, clarity, and professionalism.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add your OpenAI API key

Create a `.env.local` file in the project root:

```
OPENAI_API_KEY=sk-your-key-here
```

Get your API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub and import the repo in [vercel.com](https://vercel.com)
2. In your Vercel project: **Settings** → **Environment Variables**
3. Add `OPENAI_API_KEY` with your OpenAI API key
4. Redeploy

Without the API key, the app falls back to mock responses.

---

Built with Next.js 14, React, Tailwind CSS, and OpenAI.
