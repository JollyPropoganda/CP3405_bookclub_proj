//to start server: start bash terminal -> type: "npm run dev"
const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs');
const path = require('path');

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'templates')));
// Import routes
const usersRoute = require('./routes/users');
const notesRoute = require('./routes/notes');
const topicsRoute = require('./routes/topics');

// Apply routes
app.use('/users', usersRoute);
app.use('/notes', notesRoute);
app.use('/topics', topicsRoute);

app.get('/', (req, res) => {
  res.send('API is running');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
