const express = require('express');
const router = express.Router();
const data = require('./mock.json');

// GET /api/topics - Get hot topic tags
router.get('/', (req, res) => {
  const hotTopics = data.tags.sort((a, b) => b.count - a.count).slice(0, 5);
  res.json(hotTopics);
});

module.exports = router;