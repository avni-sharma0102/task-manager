import { useState, useRef, useEffect } from 'react';
import { addTasksFromText } from '../services/ai';
import '../styles/Chatbot.css';

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content) return;
    setMessages((m) => [...m, { role: 'user', text: content }]);
    setText('');
    setLoading(true);
    try {
      const res = await addTasksFromText(content);
      // friendly summary
      const summary = {
        added: res.tasks_added || res.tasks || [],
        schedule: res.updated_schedule || res.updated_schedule || []
      };
      setMessages((m) => [...m, { role: 'bot', text: JSON.stringify(summary, null, 2) }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'bot', text: 'Error: ' + (err.message || err) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`chatbot ${open ? 'open' : ''}`}>
      <button
        className="chat-toggle"
        aria-label="Open chatbot"
        onClick={() => setOpen((s) => !s)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" fill="currentColor"/>
        </svg>
      </button>

      <div className="chat-panel" role="dialog" aria-hidden={!open}>
        <div className="chat-header">
          <strong>Assistant</strong>
          <button className="chat-close" onClick={() => setOpen(false)}>×</button>
        </div>

        <div className="chat-messages" ref={messagesRef}>
          {messages.length === 0 && <div className="chat-empty">Ask me to add tasks (e.g. "Prepare slides by tomorrow")</div>}
          {messages.map((m, i) => (
            <div key={i} className={`chat-message ${m.role}`}>
              <pre>{m.text}</pre>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <textarea
            placeholder="Type a message to extract tasks..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            disabled={loading}
          />
          <div className="chat-actions">
            <button className="btn" onClick={() => { setText(''); }} disabled={loading}>Clear</button>
            <button className="btn btn-primary" onClick={handleSend} disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
