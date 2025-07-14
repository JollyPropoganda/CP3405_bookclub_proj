const notesList = document.getElementById('notes-list');
const form = document.getElementById('input-area');
const textarea = document.getElementById('content');
const postbutton = document.getElementById('postbutton');
const userIdInput = document.getElementById('userId');
const username = document.getElementById('username');
const replyField = document.getElementById('reply-field');
const bookField = document.getElementById("bookId");
const replyText = document.getElementById("reply-text");


let reply = false;

const user_info = localStorage.getItem("user_info").split(",");
alert(user_info);
userIdInput.value = user_info[1];
username.value = user_info[0];

textarea.addEventListener('input', () => {
  textarea.style.height = 'auto'; // reset height
  textarea.style.height = `${textarea.scrollHeight}px`; // set to scrollHeight
});

// Fetch and display recent notes
async function fetchNotes() {
  const res = await fetch('https://decent-cody-cp3405-bookclub-043c1a14.koyeb.app/notes/recent');
  const notes = await res.json();

  userIdInput.value = user_info[1];
  username.value = user_info[0];

  notesList.innerHTML = '';
  const h2 = document.createElement('h2');
  h2.textContent = `total comments (${notes[1]})`;
  notesList.appendChild(h2);

  for (const note of notes[0]) {
    const username_value = username.value;
    const showButton = username_value === note.userId;
    const li = document.createElement('li');
    li.innerHTML = `<div>
                        [${note.createdAt}] User ${note.userId} (Book ${note.bookId}): ${note.content}
                        ${showButton ? `<button onclick='editNote(${JSON.stringify(note.noteId || "")}, ${JSON.stringify(note.bookId || "")}, ${JSON.stringify(note.content || "")})'>edit</button>` : ''}
                    </div>`;
    li.classList.add('note-item');

    // replies
    if (note.replies && note.replies.length > 0) {
      const replyList = document.createElement('ul');
      note.replies.forEach(reply => {
        const replyItem = document.createElement('li');
        const showButton = username_value === reply.userId;
        replyItem.innerHTML = `<div>
                                    [${reply.createdAt}] User ${reply.userId}: ${reply.content}
                                    ${showButton ? `<button onclick='editNote(${JSON.stringify(reply.id || "")}, ${JSON.stringify(reply.bookId || "")}, ${JSON.stringify(reply.content || "")}, ${JSON.stringify(reply.replyId || "")})'>edit</button>` : ''}
                               </div>`;
        replyList.appendChild(replyItem);
      });
      li.appendChild(replyList);
    }

    const buttonDiv = document.createElement('div');
    buttonDiv.classList.add('button-container');
    const replyBtn = document.createElement('button');
    replyBtn.textContent = 'Reply';
    replyBtn.addEventListener('click', () => handleReply(note));
    replyBtn.classList.add('notesBtn', 'replyBtn');
    buttonDiv.appendChild(replyBtn);

    // Add follow/following status if the note isn't from current user
    if (username_value !== note.userId.toString()) {
      const followBtn = document.createElement('button');
      followBtn.classList.add('notesBtn', 'followBtn');
      const showFollow = document.createElement('h3');
      const showFollowing = document.createElement('h3');

      followBtn.textContent = 'Follow';
      followBtn.style.display = 'none';

      showFollow.textContent = 'followed';
      showFollow.style.display = 'none';

      showFollowing.textContent = 'following you';
      showFollowing.style.display = 'none';

      buttonDiv.appendChild(followBtn);
      buttonDiv.appendChild(showFollow);
      buttonDiv.appendChild(showFollowing);

      console.log("Check follow status", {
          username: username_value,
          notes_userId: note.userId
      });

      // Fetch follow status

      const res2 = await fetch('https://decent-cody-cp3405-bookclub-043c1a14.koyeb.app/notes/checkfollow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username_value, notes_userId: note.userId })
      });
      const follow_following = await res2.json();

      console.log("Follow API response:", follow_following);

      if (follow_following.is_followed) {
        showFollow.style.display = 'block';
      } else {
        followBtn.style.display = 'block';
      }

      if (follow_following.is_following) {
        showFollowing.style.display = 'block';
      }

      followBtn.addEventListener('click', async () => {
        await handleFollow(note.userId, followBtn, showFollow);
      });
    }

    li.appendChild(buttonDiv);
    notesList.appendChild(li);
  }
}

