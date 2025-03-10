import words from "./data.js";

let currentWord = 0;
let currentLetter = 0;
let seconds = document.querySelector(".seconds");
seconds.innerHTML = sessionStorage.getItem("seconds") || "15";
let wordContainer = document.querySelector(".words");
let firstWord = true;
let startTyping = false;
let numberOfWords;
let endTry = false;
let reload = document.querySelector(".reload");
let correctWord = "";
let userWord = "";
let startTime;
let endTime;
let wrongChars = 0;
let ranges = {
  15: [10, 20],
  30: [20, 30],
  60: [30, 40],
  120: [40, 50],
};

document.querySelector(".options li.active").classList.remove("active");
document
  .querySelector(`.options li[value="${seconds.innerHTML}"]`)
  .classList.add("active");

function getWords() {
  numberOfWords = Math.floor(Math.random() * words.length);
  numberOfWords = Math.max(numberOfWords, ranges[seconds.innerHTML][0]);
  numberOfWords = Math.min(numberOfWords, ranges[seconds.innerHTML][1]);
  wordContainer.innerHTML = "";
  for (let i = 0; i <= numberOfWords; i++) {
    let word = words[Math.floor(Math.random() * words.length)];
    let wordDiv = document.createElement("div");
    wordDiv.classList.add("word");
    let letters = word.split("");
    if (i != words.length - 1) letters.push(" ");
    letters.forEach((letter) => {
      let letterSpan = document.createElement("letter");
      letterSpan.innerHTML = letter;
      wordDiv.appendChild(letterSpan);
    });
    wordContainer.appendChild(wordDiv);
    firstWord = false;
  }
}
getWords();

let currentWordDiv = wordContainer.children[currentWord];
let currentLetterSpan = currentWordDiv.children[currentLetter];

currentLetterSpan.classList.add("currentLetter");

addEventListener("click", (e) => {
  if (e.target.tagName === "LI" && e.target.textContent != "seconds") {
    sessionStorage.setItem("seconds", e.target.textContent);
    document.querySelector(".options li.active").classList.remove("active");
    e.target.classList.add("active");
    seconds.innerHTML = e.target.textContent;
    if (endTry === false) getWords();
  }
});

addEventListener("keydown", (event) => {
  if (startTyping === false) {
    startTyping = true;
    startTime = Date.now();
  }
  if (!endTry) seconds.style.opacity = "1";
  if (event.key === currentLetterSpan.innerHTML) {
    correctWord += event.key;
    userWord += event.key;
    currentLetterSpan.classList.add("correct");
    currentLetterSpan.classList.remove("currentLetter");
    currentLetter++;
    if (currentLetter === currentWordDiv.children.length) {
      currentWord++, (currentLetter = 0);
      currentWordDiv = wordContainer.children[currentWord];
    }
    currentLetterSpan = currentWordDiv.children[currentLetter];
    currentLetterSpan.classList.add("currentLetter");
  } else if (event.key !== "Backspace") {
    userWord += event.key;
    correctWord += currentLetterSpan.innerHTML;
    currentLetterSpan.classList.add("incorrect");
    currentLetterSpan.classList.remove("currentLetter");
    currentLetter++;
    wrongChars++;
    if (currentLetter === currentWordDiv.children.length) {
      currentWord++, (currentLetter = 0);
      currentWordDiv = wordContainer.children[currentWord];
    }
    currentLetterSpan = currentWordDiv.children[currentLetter];
    currentLetterSpan.classList.add("currentLetter");
  } else {
    currentLetterSpan.classList.remove("incorrect");
    currentLetterSpan.classList.remove("correct");
    currentLetterSpan.classList.remove("currentLetter");
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
    currentLetterSpan = currentWordDiv.children[currentLetter];
    currentLetterSpan.classList.add("currentLetter");
    currentLetterSpan.classList.remove("incorrect");
    currentLetterSpan.classList.remove("correct");
  }
});

let timer = setInterval(() => {
  if (startTyping) {
    let currentSeconds = parseInt(seconds.innerHTML);
    if (currentSeconds === 0) {
      startTyping = false;
      clearInterval(timer);
      seconds.innerHTML = sessionStorage.getItem("seconds") || "15";
      seconds.style.opacity = "0";
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

  console.log(correctWord);
  console.log(userWord);

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
