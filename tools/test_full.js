const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage();
  const errors = [];
  pg.on("pageerror", e => errors.push(e.message));
  await pg.goto("http://127.0.0.1:8000/21-playground/playground.html?v=7", { waitUntil: "domcontentloaded", timeout: 60000 });
  await pg.waitForTimeout(7000);

  // Полное решение сценария l1 (Systemd)
  const cmds = [
    "systemctl status demo",
    "journalctl -u demo",
    "chmod +x /opt/demo/app.py",
    "systemctl restart demo",
    "systemctl enable demo",
  ];
  const input = pg.locator("#term-in");
  for (const c of cmds) { await input.fill(c); await input.press("Enter"); }
  await pg.locator("#btn-check").click();
  const solved = (await pg.textContent("#check-result")).includes("засчитано");
  await pg.screenshot({ path: "tools/shot-playground.png" });

  // Страница задач: подсказки + input
  await pg.goto("http://127.0.0.1:8000/15-hands-on-practice/01-100-devops-practical-tasks-part1/", { waitUntil: "domcontentloaded" });
  await pg.waitForTimeout(1000);
  const inputs = await pg.locator(".answer-check input").count();
  const hints = await pg.locator("details:has(summary:has-text('Подсказка'))").count();
  // ввести ответ на задачу 1 (awk)
  const firstBox = pg.locator(".answer-check").first();
  await firstBox.locator("input").fill("awk '{print $1}' access.log | sort | uniq -c | head");
  await firstBox.locator("button").click();
  const verdict = await firstBox.locator("span").last().textContent();

  console.log(JSON.stringify({ solved, errors, inputs, hints, verdict }, null, 1));
  await b.close();
})();
