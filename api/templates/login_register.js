//import zxcvbn from 'zxcvbn';

const Loginform = document.getElementById("loginForm");
const Registerform = document.getElementById("registerForm");

function toggleForms() {
  document.getElementById("loginForm").classList.toggle("hidden");
  document.getElementById("registerForm").classList.toggle("hidden");
}

async function login(username, password) {

  const res = await fetch('https://decent-cody-cp3405-bookclub-043c1a14.koyeb.app/notes/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const result = await res.json();

      if (result.success == true) {
        alert("Welcome! " + result.message[0]);
        localStorage.setItem("user_info", result.message);
        window.location.href = "home.html";
      }
      else {
        alert(result.message)
      }
};

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById("registerPassword").addEventListener("input", (e) => {
      show_password_strength(e.target.value);
    });

    Loginform.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;
        if (username === "" || password === "") {
            alert("Please fill in all fields.");
          } else {
            login(username, password);
          }
    });

    Registerform.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById("registerUsername").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const cfmpassword = document.getElementById("passwordconfirmation").value;
        const err_text = document.getElementById("error-text");

        if (username === "" || email === "" || password === "") {
            err_text.innerHTML = `Please fill in all fields`;
        }
        else if (password !== cfmpassword) {
            err_text.innerHTML = `Passwords do not match`;
        }
        else {
            register(username, password, email)
        }
    });
});

async function register(username, password, email) {
  const res = await fetch('https://decent-cody-cp3405-bookclub-043c1a14.koyeb.app//notes/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
      });

      const result = await res.json();

      if (result.success == true) {
        alert(result.message)
        login(result.logincred[0], result.logincred[1])
      }
      else {
        alert(result.message)
      }
}

function show_password_strength(password) {
      const strengthFill = document.getElementById('strength-fill');
      const strengthText = document.getElementById('strength-text');

      if (!strengthFill || !strengthText) {
        console.warn("Missing strength bar elements.");
        return;
      }

      const result = zxcvbn(password);
      const zxcvbnScore = result.score;

      const meetsRules = checkPasswordRules(password);
      let score = zxcvbnScore;
      if (!meetsRules) score = Math.min(score, 2);

      const colors = ['red', 'orange', 'yellow', 'lightgreen', 'green'];
      const texts = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

      strengthFill.style.width = `${(score / 4) * 100}%`;
      strengthFill.style.backgroundColor = colors[score];
      strengthText.innerHTML = meetsRules ? texts[score] : `Please include in your password at least:<br> - 1 lowercase<br> - 1 uppercase<br> - 1 number<br> - 1 special character<br> - min password length 8`;
    }

    function checkPasswordRules(password) {
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasDigit = /\d/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      return password.length >= 8 && hasUpper && hasLower && hasDigit && hasSpecial;
}
