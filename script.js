const result = document.querySelector("#result");
const kanaButtons = document.querySelectorAll(".panel button");
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

kanaButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const hiragana = button.textContent;
    result.textContent = button.dataset.romaji;
    speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(hiragana);
    speech.lang = "ja-JP";
    speechSynthesis.speak(speech);
  });
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    panels.forEach((panel) => panel.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.target).classList.add("active");
    result.textContent = "?";
  });
});
