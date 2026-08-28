/* Global Playground: Git — 25 scenarios */
S("Git","ggit-1","Отменить последний коммит, файлы сохранить (--soft)","Junior", `<h3>Контекст</h3><p>Git: <b>Отменить последний коммит, файлы сохранить (--soft)</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Отменить последний коммит, файлы сохранить (--soft)</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] посмотреть историю</li><li>[ ] отменить коммит мягко</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git log --oneline -3</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: посмотреть историю → отменить коммит мягко.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^git log --oneline -3",`a1b2c3 мусор\n9f8e7d feat: api\n7a6b5c fix`,"dim"],
 ["^git reset --soft HEAD~1",``, "ok"],
 ["^git status -s",`M src/api.go`,"ok"],
 ["^git log --oneline -3",`9f8e7d feat: api`,"ok"]
],
[{re:"^git log --oneline",l:"посмотреть историю"},
 {re:"^git reset --soft HEAD~1",l:"отменить коммит мягко"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Отменить последний коммит, файлы сохранить (--soft) в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: посмотреть историю → отменить коммит мягко"]});

S("Git","ggit-2","Отменить коммит в середине истории (revert)","Middle", `<h3>Контекст</h3><p>Git: <b>Отменить коммит в середине истории (revert)</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Отменить коммит в середине истории (revert)</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] revert коммита</li><li>[ ] запушить revert</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git log --oneline -5</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: revert коммита → запушить revert.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^git log --oneline -5",`c3d4e5 bad: drop index\nb2c3d4 feat x\na1b2c3 feat y`,"dim"],
 ["^git revert c3d4e5 --no-edit",`\\[main e5f6a7\\] Revert "bad: drop index"`,"ok"],
 ["^git log --oneline -3",`e5f6a7 Revert\nc3d4e5 bad`,"ok"],
 ["^git push",`To origin main`,"ok"]
],
[{re:"^git revert c3d4e5",l:"revert коммита"},
 {re:"^git push",l:"запушить revert"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Отменить коммит в середине истории (revert) в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: revert коммита → запушить revert"]});

S("Git","ggit-3","Merge-конфликт в config.yaml — разрешить руками","Middle", `<h3>Контекст</h3><p>Git: <b>Merge-конфликт в config.yaml — разрешить руками</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Merge-конфликт в config.yaml — разрешить руками</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть конфликт</li><li>[ ] посмотреть маркеры</li><li>[ ] закоммитить разрешение</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git status</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть конфликт → посмотреть маркеры → закоммитить разрешение.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^git status",`Unmerged paths:\n  both modified: config.yaml`,"err"],
 ["^git diff",`<<<<<<< HEAD\nreplicas: 3\n=======\nreplicas: 5\n>>>>>>> feature`,"warn"],
 ["^sed -i /<<<<<<</d; /=======/d; />>>>>>>/d config.yaml",``, "ok"],
 ["^cat config.yaml \\| grep replicas",`replicas: 5`,"ok"],
 ["^git add config.yaml && git commit --no-edit",`\\[main 4d5e6f\\] Merge`,"ok"]
],
[{re:"^git status",l:"увидеть конфликт"},
 {re:"^git diff",l:"посмотреть маркеры"},
 {re:"^git add config.yaml",l:"закоммитить разрешение"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Merge-конфликт в config.yaml — разрешить руками в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: увидеть конфликт → посмотреть маркеры → закоммитить разрешение"]});

S("Git","ggit-4","Найти сломавший коммит через bisect","Senior", `<h3>Контекст</h3><p>Git: <b>Найти сломавший коммит через bisect</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Найти сломавший коммит через bisect</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] старт бисекции</li><li>[ ] автопрогон</li><li>[ ] выйти</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git bisect start HEAD HEAD~12</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: старт бисекции → автопрогон → выйти.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^git bisect start HEAD HEAD~12",`Bisecting: 6 revisions left`,"dim"],
 ["^git bisect run pytest -q",`a1b2c3 is the first bad commit`,"err"],
 ["^git show a1b2c3 --stat",`src/pay.py | 12 +++++`,"ok"],
 ["^git bisect reset",``, "ok"]
],
[{re:"^git bisect start",l:"старт бисекции"},
 {re:"^git bisect run",l:"автопрогон"},
 {re:"^git bisect reset",l:"выйти"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Найти сломавший коммит через bisect в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: старт бисекции → автопрогон → выйти"]});

S("Git","ggit-5","Секрет утек в историю — вычистить filter-repo","Senior", `<h3>Контекст</h3><p>Git: <b>Секрет утек в историю — вычистить filter-repo</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Секрет утек в историю — вычистить filter-repo</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти коммиты</li><li>[ ] вычистить файл</li><li>[ ] пуш</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git log --all --oneline -- sec</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти коммиты → вычистить файл → пуш.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^git log --all --oneline -- secrets.env",`c3d4e5 add secrets`,"warn"],
 ["^git filter-repo --invert-paths --path secrets.env --force",`Rewrite c3d4e5 (3/3)`,"ok"],
 ["^git log --all --oneline -- secrets.env",`(пусто)`,"ok"],
 ["^git push --force-with-lease",`forced update`,"ok"]
],
[{re:"^git log --all --oneline -- secrets.env",l:"найти коммиты"},
 {re:"^git filter-repo --invert-paths",l:"вычистить файл"},
 {re:"^git push --force-with-lease",l:"пуш"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Секрет утек в историю — вычистить filter-repo в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: найти коммиты → вычистить файл → пуш"]});

S("Git","ggit-6","Stash: спрятать WIP и вернуться","Junior", `<h3>Контекст</h3><p>Git: <b>Stash: спрятать WIP и вернуться</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Stash: спрятать WIP и вернуться</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] спрятать</li><li>[ ] список</li><li>[ ] вернуть</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git status -s</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: спрятать → список → вернуть.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^git status -s",`M src/api.go\n?? notes.txt`,"dim"],
 ["^git stash push -m \"wip api\" --include-untracked",`Saved working directory`,"ok"],
 ["^git status -s",`(чисто)`,"ok"],
 ["^git stash list",`stash@{0}: wip api`,"ok"],
 ["^git stash pop",`Dropped stash@{0}`,"ok"]
],
[{re:"^git stash push",l:"спрятать"},
 {re:"^git stash list",l:"список"},
 {re:"^git stash pop",l:"вернуть"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Stash: спрятать WIP и вернуться в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: спрятать → список → вернуть"]});

S("Git","ggit-7","Cherry-pick: перенести фикс из develop в main","Middle", `<h3>Контекст</h3><p>Git: <b>Cherry-pick: перенести фикс из develop в main</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Cherry-pick: перенести фикс из develop в main</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] перенести коммит</li><li>[ ] проверить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git log develop --oneline -3</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: перенести коммит → проверить.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^git log develop --oneline -3",`f1a2b3 fix: null pointer\n...`,"dim"],
 ["^git checkout main",`Switched to branch 'main'`,"dim"],
 ["^git cherry-pick f1a2b3",`\\[main 9c8d7e\\] fix: null pointer`,"ok"],
 ["^git log --oneline -2",`9c8d7e fix: null pointer\n...`,"ok"]
],
[{re:"^git cherry-pick f1a2b3",l:"перенести коммит"},
 {re:"^git log --oneline",l:"проверить"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Cherry-pick: перенести фикс из develop в main в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: перенести коммит → проверить"]});

S("Git","ggit-8","Rebase interactive: склеить 3 fixup коммита","Middle", `<h3>Контекст</h3><p>Git: <b>Rebase interactive: склеить 3 fixup коммита</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Rebase interactive: склеить 3 fixup коммита</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] интерактивный rebase</li><li>[ ] пуш</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git log --oneline -5</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: интерактивный rebase → пуш.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (feat)$",
[
 ["^git log --oneline -5",`e5f6 fix typo\n d4e5 fix lint\n c3d4 feat x\n b2c3 fix`,"dim"],
 ["^git rebase -i HEAD~4",`pick c3d4 feat x\nsquash d4e5 fix lint\nsquash e5f6 fix typo`,"ok"],
 ["^git log --oneline -2",`a1b2 feat x (3 squashed)`,"ok"],
 ["^git push --force-with-lease",`forced`,"ok"]
],
[{re:"^git rebase -i HEAD~4",l:"интерактивный rebase"},
 {re:"^git push --force-with-lease",l:"пуш"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Rebase interactive: склеить 3 fixup коммита в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: интерактивный rebase → пуш"]});

S("Git","ggit-9","Reflog: воскресить удалённую ветку","Middle", `<h3>Контекст</h3><p>Git: <b>Reflog: воскресить удалённую ветку</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Reflog: воскресить удалённую ветку</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти хеш удалённой ветки</li><li>[ ] воскресить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git branch -D feat/pay</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти хеш удалённой ветки → воскресить.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^git branch -D feat/pay",`Deleted branch feat/pay`,"warn"],
 ["^git reflog \\| grep feat/pay \\| head -5",`a1b2c3 HEAD@{2}: checkout: moving to feat/pay`,"ok"],
 ["^git checkout -b feat/pay a1b2c3",`Switched to new branch 'feat/pay'`,"ok"],
 ["^git log --oneline -2",`a1b2c3 feat pay work`,"ok"]
],
[{re:"^git reflog",l:"найти хеш удалённой ветки"},
 {re:"^git checkout -b feat/pay",l:"воскресить"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Reflog: воскресить удалённую ветку в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: найти хеш удалённой ветки → воскресить"]});

S("Git","ggit-10","Отменить добавление в индекс (unstage)","Junior", `<h3>Контекст</h3><p>Git: <b>Отменить добавление в индекс (unstage)</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Отменить добавление в индекс (unstage)</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] убрать из индекса</li><li>[ ] проверить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git status -s</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: убрать из индекса → проверить.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^git status -s",`A secrets.env\nM src/api.go`,"err"],
 ["^git restore --staged secrets.env",``, "ok"],
 ["^git status -s",`?? secrets.env\nM src/api.go`,"ok"],
 ["^echo \"secrets.env\" >> .gitignore",``, "ok"]
],
[{re:"^git restore --staged secrets.env",l:"убрать из индекса"},
 {re:"^git status -s",l:"проверить"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Отменить добавление в индекс (unstage) в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: убрать из индекса → проверить"]});

S("Git","ggit-11","Подмодуль не инициализирован после clone","Middle", `<h3>Контекст</h3><p>Git: <b>Подмодуль не инициализирован после clone</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Подмодуль не инициализирован после clone</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить подмодули</li><li>[ ] инициализировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>ls lib/shared</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить подмодули → инициализировать.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^ls lib/shared",`(пусто)`,"err"],
 ["^cat .gitmodules \\| grep shared -A2",`\\[submodule \"lib/shared\"\\]\n path = lib/shared\n url = https://github.com/org/shared.git`,"dim"],
 ["^git submodule update --init --recursive",`Cloning into 'lib/shared'`,"ok"],
 ["^ls lib/shared \\| head -5",`README.md\nsrc`,"ok"]
],
[{re:"^cat .gitmodules",l:"проверить подмодули"},
 {re:"^git submodule update --init --recursive",l:"инициализировать"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Подмодуль не инициализирован после clone в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: проверить подмодули → инициализировать"]});

S("Git","ggit-12","LFS: большие файлы не пушатся","Middle", `<h3>Контекст</h3><p>Git: <b>LFS: большие файлы не пушатся</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>LFS: большие файлы не пушатся</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] включить LFS</li><li>[ ] проверить атрибут</li><li>[ ] закоммитить и запушить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>ls -lh data/model.bin</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: включить LFS → проверить атрибут → закоммитить и запушить.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^ls -lh data/model.bin",`-rw-r--r-- 412M model.bin`,"err"],
 ["^git lfs track \"data/model.bin\"",`Tracking "data/model.bin"`,"ok"],
 ["^cat .gitattributes \\| grep model",`data/model.bin filter=lfs diff=lfs`,"ok"],
 ["^git add .gitattributes data/model.bin && git commit -m \"lfs: model\" && git push",`Uploading LFS objects: 100%`,"ok"]
],
[{re:"^git lfs track",l:"включить LFS"},
 {re:"^cat .gitattributes",l:"проверить атрибут"},
 {re:"^git add .gitattributes",l:"закоммитить и запушить"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: LFS: большие файлы не пушатся в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: включить LFS → проверить атрибут → закоммитить и запушить"]});

S("Git","ggit-13","Хук pre-commit не запускается","Middle", `<h3>Контекст</h3><p>Git: <b>Хук pre-commit не запускается</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Хук pre-commit не запускается</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить права</li><li>[ ] сделать исполняемым</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>ls -l .git/hooks/pre-commit</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить права → сделать исполняемым.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^ls -l .git/hooks/pre-commit",`-rw-r--r-- 1 dev dev pre-commit`,"err"],
 ["^cat .git/hooks/pre-commit \\| head -5",`#!/bin/sh\npytest`,"dim"],
 ["^chmod \\+x .git/hooks/pre-commit",``, "ok"],
 ["^git commit --allow-empty -m \"test hook\" 2>&1 \\| tail -5",`pytest passed`,"ok"]
],
[{re:"^ls -l .git/hooks/pre-commit",l:"проверить права"},
 {re:"^chmod \\+x .git/hooks/pre-commit",l:"сделать исполняемым"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Хук pre-commit не запускается в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: проверить права → сделать исполняемым"]});

S("Git","ggit-14","Detached HEAD — как вернуться и сохранить коммит","Middle", `<h3>Контекст</h3><p>Git: <b>Detached HEAD — как вернуться и сохранить коммит</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Detached HEAD — как вернуться и сохранить коммит</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть detached</li><li>[ ] сохранить веткой</li><li>[ ] вернуться и смержить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git status</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть detached → сохранить веткой → вернуться и смержить.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app ((a1b2c3))$",
[
 ["^git status",`HEAD detached at a1b2c3`,"warn"],
 ["^git log --oneline -2",`a1b2c3 detached work`,"dim"],
 ["^git branch tmp-save",``, "ok"],
 ["^git checkout main",`Switched to branch 'main'`,"ok"],
 ["^git merge tmp-save --no-ff -m \"merge detached work\"",``, "ok"]
],
[{re:"^git status",l:"увидеть detached"},
 {re:"^git branch tmp-save",l:"сохранить веткой"},
 {re:"^git checkout main",l:"вернуться и смержить"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Detached HEAD — как вернуться и сохранить коммит в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: увидеть detached → сохранить веткой → вернуться и смержить"]});

S("Git","ggit-15","Rebase конфликт: прервать или продолжить","Middle", `<h3>Контекст</h3><p>Git: <b>Rebase конфликт: прервать или продолжить</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Rebase конфликт: прервать или продолжить</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] начать rebase</li><li>[ ] увидеть прогресс</li><li>[ ] продолжить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git rebase main</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: начать rebase → увидеть прогресс → продолжить.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (feat)$",
[
 ["^git rebase main",`CONFLICT in src/api.go`,"err"],
 ["^git status",`rebase in progress; fix conflicts and run \"git rebase --continue\"`,"warn"],
 ["^sed -i /<<<<<<</d src/api.go",``, "ok"],
 ["^git add src/api.go && git rebase --continue",`Successfully rebased`,"ok"]
],
[{re:"^git rebase main",l:"начать rebase"},
 {re:"^git status",l:"увидеть прогресс"},
 {re:"^git rebase --continue",l:"продолжить"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Rebase конфликт: прервать или продолжить в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: начать rebase → увидеть прогресс → продолжить"]});

S("Git","ggit-16","Tag и push тега для релиза","Junior", `<h3>Контекст</h3><p>Git: <b>Tag и push тега для релиза</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Tag и push тега для релиза</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] создать тег</li><li>[ ] запушить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git tag v1\\\\.5\\\\.0 -m \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: создать тег → запушить.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^git tag v1\\.5\\.0 -m \"release 1.5.0\"",``, "ok"],
 ["^git tag \\| tail -5",`v1.4.0\nv1.5.0`,"ok"],
 ["^git push origin v1\\.5\\.0",`To github.com:org/app.git\n * \\[new tag\\] v1.5.0 -> v1.5.0`,"ok"]
],
[{re:"^git tag v1",l:"создать тег"},
 {re:"^git push origin v1",l:"запушить"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Tag и push тега для релиза в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: создать тег → запушить"]});

S("Git","ggit-17","Squash merge: собрать feature в один коммит","Middle", `<h3>Контекст</h3><p>Git: <b>Squash merge: собрать feature в один коммит</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Squash merge: собрать feature в один коммит</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] squash</li><li>[ ] закоммитить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git merge --squash feat/pay</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: squash → закоммитить.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^git merge --squash feat/pay",`Squash commit -- not updating HEAD`,"ok"],
 ["^git status -s",`M src/pay.go`,"dim"],
 ["^git commit -m \"feat: pay integration\"",`\\[main 9f8e7d\\] feat: pay integration`,"ok"],
 ["^git log --oneline -3",`9f8e7d feat: pay integration`,"ok"]
],
[{re:"^git merge --squash feat/pay",l:"squash"},
 {re:"^git commit -m",l:"закоммитить"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Squash merge: собрать feature в один коммит в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: squash → закоммитить"]});

S("Git","ggit-18","Worktree: одновременно две ветки без stash","Senior", `<h3>Контекст</h3><p>Git: <b>Worktree: одновременно две ветки без stash</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Worktree: одновременно две ветки без stash</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] создать worktree</li><li>[ ] проверить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git worktree add ../app-hotfix</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: создать worktree → проверить.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (feat)$",
[
 ["^git worktree add ../app-hotfix hotfix",`Preparing worktree`,"ok"],
 ["^ls ../app-hotfix \\| head -5",`src\nREADME`,"ok"],
 ["^git worktree list",`app feat/pay\napp-hotfix hotfix`,"ok"],
 ["^git worktree remove ../app-hotfix",``, "dim"]
],
[{re:"^git worktree add",l:"создать worktree"},
 {re:"^git worktree list",l:"проверить"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Worktree: одновременно две ветки без stash в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: создать worktree → проверить"]});

S("Git","ggit-19","GPG подпись коммитов не проходит","Middle", `<h3>Контекст</h3><p>Git: <b>GPG подпись коммитов не проходит</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GPG подпись коммитов не проходит</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить подпись</li><li>[ ] проверить ключ</li><li>[ ] включить подпись</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git log --show-signature -1</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить подпись → проверить ключ → включить подпись.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^git log --show-signature -1",`gpg: BAD signature`,"err"],
 ["^git config --get user.signingkey",`ABCD1234`,"dim"],
 ["^gpg --list-keys ABCD1234",`pub rsa4096 ABCD1234`,"ok"],
 ["^git config commit.gpgsign true && git commit --allow-empty -m \"signed\" -S",``, "ok"],
 ["^git log --show-signature -1 \\| grep Good",`Good signature`,"ok"]
],
[{re:"^git log --show-signature",l:"проверить подпись"},
 {re:"^gpg --list-keys",l:"проверить ключ"},
 {re:"commit\\.gpgsign",l:"включить подпись"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: GPG подпись коммитов не проходит в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: проверить подпись → проверить ключ → включить подпись"]});

S("Git","ggit-20","Large repo: shallow clone для CI","Junior", `<h3>Контекст</h3><p>Git: <b>Large repo: shallow clone для CI</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Large repo: shallow clone для CI</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] shallow clone</li><li>[ ] сравнить размер</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git clone --depth 1 https://gi</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: shallow clone → сравнить размер.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^git clone --depth 1 https://github.com/org/big.git",`Cloning into 'big'...`,"ok"],
 ["^du -sh big",`42M big (vs 1.2G full)`,"ok"],
 ["^git -C big log --oneline \\| wc -l",`1`,"ok"],
 ["^git -C big fetch --unshallow",``, "dim"]
],
[{re:"^git clone --depth 1",l:"shallow clone"},
 {re:"^du -sh big",l:"сравнить размер"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Large repo: shallow clone для CI в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: shallow clone → сравнить размер"]});

S("Git","ggit-21","Fork sync: подтянуть upstream","Middle", `<h3>Контекст</h3><p>Git: <b>Fork sync: подтянуть upstream</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Fork sync: подтянуть upstream</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] стянуть upstream</li><li>[ ] смержить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git remote -v \\\\| grep upstrea</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: стянуть upstream → смержить.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/fork (main)$",
[
 ["^git remote -v \\| grep upstream",`upstream https://github.com/org/app.git`,"dim"],
 ["^git fetch upstream",`From github.com:org/app`,"ok"],
 ["^git merge upstream/main",`Updating a1b2c3..f5e6d7`,"ok"],
 ["^git push origin main",`To fork`,"ok"]
],
[{re:"^git fetch upstream",l:"стянуть upstream"},
 {re:"^git merge upstream/main",l:"смержить"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Fork sync: подтянуть upstream в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: стянуть upstream → смержить"]});

S("Git","ggit-22","Blame: кто сломал строку","Junior", `<h3>Контекст</h3><p>Git: <b>Blame: кто сломал строку</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Blame: кто сломал строку</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] blame строки</li><li>[ ] посмотреть коммит</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git blame src/api.go \\\\| sed -</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: blame строки → посмотреть коммит.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^git blame src/api.go \\| sed -n 42p",`a1b2c3 \\(Ivan 2026-03-12 42\\) broken line`,"ok"],
 ["^git show a1b2c3 --stat",`commit a1b2c3: feat api`,"ok"]
],
[{re:"^git blame src/api.go",l:"blame строки"},
 {re:"^git show a1b2c3",l:"посмотреть коммит"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Blame: кто сломал строку в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: blame строки → посмотреть коммит"]});

S("Git","ggit-23","Revert merge-коммита ( -m 1 )","Senior", `<h3>Контекст</h3><p>Git: <b>Revert merge-коммита ( -m 1 )</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Revert merge-коммита ( -m 1 )</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] revert merge с mainline 1</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git log --oneline --graph -4</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: revert merge с mainline 1.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^git log --oneline --graph -4",`* m1a2b3 Merge branch 'feat/pay'\n|\\`,"dim"],
 ["^git revert -m 1 m1a2b3 --no-edit",`\\[main 9f8e7d\\] Revert "Merge branch 'feat/pay'"`,"ok"],
 ["^git log --oneline -2",`9f8e7d Revert\nm1a2b3 Merge`,"ok"]
],
[{re:"^git revert -m 1",l:"revert merge с mainline 1"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Revert merge-коммита ( -m 1 ) в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: revert merge с mainline 1"]});

S("Git","ggit-24","Sparse checkout: клонировать только /deploy","Middle", `<h3>Контекст</h3><p>Git: <b>Sparse checkout: клонировать только /deploy</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Sparse checkout: клонировать только /deploy</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] sparse clone</li><li>[ ] выбрать каталог</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git clone --filter=blob:none -</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: sparse clone → выбрать каталог.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^git clone --filter=blob:none --sparse https://github.com/org/mono.git",``, "ok"],
 ["^git -C mono sparse-checkout set deploy",``, "ok"],
 ["^ls mono/deploy \\| head -10",`k8s\nterraform`,"ok"],
 ["^du -sh mono",`120M`,"ok"]
],
[{re:"^git clone --filter=blob:none --sparse",l:"sparse clone"},
 {re:"^git -C mono sparse-checkout set deploy",l:"выбрать каталог"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Sparse checkout: клонировать только /deploy в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: sparse clone → выбрать каталог"]});

S("Git","ggit-25","Git rerere: запомнить разрешение конфликта","Senior", `<h3>Контекст</h3><p>Git: <b>Git rerere: запомнить разрешение конфликта</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Git rerere: запомнить разрешение конфликта</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] включить rerere</li><li>[ ] проверить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git config --global rerere.ena</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: включить rerere → проверить.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
 ["^git config --global rerere.enabled true",``, "ok"],
 ["^git config --get rerere.enabled",`true`,"ok"],
 ["^ls .git/rr-cache/ 2>&1 \\| head -5",`... cache`,"dim"],
 ["^git merge feat/pay 2>&1 \\| grep -i rerere",`Resolved 'src/api.go' using previous resolution.`,"ok"]
],
[{re:"^git config --global rerere.enabled true",l:"включить rerere"},
 {re:"^git config --get rerere.enabled",l:"проверить"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Git rerere: запомнить разрешение конфликта в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: включить rerere → проверить"]});
