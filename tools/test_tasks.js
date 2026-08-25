const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage();
  await pg.goto("http://127.0.0.1:8000/15-hands-on-practice/01-100-devops-practical-tasks-part1/", { waitUntil: "domcontentloaded" });
  await pg.waitForTimeout(800);
  const firstBox = pg.locator(".answer-check").first();
  await firstBox.locator("input").fill("awk '{print $1}' access.log | sort | uniq -c | head");
  await firstBox.locator("button").click();
  const verdict = await firstBox.locator("span").last().textContent();
  const pattern = await firstBox.getAttribute("data-answer");
  console.log(JSON.stringify({ pattern, verdict }));
  await b.close();
})();
