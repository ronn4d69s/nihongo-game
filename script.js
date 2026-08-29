const result = document.querySelector("#result");
const resultMirror = document.querySelector("#result-mobile");
const basicKanaButtons = document.querySelectorAll("#basic button");
const ttsKanaButtons = document.querySelectorAll("#dakuten button, #youon button");
const tabs = document.querySelectorAll(".tab");
const kanaPanels = document.querySelectorAll("#basic, #dakuten, #youon");
const scriptOptions = document.querySelectorAll(".script-option");
const handOptions = document.querySelectorAll(".hand-option");
const katakanaPlaceholder = document.querySelector("#katakana-placeholder");

const HIRAGANA_AUDIO_BASE = "assets/audio/hiragana/";
const basicAudioFiles = {
  A:"a.mp3", I:"i.mp3", U:"u.mp3", E:"e.mp3", O:"o.mp3",
  KA:"ka.mp3", KI:"ki.mp3", KU:"ku.mp3", KE:"ke.mp3", KO:"ko.mp3",
  SA:"sa.mp3", SHI:"shi.mp3", SU:"su.mp3", SE:"se.mp3", SO:"so.mp3",
  TA:"ta.mp3", CHI:"chi.mp3", TSU:"tsu.mp3", TE:"te.mp3", TO:"to.mp3",
  NA:"na.mp3", NI:"ni.mp3", NU:"nu.mp3", NE:"ne.mp3", NO:"no.mp3",
  HA:"ha.mp3", HI:"hi.mp3", FU:"fu.mp3", HE:"he.mp3", HO:"ho.mp3",
  MA:"ma.mp3", MI:"mi.mp3", MU:"mu.mp3", ME:"me.mp3", MO:"mo.mp3",
  YA:"ya.mp3", YU:"yu.mp3", YO:"yo.mp3",
  RA:"ra.mp3", RI:"ri.mp3", RU:"ru.mp3", RE:"re.mp3", RO:"ro.mp3",
  WA:"wa.mp3", WO:"wo.mp3", N:"n.mp3"
};
let currentAudio = null;

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
  if ("onvoiceschanged" in synth) synth.addEventListener("voiceschanged", loadVoices);
}

function stopFixedAudio() {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = null;
}

function playBasicHiragana(romaji) {
  const file = basicAudioFiles[romaji];
  if (!file) return;

  stopFixedAudio();
  if (synth && (synth.speaking || synth.pending)) synth.cancel();

  const audio = new Audio(`${HIRAGANA_AUDIO_BASE}${file}`);
  audio.preload = "auto";
  currentAudio = audio;
  audio.addEventListener("ended", () => {
    if (currentAudio === audio) currentAudio = null;
  }, { once:true });
  audio.play().catch((error) => {
    if (currentAudio === audio) currentAudio = null;
    console.warn("Hiragana audio could not be played:", error);
  });
}

function speakJapanese(text) {
  stopFixedAudio();
  if (!synth || typeof SpeechSynthesisUtterance === "undefined") return;
  if (synth.paused) synth.resume();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  if (japaneseVoice) utterance.voice = japaneseVoice;
  currentUtterance = utterance;
  utterance.onend = () => { if (currentUtterance === utterance) currentUtterance = null; };
  utterance.onerror = () => { if (currentUtterance === utterance) currentUtterance = null; };

  if (synth.speaking || synth.pending) {
    synth.cancel();
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
  if (isHiragana) document.getElementById(state.group).classList.add("active");
  else katakanaPlaceholder.classList.add("active");
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

basicKanaButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setResult(button.dataset.romaji);
    playBasicHiragana(button.dataset.romaji);
  });
});

ttsKanaButtons.forEach((button) => {
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
    stopFixedAudio();
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