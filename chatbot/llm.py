import json
import re
from datetime import datetime, timedelta
import dateparser

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI(title="AI Task Manager Demo")

# Enable CORS for local frontend access (e.g., file:// or localhost) and other clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

tasks_db = []


class TaskInput(BaseModel):
    message: str


priority_score = {
    "high": 3,
    "medium": 2,
    "low": 1
}


# -----------------------
# LLM TASK EXTRACTION
# -----------------------
def extract_tasks_with_llm(text):
    prompt = f"""
You are an intelligent task management assistant.

Your job is to read the user's message and extract all tasks mentioned.

For each task return:

- task: short description
- deadline: natural language deadline if mentioned, otherwise "none"
- duration_hours: estimated hours required
- priority: high, medium, or low

Determine priority using these reasoning rules:

HIGH priority:
Tasks that are urgent, have a deadline soon, are critical responsibilities,
or have serious consequences if delayed.

MEDIUM priority:
Tasks that are important but not urgent and contribute to work, study,
personal development, or daily responsibilities.

LOW priority:
Optional, leisure, or flexible activities that can easily be postponed.

Duration rules:
If duration is mentioned, use it.
Otherwise estimate a reasonable time.

Return STRICT JSON list only.

Example:

User message:
"I need to prepare a presentation for tomorrow, study deep learning for 2 hours,
buy groceries, and watch a movie tonight"

Output:
[
  {{
    "task": "Prepare presentation",
    "deadline": "tomorrow",
    "duration_hours": 3,
    "priority": "high"
  }},
  {{
    "task": "Study deep learning",
    "deadline": "none",
    "duration_hours": 2,
    "priority": "medium"
  }},
  {{
    "task": "Buy groceries",
    "deadline": "none",
    "duration_hours": 1,
    "priority": "medium"
  }},
  {{
    "task": "Watch a movie",
    "deadline": "tonight",
    "duration_hours": 2,
    "priority": "low"
  }}
]

User message:
{text}
"""

    def _text_extract(task_text):
        # 1) normalize code fences
        task_text = task_text.strip()
        if task_text.startswith("```") and task_text.endswith("```"):
            task_text = task_text[3:-3].strip()

        # 2) parse JSON block from output
        json_text = None
        if task_text.startswith("[") or task_text.startswith("{"):
            json_text = task_text
        else:
            match = re.search(r"(```json\n)?(\[.*?\]|\{.*?\})(```)?", task_text, flags=re.S)
            if match:
                json_text = match.group(2)

        if json_text:
            try:
                parsed = json.loads(json_text)
                if isinstance(parsed, dict) and "tasks" in parsed:
                    return parsed["tasks"]
                if isinstance(parsed, list):
                    return parsed
            except Exception as e:
                print("LLM JSON parse failed:", e)

        # 3) loose fallback itemization (if human-readable content is returned)
        fallback = []
        for line in task_text.splitlines():
            line = line.strip()
            if not line:
                continue
            if line.lower().startswith("task:"):
                task_name = line.split("task:", 1)[1].strip()
                deadline = "none"
                duration_hours = 1
                priority = "medium"

                if "deadline:" in task_name:
                    task_name, deadline_part = task_name.split("deadline:", 1)
                    task_name = task_name.strip()
                    deadline = deadline_part.strip() or "none"

                if "duration_hours:" in deadline:
                    deadline, dur_part = deadline.split("duration_hours:", 1)
                    deadline = deadline.strip() or "none"
                    digits = re.sub(r"\D", "", dur_part)
                    duration_hours = int(digits) if digits else 1

                if "priority:" in deadline:
                    deadline_part, priority_part = deadline.split("priority:", 1)
                    deadline = deadline_part.strip() or "none"
                    priority = priority_part.strip().lower() or "medium"

                fallback.append({
                    "task": task_name,
                    "deadline": deadline,
                    "duration_hours": duration_hours,
                    "priority": priority
                })

        if fallback:
            return fallback

        # fallback simple phrase extraction for undifferentiated text
        words = re.split(r"[;,\n]| and ", task_text)
        simple_fallback = []
        for item in words:
            item = item.strip()
            if not item:
                continue
            # avoid picking up empty/incomplete tokens
            if len(item) < 2:
                continue
            # avoid numeric only
            if item.isdigit():
                continue
            simple_fallback.append({
                "task": item,
                "deadline": "none",
                "duration_hours": 1,
                "priority": "medium"
            })

        return simple_fallback

    if not os.getenv("GROQ_API_KEY"):
        print("GROQ_API_KEY missing; using local fallback parser")
        return _text_extract(text)

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            response_format={"type": "json_object"}
        )
    except Exception as e:
        print("LLM request error:", e)
        return _text_extract(text)

    content = ""
    try:
        content = response.choices[0].message.content
    except Exception as e:
        print("Unexpected LLM response structure:", e, response)
        return _text_extract(text)

    tasks = _text_extract(content)
    if not tasks:
        print("LLM parsed no tasks, using user text fallback")
        tasks = _text_extract(text)

    return tasks


# -----------------------
# SCHEDULER
# -----------------------

def schedule_tasks():

    if not tasks_db:
        return []

    tasks_sorted = sorted(
        tasks_db,
        key=lambda x: (
            -priority_score.get(x["priority"], 1),
            x["deadline"]
        )
    )

    current_time = datetime.now().replace(minute=0, second=0)

    schedule = []

    for task in tasks_sorted:

        start = current_time
        end = start + timedelta(hours=task["duration_hours"])

        schedule.append({
            "task": task["task"],
            "priority": task["priority"],
            "start": start.strftime("%Y-%m-%d %H:%M"),
            "end": end.strftime("%Y-%m-%d %H:%M")
        })

        current_time = end

    return schedule


# -----------------------
# ADD TASKS
# -----------------------

@app.post("/add_tasks")
def add_tasks(input: TaskInput):

    try:
        tasks_db.clear()

        extracted_tasks = extract_tasks_with_llm(input.message)

        if not extracted_tasks:
            return {
                "error": "LLM did not return valid tasks",
                "raw_input": input.message
            }

        added_tasks = []

        for t in extracted_tasks:

            deadline = dateparser.parse(str(t.get("deadline", "")))

            if deadline is None:
                deadline = datetime.now() + timedelta(days=1)

            task = {
                "task": t.get("task", "unknown task"),
                "deadline": deadline,
                "duration_hours": int(t.get("duration_hours", 1)),
                "priority": str(t.get("priority", "medium")).lower()
            }

            # prevent duplicate tasks
            if task not in tasks_db:
                tasks_db.append(task)
                added_tasks.append(task)

        schedule = schedule_tasks()

        return {
            "tasks_added": added_tasks,
            "updated_schedule": schedule
        }

    except Exception as e:

        return {
            "error": str(e)
        }


# -----------------------
# VIEW TASKS
# -----------------------

@app.get("/tasks")
def get_tasks():
    return tasks_db


# -----------------------
# VIEW SCHEDULE
# -----------------------

@app.get("/schedule")
def get_schedule():
    return schedule_tasks()


# -----------------------
# ROOT ROUTE
# -----------------------

@app.get("/")
def home():
    return {"message": "AI Task Manager API running"}