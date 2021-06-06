package cmd

import (
	"encoding/json"
	"fmt"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
	"infratesting/configParse"
	"strings"
)

var (
	generateCmd = &cobra.Command{
		Use: "generate",
		RunE: func(cmd *cobra.Command, args []string) error {

			b, err := configParse.OpenConfig(File)
			if err != nil {
				return err
			}

			switch strings.ToLower(OutputFmt) {
			case OutputFmtHCL:
				_, comp, err := configParse.Parse(b)
				if err != nil {
					return err
				}

				s := configParse.ToHCL(comp)
				fmt.Println(s)

			case OutputFmtJson:
				c, _, err := configParse.Parse(b)
				if err != nil {
					return err
				}

				s, err := json.MarshalIndent(c, "", "	")
				if err != nil {
					panic(err)
				}

				fmt.Println(string(s))

			case OutputFmtYaml:
				c, _, err := configParse.Parse(b)
				if err != nil {
					return err
				}

				s, err := yaml.Marshal(c)
				if err != nil {
					panic(err)
				}

				fmt.Println(string(s))
			}

			return nil
		},
	}
)
