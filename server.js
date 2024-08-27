const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const schedule = require('node-schedule');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const clickSchema = new mongoose.Schema({
  userId: String,
  date: { type: Date, default: Date.now }
});

const Click = mongoose.model('Click', clickSchema);

app.post('/click', async (req, res) => {
  const { userId } = req.body;
  const today = new Date().setHours(0, 0, 0, 0);
  const existingClick = await Click.findOne({ userId, date: { $gte: today } });
  
  if (existingClick) {
    return res.status(400).json({ message: 'Już kliknąłeś dzisiaj.' });
  }
  
  const newClick = new Click({ userId });
  await newClick.save();
  
  const totalClicks = await Click.countDocuments({ date: { $gte: today } });
  
  if (totalClicks === 5) {
    // Tutaj dodaj kod do wysłania wiadomości na Messengera
    console.log('Wszyscy kliknęli!');
  }
  
  res.json({ message: 'Kliknięcie zarejestrowane.' });
});

// Reset kliknięć o północy
schedule.scheduleJob('0 0 * * *', async () => {
  await Click.deleteMany({});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));