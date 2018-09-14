package main

import (
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

type sqlOptions struct {
	path string `mapstructure:"path"`
	key  string `mapstructure:"key"`
}

func sqlSetupFlags(flags *pflag.FlagSet, opts *sqlOptions) {
	flags.StringVarP(&opts.key, "sql-key", "", "s3cur3", "sqlcipher database encryption key")
	flags.StringVarP(&opts.path, "sql-path", "", "/tmp/berty.db", "sqlcipher database path")
	_ = viper.BindPFlags(flags)
}

func newSQLCommand() *cobra.Command {
	// sql (root)
	cmd := &cobra.Command{
		Use: "sql",
	}
	cmd.AddCommand(newSQLDumpCommand())
	return cmd
}
