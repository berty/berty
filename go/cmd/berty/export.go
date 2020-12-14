package main

import (
	"context"
	"flag"
	"fmt"
	"io"
	"os"

	"github.com/peterbourgon/ff/v3/ffcli"

	"berty.tech/berty/v2/go/pkg/messengertypes"
)

func exportCommand() *ffcli.Command {
	var exportPath *string

	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty export", flag.ExitOnError)
		fs.String("config", "", "config file (optional)")
		manager.SetupLoggingFlags(fs)              // also available at root level
		manager.SetupLocalMessengerServerFlags(fs) // by default, start a new local messenger server,
		manager.SetupRemoteNodeFlags(fs)           // but allow to set a remote server instead
		exportPath = fs.String("export-path", "", "path of the export tarball")
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "export",
		ShortUsage:     "berty [global flags] export [flags]",
		ShortHelp:      "export messenger data from the specified berty node",
		FlagSetBuilder: fsBuilder,
		Options:        ffSubcommandOptions(),
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			if len(args) > 0 {
				return flag.ErrHelp
			}

			if exportPath == nil || *exportPath == "" {
				return fmt.Errorf("no export path specified")
			}

			manager.DisableIPFSNetwork()

			// messenger
			messenger, err := manager.GetMessengerClient()
			if err != nil {
				return err
			}

			f, err := os.Create(*exportPath)
			if err != nil {
				return err
			}

			defer func() { _ = f.Close() }()

			cl, err := messenger.InstanceExportData(ctx, &messengertypes.InstanceExportData_Request{})
			if err != nil {
				return err
			}

			for {
				chunk, err := cl.Recv()
				if err != nil {
					if err == io.EOF {
						return nil
					}

					return err
				}

				if _, err := f.Write(chunk.ExportedData); err != nil {
					return err
				}
			}
		},
	}
}
