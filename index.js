const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Connect to MongoDB database
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB.');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });

// Define attendance schema
const attendanceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Attendance = mongoose.model('Attendance', attendanceSchema);

// Configure multer middleware for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Set up routes
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/attendance', upload.single('photo'), async (req, res) => {
  const { name } = req.body;
  const { filename } = req.file;

  // Save attendance data to the database
  try {
    const attendanceRecord = new Attendance({
      name,
      photo: filename
    });
    await attendanceRecord.save();
    console.log('Attendance record created:', attendanceRecord.toJSON());
    res.send('Attendance recorded successfully!');
  } catch (error) {
    console.error('Error saving attendance record:', error);
    res.status(500).send('An error occurred while recording attendance.');
  }

  // Remove uploaded photo file
  fs.unlink(req.file.path, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