async function handleFollow(notes_userId, followBtn, showFollow) {
  const username_value = username.value;

  const res = await fetch('http://decent-cody-cp3405-bookclub-043c1a14.koyeb.app/notes/follow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username_value, notes_userId })
  });
  const result = await res.json();

  if (result.is_followed === true) {
    followBtn.style.display = 'none';
    showFollow.style.display = 'block';
  }
  fetchNotes();
}

async function postNote() {
  const userId = userIdInput.value;
  const bookId = document.getElementById('bookId').value;
  const content = document.getElementById('content').value;

  const res = await fetch('https://decent-cody-cp3405-bookclub-043c1a14.koyeb.app/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, bookId, content })
  });
  textarea.value = '';
  textarea.style.height = 'auto';
  const result = await res.json();
  alert(result.message[0]);

  form.reset();
  fetchNotes();

}

function handleClose() {
    reply = false;
    replyField.style.visibility = 'hidden';
    bookField.readOnly = false;
    bookField.value = "";
}

let replyNoteId = null;
let replyBookId = null;

function handleReply(note) {
    replyNoteId = note.noteId;
    replyBookId = note.bookId;

    reply = true;
    edit = false;
    replyField.style.visibility = 'visible';
    bookField.readOnly = true;
    bookField.value = note.bookId;

    replyText.textContent = `[${note.createdAt}] User ${note.userId} (Book ${note.bookId}): ${note.content}\n
                            ↳ Replying to ${note.userId} on (Book ${note.bookId})`;
}

async function postReply() {
    const userId = userIdInput.value;
    const content = document.getElementById('content').value;

    if (!replyNoteId || !replyBookId) {
        alert('Missing reply target!');
        return;
    }

    alert("reply clicked, reply status is now: ", reply);
    const res = await fetch('https://decent-cody-cp3405-bookclub-043c1a14.koyeb.app/notes/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: replyNoteId, userId, bookId: replyBookId, content })
      });
    textarea.value = '';
    textarea.style.height = 'auto';
    const result = await res.json();
    alert(result.message[0]);

    reply = false;
    bookField.readOnly = false;

    form.reset();
    fetchNotes();
}


const edited_content = textarea.value;
let original_content = '';
let editing_noteId = '';
let editing_replyId = '';
let edit = false;

function editNote(noteId, bookId, content, id='') {
    original_content = content;
    textarea.value = content;
    editing_noteId = noteId;
    editing_replyId = id;

    bookField.readOnly = true;
    bookField.value = bookId;
    edit = true;
    reply = false;
}

async function postEdit() {
    console.log( "content:", original_content, "noteId: ", editing_noteId, "replyId: ", editing_replyId)
    const res = await fetch('https://decent-cody-cp3405-bookclub-043c1a14.koyeb.app/notes/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: textarea.value, noteId: editing_noteId, replyId: editing_replyId })
    });
    textarea.style.height = 'auto';
    const result = await res.json();
    alert(result.message);

    edit = false;
    bookField.readOnly = false;

    form.reset();
    fetchNotes();
}

document.addEventListener('DOMContentLoaded', () => {
  postbutton.addEventListener('click', async (event)=> {
  event.preventDefault(); // stop default form submission (if inside a form)
  if (edit === true) {
    alert("edit");
    await postEdit();
  } else if (reply === true) {
    alert("reply")
    await postReply();
  } else {
    alert("clicked!");
    await postNote();
  }
  });
});

fetchNotes();
