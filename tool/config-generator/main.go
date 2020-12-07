// config-generator is used to generate various files based on the config/ directory at the root of this repo.
package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path"

	qrterminal "github.com/mdp/qrterminal/v3"
	yaml "gopkg.in/yaml.v3"
	"moul.io/u"

	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

var (
	ConfigYML  = path.Join("config", "config.yml")
	ConfigJSON = path.Join("config", "config.gen.json")
	JSGlobal   = path.Join("js", "packages", "config", "global.gen.js")
	GoConfig   = path.Join("go", "internal", "config", "config.gen.go")
	TmpDir     = path.Join("config", ".tmp")
)

func main() {
	root := ".." // maybe should be dynamic or using getwd

	log.Printf("[+] parsing    %s", ConfigYML)
	var config protocoltypes.Config
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

import "encoding/json"
import "berty.tech/berty/v2/go/pkg/protocoltypes"

var Config protocoltypes.Config

// FIXME: make it more nicely
func init() {
        var input = %s
	err := json.Unmarshal([]byte(input), &Config)
	if err != nil {
		panic(err)
	}
}
`, "`\n"+u.PrettyJSON(config)+"`")
		p := path.Join(root, GoConfig)
		err := ioutil.WriteFile(p, []byte(output), 0o644)
		checkErr(err)
	}

	log.Printf("[+] generating QRcodes in .tmp dir")
	{
		p := path.Join(root, TmpDir)
		err := os.MkdirAll(p, 0o755)
		checkErr(err)
		for idx, contact := range config.Berty.Contacts {
			p := path.Join(root, TmpDir, fmt.Sprintf("qr-%s.txt", idx))
			f, err := os.OpenFile(p, os.O_RDWR|os.O_CREATE, 0755)
			checkErr(err)
			qrterminal.GenerateHalfBlock(contact.Link, qrterminal.L, f)
			fmt.Fprintln(f, contact.Link)
			f.Close()
		}
	}

	// TODO: generate .env file" for CI
}

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}
