package cmd

import (
	"context"
	"infratesting/config"
	"os"
	"os/signal"

	"gopkg.in/yaml.v3"
)

func contextHandleSignal(ctx context.Context, signals ...os.Signal) (context.Context, context.CancelFunc) {
	ctx, cancel := context.WithCancel(ctx)

	signal_chan := make(chan os.Signal, 1)
	signal.Notify(signal_chan, signals...)
	go func() {
		select {
		case <-ctx.Done():
		case <-signal_chan:
			cancel()
		}
	}()

	return ctx, func() {
		signal.Reset(signals...)
		cancel()

	}
}
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
