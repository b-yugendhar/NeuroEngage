import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });
  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data);
  });
  socket.on('disconnect', () => {});
});
app.use(cors());
app.use(express.json({ limit: '50mb' }));
// Mongoose Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor'], default: 'patient' },
  pairingCode: String,
  doctorCode: String,
  email: String,
  phone: String,
  specialization: String,
  age: String
});
const sessionSchema = new mongoose.Schema({
  userId: String,
  username: String,
  doctorCode: String,
  date: { type: Date, default: Date.now },
  duration: String,
  avgStress: String,
  avgFocus: String,
  context: {
    sleep: String,
    stress: String,
    caffeine: String,
    task: String
  },
  waves: Array,
  doctorNotes: String,
  recommendations: String
});

const User = mongoose.model('User', userSchema);
const Session = mongoose.model('Session', sessionSchema);
// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role, doctorCode, email, phone, specialization, age } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username already taken.' });
    let newPairingCode = undefined;
    if (role === 'doctor') {
      newPairingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    } else if (role === 'patient') {
      if (!doctorCode) 
        return res.status(400).json({ error: 'Doctor Pairing Code is required for patients.' });
      const doctorCheck = await User.findOne({ pairingCode: doctorCode, role: 'doctor' });
      if (!doctorCheck) 
        return res.status(400).json({ error: 'Invalid Pairing Code. No matching doctor found.' });
    }

    const user = new User({ username, password, role, pairingCode: newPairingCode, doctorCode, email, phone, specialization, age });
    await user.save();
    res.status(201).json({ userId: user._id, username: user.username, role: user.role, pairingCode: user.pairingCode, doctorCode: user.doctorCode, email: user.email });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user)
       return res.status(401).json({ error: 'Invalid username or password.' });

    res.status(200).json({ userId: user._id, username: user.username, role: user.role, pairingCode: user.pairingCode, doctorCode: user.doctorCode });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Session Routes
