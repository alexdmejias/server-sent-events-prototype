class AppState {
  constructor() {
    this.state = {
      isListening: false,
      words: [],
    };

    this.callbacks = {};
    this.statePropsCallbacks = {};
  }

  addCallback(stateProps, name, cb) {
    this.callbacks[name] = cb;

    stateProps.forEach((prop) => {
      if (this.statePropsCallbacks[prop]) {
        this.statePropsCallbacks[prop].push(name);
      } else {
        this.statePropsCallbacks[prop] = [name];
      }
    });
  }

  callCallbacks(prop) {
    if (this.statePropsCallbacks[prop]) {
      this.statePropsCallbacks[prop].forEach((cbName) => {
        this.callbacks[cbName](this.state);
      });
    } else if (prop === "*") {
      Object.values(this.callbacks).forEach((cb) => {
        cb(this.state);
      });
    }
  }

  changeProp(prop, newValue) {
    this.state[prop] = newValue;

    this.callCallbacks(prop);
  }
}

const words = [
  "Alpha",
  "Bravo",
  "Charlie",
  "Delta",
  "Echo",
  "Foxtrot",
  "Golf",
  "Hotel",
  "India",
  "Juliett",
  "Kilo",
  "Lima",
  "Mike",
  "November",
  "Oscar",
  "Papa",
  "Quebec",
  "Romeo",
  "Sierra",
  "Tango",
  "Uniform",
  "Victor",
  "Whiskey",
  "X-ray",
  "Yankee",
  "Zulu",
];
let wordIndex = 0;

const $getStatus = document.getElementById("get-status");
const $addWord = document.getElementById("add-word");
const $words = document.getElementById("words");
const $toggle = document.getElementById("toggle-status");
const $status = document.getElementById("status");

const HOST = `http://localhost:3333`;
const EVENTS_URL = `${HOST}/events`;
const ADD_WORD_URL = `${HOST}/add-word`;
const STATUS_URL = `${HOST}/status`;

const appState = new AppState();

appState.addCallback(["isListening"], "status-indicator", (state) => {
  $status.innerHTML = state.isListening;
});

appState.addCallback(["words"], "update-word-list", (state) => {
  const fragment = new DocumentFragment();

  state.words.forEach((word) => {
    const li = document.createElement("li");
    li.innerHTML = word.word;
    fragment.appendChild(li);
  });
  $words.replaceChildren(fragment);
});

let eventsConnection;

function handleOnMessage(event) {
  const parsedData = JSON.parse(event.data);

  console.log("onmessage", { parsedData });
  appState.changeProp("words", appState.state.words.concat(parsedData));
}

function handleToggleStatus() {
  appState.changeProp("isListening", !appState.state.isListening);
  if (appState.state.isListening) {
    eventsConnection = new EventSource(EVENTS_URL);

    eventsConnection.addEventListener("message", handleOnMessage, false);
  } else {
    if (eventsConnection && eventsConnection.readyState === 1) {
      eventsConnection.close();
    }
  }
}

function handleGetStatus() {
  fetch(STATUS_URL)
    .then((res) => res.json())
    .then((json) => {
      console.log("status:", json);
    });
}

function handleAddWord() {
  const word = words[wordIndex];
  fetch(ADD_WORD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ word }),
  })
    .then((res) => res.json())
    .then((json) => {
      console.log("response from adding word: ", json);
    });

  wordIndex++;
  if (wordIndex === words.length) {
    wordIndex = 0;
  }
}

function init() {
  $toggle.addEventListener("click", handleToggleStatus);
  $getStatus.addEventListener("click", handleGetStatus);
  $addWord.addEventListener("click", handleAddWord);

  console.log("init app state", appState);

  appState.callCallbacks("*");
}

init();
