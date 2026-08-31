package main

import (
	"fmt"
	"os"
)

var global = "константа верхнего уровня" // видим в пакете

func main() {
	name := "api"       // короткое объявление (только внутри функций)
	var port int = 8080 // явное
	var timeout float64 // нулевое значение: 0 (не nil!)
	var enabled bool    // false
	var host string     // "" (пустая строка)
	fmt.Println(name, port, timeout, enabled, host == "")

	// Нулевые значения — Go НИКОГДА не даёт «мусор»: int=0, string="", slice=nil, map=nil
	if len(os.Args) > 1 {
		fmt.Println("args:", os.Args[1], os.Args[2])
	}
}