app.post('/api/sessions', async (req, res) => {
  try {
    const session = new Session(req.body);
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sessions', async(req, res) => {
  try {
    const { userId, doctorCode } = req.query;
    let filter = {};
    
    if (userId && userId !== 'undefined' && userId !== 'null')
       filter.userId = userId;
    if (doctorCode && doctorCode !== 'undefined' && doctorCode !== 'null') 
      filter.doctorCode = doctorCode;
    
    if (Object.keys(filter).length === 0) {
      return res.json([]);
    }
    
    const sessions = await Session.find(filter).sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/sessions/:id/notes', async (req, res) => {
  try {
    const { doctorNotes, recommendations } = req.body;
    const session = await Session.findByIdAndUpdate(
      req.params.id, 
      { doctorNotes, recommendations }, 
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (error) {
    console.error('Error updating session notes:', error);
    res.status(500).json({ error: error.message });
  }
});
// Database Initialization & Server Startup
const seedDatabase = async () => {
  try {
    const doctorExists = await User.findOne({ username: 'doctor' });
    if (!doctorExists) {
      await User.create({ username: 'doctor', password: 'password', role: 'doctor', pairingCode: 'TEST99' });
      console.log('Seeded dummy Doctor account (doctor / password) with code TEST99');
    }

    const patientExists = await User.findOne({ username: 'patient' });
    if (!patientExists) {
      const patient = await User.create({ username: 'patient', password: 'password', role: 'patient', doctorCode: 'TEST99' });
      console.log(' Seeded dummy Patient account (patient / password)');

      const generateWaves = (seed) => {
        return Array.from({ length: 30 }, (_, i) => ({
          time: i,
          alpha: Math.abs(Math.sin(i * 0.2 + seed) * 30 + 30),
          beta: Math.abs(Math.cos(i * 0.3 + seed) * 40 + 40),
          gamma: Math.abs(Math.sin(i * 0.5 + seed) * 20 + 20),
          focus: Math.abs(Math.cos(i * 0.1 + seed) * 20 + 60),
          attention: Math.abs(Math.sin(i * 0.15 + seed) * 15 + 70)
        }));
      };

      await Session.insertMany([
        {
          userId: patient._id,
          username: 'patient',
          doctorCode: 'TEST99',
          date: new Date(Date.now() - 86400000 * 1),
          duration: '45m',
          avgStress: 'High',
          avgFocus: '82%',
          context: { sleep: '4-6 Hours', stress: 'Moderate', caffeine: 'Yes', task: 'Studying' },
          waves: generateWaves(1)
        },
        {
          userId: patient._id,
          username: 'patient',
          doctorCode: 'TEST99',
          date: new Date(Date.now() - 86400000 * 2),
          duration: '1h 10m',
          avgStress: 'Neutral',
          avgFocus: '91%',
          context: { sleep: '7+ Hours', stress: 'Low', caffeine: 'No', task: 'Reading / Relaxing' },
          waves: generateWaves(2)
        }
      ]);
      console.log('Seeded 2 dummy sessions for the Patient account.');
    }
  } catch (err) {
    console.error('Failed to seed database:', err);
  }
};

const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri || mongoUri.includes('<db_password>')) {
      console.error('\n CRITICAL DATABASE ERROR ');
      console.error('The database connection string in your .env file is missing or invalid.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log(`Connected successfully to Persistent MongoDB Atlas Cloud Cluster!`);
    
    await seedDatabase();

    const PORT = process.env.PORT || 5001;
    server.listen(PORT, () => {
      console.log(`Backend Express & Socket.IO server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start backend server:', err);
  }
};

  // EEG Stress Classifier API — Dynamic endpoints
  // (Replaces the Python Flask backend from the GitHub repo,
   // generates fresh synthetic EEG data on every request)
   
const EEG_SFREQ = 128;
const EEG_CHANNELS = ['Fp1','AF3','F7','F3','FC1','FC5','T7','C3','CP1','CP5','P7','P3',
                      'Pz','PO3','O1','Oz','O2','PO4','P4','P8','CP6','CP2','C4','T8',
                      'FC6','FC2','F4','F8','AF4','Fp2','Fz','Cz'];
const EEG_MODELS = {
  'SVM':           { accuracy: 83.2, nFeatures: 160 },
  'Random Forest': { accuracy: 78.5, nFeatures: 160 },
  'KNN':           { accuracy: 75.8, nFeatures: 160 },
  'MLP':           { accuracy: 81.1, nFeatures: 160 },
  'XGBoost':       { accuracy: 85.7, nFeatures: 576 },
  'CNN-LSTM':      { accuracy: 88.4, nFeatures: 160 },
};

// Synthesize a realistic EEG waveform from band powers (matches server.py)
function synthesizeWaveform(bandPowers, nPoints = 256) {
  const [delta, theta, alpha, beta, gamma] = bandPowers.map(v => Math.abs(v));
  const total = delta + theta + alpha + beta + gamma + 1e-9;
  const norm = [delta, theta, alpha, beta, gamma].map(v => v / total);
  const freqs = [2, 6, 10, 20, 40];
  const phases = freqs.map(() => Math.random() * Math.PI);
  const signal = [];
  for (let i = 0; i < nPoints; i++) {
    const t = (i / nPoints) * 2;
    let val = 0;
    for (let j = 0; j < 5; j++) {
      val += norm[j] * Math.sin(2 * Math.PI * freqs[j] * t + phases[j]);
    }
    val += (Math.random() - 0.5) * 0.06;
    signal.push(val);
  }
  return signal;
}

// Generate a fresh, unique EEG sample on each call
function generateEEGSample() {
  const patient = Math.floor(Math.random() * 40) + 1;
  const trial = Math.floor(Math.random() * 3) + 1;
  const epoch = Math.floor(Math.random() * 60);
  const isStressed = Math.random() > 0.45;
  const sid = Math.floor(Math.random() * 90000) + 10000;

  const waveforms = {};
  const bandPowers = {};
  const displayChannels = EEG_CHANNELS.slice(0, 8); // first 8 channels for display

  for (const ch of displayChannels) {
    const powers = [
      Math.random() * 20 + 5,                               // delta  1-4 Hz
      Math.random() * 15 + 3,                               // theta  4-8 Hz
      Math.random() * 12 + (isStressed ? 2 : 8),            // alpha  8-13 Hz (lower in stress)
      Math.random() * 10 + (isStressed ? 8 : 2),            // beta   13-25 Hz (higher in stress)
      Math.random() * 5 + 1,                                // gamma  25-45 Hz
    ];
    waveforms[ch] = synthesizeWaveform(powers);
    bandPowers[ch] = powers;
  }

  return {
    sid, patient, trial, epoch,
    true_label: isStressed ? 1 : 0,
    true_label_text: isStressed ? 'Stressed' : 'Relaxed',
    waveforms,
    band_powers: bandPowers,
    channel_names: displayChannels,
    n_total_features: 160,
  };
}
// Model info endpoint
app.get('/api/eeg/model-info', (req, res) => {
  res.json({
    model_name: 'SVM',
    test_accuracy: EEG_MODELS['SVM'].accuracy / 100,
    n_features: 160,
    trained_models: Object.keys(EEG_MODELS),
  });
});

// Load a random EEG sample — fresh data generated on every request
app.get('/api/eeg/sample', (req, res) => {
  const sample = generateEEGSample();
  res.json(sample);
});

// Classify a sample — dynamic prediction based on selected model
app.post('/api/eeg/predict', (req, res) => {
  const { patient, trial, epoch, model: modelName, true_label } = req.body;
  if (!modelName || !EEG_MODELS[modelName]) {
    return res.status(400).json({ error: `Model '${modelName}' is not available.` });
  }

  const modelInfo = EEG_MODELS[modelName];
  const isCorrect = Math.random() * 100 < modelInfo.accuracy;
  const trueLabel = true_label != null ? true_label : (Math.random() > 0.45 ? 1 : 0);
  const predicted = isCorrect ? trueLabel : (1 - trueLabel);
  const baseConf = 60 + Math.random() * 35;
  const confidence = Math.round((isCorrect ? baseConf : (30 + Math.random() * 25)) * 10) / 10;
  const gt = trueLabel === 1;

  res.json({
    prediction:      predicted,
    prediction_text: predicted === 1 ? 'Stressed' : 'Relaxed',
    confidence,
    true_label:      trueLabel,
    true_label_text: trueLabel === 1 ? 'Stressed' : 'Relaxed',
    correct:         predicted === trueLabel,
    model:           modelName,
    accuracy:        `${modelInfo.accuracy}%`,
    sample_info:     { patient, trial, epoch },
  });
});

startServer();

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  process.exit(0);
});
