<img width="5520" height="1872" alt="Banner-Pilot" src="https://github.com/user-attachments/assets/25c8d1e2-a995-4a79-b3bc-963a090b43b2" />

# Pilot

Pilot is an open-source browser automation tool for Amity Online students. It navigates course modules, answers quizzes using Groq's Llama 3.3 70B, and submits feedback forms automatically.

> Full documentation at [pilotcli.netlify.app](https://pilotcli.netlify.app)

---

## Quickstart

```bash
# Clone the repo
git clone https://github.com/TaahaSidd/Pilot.git
cd Pilot

# Install dependencies
pip install -r requirements.txt

# Install Chromium browser
playwright install chromium

# Run
python main.py
```

On first run, Pilot will ask for your Groq API key and Amity portal credentials. These are saved locally and never shared.

---

## What Pilot does

- Scans all enrolled courses and skips anything already at 100%
- Visits every incomplete reading module automatically
- Answers mini quizzes and module assessments using Groq LLM inference
- Auto-fills feedback forms and rating surveys
- Runs up to 10 passes per session to unlock gated content
- Built-in guardrails — never submits a quiz if answers are missing

---

## Requirements

- Python 3.8+
- A free [Groq API key](https://console.groq.com)
- Your Amity student email and portal password

---

## Project Structure
```

Pilot/
├── core/
│   ├── browser.py
│   ├── session.py
│   └── setup.py
├── workflow/
│   ├── workflow.py
│   ├── quiz_solver.py
│   ├── feedback_solver.py
│   └── notes_engine.py
├── notes/
│   └── (generated per user — gitignored)
├── pilot_ui.py
├── config.py
├── main.py
└── requirements.txt

```

---

## Built With

- [Playwright](https://playwright.dev/python/) — browser automation
- [Groq](https://console.groq.com) — LLM inference (Llama 3.3 70B)
- [Rich](https://github.com/Textualize/rich) — terminal UI

---

## Roadmap

- [x] Browser automation
- [x] Session persistence
- [x] AI quiz solver
- [x] Feedback form engine
- [x] Multi-pass unlock loop
- [x] CLI with onboarding
- [x] Notes generator
- [x] Certificate Completion
- [ ] Plugin system
- [ ] Desktop GUI

---

## Disclaimer

Pilot is intended for personal productivity. Users are responsible for ensuring their use complies with Amity Online's terms of service.

---

## Links

- [Documentation](https://pilotcli.netlify.app/docs)
- [Report a bug](https://github.com/TaahaSidd/Pilot/issues)
- Built by [Spica Labs](https://github.com/TaahaSidd)
