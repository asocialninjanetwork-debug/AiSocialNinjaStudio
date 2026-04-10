const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
const MONGO_URI = 'mongodb://atlas-sql-69b4687c4a19d00d5115e6a1-jigh0o.a.query.mongodb.net/sample_mflix?ssl=true&authSource=admin';
const DB_NAME = 'sample_mflix';
const COLLECTION = 'library';

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

let db, libraryCollection;

async function initMongo() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  libraryCollection = db.collection(COLLECTION);
  console.log('Connected to MongoDB.');
}

app.get('/api/library', async (req, res) => {
  const { q } = req.query;
  try {
    let query = {};
    if (q) {
      const search = new RegExp(q, 'i');
      query = { $or: [
        { title: search },
        { tags: search },
        { content: search }
      ] };
    }
    const items = await libraryCollection.find(query).toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch library items.' });
  }
});

app.get('/api/library/:id', async (req, res) => {
  try {
    const item = await libraryCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!item) return res.status(404).json({ error: 'Archive entry not found.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item.' });
  }
});

app.post('/api/library', async (req, res) => {
  const { title, tags = [], content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title and content are required' });

  try {
    const newItem = { _id: uuidv4(), title, tags, content, createdAt: new Date().toISOString() };
    await libraryCollection.insertOne(newItem);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create new item.' });
  }
});

app.post('/api/query', async (req, res) => {
  const { question, maxRefs = 3 } = req.body;
  if (!question) return res.status(400).json({ error: 'question is required' });
  try {
    const search = new RegExp(question, 'i');
    const items = await libraryCollection.find({
      $or: [
        { title: search },
        { tags: search },
        { content: search }
      ]
    }).toArray();

    const scored = items.map(item => ({
      item,
      score: (item.title.match(search) ? 3 : 0) +
             (item.tags.some(t => search.test(t)) ? 2 : 0) +
             (item.content.match(search) ? 1 : 0)
    }))
      .filter(entry => entry.score > 0)
      .sort((a,b) => b.score - a.score)
      .slice(0, maxRefs)
      .map(entry => entry.item);

    const answer = {
      question,
      insights: scored.map(m => ({
        id: m._id,
        title: m.title,
        excerpt: m.content.slice(0, 300) + (m.content.length > 300 ? '...' : ''),
        tags: m.tags
      })),
      generated: `This is a stub LLM response generated using ${scored.length} reference library item(s).`,
      timestamp: new Date().toISOString()
    };

    res.json(answer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to query items.' });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

initMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`AI Social Ninja backend running on http://localhost:${PORT}`);
  });
});

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
