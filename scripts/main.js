// Elements
const startScreen = document.getElementById('start-screen');
const usernameInput = document.getElementById('username');
const categorySelect = document.getElementById('category');
const numQuestionsSelect = document.getElementById('numQuestions');
const startBtn = document.getElementById('start-btn');

const quizScreen = document.getElementById('quiz-screen');
const displayUsername = document.getElementById('display-username');
const displayCategory = document.getElementById('display-category');
const displayQuestionCount = document.getElementById('display-question-count');

const quizArea = document.querySelector('.quiz-area');
const answersArea = document.querySelector('.answers-area');
const submitButton = document.querySelector('.submit-button');
const bulletsSpanContainer = document.querySelector('.bullets .spans');
const countdownElement = document.querySelector('.countdown');
const resultsContainer = document.querySelector('.results');
const restartBtn = document.getElementById('restart-btn');
const toggleThemeBtn = document.getElementById('toggle-theme');

let questions = [];
let currentIndex = 0;
let rightAnswers = 0;
let countdownInterval;
let selectedUsername = '';
let selectedCategory = '';
let selectedNumQuestions = 5;

// Paths to questions JSON files
const questionsFiles = {
  html: 'data/html_questions.json',
  css: 'data/css_questions.json',
  js: 'data/js_questions.json',
};

startBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (!username) {
    alert('Please enter your name.');
    return;
  }

  selectedUsername = username;
  selectedCategory = categorySelect.value;
  selectedNumQuestions = parseInt(numQuestionsSelect.value, 10);

  // Load questions JSON file
  fetch(questionsFiles[selectedCategory])
    .then(res => {
      if (!res.ok) throw new Error('Failed to load questions.');
      return res.json();
    })
    .then(data => {
      questions = shuffleArray(data).slice(0, selectedNumQuestions);
      if (questions.length === 0) {
        alert('No questions available for this category.');
        return;
      }
      initQuiz();
    })
    .catch(err => {
      alert('Error loading questions: ' + err.message);
    });
});

function initQuiz() {
  // Reset
  currentIndex = 0;
  rightAnswers = 0;
  resultsContainer.innerHTML = '';
  bulletsSpanContainer.innerHTML = '';
  quizArea.innerHTML = '';
  answersArea.innerHTML = '';
  restartBtn.classList.add('d-none');
  submitButton.style.display = 'block'; // إظهار زر الإرسال

  // Show quiz screen
  startScreen.classList.add('d-none');
  quizScreen.classList.remove('d-none');

  // Display user info
  displayUsername.textContent = selectedUsername;
  displayCategory.textContent = selectedCategory.toUpperCase();
  displayQuestionCount.textContent = questions.length;

  // Create bullets
  createBullets(questions.length);

  // Add first question
  addQuestionData(questions[currentIndex]);

  // Start countdown
  startCountdown(15);

  submitButton.disabled = false;
  submitButton.textContent = 'Submit Answer';
}

submitButton.addEventListener('click', () => {
  if (!checkAnswer()) {
    alert('Please select an answer before submitting!');
    return;
  }

  currentIndex++;

  if (currentIndex < questions.length) {
    // Next question
    quizArea.innerHTML = '';
    answersArea.innerHTML = '';
    addQuestionData(questions[currentIndex]);
    handleBullets();
    clearInterval(countdownInterval);
    startCountdown(15);
  } else {
    // End quiz - Show results
    showResults();
  }
});

restartBtn.addEventListener('click', () => {
  startScreen.classList.remove('d-none');
  quizScreen.classList.add('d-none');
  submitButton.style.display = 'block';  // إعادة إظهار زر الإرسال
  resultsContainer.innerHTML = '';
});

toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  // Toggle icon
  if (document.body.classList.contains('dark-mode')) {
    toggleThemeBtn.textContent = '☀️';
  } else {
    toggleThemeBtn.textContent = '🌙';
  }
});

// Functions

function createBullets(num) {
  bulletsSpanContainer.innerHTML = '';
  for (let i = 0; i < num; i++) {
    const span = document.createElement('span');
    if (i === 0) span.classList.add('on');
    bulletsSpanContainer.appendChild(span);
  }
}

function addQuestionData(question) {
  // عنوان السؤال
  const h2 = document.createElement('h2');
  h2.textContent = question.title;
  quizArea.appendChild(h2);

  for (let i = 1; i <= 4; i++) {
    const answerText = question[`answer_${i}`];

    const label = document.createElement('label');
    label.className = 'answer';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'question';
    input.id = `answer_${i}`;
    input.dataset.answer = answerText;

    if (currentIndex === 0 && i === 1) {
      input.checked = true;
    }

    const span = document.createElement('span');
    span.textContent = answerText;
    span.style.marginLeft = '8px';

    label.appendChild(input);
    label.appendChild(span);

    answersArea.appendChild(label);
  }
}


function checkAnswer() {
  const answers = document.getElementsByName('question');
  let selectedAnswer = null;
  for (const answer of answers) {
    if (answer.checked) {
      selectedAnswer = answer.dataset.answer;
      break;
    }
  }

  if (!selectedAnswer) return false;

  if (selectedAnswer === questions[currentIndex].right_answer) {
    rightAnswers++;
  }
  return true;
}

function handleBullets() {
  const spans = bulletsSpanContainer.querySelectorAll('span');
  spans.forEach((span, index) => {
    span.classList.toggle('on', index === currentIndex);
  });
}

function startCountdown(duration) {
  let timeLeft = duration;
  updateCountdownDisplay(timeLeft);

  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft < 0) {
      clearInterval(countdownInterval);
      // Auto submit
      submitButton.click();
    } else {
      updateCountdownDisplay(timeLeft);
    }
  }, 1000);
}

function updateCountdownDisplay(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  countdownElement.textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// دالة لخلط عناصر المصفوفة (لضمان ظهور الأسئلة بشكل عشوائي)
function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // تبديل العناصر
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

// دالة إظهار النتيجة النهائية
function showResults() {
  quizArea.innerHTML = '';
  answersArea.innerHTML = '';
  submitButton.style.display = 'none';  // إخفاء زر الإرسال
  clearInterval(countdownInterval);

  let resultText = `${selectedUsername}, Your Score: ${rightAnswers} / ${questions.length}`;
  let resultClass = 'bad';

  if (rightAnswers === questions.length) {
    resultClass = 'perfect';
    resultText += ' 🎉 Perfect!';
  } else if (rightAnswers > questions.length / 2) {
    resultClass = 'good';
  }

  resultsContainer.innerHTML = `<span class="${resultClass}">${resultText}</span>`;
  restartBtn.classList.remove('d-none');  // إظهار زر إعادة التشغيل
}
