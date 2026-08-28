/**
 * Answer-check widget for hands-on practice tasks.
 * Works with MkDocs Material instant navigation (document$ observable).
 */
function initAnswerCheck() {
  document.querySelectorAll(".answer-check").forEach(function (box) {
    if (box.dataset.ready) return;
    box.dataset.ready = "1";
    var pat = box.getAttribute("data-answer");
    var inp = document.createElement("input");
    inp.placeholder = "✍️ Введите вашу команду/решение…";
    inp.className = "answer-check-input";
    var btn = document.createElement("button");
    btn.textContent = "Проверить ответ";
    btn.className = "answer-check-btn";
    btn.type = "button";
    var res = document.createElement("span");
    res.className = "answer-check-result";
    box.appendChild(inp);
    box.appendChild(btn);
    box.appendChild(res);
    function check() {
      var ok = false;
      try { ok = new RegExp(pat, "i").test(inp.value); } catch (e) {}
      res.innerHTML = ok
        ? '<span class="answer-ok">✓ Верно! Сверьте с эталонным решением ниже.</span>'
        : '<span class="answer-err">✗ Пока не то — загляните в подсказку 💡</span>';
      inp.classList.toggle("is-ok", ok);
      inp.classList.toggle("is-err", !ok && inp.value.length > 0);
    }
    btn.addEventListener("click", check);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") check(); });
  });
}

// Material instant navigation: document$ is an RxJS-like observable
if (typeof document$ !== "undefined" && document$ && typeof document$.subscribe === "function") {
  document$.subscribe(function () { initAnswerCheck(); });
} else {
  document.addEventListener("DOMContentLoaded", initAnswerCheck);
}
// Fallback for case where DOM already ready and no document$
if (document.readyState !== "loading") {
  initAnswerCheck();
}
