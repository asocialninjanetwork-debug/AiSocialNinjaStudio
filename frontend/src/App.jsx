import { useEffect, useState } from 'react';

const API_BASE = '/api';

function App() {
  const [archive, setArchive] = useState([]);
  const [filter, setFilter] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', tags: '', content: '' });

  const fetchArchive = async () => {
    const res = await fetch(`${API_BASE}/library${filter ? `?q=${encodeURIComponent(filter)}` : ''}`);
    setArchive(await res.json());
  };

  useEffect(() => {
    fetchArchive();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newEntry.title || !newEntry.content) return;
    setSaving(true);
    await fetch(`${API_BASE}/library`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newEntry.title,
        tags: newEntry.tags.split(',').map(x => x.trim()).filter(Boolean),
        content: newEntry.content
      })
    });
    setNewEntry({ title: '', tags: '', content: '' });
    await fetchArchive();
    setSaving(false);
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!question) return;
    const res = await fetch(`${API_BASE}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    setAnswer(await res.json());
  };

  return (
    <div className="app">
      <header>
        <h1>AI Social Ninja CV Reference Archive</h1>
        <p>Use this as a knowledge base for computer vision answers in your LLM agent.</p>
      </header>

      <section className="panel">
        <h2>1. Add Archive Reference</h2>
        <form onSubmit={handleSave} className="form-grid">
          <input
            value={newEntry.title}
            onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
            placeholder="Title"
            required
          />
          <input
            value={newEntry.tags}
            onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
            placeholder="Tags (comma separated)"
          />
          <textarea
            value={newEntry.content}
            onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
            placeholder="Detailed content about computer vision concepts or how-tos"
            required
          />
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Reference'}</button>
        </form>
      </section>

      <section className="panel">
        <h2>2. Browse & Search References</h2>
        <input
          placeholder="Search by keyword, tag, title"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') fetchArchive(); }}
        />
        <button onClick={fetchArchive}>Search</button>
        <div className="list">
          {archive.length === 0 && <p>No results.</p>}
          {archive.map(item => (
            <div className="entry" key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.content.slice(0, 180)}{item.content.length > 180 ? '...' : ''}</p>
              <p className="tags">Tags: {item.tags.join(', ')}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>3. Computer Vision Query (LLM agent style)</h2>
        <form onSubmit={handleQuery} className="form-grid">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a CV question, e.g., 'How to improve object detection accuracy on low light images?'"
            required
          />
          <button type="submit">Generate Answer</button>
        </form>

        {answer && (
          <div className="answer-box">
            <h3>Agent Response</h3>
            <p><strong>Question:</strong> {answer.question}</p>
            <p><strong>Text:</strong> {answer.generated}</p>
            <h4>Reference snippets</h4>
            {answer.insights.length === 0 && <p>No reference matches found; add more CV archive content.</p>}
            <ul>
              {answer.insights.map(item => (
                <li key={item.id}>
                  <strong>{item.title}</strong> — {item.excerpt}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
