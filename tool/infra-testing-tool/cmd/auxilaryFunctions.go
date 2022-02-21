package cmd

import (
	"gopkg.in/yaml.v3"
	"infratesting/config"
	"os"
)

func writeFile(content string, filename string) error {
	_, err := os.Stat(DefaultFolderName)
	if os.IsNotExist(err) {
		err = os.Mkdir(DefaultFolderName, 0777)
		if err != nil {
			return err
		}
	}

	f, err := os.Create(filename)
	if err != nil {
		return err
	}

	defer f.Close()

	_, err = f.WriteString(content)
	if err != nil {
		return err
	}

	return err
}

func loadConfig() (c config.Config, err error) {
	b, err := config.OpenConfig(DefaultStateFile)
	if err != nil {
		return c, err
	}

	err = yaml.Unmarshal(b, &c)
	if err != nil {
		return c, err
	}

	return c, err
}
