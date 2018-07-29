package test

import (
	"encoding/json"
	"fmt"
)

func jsonPrint(i interface{}) {
	out, _ := json.Marshal(i)
	fmt.Println(string(out))
}

func jsonPrintIndent(i interface{}) {
	out, _ := json.MarshalIndent(i, "", "  ")
	fmt.Println(string(out))
}
