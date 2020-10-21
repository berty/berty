package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"reflect"

	"moul.io/u"
)

var (
	source = flag.String("source", "en/messages.json", "path to source file")
)

func main() {
	flag.Parse()

	b, err := ioutil.ReadFile(*source)
	checkErr(err)

	var object interface{}
	checkErr(json.Unmarshal(b, &object))
	patched := iterate(object, "")
	fmt.Println(u.PrettyJSON(patched))
}

func iterate(data interface{}, path string) interface{} {
	v := reflect.ValueOf(data)
	switch v.Kind() {
	case reflect.String:
		return path
	case reflect.Map:
		tmp := make(map[string]interface{})
		for _, k := range v.MapKeys() {
			tmp[k.String()] = iterate(v.MapIndex(k).Interface(), path+"."+k.String())
		}
		return tmp
	default:
		panic(fmt.Sprintf("unsupported data type: %q", v.Kind()))
	}
	return data
}

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}
