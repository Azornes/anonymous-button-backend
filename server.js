const express = require('express');
const cors = require('cors');
const schedule = require('node-schedule');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'clicks.json');

async function readClicks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function writeClicks(clicks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(clicks));
}

app.post('/click', async (req, res) => {
  const { userId } = req.body;
  const clicks = await readClicks();
  const today = new Date().toISOString().split('T')[0];

  if (!clicks[today]) {
    clicks[today] = [];
  }

  if (clicks[today].includes(userId)) {
    return res.status(400).json({ message: 'Już kliknąłeś dzisiaj.' });
  }

  clicks[today].push(userId);
  await writeClicks(clicks);

  if (clicks[today].length === 5) {
    // Tutaj dodaj kod do wysłania wiadomości na Messengera
    console.log('Wszyscy kliknęli!');
  }

  res.json({ message: 'Kliknięcie zarejestrowane.' });
});

// Nowy endpoint, który zwraca liczbę kliknięć
app.get('/clicks', async (req, res) => {
  const clicks = await readClicks();
  const today = new Date().toISOString().split('T')[0];

  const clickCount = clicks[today] ? clicks[today].length : 0;
  res.json({ clickCount });
});

// Reset kliknięć o północy
schedule.scheduleJob('0 0 * * *', async () => {
  await writeClicks({});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));