const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'library.json');

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

function readLibrary() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function writeLibrary(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
}

app.get('/api/library', (req, res) => {
  const items = readLibrary();
  const { q } = req.query;
  if (q) {
    const lower = q.toLowerCase();
    return res.json(items.filter(it =>
      it.title.toLowerCase().includes(lower) ||
      it.tags.some(t => t.toLowerCase().includes(lower)) ||
      it.content.toLowerCase().includes(lower)
    ));
  }
  res.json(items);
});

app.get('/api/library/:id', (req, res) => {
  const items = readLibrary();
  const item = items.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Archive entry not found.' });
  }
  res.json(item);
});

app.post('/api/library', (req, res) => {
  const { title, tags = [], content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  const items = readLibrary();
  const newItem = { id: uuidv4(), title, tags, content, createdAt: new Date().toISOString() };
  items.unshift(newItem);
  writeLibrary(items);
  res.status(201).json(newItem);
});

app.post('/api/query', (req, res) => {
  const { question, maxRefs = 3 } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'question is required' });
  }

  const items = readLibrary();
  const searchTerm = question.toLowerCase();
  const matched = items
    .map(item => ({ item, score:
      (item.title.toLowerCase().includes(searchTerm) ? 3 : 0) +
      (item.tags.some(t => t.toLowerCase().includes(searchTerm)) ? 2 : 0) +
      (item.content.toLowerCase().includes(searchTerm) ? 1 : 0)
    }))
    .filter(entry => entry.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0, maxRefs)
    .map(entry => entry.item);

  const answer = {
    question,
    insights: matched.map(m => ({
      id: m.id,
      title: m.title,
      excerpt: m.content.slice(0, 300) + (m.content.length > 300 ? '...' : ''),
      tags: m.tags
    })),
    generated: `This is a stub LLM response generated using ${matched.length} reference library item(s).`,
    timestamp: new Date().toISOString()
  };

  res.json(answer);
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`AI Social Ninja backend running on http://localhost:${PORT}`);
});
