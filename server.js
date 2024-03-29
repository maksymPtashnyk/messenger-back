require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./routes/index')

const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api', router)

const start = async () => {
  try {
    mongoose.connect(DB_URL);
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  }
  catch (e) {
    console.log(e);
  }
}

start()