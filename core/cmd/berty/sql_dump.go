package main

import (
	"encoding/json"
	"fmt"

	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"

	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	"berty.tech/core/sql"
	"berty.tech/core/sql/sqlcipher"
)

type sqlDumpOptions struct {
	sql         sqlOptions `mapstructure:"sql"`
	autoPreload bool       `mapstructure:"auto-preload"`
}

func sqlDumpSetupFlags(flags *pflag.FlagSet, opts *sqlDumpOptions) {
	flags.BoolVar(&opts.autoPreload, "auto-preload", false, "preload associations")
	_ = viper.BindPFlags(flags)
}

func newSQLDumpCommand() *cobra.Command {
	// sql dump
	opts := &sqlDumpOptions{}
	cmd := &cobra.Command{
		Use: "dump",
		RunE: func(cmd *cobra.Command, args []string) error {
			return sqlDump(opts)
		},
	}
	sqlDumpSetupFlags(cmd.Flags(), opts)
	sqlSetupFlags(cmd.Flags(), &opts.sql)
	return cmd
}

func sqlDump(opts *sqlDumpOptions) error {
	// initialize sql
	db, err := sqlcipher.Open(opts.sql.path, []byte(opts.sql.key))
	if err != nil {
		return errors.Wrap(err, "failed to open sqlcipher")
	}
	defer db.Close()
	if db, err = sql.Init(db); err != nil {
		return errors.Wrap(err, "failed to initialize sql")
	}

	db = db.Set("gorm:auto_preload", opts.autoPreload)

	dump := struct {
		Config              entity.Config               `json:"config"`
		Contacts            []entity.Contact            `json:"contacts"`
		Events              []p2p.Event                 `json:"events"`
		Conversations       []entity.Conversation       `json:"conversations"`
		ConversationMembers []entity.ConversationMember `json:"conversation_members"`
		Devices             []entity.Device             `json:"devices"`
	}{
		Contacts:            []entity.Contact{},
		Events:              []p2p.Event{},
		Conversations:       []entity.Conversation{},
		ConversationMembers: []entity.ConversationMember{},
		Devices:             []entity.Device{},
	}

	// fetch entities
	if err := db.Set("gorm:auto_preload", false).Find(&dump.Config).Error; err != nil {
		return err
	}
	if err := db.Find(&dump.Contacts).Error; err != nil {
		return err
	}
	if err := db.Find(&dump.Conversations).Error; err != nil {
		return err
	}
	if err := db.Find(&dump.ConversationMembers).Error; err != nil {
		return err
	}
	if err := db.Find(&dump.Devices).Error; err != nil {
		return err
	}
	if err := db.Find(&dump.Events).Error; err != nil {
		return err
	}

	// rendering
	out, err := json.MarshalIndent(dump, "", "  ")
	if err != nil {
		return errors.Wrap(err, "failed to marshal the dump")
	}
	fmt.Println(string(out))

	return nil
}
