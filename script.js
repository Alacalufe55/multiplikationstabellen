const state = {
  score: 0,
  answered: 0,
  streak: 0,
  bestStreak: 0,
  maxFactor: 10,
  currentQuestion: null,
  history: [],
  leaderboard: []
};

const LEADERBOARD_KEY = "multiplikationstabellen-highscores";

const scoreEl = document.querySelector("#score");
const answeredEl = document.querySelector("#answered");
const streakEl = document.querySelector("#streak");
const bestStreakEl = document.querySelector("#best-streak");
const questionEl = document.querySelector("#question");
const feedbackEl = document.querySelector("#feedback");
const encouragementEl = document.querySelector("#encouragement");
const answerFormEl = document.querySelector("#answer-form");
const answerInputEl = document.querySelector("#answer-input");
const historyListEl = document.querySelector("#history-list");
const leaderboardListEl = document.querySelector("#leaderboard-list");
const maxFactorEl = document.querySelector("#max-factor");
const newQuestionEl = document.querySelector("#new-question");
const resetGameEl = document.querySelector("#reset-game");
const saveScoreFormEl = document.querySelector("#save-score-form");
const playerNameEl = document.querySelector("#player-name");

function loadLeaderboard() {
  try {
    const savedValue = window.localStorage.getItem(LEADERBOARD_KEY);
    const parsedValue = savedValue ? JSON.parse(savedValue) : [];

    state.leaderboard = Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    state.leaderboard = [];
  }
}

function saveLeaderboard() {
  window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(state.leaderboard));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function randomFactor(maxFactor) {
  return Math.floor(Math.random() * maxFactor) + 1;
}

function nextQuestion() {
  state.currentQuestion = {
    left: randomFactor(state.maxFactor),
    right: randomFactor(state.maxFactor)
  };

  questionEl.textContent = `${state.currentQuestion.left} × ${state.currentQuestion.right}`;
  answerInputEl.value = "";
  answerInputEl.focus();
}

function setFeedback(message, type = "") {
  feedbackEl.textContent = message;
  feedbackEl.className = `feedback ${type}`.trim();
}

function updateStats() {
  scoreEl.textContent = String(state.score);
  answeredEl.textContent = String(state.answered);
  streakEl.textContent = String(state.streak);
  bestStreakEl.textContent = String(state.bestStreak);

  if (state.bestStreak >= 10) {
    encouragementEl.textContent = "Stark form. Du har byggt en riktigt fin svit.";
  } else if (state.streak >= 5) {
    encouragementEl.textContent = "Nu flyter det. Fortsätt medan rytmen sitter.";
  } else if (state.answered === 0) {
    encouragementEl.textContent = "Du är igång. Första rätta svaret startar sviten.";
  } else {
    encouragementEl.textContent = "Lite i taget räcker långt. Nästa fråga väntar.";
  }
}

function updateHistory() {
  if (state.history.length === 0) {
    historyListEl.innerHTML = '<li class="history-empty">Dina senaste svar visas här.</li>';
    return;
  }

  historyListEl.innerHTML = state.history
    .map((entry) => {
      const statusLabel = entry.correct ? "Rätt" : "Fel";
      const details = entry.correct
        ? `Du svarade ${entry.userAnswer}`
        : `Du svarade ${entry.userAnswer}, rätt svar är ${entry.correctAnswer}`;

      return `
        <li class="history-item ${entry.correct ? "correct" : "wrong"}">
          <div>
            <div class="history-expression">${entry.expression}</div>
            <div>${statusLabel}</div>
          </div>
          <div class="history-meta">${details}</div>
        </li>
      `;
    })
    .join("");
}

function updateLeaderboard() {
  if (state.leaderboard.length === 0) {
    leaderboardListEl.innerHTML = '<li class="history-empty">Ingen high score än. Spara första resultatet.</li>';
    return;
  }

  leaderboardListEl.innerHTML = state.leaderboard
    .map((entry) => {
      return `
        <li class="leaderboard-item">
          <div>
            <div class="leaderboard-name">${escapeHtml(entry.name)}</div>
            <div class="leaderboard-details">${entry.answered} svarade, bästa svit ${entry.bestStreak}</div>
          </div>
          <div class="leaderboard-meta">${entry.score} poäng</div>
        </li>
      `;
    })
    .join("");
}

function rememberAnswer(entry) {
  state.history.unshift(entry);
  state.history = state.history.slice(0, 8);
  updateHistory();
}

function sanitizeName(name) {
  return name.replace(/\s+/g, " ").trim().slice(0, 20);
}

function saveCurrentScore(event) {
  event.preventDefault();

  const playerName = sanitizeName(playerNameEl.value);

  if (!playerName) {
    setFeedback("Skriv ett namn innan du sparar din score.", "error");
    playerNameEl.focus();
    return;
  }

  if (state.answered === 0) {
    setFeedback("Spela minst en runda innan du sparar din score.", "error");
    return;
  }

  state.leaderboard.push({
    name: playerName,
    score: state.score,
    answered: state.answered,
    bestStreak: state.bestStreak
  });

  state.leaderboard.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    if (right.bestStreak !== left.bestStreak) {
      return right.bestStreak - left.bestStreak;
    }

    return left.answered - right.answered;
  });

  state.leaderboard = state.leaderboard.slice(0, 10);
  saveLeaderboard();
  updateLeaderboard();

  setFeedback(`${playerName} är nu sparad på high score-tavlan.`, "success");
  playerNameEl.value = "";
}

function handleAnswerSubmit(event) {
  event.preventDefault();

  const rawValue = answerInputEl.value.trim();
  const answer = Number(rawValue);

  if (rawValue === "" || Number.isNaN(answer)) {
    setFeedback("Skriv ett tal innan du svarar.", "error");
    answerInputEl.focus();
    return;
  }

  const { left, right } = state.currentQuestion;
  const correctAnswer = left * right;
  const correct = answer === correctAnswer;

  state.answered += 1;

  if (correct) {
    state.score += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    setFeedback("Rätt svar. Snyggt jobbat!", "success");
  } else {
    state.streak = 0;
    setFeedback(`Inte riktigt. ${left} × ${right} = ${correctAnswer}.`, "error");
  }

  rememberAnswer({
    expression: `${left} × ${right}`,
    userAnswer: answer,
    correctAnswer,
    correct
  });

  updateStats();
  nextQuestion();
}

function resetGame() {
  state.score = 0;
  state.answered = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.history = [];

  setFeedback("Spelet är nollställt. Nu kör vi en ny omgång.");
  updateStats();
  updateHistory();
  nextQuestion();
}

maxFactorEl.addEventListener("change", (event) => {
  state.maxFactor = Number(event.target.value);
  setFeedback(`Nu tränar du tabeller upp till ${state.maxFactor}.`);
  nextQuestion();
});

answerFormEl.addEventListener("submit", handleAnswerSubmit);
saveScoreFormEl.addEventListener("submit", saveCurrentScore);
newQuestionEl.addEventListener("click", () => {
  setFeedback("Ny fråga framme. Kör!");
  nextQuestion();
});
resetGameEl.addEventListener("click", resetGame);

loadLeaderboard();
updateStats();
updateHistory();
updateLeaderboard();
nextQuestion();
