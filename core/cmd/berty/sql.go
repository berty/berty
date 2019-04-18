package main

import (
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

type sqlOptions struct {
	path string `mapstructure:"path"`
	name string `mapstructure:"name"`
	key  string `mapstructure:"key"`
}

func sqlSetupFlags(flags *pflag.FlagSet, opts *sqlOptions) {
	flags.StringVarP(&opts.path, "storage-path", "", "/tmp/berty", "storage path")
	flags.StringVarP(&opts.key, "sql-key", "", "s3cur3", "sqlcipher database encryption key")
	flags.StringVarP(&opts.name, "sql-name", "", "berty.state.db", "db name (relative to storage path)")
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
