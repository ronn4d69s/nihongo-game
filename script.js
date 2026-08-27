const result = document.querySelector("#result");
const resultMirror = document.querySelector("#result-mobile");
const kanaButtons = document.querySelectorAll("#basic button, #dakuten button, #youon button");
const tabs = document.querySelectorAll(".tab");
const kanaPanels = document.querySelectorAll("#basic, #dakuten, #youon");
const scriptOptions = document.querySelectorAll(".script-option");
const handOptions = document.querySelectorAll(".hand-option");
const katakanaPlaceholder = document.querySelector("#katakana-placeholder");

const synth = window.speechSynthesis;
let availableVoices = [];
let japaneseVoice = null;
let currentUtterance = null;

const state = {
  script: "hiragana",
  group: "basic",
  hand: localStorage.getItem("nihongo-game-hand") === "left" ? "left" : "right"
};

function loadVoices() {
  if (!synth) return;
  availableVoices = synth.getVoices();
  japaneseVoice =
    availableVoices.find((voice) => voice.lang.toLowerCase() === "ja-jp") ||
    availableVoices.find((voice) => voice.lang.toLowerCase().startsWith("ja")) ||
    null;
}

if (synth) {
  loadVoices();
  if ("onvoiceschanged" in synth) {
    synth.addEventListener("voiceschanged", loadVoices);
  }
}

function speakJapanese(text) {
  if (!synth || typeof SpeechSynthesisUtterance === "undefined") return;

  // Some WebKit versions can remain paused after interruptions.
  if (synth.paused) synth.resume();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  if (japaneseVoice) utterance.voice = japaneseVoice;

  // Keep a live reference until speech completes. This also avoids WebKit
  // dropping a short utterance prematurely in some iOS versions.
  currentUtterance = utterance;
  utterance.onend = () => {
    if (currentUtterance === utterance) currentUtterance = null;
  };
  utterance.onerror = () => {
    if (currentUtterance === utterance) currentUtterance = null;
  };

  if (synth.speaking || synth.pending) {
    synth.cancel();
    // Queue in the same user-activation turn without an arbitrary timeout.
    queueMicrotask(() => synth.speak(utterance));
  } else {
    synth.speak(utterance);
  }
}

function setResult(value) {
  result.textContent = value;
  resultMirror.textContent = value;
}

function renderScript() {
  const isHiragana = state.script === "hiragana";
  document.body.dataset.script = state.script;

  scriptOptions.forEach((option) => {
    const active = option.dataset.script === state.script;
    option.classList.toggle("active", active);
    option.setAttribute("aria-pressed", String(active));
  });

  tabs.forEach((tab) => {
    tab.textContent = isHiragana ? tab.dataset.hiraganaLabel : tab.dataset.katakanaLabel;
    tab.disabled = !isHiragana;
  });

  kanaPanels.forEach((panel) => panel.classList.remove("active"));
  katakanaPlaceholder.classList.remove("active");

  if (isHiragana) {
    document.getElementById(state.group).classList.add("active");
  } else {
    katakanaPlaceholder.classList.add("active");
  }

  setResult("?");
}

function renderGroup() {
  if (state.script !== "hiragana") return;
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.target === state.group));
  kanaPanels.forEach((panel) => panel.classList.toggle("active", panel.id === state.group));
  setResult("?");
}

function renderHand() {
  document.body.dataset.hand = state.hand;
  handOptions.forEach((option) => {
    const active = option.dataset.hand === state.hand;
    option.classList.toggle("active", active);
    option.setAttribute("aria-pressed", String(active));
  });
}

kanaButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setResult(button.dataset.romaji);
    speakJapanese(button.textContent);
  });
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (state.script !== "hiragana") return;
    state.group = tab.dataset.target;
    renderGroup();
  });
});

scriptOptions.forEach((option) => {
  option.addEventListener("click", () => {
    state.script = option.dataset.script;
    renderScript();
  });
});

handOptions.forEach((option) => {
  option.addEventListener("click", () => {
    state.hand = option.dataset.hand;
    localStorage.setItem("nihongo-game-hand", state.hand);
    renderHand();
  });
});

renderHand();
renderScript();
renderGroup();