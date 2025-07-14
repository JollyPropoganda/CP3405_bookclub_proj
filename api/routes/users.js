const express = require('express');
const router = express.Router();
const data = require('./mock.json');

// GET /api/users/:id - Fetch user profile
router.get('/:id', (req, res) => {
  const user = data.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST /api/users/follow - Follow another user
router.post('/follow', (req, res) => {
  const { currentUserId, targetUserId } = req.body;
  const currentUser = data.users.find(u => u.id === currentUserId);
  if (!currentUser) return res.status(404).json({ error: 'Current user not found' });

  if (!currentUser.following.includes(targetUserId)) {
    currentUser.following.push(targetUserId);
    res.json({ message: 'User followed successfully' });
  } else {
    res.json({ message: 'Already following' });
  }
});

module.exports = router;