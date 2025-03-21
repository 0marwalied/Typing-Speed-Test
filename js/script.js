import words from "./data.js";

let currentWord = 0;
let currentLetter = 0;
let options = document.querySelector(".options");
let seconds = document.querySelector(".seconds");
let wordContainer = document.querySelector(".words");
let firstWord = true;
let startTyping = false;
let numberOfWords;
let endTry = false;
let reload = document.querySelector(".reload");
let correctWord = "";
let userWord = "";
let startTime = null;
let endTime = null;
let wrongChars = 0;
let currentWordDiv = 0;
let currentLetterLetter = 0;
let ranges = {
  15: [10, 20],
  30: [20, 30],
  60: [30, 40],
  120: [40, 50],
};

function initialize() {
  seconds.innerHTML = sessionStorage.getItem("seconds") || "15";
  document.querySelector(".options li.active").classList.remove("active");
  document
    .querySelector(`.options li[value="${seconds.innerHTML}"]`)
    .classList.add("active");
  getWords();
  currentWordDiv = wordContainer.children[currentWord];
  currentLetterLetter = currentWordDiv.children[currentLetter];
  currentLetterLetter.classList.add("currentLetter");
}

function getWords() {
  numberOfWords = Math.floor(Math.random() * words.length);
  numberOfWords = Math.max(numberOfWords, ranges[seconds.innerHTML][0]);
  numberOfWords = Math.min(numberOfWords, ranges[seconds.innerHTML][1]);
  wordContainer.innerHTML = "";
  for (let i = 0; i < numberOfWords; i++) {
    let word = words[Math.floor(Math.random() * words.length)];
    let wordDiv = document.createElement("div");
    wordDiv.classList.add("word");
    let letters = word.split("");
    if (i != numberOfWords - 1) letters.push(" ");
    letters.forEach((letter) => {
      let letterSpan = document.createElement("span");
      letterSpan.innerHTML = letter;
      wordDiv.appendChild(letterSpan);
    });
    wordContainer.appendChild(wordDiv);
    firstWord = false;
  }
}

addEventListener("click", (e) => {
  if (e.target.tagName === "LI" && e.target.textContent != "seconds") {
    sessionStorage.setItem("seconds", e.target.textContent);
    document.querySelector(".options li.active").classList.remove("active");
    e.target.classList.add("active");
    seconds.innerHTML = e.target.textContent;
    if (endTry === false) getWords();
    initialize();
  }
});

addEventListener("keydown", (event) => {
  if (event.key === "Shift") {
    return;
  }
  if (startTyping === false) {
    startTyping = true;
    startTime = Date.now();
    options.style.display = "none";
  }
  if (!endTry) seconds.style.visibility = "visible";
  if (event.key === currentLetterLetter.innerHTML) {
    correctWord += event.key;
    userWord += event.key;
    currentLetterLetter.classList.add("correct");
    currentLetterLetter.classList.remove("currentLetter");
    currentLetter++;
    if (currentLetter === currentWordDiv.children.length) {
      currentWord++, (currentLetter = 0);
      currentWordDiv = wordContainer.children[currentWord];
    }
    currentLetterLetter = currentWordDiv.children[currentLetter];
    currentLetterLetter.classList.add("currentLetter");
  } else if (event.key !== "Backspace") {
    userWord += event.key;
    correctWord += currentLetterLetter.innerHTML;
    currentLetterLetter.classList.add("incorrect");
    currentLetterLetter.classList.remove("currentLetter");
    currentLetter++;
    wrongChars++;
    if (currentLetter === currentWordDiv.children.length) {
      currentWord++, (currentLetter = 0);
      currentWordDiv = wordContainer.children[currentWord];
    }
    currentLetterLetter = currentWordDiv.children[currentLetter];
    currentLetterLetter.classList.add("currentLetter");
  } else {
    currentLetterLetter.classList.remove(
      "incorrect",
      "correct",
      "currentLetter"
    );
    currentLetter--;
    userWord = userWord.slice(0, -1);
    correctWord = correctWord.slice(0, -1);
    if (currentLetter === -1) {
      currentWord--;
      if (currentWord === -1) (currentWord = 0), (currentLetter = 0);
      else
        currentLetter = wordContainer.children[currentWord].children.length - 1;
      currentWordDiv = wordContainer.children[currentWord];
    }
    currentLetterLetter = currentWordDiv.children[currentLetter];
    currentLetterLetter.classList.add("currentLetter");
    currentLetterLetter.classList.remove("incorrect", "correct");
  }
});

let timer = setInterval(() => {
  if (startTyping) {
    let currentSeconds = parseInt(seconds.innerHTML);
    if (currentSeconds === 0) {
      startTyping = false;
      clearInterval(timer);
      seconds.innerHTML = sessionStorage.getItem("seconds") || "15";
      seconds.style.visibility = "hidden";
      endTime = Date.now();
      endTry = true;
      getResult();
    } else {
      seconds.innerHTML = currentSeconds - 1;
    }
  }
}, 1000);

reload.addEventListener("click", () => {
  location.reload();
  seconds.innerHTML = sessionStorage.getItem("seconds") || "15";
});

function getResult() {
  wordContainer.innerHTML = "";
  let result = calculateWPMWithAccuracy(
    correctWord,
    userWord,
    (endTime - startTime) / 1000
  );

  let resultDiv = document.querySelector(".result");
  let wpm = document.createElement("div");
  wpm.innerHTML = `WPM: ${result.wpm}`;
  let accuracy = document.createElement("div");
  accuracy.innerHTML = `Accuracy: ${result.accuracy}%`;
  let correctChars = document.createElement("div");
  correctChars.innerHTML = `Correct Characters: ${result.correctChars}`;
  let wrongChars = document.createElement("div");
  wrongChars.innerHTML = `Wrong Characters: ${result.wrongChars}`;
  resultDiv.appendChild(wpm);
  resultDiv.appendChild(accuracy);
  resultDiv.appendChild(correctChars);
  resultDiv.appendChild(wrongChars);
}

function calculateWPMWithAccuracy(correctText, userText, timeInSeconds) {
  const correctChars = [...userText].filter(
    (char, i) => char === correctText[i]
  ).length;
  const totalChars = userText.length;
  const accuracy = ((totalChars - wrongChars) / userText.length) * 100;
  const words = userText.length / 5;
  const timeInMinutes = timeInSeconds / 60;
  const wpm = Math.round(words / timeInMinutes);
  const correctCharsCount = correctChars;
  const wrongCharsCount = totalChars - correctCharsCount;

  return {
    wpm,
    accuracy: accuracy.toFixed(1),
    correctChars: correctCharsCount,
    wrongChars: wrongCharsCount,
  };
}

initialize();
