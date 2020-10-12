// config-generator is used to generate various files based on the config/ directory at the root of this repo.
package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"path"

	yaml "gopkg.in/yaml.v3"
	"moul.io/u"

	"berty.tech/berty/v2/go/pkg/bertytypes"
)

var (
	ConfigYML  = path.Join("config", "config.yml")
	ConfigJSON = path.Join("config", "config.gen.json")
	JSGlobal   = path.Join("js", "packages", "config", "global.gen.js")
	GoConfig   = path.Join("go", "internal", "config", "config.gen.go")
)

func main() {
	root := ".." // maybe should be dynamic or using getwd

	log.Printf("[+] parsing    %s", ConfigYML)
	var config bertytypes.Config
	{
		p := path.Join(root, ConfigYML)
		data, err := ioutil.ReadFile(p)
		checkErr(err)
		err = yaml.Unmarshal(data, &config)
		checkErr(err)
	}

	log.Printf("[+] generating %s", ConfigJSON)
	{
		p := path.Join(root, ConfigJSON)
		err := ioutil.WriteFile(p, []byte(u.PrettyJSON(config)), 0o644)
		checkErr(err)
	}

	log.Printf("[+] generating %s", JSGlobal)
	{
		output := fmt.Sprintf(`// file generated. see /config.
export const globals = %s;
`, u.PrettyJSON(config))
		p := path.Join(root, JSGlobal)
		err := ioutil.WriteFile(p, []byte(output), 0o644)
		checkErr(err)
	}

	log.Printf("[+] generating %s", GoConfig)
	{
		output := fmt.Sprintf(`// file generated. see /config.
package config

import "berty.tech/berty/v2/go/pkg/bertytypes"

var Config bertytypes.Config

// FIXME: make it more nicely
func init() {
	err := json.Unmarshal([]byte(%q), &Config)
	if err != nil {
		panic(err)
	}
}
`, u.JSON(config))
		p := path.Join(root, GoConfig)
		err := ioutil.WriteFile(p, []byte(output), 0o644)
		checkErr(err)
	}

	// TODO: generate go file"
	// TODO: generate .env file" for CI
	// TODO: generate qr images for READMEs
}

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}
