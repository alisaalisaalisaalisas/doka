const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage();
  const errors = [];
  pg.on("pageerror", e => errors.push(e.stack ? e.stack.split("\n").slice(0,3).join(" | ") : e.message));
  await pg.goto("http://127.0.0.1:8000/21-playground/playground.html?v=6", { waitUntil: "domcontentloaded", timeout: 60000 });
  await pg.waitForTimeout(7000);

  // textarea ВНУТРИ monaco = норма; отдельный textarea = баг
  const monaco = await pg.locator("#editor .monaco-editor").count();
  const taInside = await pg.locator("#editor .monaco-editor textarea").count();
  const taDirect = await pg.locator("#editor > textarea").count();

  await pg.fill("#term-in", "cd fg");
  await pg.press("#term-in", "Enter");
  await pg.waitForTimeout(200);
  const inputVal = await pg.inputValue("#term-in");
  const termText = await pg.textContent("#term");

  console.log(JSON.stringify({
    monaco, taInside, taDirect,
    inputAfterEnter: inputVal,
    termTail: termText.slice(-260),
    pageErrors: errors.slice(0, 4)
  }, null, 1));
  await b.close();
})();
