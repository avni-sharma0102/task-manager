import json
import re
from datetime import datetime, timedelta
import dateparser

from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI(title="AI Task Manager Demo")

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

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        response_format={"type": "json_object"}
    )

    content = response.choices[0].message.content

    try:
        data = json.loads(content)

        if isinstance(data, dict) and "tasks" in data:
            return data["tasks"]

        if isinstance(data, list):
            return data

        return []

    except Exception:
        return []


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