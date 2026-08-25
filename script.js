// すべてのひらがなボタンを取得します。
const buttons = document.querySelectorAll("button");
const result = document.querySelector("#result");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const hiragana = button.textContent;
    const romaji = button.dataset.romaji;

    // ローマ字を画面に表示します。
    result.textContent = romaji;

    // 前の読み上げを止めてから、ひらがなを日本語で読み上げます。
    speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(hiragana);
    speech.lang = "ja-JP";
    speechSynthesis.speak(speech);
  });
});
