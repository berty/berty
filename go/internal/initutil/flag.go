package initutil

import (
	"fmt"
	"strings"
)

type flagStringSlice []string

func (i *flagStringSlice) String() string {
	return fmt.Sprintf("%s", *i)
}

func (i *flagStringSlice) Set(value string) error {
	*i = append(*i, strings.Split(value, ",")...)
	return nil
}
