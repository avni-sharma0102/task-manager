// minimal AI integration service for chatbot/llm.py
// Expects the Python FastAPI to run at http://localhost:8000

export async function addTasksFromText(message) {
  // Use relative path so it works in production or when proxying to backend
  const url = (window._API_BASE || '') + '/add_tasks';

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || 'AI service request failed');
  }

  return resp.json();
}
