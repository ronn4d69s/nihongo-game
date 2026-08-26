const result = document.querySelector("#result");
const resultMirror = document.querySelector("#result-mobile");
const kanaButtons = document.querySelectorAll("#basic button, #dakuten button, #youon button");
const tabs = document.querySelectorAll(".tab");
const kanaPanels = document.querySelectorAll("#basic, #dakuten, #youon");
const scriptOptions = document.querySelectorAll(".script-option");
const handOptions = document.querySelectorAll(".hand-option");
const katakanaPlaceholder = document.querySelector("#katakana-placeholder");

const state = {
  script: "hiragana",
  group: "basic",
  hand: localStorage.getItem("nihongo-game-hand") === "left" ? "left" : "right"
};

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
    speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(button.textContent);
    speech.lang = "ja-JP";
    speechSynthesis.speak(speech);
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