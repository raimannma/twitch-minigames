const socket = io();
const N_MOVES = 5;
let speed = 0.9;

let objMovePattern = [];
const ball = document.getElementById("ball");
const widthBall = ball.offsetWidth;
let ballPosition = Math.floor(Math.random() * 3);
let running = false;

const cups = [
  document.getElementById("cup1"),
  document.getElementById("cup2"),
  document.getElementById("cup3"),
];
const startButton = document.getElementById("btnStart");
const namesSpans = [
  document.getElementById("names1"),
  document.getElementById("names2"),
  document.getElementById("names3"),
];
const votes = {};

function updateNames() {
  namesSpans.forEach((span) => {
    span.innerHTML = "";
  });
  Object.entries(votes).forEach((entry) => {
    const [name, number] = entry;
    namesSpans[number - 1].innerHTML += name + "<br>";
  });
}

const url = new URL(window.location.href);
const channel_name = url.searchParams.get("channel_name");
socket.emit("twitch_channel", channel_name);
socket.on("twitch_connection", (msg) => console.log(msg));

socket.on("chat_message", (data) => {
  console.log("Received: " + data);
  const [name, msg] = data.split(":");

  if (running) {
    let number = parseInt(msg.charAt(0));
    if (number <= 3 && number >= 1) {
      votes[name] = number;
      updateNames();
    }
  }
});

function startGame() {
  running = true;
  startButton.style.display = "none";
  TweenMax.to(getBallCup(), 0.5, { y: -130 });
  TweenMax.to(ball, 0.5, {
    left:
      getBallCup().offsetLeft + getBallCup().offsetWidth / 2 - widthBall / 2,
    y: -30,
    onComplete: function () {
      ball.style.zIndex = "1";
      ball.style.top = "220px";
      cups.forEach((cup) => (cup.style.zIndex = "10"));
      TweenMax.to(getBallCup(), 0.5, { y: 0, onComplete: shakeCups });
    },
  });
}

function shakeCups() {
  ball.style.display = "none";
  let aPos = [
    cups[objMovePattern[0][0]].offsetLeft,
    cups[objMovePattern[0][1]].offsetLeft,
    cups[objMovePattern[0][2]].offsetLeft,
  ];
  for (let i = 0; i < objMovePattern.length; i++) {
    TweenMax.to(cups[objMovePattern[i][0]], speed, {
      left: aPos[0],
      delay: speed * i,
      ease: Sine.easeOut,
    });
    TweenMax.to(cups[objMovePattern[i][1]], speed, {
      left: aPos[1],
      delay: speed * i,
      ease: Sine.easeOut,
    });
    if (i === objMovePattern.length - 1) {
      TweenMax.to(cups[objMovePattern[i][2]], speed, {
        left: aPos[2],
        delay: speed * i,
        ease: Sine.easeOut,
        onComplete: finishedMixing,
      });
    } else {
      TweenMax.to(cups[objMovePattern[i][2]], speed, {
        left: aPos[2],
        delay: speed * i,
        ease: Sine.easeOut,
      });
    }
  }
}

function finishedMixing() {
  startButton.style.display = "";
  startButton.innerText = "Ergebnis anzeigen";
  startButton.onclick = showAllCups;
}

function generateMovePatterns() {
  let objMoves = [[0, 1, 2]]; // initial state, cups order
  for (let i = 0; i < N_MOVES; i++) {
    let pattern;
    do {
      pattern = shuffle([0, 1, 2]);
    } while (pattern === objMoves[i]);
    objMoves.push(pattern);
  }
  return objMoves;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getBallCup() {
  return document.getElementById("cup" + (ballPosition + 1));
}

function isCorrect(position) {
  let lastPattern = objMovePattern[objMovePattern.length - 1];
  return lastPattern[position - 1] === ballPosition;
}

function getAllWinners() {
  let winners = [];
  Object.entries(votes).forEach((entry) => {
    const [name, number] = entry;
    if (isCorrect(number)) winners.push(name);
  });
  return winners;
}

function showAllCups() {
  running = false;
  cups.forEach((cup) => {
    ball.style.left =
      getBallCup().offsetLeft +
      getBallCup().offsetWidth / 2 -
      widthBall / 2 +
      "px";
    ball.style.display = "block";
    TweenMax.to(cup, 0.5, {
      y: -130,
      ease: Sine.easeIn,
      delay: 0.1,
    });
  });
  startButton.style.display = "";
  startButton.innerText = "Reset Game";
  startButton.onclick = () => location.reload();

  let winners = getAllWinners();
  let chat_reply = "";
  if (winners.length === 0) chat_reply = "Kein Gewinner!";
  else chat_reply = "Gewonnen haben: " + winners.join(",");
  socket.emit("chat_reply", chat_reply);
}

objMovePattern = generateMovePatterns();
document.getElementById("btnStart").onclick = startGame;
