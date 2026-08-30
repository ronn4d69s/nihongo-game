const result = document.querySelector("#result");
const resultMirror = document.querySelector("#result-mobile");
const kanaButtons = document.querySelectorAll("#basic button, #dakuten button, #youon button");
const tabs = document.querySelectorAll(".tab");
const kanaPanels = document.querySelectorAll("#basic, #dakuten, #youon");
const scriptOptions = document.querySelectorAll(".script-option");
const handOptions = document.querySelectorAll(".hand-option");
const katakanaPlaceholder = document.querySelector("#katakana-placeholder");

const HIRAGANA_AUDIO_BASE = "assets/audio/hiragana/";
const hiraganaAudioFiles = {
  "あ":"a.mp3","い":"i.mp3","う":"u.mp3","え":"e.mp3","お":"o.mp3",
  "か":"ka.mp3","き":"ki.mp3","く":"ku.mp3","け":"ke.mp3","こ":"ko.mp3",
  "さ":"sa.mp3","し":"shi.mp3","す":"su.mp3","せ":"se.mp3","そ":"so.mp3",
  "た":"ta.mp3","ち":"chi.mp3","つ":"tsu.mp3","て":"te.mp3","と":"to.mp3",
  "な":"na.mp3","に":"ni.mp3","ぬ":"nu.mp3","ね":"ne.mp3","の":"no.mp3",
  "は":"ha.mp3","ひ":"hi.mp3","ふ":"fu.mp3","へ":"he.mp3","ほ":"ho.mp3",
  "ま":"ma.mp3","み":"mi.mp3","む":"mu.mp3","め":"me.mp3","も":"mo.mp3",
  "や":"ya.mp3","ゆ":"yu.mp3","よ":"yo.mp3",
  "ら":"ra.mp3","り":"ri.mp3","る":"ru.mp3","れ":"re.mp3","ろ":"ro.mp3",
  "わ":"wa.mp3","を":"wo.mp3","ん":"n.mp3",
  "が":"ga.mp3","ぎ":"gi.mp3","ぐ":"gu.mp3","げ":"ge.mp3","ご":"go.mp3",
  "ざ":"za.mp3","じ":"ji.mp3","ず":"zu.mp3","ぜ":"ze.mp3","ぞ":"zo.mp3",
  "だ":"da.mp3","ぢ":"di.mp3","づ":"du.mp3","で":"de.mp3","ど":"do.mp3",
  "ば":"ba.mp3","び":"bi.mp3","ぶ":"bu.mp3","べ":"be.mp3","ぼ":"bo.mp3",
  "ぱ":"pa.mp3","ぴ":"pi.mp3","ぷ":"pu.mp3","ぺ":"pe.mp3","ぽ":"po.mp3",
  "きゃ":"kya.mp3","きゅ":"kyu.mp3","きょ":"kyo.mp3",
  "しゃ":"sha.mp3","しゅ":"shu.mp3","しょ":"sho.mp3",
  "ちゃ":"cha.mp3","ちゅ":"chu.mp3","ちょ":"cho.mp3",
  "にゃ":"nya.mp3","にゅ":"nyu.mp3","にょ":"nyo.mp3",
  "ひゃ":"hya.mp3","ひゅ":"hyu.mp3","ひょ":"hyo.mp3",
  "みゃ":"mya.mp3","みゅ":"myu.mp3","みょ":"myo.mp3",
  "りゃ":"rya.mp3","りゅ":"ryu.mp3","りょ":"ryo.mp3",
  "ぎゃ":"gya.mp3","ぎゅ":"gyu.mp3","ぎょ":"gyo.mp3",
  "じゃ":"ja.mp3","じゅ":"ju.mp3","じょ":"jo.mp3",
  "びゃ":"bya.mp3","びゅ":"byu.mp3","びょ":"byo.mp3",
  "ぴゃ":"pya.mp3","ぴゅ":"pyu.mp3","ぴょ":"pyo.mp3"
};
let currentAudio = null;

const state = {
  script: "hiragana",
  group: "basic",
  hand: localStorage.getItem("nihongo-game-hand") === "left" ? "left" : "right"
};

function stopFixedAudio() {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = null;
}

function playHiragana(text) {
  const file = hiraganaAudioFiles[text];
  if (!file) return;
  stopFixedAudio();
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

kanaButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setResult(button.dataset.romaji);
    playHiragana(button.textContent);
  });
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (state.script !== "hiragana") return;
    stopFixedAudio();
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