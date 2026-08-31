/* Global Playground: Go — 50 scenarios */
S("Go","gc-go-1","interface nil: typed nil vs nil interface","Junior", `<h3>Контекст</h3><p>Go: <b>interface nil: typed nil vs nil interface</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>interface nil: typed nil vs nil interface</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | head -20</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | head -20", "diagnostic output: error or mismatch", "err"],
 ["^go vet ./... 2>&1 | head -20", "check output", "warn"],
 ["^sed -i s/var s/interface fix/ main.go", "fixed", "ok"],
 ["^go run main.go 2>&1 | grep -i nil | head -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/var s/interface fix/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: interface nil: typed nil vs nil interface в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-2","errors.Is vs ==","Middle", `<h3>Контекст</h3><p>Go: <b>errors.Is vs ==</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>errors.Is vs ==</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -A2</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -A2 error | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n errors.Is main.go | head -10", "check output", "warn"],
 ["^sed -i s/'err == io.EOF'/'errors.Is(err, io.EOF)'/ main.go", "fixed", "ok"],
 ["^go test ./... 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -A2 error | head -10",l:"диагностика"},
 {re:"^sed -i s/'err == io.EOF'/'errors.Is(err, io.EOF)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: errors.Is vs == в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-3","errors.As unwrap","Senior", `<h3>Контекст</h3><p>Go: <b>errors.As unwrap</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>errors.As unwrap</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -A2</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -A2 error | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n errors.Is main.go | head -10", "check output", "warn"],
 ["^sed -i s/'err == io.EOF'/'errors.Is(err, io.EOF)'/ main.go", "fixed", "ok"],
 ["^go test ./... 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -A2 error | head -10",l:"диагностика"},
 {re:"^sed -i s/'err == io.EOF'/'errors.Is(err, io.EOF)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: errors.As unwrap в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-4","generics: type constraint comparable","Junior", `<h3>Контекст</h3><p>Go: <b>generics: type constraint comparable</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>generics: type constraint comparable</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -i </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -i generic | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n \"comparable\" main.go | head -10", "check output", "warn"],
 ["^sed -i s/'func Max'/'func Max[T comparable]'/ main.go", "fixed", "ok"],
 ["^go build ./... 2>&1 | head -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -i generic | head -10",l:"диагностика"},
 {re:"^sed -i s/'func Max'/'func Max[T comparable]'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: generics: type constraint comparable в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-5","generics: any vs interface{}","Middle", `<h3>Контекст</h3><p>Go: <b>generics: any vs interface{}</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>generics: any vs interface{}</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | head -20</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^go vet ./... 2>&1 | head -20", "check output", "warn"],
 ["^sed -i s/var s/interface fix/ main.go", "fixed", "ok"],
 ["^go run main.go 2>&1 | grep -i nil | head -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/var s/interface fix/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: generics: any vs interface{} в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-6","escape analysis: variable escapes to heap","Senior", `<h3>Контекст</h3><p>Go: <b>escape analysis: variable escapes to heap</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>escape analysis: variable escapes to heap</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go build -gcflags=-m main.go 2</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go build -gcflags=-m main.go 2>&1 | grep -i escape | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^go run -gcflags=-m main.go 2>&1 | grep heap | head -10", "check output", "warn"],
 ["^sed -i s/'new(int)'/'int'/ main.go", "fixed", "ok"],
 ["^go build -gcflags=-m main.go 2>&1 | grep -i \"escapes to heap\" | head -5", "ok verified", "ok"]
],
[{re:"^go build -gcflags=-m main.go 2>&1 | grep -i escape | head -10",l:"диагностика"},
 {re:"^sed -i s/'new(int)'/'int'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: escape analysis: variable escapes to heap в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-7","goroutine leak: not closed channel","Junior", `<h3>Контекст</h3><p>Go: <b>goroutine leak: not closed channel</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>goroutine leak: not closed channel</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go test -run TestLeak -count=1</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go test -run TestLeak -count=1 2>&1 | head -20", "diagnostic output: error or mismatch", "err"],
 ["^go vet -run TestLeak 2>&1 | head -10", "check output", "warn"],
 ["^sed -i s/'go func()'/'go func(ctx context.Context)'/ main.go", "fixed", "ok"],
 ["^go test -run TestLeak -count=1 2>&1 | grep -i leak | head -10", "ok verified", "ok"]
],
[{re:"^go test -run TestLeak -count=1 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'go func()'/'go func(ctx context.Context)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: goroutine leak: not closed channel в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-8","goroutine leak: context not cancelled","Middle", `<h3>Контекст</h3><p>Go: <b>goroutine leak: context not cancelled</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>goroutine leak: context not cancelled</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go test -run TestLeak -count=1</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go test -run TestLeak -count=1 2>&1 | head -20", "diagnostic output: error or mismatch", "err"],
 ["^go vet -run TestLeak 2>&1 | head -10", "check output", "warn"],
 ["^sed -i s/'go func()'/'go func(ctx context.Context)'/ main.go", "fixed", "ok"],
 ["^go test -run TestLeak -count=1 2>&1 | grep -i leak | head -10", "ok verified", "ok"]
],
[{re:"^go test -run TestLeak -count=1 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'go func()'/'go func(ctx context.Context)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: goroutine leak: context not cancelled в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-9","channel: buffered vs unbuffered deadlock","Senior", `<h3>Контекст</h3><p>Go: <b>channel: buffered vs unbuffered deadlock</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>channel: buffered vs unbuffered deadlock</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -i </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -i deadlock | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n \"chan\" main.go | head -10", "check output", "warn"],
 ["^sed -i s/'ch := make(chan int)'/'ch := make(chan int, 10)'/ main.go", "fixed", "ok"],
 ["^go run main.go 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -i deadlock | head -10",l:"диагностика"},
 {re:"^sed -i s/'ch := make(chan int)'/'ch := make(chan int, 10)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: channel: buffered vs unbuffered deadlock в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-10","channel: close twice panic","Junior", `<h3>Контекст</h3><p>Go: <b>channel: close twice panic</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>channel: close twice panic</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -i </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -i deadlock | head -10", "diagnostic output: error or mismatch", "err"],
 ["^grep -n \"chan\" main.go | head -10", "check output", "warn"],
 ["^sed -i s/'ch := make(chan int)'/'ch := make(chan int, 10)'/ main.go", "fixed", "ok"],
 ["^go run main.go 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -i deadlock | head -10",l:"диагностика"},
 {re:"^sed -i s/'ch := make(chan int)'/'ch := make(chan int, 10)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: channel: close twice panic в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-11","context: WithTimeout 5s","Middle", `<h3>Контекст</h3><p>Go: <b>context: WithTimeout 5s</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>context: WithTimeout 5s</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -A2</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -A2 context | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n context.With main.go | head -10", "check output", "warn"],
 ["^sed -i s/'context.Background()'/'context.WithTimeout(context.Background(), 5*time.Second)'/ main.go", "fixed", "ok"],
 ["^go run main.go 2>&1 | grep -i timeout | head -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -A2 context | head -10",l:"диагностика"},
 {re:"^sed -i s/'context.Background()'/'context.WithTimeout(context.Background(), 5*time.Second)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: context: WithTimeout 5s в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-12","context: WithCancel propagate","Senior", `<h3>Контекст</h3><p>Go: <b>context: WithCancel propagate</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>context: WithCancel propagate</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -A2</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -A2 context | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n context.With main.go | head -10", "check output", "warn"],
 ["^sed -i s/'context.Background()'/'context.WithTimeout(context.Background(), 5*time.Second)'/ main.go", "fixed", "ok"],
 ["^go run main.go 2>&1 | grep -i timeout | head -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -A2 context | head -10",l:"диагностика"},
 {re:"^sed -i s/'context.Background()'/'context.WithTimeout(context.Background(), 5*time.Second)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: context: WithCancel propagate в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-13","pprof: heap 200MB top","Junior", `<h3>Контекст</h3><p>Go: <b>pprof: heap 200MB top</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>pprof: heap 200MB top</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go test -bench=. -cpuprofile c</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go test -bench=. -cpuprofile cpu.prof 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^go tool pprof -top cpu.prof 2>&1 | head -20", "check output", "warn"],
 ["^go tool pprof -list main cpu.prof 2>&1 | head -20", "fixed", "ok"],
 ["^go test -bench=. 2>&1 | grep -i bench | head -10", "ok verified", "ok"]
],
[{re:"^go test -bench=. -cpuprofile cpu.prof 2>&1 | head -20",l:"диагностика"},
 {re:"^go tool pprof -list main cpu.prof 2>&1 | head -20",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: pprof: heap 200MB top в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-14","pprof: goroutine 1000 blocked","Middle", `<h3>Контекст</h3><p>Go: <b>pprof: goroutine 1000 blocked</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>pprof: goroutine 1000 blocked</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go test -run TestLeak -count=1</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go test -run TestLeak -count=1 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^go vet -run TestLeak 2>&1 | head -10", "check output", "warn"],
 ["^sed -i s/'go func()'/'go func(ctx context.Context)'/ main.go", "fixed", "ok"],
 ["^go test -run TestLeak -count=1 2>&1 | grep -i leak | head -10", "ok verified", "ok"]
],
[{re:"^go test -run TestLeak -count=1 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'go func()'/'go func(ctx context.Context)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: pprof: goroutine 1000 blocked в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-15","bench: BenchmarkX 10 ns/op","Senior", `<h3>Контекст</h3><p>Go: <b>bench: BenchmarkX 10 ns/op</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>bench: BenchmarkX 10 ns/op</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go test -bench=. -benchmem 2>&</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go test -bench=. -benchmem 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n Benchmark main_test.go | head -10", "check output", "warn"],
 ["^sed -i s/'BenchmarkX'/'BenchmarkY'/ main_test.go", "fixed", "ok"],
 ["^go test -bench=Benchmark 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^go test -bench=. -benchmem 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'BenchmarkX'/'BenchmarkY'/ main_test.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: bench: BenchmarkX 10 ns/op в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-16","bench: parallel bench","Junior", `<h3>Контекст</h3><p>Go: <b>bench: parallel bench</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>bench: parallel bench</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go test -bench=. -benchmem 2>&</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go test -bench=. -benchmem 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n Benchmark main_test.go | head -10", "check output", "warn"],
 ["^sed -i s/'BenchmarkX'/'BenchmarkY'/ main_test.go", "fixed", "ok"],
 ["^go test -bench=Benchmark 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^go test -bench=. -benchmem 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'BenchmarkX'/'BenchmarkY'/ main_test.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: bench: parallel bench в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-17","vet: printf mismatch","Middle", `<h3>Контекст</h3><p>Go: <b>vet: printf mismatch</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>vet: printf mismatch</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go vet ./... 2>&1 | head -20</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go vet ./... 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^go vet -all ./... 2>&1 | head -20", "check output", "warn"],
 ["^sed -i s/'printf(\"%s\", 123)'/'printf(\"%d\", 123)'/ main.go", "fixed", "ok"],
 ["^go vet ./... 2>&1 | grep -c \"vet\" | head -5", "ok verified", "ok"]
],
[{re:"^go vet ./... 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'printf(\"%s\", 123)'/'printf(\"%d\", 123)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: vet: printf mismatch в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-18","vet: shadow variable","Senior", `<h3>Контекст</h3><p>Go: <b>vet: shadow variable</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>vet: shadow variable</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go vet ./... 2>&1 | head -20</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go vet ./... 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^go vet -all ./... 2>&1 | head -20", "check output", "warn"],
 ["^sed -i s/'printf(\"%s\", 123)'/'printf(\"%d\", 123)'/ main.go", "fixed", "ok"],
 ["^go vet ./... 2>&1 | grep -c \"vet\" | head -5", "ok verified", "ok"]
],
[{re:"^go vet ./... 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'printf(\"%s\", 123)'/'printf(\"%d\", 123)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: vet: shadow variable в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-19","controller: reconcile 3s timeout","Junior", `<h3>Контекст</h3><p>Go: <b>controller: reconcile 3s timeout</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>controller: reconcile 3s timeout</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>kubectl logs deploy/controller</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^kubectl logs deploy/controller -n prod 2>&1 | grep -i reconcile | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^kubectl get lease -n prod | grep controller | head -5", "check output", "warn"],
 ["^kubectl patch deploy controller -n prod -p '{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"restart\":\"now\"}}}}}'", "fixed", "ok"],
 ["^kubectl get pods -n prod -l app=controller | grep Running", "ok verified", "ok"]
],
[{re:"^kubectl logs deploy/controller -n prod 2>&1 | grep -i reconcile | head -10",l:"диагностика"},
 {re:"^kubectl patch deploy controller -n prod -p '{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"restart\":\"now\"}}}}}'",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: controller: reconcile 3s timeout в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-20","controller: leader election 15s lease","Middle", `<h3>Контекст</h3><p>Go: <b>controller: leader election 15s lease</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>controller: leader election 15s lease</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>kubectl logs deploy/controller</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^kubectl logs deploy/controller -n prod 2>&1 | grep -i reconcile | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^kubectl get lease -n prod | grep controller | head -5", "check output", "warn"],
 ["^kubectl patch deploy controller -n prod -p '{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"restart\":\"now\"}}}}}'", "fixed", "ok"],
 ["^kubectl get pods -n prod -l app=controller | grep Running", "ok verified", "ok"]
],
[{re:"^kubectl logs deploy/controller -n prod 2>&1 | grep -i reconcile | head -10",l:"диагностика"},
 {re:"^kubectl patch deploy controller -n prod -p '{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"restart\":\"now\"}}}}}'",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: controller: leader election 15s lease в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-21","interface: type assertion panic","Senior", `<h3>Контекст</h3><p>Go: <b>interface: type assertion panic</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>interface: type assertion panic</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | head -20</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | head -20", "diagnostic output: error or mismatch", "err"],
 ["^go vet ./... 2>&1 | head -20", "check output", "warn"],
 ["^sed -i s/var s/interface fix/ main.go", "fixed", "ok"],
 ["^go run main.go 2>&1 | grep -i nil | head -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/var s/interface fix/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: interface: type assertion panic в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-22","errors: wrap %w vs %v","Junior", `<h3>Контекст</h3><p>Go: <b>errors: wrap %w vs %v</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>errors: wrap %w vs %v</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -A2</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -A2 error | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n errors.Is main.go | head -10", "check output", "warn"],
 ["^sed -i s/'err == io.EOF'/'errors.Is(err, io.EOF)'/ main.go", "fixed", "ok"],
 ["^go test ./... 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -A2 error | head -10",l:"диагностика"},
 {re:"^sed -i s/'err == io.EOF'/'errors.Is(err, io.EOF)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: errors: wrap %w vs %v в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-23","generics: comparable map key","Middle", `<h3>Контекст</h3><p>Go: <b>generics: comparable map key</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>generics: comparable map key</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -i </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -i generic | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n \"comparable\" main.go | head -10", "check output", "warn"],
 ["^sed -i s/'func Max'/'func Max[T comparable]'/ main.go", "fixed", "ok"],
 ["^go build ./... 2>&1 | head -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -i generic | head -10",l:"диагностика"},
 {re:"^sed -i s/'func Max'/'func Max[T comparable]'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: generics: comparable map key в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-24","escape: slice append reallocate","Senior", `<h3>Контекст</h3><p>Go: <b>escape: slice append reallocate</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>escape: slice append reallocate</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go build -gcflags=-m main.go 2</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go build -gcflags=-m main.go 2>&1 | grep -i escape | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^go run -gcflags=-m main.go 2>&1 | grep heap | head -10", "check output", "warn"],
 ["^sed -i s/'new(int)'/'int'/ main.go", "fixed", "ok"],
 ["^go build -gcflags=-m main.go 2>&1 | grep -i \"escapes to heap\" | head -5", "ok verified", "ok"]
],
[{re:"^go build -gcflags=-m main.go 2>&1 | grep -i escape | head -10",l:"диагностика"},
 {re:"^sed -i s/'new(int)'/'int'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: escape: slice append reallocate в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-25","goroutine: WaitGroup Add before Go","Junior", `<h3>Контекст</h3><p>Go: <b>goroutine: WaitGroup Add before Go</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>goroutine: WaitGroup Add before Go</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go test -run TestLeak -count=1</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go test -run TestLeak -count=1 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^go vet -run TestLeak 2>&1 | head -10", "check output", "warn"],
 ["^sed -i s/'go func()'/'go func(ctx context.Context)'/ main.go", "fixed", "ok"],
 ["^go test -run TestLeak -count=1 2>&1 | grep -i leak | head -10", "ok verified", "ok"]
],
[{re:"^go test -run TestLeak -count=1 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'go func()'/'go func(ctx context.Context)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: goroutine: WaitGroup Add before Go в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-26","channel: select default non-blocking","Middle", `<h3>Контекст</h3><p>Go: <b>channel: select default non-blocking</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>channel: select default non-blocking</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -i </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -i deadlock | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n \"chan\" main.go | head -10", "check output", "warn"],
 ["^sed -i s/'ch := make(chan int)'/'ch := make(chan int, 10)'/ main.go", "fixed", "ok"],
 ["^go run main.go 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -i deadlock | head -10",l:"диагностика"},
 {re:"^sed -i s/'ch := make(chan int)'/'ch := make(chan int, 10)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: channel: select default non-blocking в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-27","context: Value key collision","Senior", `<h3>Контекст</h3><p>Go: <b>context: Value key collision</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>context: Value key collision</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -A2</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -A2 context | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n context.With main.go | head -10", "check output", "warn"],
 ["^sed -i s/'context.Background()'/'context.WithTimeout(context.Background(), 5*time.Second)'/ main.go", "fixed", "ok"],
 ["^go run main.go 2>&1 | grep -i timeout | head -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -A2 context | head -10",l:"диагностика"},
 {re:"^sed -i s/'context.Background()'/'context.WithTimeout(context.Background(), 5*time.Second)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: context: Value key collision в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-28","pprof: cpu 80% in json.Marshal","Junior", `<h3>Контекст</h3><p>Go: <b>pprof: cpu 80% in json.Marshal</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>pprof: cpu 80% in json.Marshal</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go test -bench=. -cpuprofile c</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go test -bench=. -cpuprofile cpu.prof 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^go tool pprof -top cpu.prof 2>&1 | head -20", "check output", "warn"],
 ["^go tool pprof -list main cpu.prof 2>&1 | head -20", "fixed", "ok"],
 ["^go test -bench=. 2>&1 | grep -i bench | head -10", "ok verified", "ok"]
],
[{re:"^go test -bench=. -cpuprofile cpu.prof 2>&1 | head -20",l:"диагностика"},
 {re:"^go tool pprof -list main cpu.prof 2>&1 | head -20",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: pprof: cpu 80% in json.Marshal в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-29","bench: memory b/alloc","Middle", `<h3>Контекст</h3><p>Go: <b>bench: memory b/alloc</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>bench: memory b/alloc</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go test -bench=. -benchmem 2>&</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go test -bench=. -benchmem 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n Benchmark main_test.go | head -10", "check output", "warn"],
 ["^sed -i s/'BenchmarkX'/'BenchmarkY'/ main_test.go", "fixed", "ok"],
 ["^go test -bench=Benchmark 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^go test -bench=. -benchmem 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'BenchmarkX'/'BenchmarkY'/ main_test.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: bench: memory b/alloc в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-30","vet: unreachable code","Senior", `<h3>Контекст</h3><p>Go: <b>vet: unreachable code</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>vet: unreachable code</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go vet ./... 2>&1 | head -20</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go vet ./... 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^go vet -all ./... 2>&1 | head -20", "check output", "warn"],
 ["^sed -i s/'printf(\"%s\", 123)'/'printf(\"%d\", 123)'/ main.go", "fixed", "ok"],
 ["^go vet ./... 2>&1 | grep -c \"vet\" | head -5", "ok verified", "ok"]
],
[{re:"^go vet ./... 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'printf(\"%s\", 123)'/'printf(\"%d\", 123)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: vet: unreachable code в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-31","controller: workqueue rate limiter","Junior", `<h3>Контекст</h3><p>Go: <b>controller: workqueue rate limiter</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>controller: workqueue rate limiter</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>kubectl logs deploy/controller</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^kubectl logs deploy/controller -n prod 2>&1 | grep -i reconcile | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^kubectl get lease -n prod | grep controller | head -5", "check output", "warn"],
 ["^kubectl patch deploy controller -n prod -p '{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"restart\":\"now\"}}}}}'", "fixed", "ok"],
 ["^kubectl get pods -n prod -l app=controller | grep Running", "ok verified", "ok"]
],
[{re:"^kubectl logs deploy/controller -n prod 2>&1 | grep -i reconcile | head -10",l:"диагностика"},
 {re:"^kubectl patch deploy controller -n prod -p '{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"restart\":\"now\"}}}}}'",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: controller: workqueue rate limiter в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-32","controller: owner reference GC","Middle", `<h3>Контекст</h3><p>Go: <b>controller: owner reference GC</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>controller: owner reference GC</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>kubectl logs deploy/controller</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^kubectl logs deploy/controller -n prod 2>&1 | grep -i reconcile | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^kubectl get lease -n prod | grep controller | head -5", "check output", "warn"],
 ["^kubectl patch deploy controller -n prod -p '{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"restart\":\"now\"}}}}}'", "fixed", "ok"],
 ["^kubectl get pods -n prod -l app=controller | grep Running", "ok verified", "ok"]
],
[{re:"^kubectl logs deploy/controller -n prod 2>&1 | grep -i reconcile | head -10",l:"диагностика"},
 {re:"^kubectl patch deploy controller -n prod -p '{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"restart\":\"now\"}}}}}'",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: controller: owner reference GC в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-33","interface: empty interface performance","Senior", `<h3>Контекст</h3><p>Go: <b>interface: empty interface performance</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>interface: empty interface performance</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | head -20</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^go vet ./... 2>&1 | head -20", "check output", "warn"],
 ["^sed -i s/var s/interface fix/ main.go", "fixed", "ok"],
 ["^go run main.go 2>&1 | grep -i nil | head -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/var s/interface fix/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: interface: empty interface performance в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-34","errors: multierror Join","Junior", `<h3>Контекст</h3><p>Go: <b>errors: multierror Join</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>errors: multierror Join</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -A2</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -A2 error | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n errors.Is main.go | head -10", "check output", "warn"],
 ["^sed -i s/'err == io.EOF'/'errors.Is(err, io.EOF)'/ main.go", "fixed", "ok"],
 ["^go test ./... 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -A2 error | head -10",l:"диагностика"},
 {re:"^sed -i s/'err == io.EOF'/'errors.Is(err, io.EOF)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: errors: multierror Join в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-35","generics: constraints.Ordered","Middle", `<h3>Контекст</h3><p>Go: <b>generics: constraints.Ordered</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>generics: constraints.Ordered</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -i </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -i generic | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n \"comparable\" main.go | head -10", "check output", "warn"],
 ["^sed -i s/'func Max'/'func Max[T comparable]'/ main.go", "fixed", "ok"],
 ["^go build ./... 2>&1 | head -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -i generic | head -10",l:"диагностика"},
 {re:"^sed -i s/'func Max'/'func Max[T comparable]'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: generics: constraints.Ordered в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-36","escape: defer in loop","Senior", `<h3>Контекст</h3><p>Go: <b>escape: defer in loop</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>escape: defer in loop</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go build -gcflags=-m main.go 2</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go build -gcflags=-m main.go 2>&1 | grep -i escape | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^go run -gcflags=-m main.go 2>&1 | grep heap | head -10", "check output", "warn"],
 ["^sed -i s/'new(int)'/'int'/ main.go", "fixed", "ok"],
 ["^go build -gcflags=-m main.go 2>&1 | grep -i \"escapes to heap\" | head -5", "ok verified", "ok"]
],
[{re:"^go build -gcflags=-m main.go 2>&1 | grep -i escape | head -10",l:"диагностика"},
 {re:"^sed -i s/'new(int)'/'int'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: escape: defer in loop в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-37","goroutine: worker pool 10","Junior", `<h3>Контекст</h3><p>Go: <b>goroutine: worker pool 10</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>goroutine: worker pool 10</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go test -run TestLeak -count=1</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go test -run TestLeak -count=1 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^go vet -run TestLeak 2>&1 | head -10", "check output", "warn"],
 ["^sed -i s/'go func()'/'go func(ctx context.Context)'/ main.go", "fixed", "ok"],
 ["^go test -run TestLeak -count=1 2>&1 | grep -i leak | head -10", "ok verified", "ok"]
],
[{re:"^go test -run TestLeak -count=1 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'go func()'/'go func(ctx context.Context)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: goroutine: worker pool 10 в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-38","channel: fan-in fan-out","Middle", `<h3>Контекст</h3><p>Go: <b>channel: fan-in fan-out</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>channel: fan-in fan-out</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -i </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -i deadlock | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n \"chan\" main.go | head -10", "check output", "warn"],
 ["^sed -i s/'ch := make(chan int)'/'ch := make(chan int, 10)'/ main.go", "fixed", "ok"],
 ["^go run main.go 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -i deadlock | head -10",l:"диагностика"},
 {re:"^sed -i s/'ch := make(chan int)'/'ch := make(chan int, 10)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: channel: fan-in fan-out в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-39","context: WithValue vs struct","Senior", `<h3>Контекст</h3><p>Go: <b>context: WithValue vs struct</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>context: WithValue vs struct</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -A2</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -A2 context | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n context.With main.go | head -10", "check output", "warn"],
 ["^sed -i s/'context.Background()'/'context.WithTimeout(context.Background(), 5*time.Second)'/ main.go", "fixed", "ok"],
 ["^go run main.go 2>&1 | grep -i timeout | head -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -A2 context | head -10",l:"диагностика"},
 {re:"^sed -i s/'context.Background()'/'context.WithTimeout(context.Background(), 5*time.Second)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: context: WithValue vs struct в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-40","pprof: trace 1s","Junior", `<h3>Контекст</h3><p>Go: <b>pprof: trace 1s</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>pprof: trace 1s</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go test -bench=. -cpuprofile c</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go test -bench=. -cpuprofile cpu.prof 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^go tool pprof -top cpu.prof 2>&1 | head -20", "check output", "warn"],
 ["^go tool pprof -list main cpu.prof 2>&1 | head -20", "fixed", "ok"],
 ["^go test -bench=. 2>&1 | grep -i bench | head -10", "ok verified", "ok"]
],
[{re:"^go test -bench=. -cpuprofile cpu.prof 2>&1 | head -20",l:"диагностика"},
 {re:"^go tool pprof -list main cpu.prof 2>&1 | head -20",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: pprof: trace 1s в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-41","bench: -benchmem","Middle", `<h3>Контекст</h3><p>Go: <b>bench: -benchmem</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>bench: -benchmem</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go test -bench=. -benchmem 2>&</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go test -bench=. -benchmem 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n Benchmark main_test.go | head -10", "check output", "warn"],
 ["^sed -i s/'BenchmarkX'/'BenchmarkY'/ main_test.go", "fixed", "ok"],
 ["^go test -bench=Benchmark 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^go test -bench=. -benchmem 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'BenchmarkX'/'BenchmarkY'/ main_test.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: bench: -benchmem в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-42","vet: vet -all","Senior", `<h3>Контекст</h3><p>Go: <b>vet: vet -all</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>vet: vet -all</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go vet ./... 2>&1 | head -20</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go vet ./... 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^go vet -all ./... 2>&1 | head -20", "check output", "warn"],
 ["^sed -i s/'printf(\"%s\", 123)'/'printf(\"%d\", 123)'/ main.go", "fixed", "ok"],
 ["^go vet ./... 2>&1 | grep -c \"vet\" | head -5", "ok verified", "ok"]
],
[{re:"^go vet ./... 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'printf(\"%s\", 123)'/'printf(\"%d\", 123)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: vet: vet -all в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-43","controller: status subresource","Junior", `<h3>Контекст</h3><p>Go: <b>controller: status subresource</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>controller: status subresource</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>kubectl logs deploy/controller</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^kubectl logs deploy/controller -n prod 2>&1 | grep -i reconcile | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^kubectl get lease -n prod | grep controller | head -5", "check output", "warn"],
 ["^kubectl patch deploy controller -n prod -p '{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"restart\":\"now\"}}}}}'", "fixed", "ok"],
 ["^kubectl get pods -n prod -l app=controller | grep Running", "ok verified", "ok"]
],
[{re:"^kubectl logs deploy/controller -n prod 2>&1 | grep -i reconcile | head -10",l:"диагностика"},
 {re:"^kubectl patch deploy controller -n prod -p '{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"restart\":\"now\"}}}}}'",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: controller: status subresource в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-44","controller: finalizer blocks delete","Middle", `<h3>Контекст</h3><p>Go: <b>controller: finalizer blocks delete</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>controller: finalizer blocks delete</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>kubectl logs deploy/controller</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^kubectl logs deploy/controller -n prod 2>&1 | grep -i reconcile | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^kubectl get lease -n prod | grep controller | head -5", "check output", "warn"],
 ["^kubectl patch deploy controller -n prod -p '{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"restart\":\"now\"}}}}}'", "fixed", "ok"],
 ["^kubectl get pods -n prod -l app=controller | grep Running", "ok verified", "ok"]
],
[{re:"^kubectl logs deploy/controller -n prod 2>&1 | grep -i reconcile | head -10",l:"диагностика"},
 {re:"^kubectl patch deploy controller -n prod -p '{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"restart\":\"now\"}}}}}'",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: controller: finalizer blocks delete в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-45","interface: io.Reader vs io.ReadCloser","Senior", `<h3>Контекст</h3><p>Go: <b>interface: io.Reader vs io.ReadCloser</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>interface: io.Reader vs io.ReadCloser</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | head -20</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^go vet ./... 2>&1 | head -20", "check output", "warn"],
 ["^sed -i s/var s/interface fix/ main.go", "fixed", "ok"],
 ["^go run main.go 2>&1 | grep -i nil | head -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/var s/interface fix/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: interface: io.Reader vs io.ReadCloser в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-46","errors: sentinel vs dynamic","Junior", `<h3>Контекст</h3><p>Go: <b>errors: sentinel vs dynamic</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>errors: sentinel vs dynamic</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -A2</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -A2 error | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n errors.Is main.go | head -10", "check output", "warn"],
 ["^sed -i s/'err == io.EOF'/'errors.Is(err, io.EOF)'/ main.go", "fixed", "ok"],
 ["^go test ./... 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -A2 error | head -10",l:"диагностика"},
 {re:"^sed -i s/'err == io.EOF'/'errors.Is(err, io.EOF)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: errors: sentinel vs dynamic в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-47","generics: type set ~int | ~int64","Middle", `<h3>Контекст</h3><p>Go: <b>generics: type set ~int | ~int64</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>generics: type set ~int | ~int64</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -i </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -i generic | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^grep -n \"comparable\" main.go | head -10", "check output", "warn"],
 ["^sed -i s/'func Max'/'func Max[T comparable]'/ main.go", "fixed", "ok"],
 ["^go build ./... 2>&1 | head -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -i generic | head -10",l:"диагностика"},
 {re:"^sed -i s/'func Max'/'func Max[T comparable]'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: generics: type set ~int | ~int64 в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-48","escape: string to []byte copy","Senior", `<h3>Контекст</h3><p>Go: <b>escape: string to []byte copy</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>escape: string to []byte copy</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go build -gcflags=-m main.go 2</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go build -gcflags=-m main.go 2>&1 | grep -i escape | head -10", "diagnostic output: error or mismatch", "warn"],
 ["^go run -gcflags=-m main.go 2>&1 | grep heap | head -10", "check output", "warn"],
 ["^sed -i s/'new(int)'/'int'/ main.go", "fixed", "ok"],
 ["^go build -gcflags=-m main.go 2>&1 | grep -i \"escapes to heap\" | head -5", "ok verified", "ok"]
],
[{re:"^go build -gcflags=-m main.go 2>&1 | grep -i escape | head -10",l:"диагностика"},
 {re:"^sed -i s/'new(int)'/'int'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: escape: string to []byte copy в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-49","goroutine: semaphore weighted","Junior", `<h3>Контекст</h3><p>Go: <b>goroutine: semaphore weighted</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>goroutine: semaphore weighted</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go test -run TestLeak -count=1</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go test -run TestLeak -count=1 2>&1 | head -20", "diagnostic output: error or mismatch", "warn"],
 ["^go vet -run TestLeak 2>&1 | head -10", "check output", "warn"],
 ["^sed -i s/'go func()'/'go func(ctx context.Context)'/ main.go", "fixed", "ok"],
 ["^go test -run TestLeak -count=1 2>&1 | grep -i leak | head -10", "ok verified", "ok"]
],
[{re:"^go test -run TestLeak -count=1 2>&1 | head -20",l:"диагностика"},
 {re:"^sed -i s/'go func()'/'go func(ctx context.Context)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: goroutine: semaphore weighted в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

S("Go","gc-go-50","channel: nil channel blocks forever","Middle", `<h3>Контекст</h3><p>Go: <b>channel: nil channel blocks forever</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>channel: nil channel blocks forever</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go run main.go 2>&1 | grep -i </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@go:~$",
[
 ["^go run main.go 2>&1 | grep -i deadlock | head -10", "diagnostic output: error or mismatch", "err"],
 ["^grep -n \"chan\" main.go | head -10", "check output", "warn"],
 ["^sed -i s/'ch := make(chan int)'/'ch := make(chan int, 10)'/ main.go", "fixed", "ok"],
 ["^go run main.go 2>&1 | tail -10", "ok verified", "ok"]
],
[{re:"^go run main.go 2>&1 | grep -i deadlock | head -10",l:"диагностика"},
 {re:"^sed -i s/'ch := make(chan int)'/'ch := make(chan int, 10)'/ main.go",l:"исправить"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: channel: nil channel blocks forever в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: диагностика → исправить"]});

