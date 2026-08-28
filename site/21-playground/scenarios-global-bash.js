/* Global Playground: Bash — 35 scenarios */
S("Bash","gc-bash-1","arrays: ${arr[@]} vs ${arr[*]} word splitting","Junior", `<h3>Контекст</h3><p>Bash: <b>arrays: \${arr[@]} vs \${arr[*]} word splitting</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>arrays: \${arr[@]} vs \${arr[*]} word splitting</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>bash -x script.sh 2>&1 | head </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^bash -x script.sh 2>&1 | head -20", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep -A2 \"arr\\[\" | head -20", "check output", "warn"],
 ["^sed -i s/'${arr[*]}'/'${arr[@]}'/ script.sh", "fixed", "ok"],
 ["^bash script.sh 2>&1 | head -20", "ok verified", "ok"]
],
[{re:"^bash -x script.sh 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'${arr[*]}'/'${arr[@]}'/ script.sh",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: arrays: \${arr[@]} vs \${arr[*]} word splitting в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-2","getopts: parse -f file -v verbose","Middle", `<h3>Контекст</h3><p>Bash: <b>getopts: parse -f file -v verbose</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>getopts: parse -f file -v verbose</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>bash script.sh -f file.txt -v </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^bash script.sh -f file.txt -v 2>&1 | head -20", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep -A5 getopts | head -20", "check output", "warn"],
 ["^sed -i s/'getopts f:'/'getopts f:v'/ script.sh", "fixed", "ok"],
 ["^bash script.sh -f file.txt -v 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^bash script.sh -f file.txt -v 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'getopts f:'/'getopts f:v'/ script.sh",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: getopts: parse -f file -v verbose в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-3","mapfile: readarray 10k lines OOM","Senior", `<h3>Контекст</h3><p>Bash: <b>mapfile: readarray 10k lines OOM</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>mapfile: readarray 10k lines OOM</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>bash -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^bash -c \"mapfile -t arr < large.txt; echo ${#arr[@]}\" 2>&1 | head -10", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep -A2 mapfile | head -20", "check output", "warn"],
 ["^sed -i s/'mapfile arr'/'mapfile -t arr'/ script.sh", "fixed", "ok"],
 ["^bash script.sh 2>&1 | head -10", "ok verified", "ok"]
],
[{re:"^bash -c \"mapfile -t arr < large.txt; echo ${#arr[@]}\" 2>&1 | head -10",l:"диагностика"},
 {re:"^sed -i s/'mapfile arr'/'mapfile -t arr'/ script.sh",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: mapfile: readarray 10k lines OOM в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-4","flock: 2 процесса пишут в файл одновременно","Junior", `<h3>Контекст</h3><p>Bash: <b>flock: 2 процесса пишут в файл одновременно</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>flock: 2 процесса пишут в файл одновременно</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>flock -n /tmp/lock -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^flock -n /tmp/lock -c \"sleep 10\" & flock -n /tmp/lock -c \"echo locked\" 2>&1 | head -10", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep -A2 flock | head -20", "check output", "warn"],
 ["^sed -i s/'flock \\/tmp\\/lock'/'flock -n \\/tmp\\/lock'/ script.sh", "fixed", "ok"],
 ["^bash script.sh 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^flock -n /tmp/lock -c \"sleep 10\" & flock -n /tmp/lock -c \"echo locked\" 2>&1 | head -10",l:"диагностика"},
 {re:"^sed -i s/'flock \\/tmp\\/lock'/'flock -n \\/tmp\\/lock'/ script.sh",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: flock: 2 процесса пишут в файл одновременно в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-5","jq: filter .items[] | select(.status==\"Failed\")","Middle",
"<b>Задача:</b> jq: filter .items[] | select(.status==\"Failed\"). Требуется исправление bash скрипта.",
"dev@bash:~$",
[
 ["^cat data.json | jq '.items[] | select(.status==\"Failed\")' 2>&1 | head -20", "diagnostic: split or error", "warn"],
 ["^cat data.json | jq -r '.items[0].name' 2>&1 | head -10", "check output", "warn"],
 ["^cat data.json | jq -r '.items[] | select(.status==\"Failed\") | .name' > out.txt", "fixed", "ok"],
 ["^cat out.txt | head -10", "ok verified", "ok"]
],
[{re:"^cat data.json | jq '.items[] | select(.status==\"Failed\")' 2>&1 | head -20",l:"диагностика"},
 {re:"^cat data.json | jq -r '.items[] | select(.status==\"Failed\") | .name' > out.txt",l:"исправить"}],{file:"data.json",files:{"data.json":`{\n  \"items\": [\n    {\"name\": \"a\", \"status\": \"Failed\"}\n  ]\n}`,"query.jq":`.items[] | select(.status==\"Failed\")`},checks:[{re:/select\(.*Failed/,l:"фильтрует Failed"}],solutionFiles:{"data.json":`{\n  \"items\": [\n    {\"name\": \"a\", \"status\": \"Failed\"}\n  ]\n}`,"query.jq":`.items[] | select(.status==\"Failed\") | .name`}},
{hints:["Задача сводится к тому, чтобы отфильтровать элементы JSON по статусу и вывести результат предсказуемо. Определите, чем отличается вывод `jq` с флагом `-r` и без него.", "Рабочие инструменты сценария: <code>cat</code>, <code>jq</code>, <code>head</code>. Диагноз начинайте с <code>cat data.json | jq '.items[] | select(.status==\"Failed\")' 2>&1 | head -20</code>.", "Порядок действий: диагностика → исправить"]});

S("Bash","gc-bash-6","jq: -r raw output без кавычек","Senior", `<h3>Контекст</h3><p>Bash: <b>jq: -r raw output без кавычек</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>jq: -r raw output без кавычек</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>cat data.json | jq '.items[] |</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^cat data.json | jq '.items[] | select(.status==\"Failed\")' 2>&1 | head -20", "diagnostic: split or error", "warn"],
 ["^cat data.json | jq -r '.items[0].name' 2>&1 | head -10", "check output", "warn"],
 ["^cat data.json | jq -r '.items[] | select(.status==\"Failed\") | .name' > out.txt", "fixed", "ok"],
 ["^cat out.txt | head -10", "ok verified", "ok"]
],
[{re:"^cat data.json | jq '.items[] | select(.status==\"Failed\")' 2>&1 | head -20",l:"диагностика"},
 {re:"^cat data.json | jq -r '.items[] | select(.status==\"Failed\") | .name' > out.txt",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: jq: -r raw output без кавычек в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-7","awk: $1 $NF last field","Junior", `<h3>Контекст</h3><p>Bash: <b>awk: $1 $NF last field</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>awk: $1 $NF last field</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>awk '{print 1, NF}' access.log</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^awk '{print $1, $NF}' access.log | head -10", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep awk | head -20", "check output", "warn"],
 ["^awk 'BEGIN{FS=\",\"; OFS=\";\"} {print $1, $3}' data.csv > out.csv", "fixed", "ok"],
 ["^cat out.csv | head -10", "ok verified", "ok"]
],
[{re:"^awk '{print $1, $NF}' access.log | head -10",l:"диагностика"},
 {re:"^awk 'BEGIN{FS=\",\"; OFS=\";\"} {print $1, $3}' data.csv > out.csv",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: awk: $1 $NF last field в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-8","awk: BEGIN FS OFS","Middle", `<h3>Контекст</h3><p>Bash: <b>awk: BEGIN FS OFS</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>awk: BEGIN FS OFS</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>awk '{print 1, NF}' access.log</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^awk '{print $1, $NF}' access.log | head -10", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep awk | head -20", "check output", "warn"],
 ["^awk 'BEGIN{FS=\",\"; OFS=\";\"} {print $1, $3}' data.csv > out.csv", "fixed", "ok"],
 ["^cat out.csv | head -10", "ok verified", "ok"]
],
[{re:"^awk '{print $1, $NF}' access.log | head -10",l:"диагностика"},
 {re:"^awk 'BEGIN{FS=\",\"; OFS=\";\"} {print $1, $3}' data.csv > out.csv",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: awk: BEGIN FS OFS в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-9","sed: -i без бэкапа GNU vs BSD","Senior", `<h3>Контекст</h3><p>Bash: <b>sed: -i без бэкапа GNU vs BSD</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>sed: -i без бэкапа GNU vs BSD</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>sed -n '3p' file.txt 2>&1 | he</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^sed -n '3p' file.txt 2>&1 | head -10", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep sed | head -20", "check output", "warn"],
 ["^sed -i.bak s/old/new/g file.txt", "fixed", "ok"],
 ["^cat file.txt | head -10", "ok verified", "ok"]
],
[{re:"^sed -n '3p' file.txt 2>&1 | head -10",l:"диагностика"},
 {re:"^sed -i.bak s/old/new/g file.txt",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: sed: -i без бэкапа GNU vs BSD в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-10","sed: capture group \\1","Junior", `<h3>Контекст</h3><p>Bash: <b>sed: capture group \\\\1</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>sed: capture group \\\\1</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>sed -n '3p' file.txt 2>&1 | he</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^sed -n '3p' file.txt 2>&1 | head -10", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep sed | head -20", "check output", "warn"],
 ["^sed -i.bak s/old/new/g file.txt", "fixed", "ok"],
 ["^cat file.txt | head -10", "ok verified", "ok"]
],
[{re:"^sed -n '3p' file.txt 2>&1 | head -10",l:"диагностика"},
 {re:"^sed -i.bak s/old/new/g file.txt",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: sed: capture group \\\\1 в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-11","xargs -P: parallel 10 jobs","Middle", `<h3>Контекст</h3><p>Bash: <b>xargs -P: parallel 10 jobs</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>xargs -P: parallel 10 jobs</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>cat files.txt | xargs -I{} ech</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^cat files.txt | xargs -I{} echo {} 2>&1 | head -10", "diagnostic: split or error", "warn"],
 ["^cat files.txt | xargs -P 4 -I{} echo {} 2>&1 | head -10", "check output", "warn"],
 ["^cat files.txt | xargs -0 -P 4 -I{} echo {} < <(tr '\\n' '\\0' < files.txt)", "fixed", "ok"],
 ["^cat files.txt | xargs -P 4 -I{} bash -c \"echo {}\" | head -10", "ok verified", "ok"]
],
[{re:"^cat files.txt | xargs -I{} echo {} 2>&1 | head -10",l:"диагностика"},
 {re:"^cat files.txt | xargs -0 -P 4 -I{} echo {} < <(tr '\\n' '\\0' < files.txt)",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: xargs -P: parallel 10 jobs в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-12","xargs: -0 с find -print0","Senior", `<h3>Контекст</h3><p>Bash: <b>xargs: -0 с find -print0</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>xargs: -0 с find -print0</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>cat files.txt | xargs -I{} ech</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^cat files.txt | xargs -I{} echo {} 2>&1 | head -10", "diagnostic: split or error", "warn"],
 ["^cat files.txt | xargs -P 4 -I{} echo {} 2>&1 | head -10", "check output", "warn"],
 ["^cat files.txt | xargs -0 -P 4 -I{} echo {} < <(tr '\\n' '\\0' < files.txt)", "fixed", "ok"],
 ["^cat files.txt | xargs -P 4 -I{} bash -c \"echo {}\" | head -10", "ok verified", "ok"]
],
[{re:"^cat files.txt | xargs -I{} echo {} 2>&1 | head -10",l:"диагностика"},
 {re:"^cat files.txt | xargs -0 -P 4 -I{} echo {} < <(tr '\\n' '\\0' < files.txt)",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: xargs: -0 с find -print0 в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-13","shellcheck: SC2086 double quote","Junior", `<h3>Контекст</h3><p>Bash: <b>shellcheck: SC2086 double quote</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>shellcheck: SC2086 double quote</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>shellcheck script.sh 2>&1 | he</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^shellcheck script.sh 2>&1 | head -20", "diagnostic: split or error", "warn"],
 ["^cat script.sh | head -20", "check output", "warn"],
 ["^shellcheck --fix script.sh 2>&1 | head -10", "fixed", "ok"],
 ["^shellcheck script.sh 2>&1 | grep -c SC | head -5", "ok verified", "ok"]
],
[{re:"^shellcheck script.sh 2>&1 | head -20",l:"диагностика"},
 {re:"^shellcheck --fix script.sh 2>&1 | head -10",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: shellcheck: SC2086 double quote в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-14","shellcheck: SC2046 $(...)","Middle", `<h3>Контекст</h3><p>Bash: <b>shellcheck: SC2046 $(...)</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>shellcheck: SC2046 $(...)</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>shellcheck script.sh 2>&1 | he</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^shellcheck script.sh 2>&1 | head -20", "diagnostic: split or error", "warn"],
 ["^cat script.sh | head -20", "check output", "warn"],
 ["^shellcheck --fix script.sh 2>&1 | head -10", "fixed", "ok"],
 ["^shellcheck script.sh 2>&1 | grep -c SC | head -5", "ok verified", "ok"]
],
[{re:"^shellcheck script.sh 2>&1 | head -20",l:"диагностика"},
 {re:"^shellcheck --fix script.sh 2>&1 | head -10",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: shellcheck: SC2046 $(...) в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-15","arrays: associative array declare -A","Senior", `<h3>Контекст</h3><p>Bash: <b>arrays: associative array declare -A</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>arrays: associative array declare -A</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>bash -x script.sh 2>&1 | head </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^bash -x script.sh 2>&1 | head -20", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep -A2 \"arr\\[\" | head -20", "check output", "warn"],
 ["^sed -i s/'${arr[*]}'/'${arr[@]}'/ script.sh", "fixed", "ok"],
 ["^bash script.sh 2>&1 | head -20", "ok verified", "ok"]
],
[{re:"^bash -x script.sh 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'${arr[*]}'/'${arr[@]}'/ script.sh",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: arrays: associative array declare -A в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-16","getopts: long opts --help","Junior", `<h3>Контекст</h3><p>Bash: <b>getopts: long opts --help</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>getopts: long opts --help</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>bash script.sh -f file.txt -v </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^bash script.sh -f file.txt -v 2>&1 | head -20", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep -A5 getopts | head -20", "check output", "warn"],
 ["^sed -i s/'getopts f:'/'getopts f:v'/ script.sh", "fixed", "ok"],
 ["^bash script.sh -f file.txt -v 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^bash script.sh -f file.txt -v 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'getopts f:'/'getopts f:v'/ script.sh",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: getopts: long opts --help в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-17","mapfile: -t trim newline","Middle", `<h3>Контекст</h3><p>Bash: <b>mapfile: -t trim newline</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>mapfile: -t trim newline</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>bash -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^bash -c \"mapfile -t arr < large.txt; echo ${#arr[@]}\" 2>&1 | head -10", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep -A2 mapfile | head -20", "check output", "warn"],
 ["^sed -i s/'mapfile arr'/'mapfile -t arr'/ script.sh", "fixed", "ok"],
 ["^bash script.sh 2>&1 | head -10", "ok verified", "ok"]
],
[{re:"^bash -c \"mapfile -t arr < large.txt; echo ${#arr[@]}\" 2>&1 | head -10",l:"диагностика"},
 {re:"^sed -i s/'mapfile arr'/'mapfile -t arr'/ script.sh",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: mapfile: -t trim newline в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-18","flock: non-blocking -n","Senior", `<h3>Контекст</h3><p>Bash: <b>flock: non-blocking -n</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>flock: non-blocking -n</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>flock -n /tmp/lock -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^flock -n /tmp/lock -c \"sleep 10\" & flock -n /tmp/lock -c \"echo locked\" 2>&1 | head -10", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep -A2 flock | head -20", "check output", "warn"],
 ["^sed -i s/'flock \\/tmp\\/lock'/'flock -n \\/tmp\\/lock'/ script.sh", "fixed", "ok"],
 ["^bash script.sh 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^flock -n /tmp/lock -c \"sleep 10\" & flock -n /tmp/lock -c \"echo locked\" 2>&1 | head -10",l:"диагностика"},
 {re:"^sed -i s/'flock \\/tmp\\/lock'/'flock -n \\/tmp\\/lock'/ script.sh",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: flock: non-blocking -n в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-19","jq: to_entries vs keys","Junior", `<h3>Контекст</h3><p>Bash: <b>jq: to_entries vs keys</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>jq: to_entries vs keys</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>cat data.json | jq '.items[] |</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^cat data.json | jq '.items[] | select(.status==\"Failed\")' 2>&1 | head -20", "diagnostic: split or error", "warn"],
 ["^cat data.json | jq -r '.items[0].name' 2>&1 | head -10", "check output", "warn"],
 ["^cat data.json | jq -r '.items[] | select(.status==\"Failed\") | .name' > out.txt", "fixed", "ok"],
 ["^cat out.txt | head -10", "ok verified", "ok"]
],
[{re:"^cat data.json | jq '.items[] | select(.status==\"Failed\")' 2>&1 | head -20",l:"диагностика"},
 {re:"^cat data.json | jq -r '.items[] | select(.status==\"Failed\") | .name' > out.txt",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: jq: to_entries vs keys в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-20","awk: sum $3","Middle", `<h3>Контекст</h3><p>Bash: <b>awk: sum $3</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>awk: sum $3</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>awk '{print 1, NF}' access.log</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^awk '{print $1, $NF}' access.log | head -10", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep awk | head -20", "check output", "warn"],
 ["^awk 'BEGIN{FS=\",\"; OFS=\";\"} {print $1, $3}' data.csv > out.csv", "fixed", "ok"],
 ["^cat out.csv | head -10", "ok verified", "ok"]
],
[{re:"^awk '{print $1, $NF}' access.log | head -10",l:"диагностика"},
 {re:"^awk 'BEGIN{FS=\",\"; OFS=\";\"} {print $1, $3}' data.csv > out.csv",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: awk: sum $3 в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-21","sed: delete line 3d","Senior", `<h3>Контекст</h3><p>Bash: <b>sed: delete line 3d</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>sed: delete line 3d</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>sed -n '3p' file.txt 2>&1 | he</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^sed -n '3p' file.txt 2>&1 | head -10", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep sed | head -20", "check output", "warn"],
 ["^sed -i.bak s/old/new/g file.txt", "fixed", "ok"],
 ["^cat file.txt | head -10", "ok verified", "ok"]
],
[{re:"^sed -n '3p' file.txt 2>&1 | head -10",l:"диагностика"},
 {re:"^sed -i.bak s/old/new/g file.txt",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: sed: delete line 3d в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-22","xargs: limit -n 2","Junior", `<h3>Контекст</h3><p>Bash: <b>xargs: limit -n 2</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>xargs: limit -n 2</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>cat files.txt | xargs -I{} ech</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^cat files.txt | xargs -I{} echo {} 2>&1 | head -10", "diagnostic: split or error", "warn"],
 ["^cat files.txt | xargs -P 4 -I{} echo {} 2>&1 | head -10", "check output", "warn"],
 ["^cat files.txt | xargs -0 -P 4 -I{} echo {} < <(tr '\\n' '\\0' < files.txt)", "fixed", "ok"],
 ["^cat files.txt | xargs -P 4 -I{} bash -c \"echo {}\" | head -10", "ok verified", "ok"]
],
[{re:"^cat files.txt | xargs -I{} echo {} 2>&1 | head -10",l:"диагностика"},
 {re:"^cat files.txt | xargs -0 -P 4 -I{} echo {} < <(tr '\\n' '\\0' < files.txt)",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: xargs: limit -n 2 в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-23","shellcheck: disable SC2143 grep -q","Middle", `<h3>Контекст</h3><p>Bash: <b>shellcheck: disable SC2143 grep -q</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>shellcheck: disable SC2143 grep -q</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>shellcheck script.sh 2>&1 | he</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^shellcheck script.sh 2>&1 | head -20", "diagnostic: split or error", "warn"],
 ["^cat script.sh | head -20", "check output", "warn"],
 ["^shellcheck --fix script.sh 2>&1 | head -10", "fixed", "ok"],
 ["^shellcheck script.sh 2>&1 | grep -c SC | head -5", "ok verified", "ok"]
],
[{re:"^shellcheck script.sh 2>&1 | head -20",l:"диагностика"},
 {re:"^shellcheck --fix script.sh 2>&1 | head -10",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: shellcheck: disable SC2143 grep -q в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-24","arrays: slice ${arr[@]:1:2}","Senior", `<h3>Контекст</h3><p>Bash: <b>arrays: slice \${arr[@]:1:2}</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>arrays: slice \${arr[@]:1:2}</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>bash -x script.sh 2>&1 | head </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^bash -x script.sh 2>&1 | head -20", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep -A2 \"arr\\[\" | head -20", "check output", "warn"],
 ["^sed -i s/'${arr[*]}'/'${arr[@]}'/ script.sh", "fixed", "ok"],
 ["^bash script.sh 2>&1 | head -20", "ok verified", "ok"]
],
[{re:"^bash -x script.sh 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'${arr[*]}'/'${arr[@]}'/ script.sh",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: arrays: slice \${arr[@]:1:2} в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-25","getopts: OPTARG","Junior", `<h3>Контекст</h3><p>Bash: <b>getopts: OPTARG</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>getopts: OPTARG</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>bash script.sh -f file.txt -v </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^bash script.sh -f file.txt -v 2>&1 | head -20", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep -A5 getopts | head -20", "check output", "warn"],
 ["^sed -i s/'getopts f:'/'getopts f:v'/ script.sh", "fixed", "ok"],
 ["^bash script.sh -f file.txt -v 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^bash script.sh -f file.txt -v 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'getopts f:'/'getopts f:v'/ script.sh",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: getopts: OPTARG в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-26","mapfile: -d ':' delimiter","Middle", `<h3>Контекст</h3><p>Bash: <b>mapfile: -d ':' delimiter</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>mapfile: -d ':' delimiter</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>bash -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^bash -c \"mapfile -t arr < large.txt; echo ${#arr[@]}\" 2>&1 | head -10", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep -A2 mapfile | head -20", "check output", "warn"],
 ["^sed -i s/'mapfile arr'/'mapfile -t arr'/ script.sh", "fixed", "ok"],
 ["^bash script.sh 2>&1 | head -10", "ok verified", "ok"]
],
[{re:"^bash -c \"mapfile -t arr < large.txt; echo ${#arr[@]}\" 2>&1 | head -10",l:"диагностика"},
 {re:"^sed -i s/'mapfile arr'/'mapfile -t arr'/ script.sh",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: mapfile: -d ':' delimiter в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-27","flock: -w 5 timeout","Senior", `<h3>Контекст</h3><p>Bash: <b>flock: -w 5 timeout</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>flock: -w 5 timeout</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>flock -n /tmp/lock -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^flock -n /tmp/lock -c \"sleep 10\" & flock -n /tmp/lock -c \"echo locked\" 2>&1 | head -10", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep -A2 flock | head -20", "check output", "warn"],
 ["^sed -i s/'flock \\/tmp\\/lock'/'flock -n \\/tmp\\/lock'/ script.sh", "fixed", "ok"],
 ["^bash script.sh 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^flock -n /tmp/lock -c \"sleep 10\" & flock -n /tmp/lock -c \"echo locked\" 2>&1 | head -10",l:"диагностика"},
 {re:"^sed -i s/'flock \\/tmp\\/lock'/'flock -n \\/tmp\\/lock'/ script.sh",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: flock: -w 5 timeout в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-28","jq: --arg var","Junior", `<h3>Контекст</h3><p>Bash: <b>jq: --arg var</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>jq: --arg var</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>cat data.json | jq '.items[] |</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^cat data.json | jq '.items[] | select(.status==\"Failed\")' 2>&1 | head -20", "diagnostic: split or error", "warn"],
 ["^cat data.json | jq -r '.items[0].name' 2>&1 | head -10", "check output", "warn"],
 ["^cat data.json | jq -r '.items[] | select(.status==\"Failed\") | .name' > out.txt", "fixed", "ok"],
 ["^cat out.txt | head -10", "ok verified", "ok"]
],
[{re:"^cat data.json | jq '.items[] | select(.status==\"Failed\")' 2>&1 | head -20",l:"диагностика"},
 {re:"^cat data.json | jq -r '.items[] | select(.status==\"Failed\") | .name' > out.txt",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: jq: --arg var в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-29","awk: regex /error/ ","Middle", `<h3>Контекст</h3><p>Bash: <b>awk: regex /error/ </b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>awk: regex /error/ </b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>awk '{print 1, NF}' access.log</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^awk '{print $1, $NF}' access.log | head -10", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep awk | head -20", "check output", "warn"],
 ["^awk 'BEGIN{FS=\",\"; OFS=\";\"} {print $1, $3}' data.csv > out.csv", "fixed", "ok"],
 ["^cat out.csv | head -10", "ok verified", "ok"]
],
[{re:"^awk '{print $1, $NF}' access.log | head -10",l:"диагностика"},
 {re:"^awk 'BEGIN{FS=\",\"; OFS=\";\"} {print $1, $3}' data.csv > out.csv",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: awk: regex /error/  в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-30","sed: y/abc/ABC/ transliterate","Senior", `<h3>Контекст</h3><p>Bash: <b>sed: y/abc/ABC/ transliterate</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>sed: y/abc/ABC/ transliterate</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>sed -n '3p' file.txt 2>&1 | he</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^sed -n '3p' file.txt 2>&1 | head -10", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep sed | head -20", "check output", "warn"],
 ["^sed -i.bak s/old/new/g file.txt", "fixed", "ok"],
 ["^cat file.txt | head -10", "ok verified", "ok"]
],
[{re:"^sed -n '3p' file.txt 2>&1 | head -10",l:"диагностика"},
 {re:"^sed -i.bak s/old/new/g file.txt",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: sed: y/abc/ABC/ transliterate в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-31","xargs -P: max-procs 4","Junior", `<h3>Контекст</h3><p>Bash: <b>xargs -P: max-procs 4</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>xargs -P: max-procs 4</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>cat files.txt | xargs -I{} ech</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^cat files.txt | xargs -I{} echo {} 2>&1 | head -10", "diagnostic: split or error", "warn"],
 ["^cat files.txt | xargs -P 4 -I{} echo {} 2>&1 | head -10", "check output", "warn"],
 ["^cat files.txt | xargs -0 -P 4 -I{} echo {} < <(tr '\\n' '\\0' < files.txt)", "fixed", "ok"],
 ["^cat files.txt | xargs -P 4 -I{} bash -c \"echo {}\" | head -10", "ok verified", "ok"]
],
[{re:"^cat files.txt | xargs -I{} echo {} 2>&1 | head -10",l:"диагностика"},
 {re:"^cat files.txt | xargs -0 -P 4 -I{} echo {} < <(tr '\\n' '\\0' < files.txt)",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: xargs -P: max-procs 4 в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-32","shellcheck: SC2164 cd || exit","Middle", `<h3>Контекст</h3><p>Bash: <b>shellcheck: SC2164 cd || exit</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>shellcheck: SC2164 cd || exit</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>shellcheck script.sh 2>&1 | he</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^shellcheck script.sh 2>&1 | head -20", "diagnostic: split or error", "warn"],
 ["^cat script.sh | head -20", "check output", "warn"],
 ["^shellcheck --fix script.sh 2>&1 | head -10", "fixed", "ok"],
 ["^shellcheck script.sh 2>&1 | grep -c SC | head -5", "ok verified", "ok"]
],
[{re:"^shellcheck script.sh 2>&1 | head -20",l:"диагностика"},
 {re:"^shellcheck --fix script.sh 2>&1 | head -10",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: shellcheck: SC2164 cd || exit в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-33","arrays: ${#arr[@]} length","Senior", `<h3>Контекст</h3><p>Bash: <b>arrays: \${#arr[@]} length</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>arrays: \${#arr[@]} length</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>bash -x script.sh 2>&1 | head </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^bash -x script.sh 2>&1 | head -20", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep -A2 \"arr\\[\" | head -20", "check output", "warn"],
 ["^sed -i s/'${arr[*]}'/'${arr[@]}'/ script.sh", "fixed", "ok"],
 ["^bash script.sh 2>&1 | head -20", "ok verified", "ok"]
],
[{re:"^bash -x script.sh 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'${arr[*]}'/'${arr[@]}'/ script.sh",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: arrays: \${#arr[@]} length в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-34","getopts: shift $((OPTIND-1))","Junior", `<h3>Контекст</h3><p>Bash: <b>getopts: shift $((OPTIND-1))</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>getopts: shift $((OPTIND-1))</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>bash script.sh -f file.txt -v </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^bash script.sh -f file.txt -v 2>&1 | head -20", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep -A5 getopts | head -20", "check output", "warn"],
 ["^sed -i s/'getopts f:'/'getopts f:v'/ script.sh", "fixed", "ok"],
 ["^bash script.sh -f file.txt -v 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^bash script.sh -f file.txt -v 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'getopts f:'/'getopts f:v'/ script.sh",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: getopts: shift $((OPTIND-1)) в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

S("Bash","gc-bash-35","mapfile: process substitution < <(cmd)","Middle", `<h3>Контекст</h3><p>Bash: <b>mapfile: process substitution < <(cmd)</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>mapfile: process substitution < <(cmd)</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>bash -c \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@bash:~$",
[
 ["^bash -c \"mapfile -t arr < large.txt; echo ${#arr[@]}\" 2>&1 | head -10", "diagnostic: split or error", "warn"],
 ["^cat script.sh | grep -A2 mapfile | head -20", "check output", "warn"],
 ["^sed -i s/'mapfile arr'/'mapfile -t arr'/ script.sh", "fixed", "ok"],
 ["^bash script.sh 2>&1 | head -10", "ok verified", "ok"]
],
[{re:"^bash -c \"mapfile -t arr < large.txt; echo ${#arr[@]}\" 2>&1 | head -10",l:"диагностика"},
 {re:"^sed -i s/'mapfile arr'/'mapfile -t arr'/ script.sh",l:"исправить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: mapfile: process substitution < <(cmd) в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: диагностика → исправить"]});

