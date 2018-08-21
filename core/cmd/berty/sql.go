package main

import (
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
)

type sqlOptions struct {
	path string
	key  string
}

func sqlSetupFlags(flags *pflag.FlagSet, opts *sqlOptions) {
	flags.StringVarP(&opts.key, "sql-key", "", "s3cur3", "sqlcipher database encryption key")
	flags.StringVarP(&opts.path, "sql-path", "", "/tmp/berty.db", "sqlcipher database path")
}

func newSQLCommand() *cobra.Command {
	// sql (root)
	cmd := &cobra.Command{
		Use: "sql",
	}
	cmd.AddCommand(newSQLDumpCommand())
	return cmd
}
