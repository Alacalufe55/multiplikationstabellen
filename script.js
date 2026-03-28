const state = {
  score: 0,
  answered: 0,
  streak: 0,
  bestStreak: 0,
  maxFactor: 10,
  currentQuestion: null,
  history: []
};

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
const maxFactorEl = document.querySelector("#max-factor");
const newQuestionEl = document.querySelector("#new-question");
const resetGameEl = document.querySelector("#reset-game");

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

function rememberAnswer(entry) {
  state.history.unshift(entry);
  state.history = state.history.slice(0, 8);
  updateHistory();
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
newQuestionEl.addEventListener("click", () => {
  setFeedback("Ny fråga framme. Kör!");
  nextQuestion();
});
resetGameEl.addEventListener("click", resetGame);

updateStats();
updateHistory();
nextQuestion();
