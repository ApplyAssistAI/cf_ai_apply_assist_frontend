<div align="center">
    <img src="./a3.svg" alt="fabriclogo" width="180" height="180"/>
    
### `a³ - Apply Assist AI`
#### [Link to deployed app](https://pages-frontend.konradmstlr.workers.dev)
</div>

An agentic app to perfect your resume for your next job application, powered by **Cloudflare Developer Platform** and
**HuggingFace smolagents**.

Visit the demo site, **attach your resume & the job posting URL**, and hit send! _Apply Assist AI_ will serve you
personalized feedback.

This project adapts the [Chat Agent starter kit](https://github.com/cloudflare/agents-starter).

#### [Link to backend source](https://github.com/ApplyAssistAI/smolagents-backend)

## Features

- 💬 REPL chat interface with AI
- 🌓 Dark/Light theme support
- 🎨 Modern, responsive UI

### Use Cases

1. You have just found a job posting for a developer role at a company you've been eyeing for a long time.

You know more or less what all companies look for in candidates, but you want to make your resume shine for this
specific application. You are about to jump in and use your favourite LLM to assist you, but wait - `a³`
was _made for_ this task!

`Apply Assist AI` will look through the job posting, as well as the rest of the internet, to find all of the relevant
information and then review the contents of your resume against that information to help you tailor it to the needs of your app.

2. You have found several job postings at different companies and want to know where you'll fit in best.

`Apply Assist AI` has you covered. It checks the technologies listed in the job posting to see which bases you cover
and which ones you don't, and applies knowledge it gathers specific to that company to tell you whether you'll be
the right fit.

## Project Structure

```
├── ai/
│   └── PROMPTS.md     # Obligatory job application prompt disclosure
├── src/
│   ├── app.tsx        # Chat UI implementation
│   └── styles.css     # UI styling
```

## License

MIT
