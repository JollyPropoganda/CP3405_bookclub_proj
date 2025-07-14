const express = require('express');
const fs = require('fs'); //constant required to save data into mock.json
const router = express.Router();
const path = require('path');
//const data = require('./mock.json'); -> caches the file, might cause stale data and overwrite changes
const dataPath = path.join(__dirname, 'mock.json');
const data = require(dataPath);

//Jordan-add on
//function saveData() {
//    fs.writeFileSync('./mock.json', JSON.stringify(data, null, 2));
//}

router.post('/checkfollow', (req, res) => {
  const { username, notes_userId } = req.body;
  const users = data.users;

  const notesUser = users.find(u => u.name === notes_userId);
  const sessionUser = users.find(u => u.name === username);

  if (!notesUser || !sessionUser) {
    return res.status(400).json({ error: "User(s) not found" });
  }

  const is_followed = notesUser.followers.includes(username);
  const is_following = sessionUser.followers.includes(notes_userId);

  res.json({ is_followed, is_following });
});

router.post('/follow', (req, res) => {
  const { username, notes_userId } = req.body;
  const users = data.users;

  const notesUser = users.find(u => u.name === notes_userId);
  const currentUser = users.find(u => u.name === username);

  if (!notesUser) {
    return res.status(400).json({ error: "Target user not found" });
  }

  if (!notesUser.followers.includes(username)) {
    notesUser.followers.push(username);
    currentUser.following.push(notesUser.name);
    notesUser.total_followers += 1
    currentUser.total_following += 1
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
  res.json({ is_followed: true });
});

// GET /api/notes/recent - Get recent shared notes
router.get('/recent', (req, res) => {
  const user_credentials = data.users;
  const total_comments = data.notes.length;
  const recentNotes = data.notes.slice(-10).reverse().map(note => {
    const user = user_credentials.find(u => u.id === note.userId);
    //match user id in replies to user's name
    const replies = note.replies?.map(reply => {
      const replyUser = user_credentials.find(u => u.id === reply.userId);
      return {
        ...reply,
        userId: replyUser ? replyUser.name : "[invalid user]",
        content: replyUser ? reply.content : "[comment deleted by system: invalid user]"
      };
    }) || [];
    // match user id in notes to user's name
    return {
      ...note,
      id: note.noteId,
      userId: user ? user.name : "[invalid user]",
      content: user ? note.content : "[comment deleted by system: invalid user]",
      replies: replies
    };
  });
  //return output
  res.json([recentNotes, total_comments]);
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = data.users;

  const user = users.find(u => u.name === username && u.Password === password);

  if (user) {

    res.json({ message: [username, user.id], success: true });
  } else {
    res.json({ message: "Invalid credentials", success: false });
  }
});

router.post('/register', (req, res) => {
  const { username, password, email } = req.body;
  const users = data.users;
  //console.log("this is username:", username, "this is password", password, "this is email:", email)

  const validator = require('validator');

  if (!validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })) {
    return res.json({ message: "Password is too weak. Must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol.", success: false })
  }

  const existing_email = users.find(u => u.Email.toLowerCase() === email.toLowerCase());

  if (existing_email) {
    res.json({ message: "An account with this email already exists :0", success: false })
  } else {
      const newUser = {
        id: (users.length + 1).toString(),
        name: username,
        following: [],
        followers: [],
        total_followers: 0,
        total_following: 0,
        Password: password,
        Email:email
      }
      users.push(newUser);
      try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
        res.json({ message: "Account successfully created!", logincred: [username, password], success: true })
      } catch (error) {
        console.error('❌ Failed to write to mock.json:', error);
        res.status(500).json({ error: 'Failed to create new user' });
      }
  }
});

router.post('/reply', (req, res) => {
  const { noteId, userId, bookId, content } = req.body;
  const users = data.users;
  const notes = data.notes;
  const parentNote = data.notes.find(n => n.noteId === noteId)
  const now = new Date();
  const newReply = {
    id: noteId,
    replyId: (data.notes.length + 1).toString(),
    userId,
    bookId,
    content,
    createdAt: `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`
  };

  parentNote.replies = parentNote.replies || [];
  parentNote.replies.push(newReply);

  //code to write changes to mock.json permanently
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ message: ['Note posted successfully'], reply: newReply });
  } catch (error) {
    console.error('❌ Failed to write to mock.json:', error);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

router.post('/edit', (req, res) => {
  const { content, noteId, replyId } = req.body;
  const replies = data.notes.replies;
  const notes = data.notes;

  if (replyId !== '') {
    const note = notes.find(n => n.noteId === noteId);
    if (!note || !note.replies) {
      return res.json({ message: 'No reply parent note found' });
    }

    const reply = note.replies.find(r => r.replyId === replyId);
    if (reply) {
      reply.content = content;

      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
      return res.json({ message: 'Reply updated successfully' });
    } else {
      return res.json({ message: 'No reply found' });
    }
  } else {
    const note = notes.find(u => u.noteId === noteId); // ✅ fixed
    if (note) {
      note.content = content;

      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
      return res.json({ message: 'Note updated successfully' });
    } else {
      return res.json({ message: 'No note found' });
    }
  }
});

// POST /api/notes - Post a new note
router.post('/', (req, res) => {
  const { userId, bookId, content } = req.body;
  const users = data.users;
  const now = new Date();
  const newNote = {
    noteId: (data.notes.length + 1).toString(),
    userId,
    bookId,
    content,
    createdAt: `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`
  };
  data.notes.push(newNote);

  //const username = users.find(u => u.id === newNote.userId);

  //code to write changes to mock.json permanently
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    res.json({ message: ['Note posted successfully'], note: newNote });
  } catch (error) {
    console.error('❌ Failed to write to mock.json:', error);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

module.exports = router;