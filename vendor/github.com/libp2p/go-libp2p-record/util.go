package record

import (
	"strings"
)

// SplitKey takes a key in the form `/$namespace/$path` and splits it into
// `$namespace` and `$path`.
func SplitKey(key string) (string, string, error) {
	if len(key) == 0 || key[0] != '/' {
		return "", "", ErrInvalidRecordType
	}

	key = key[1:]

	i := strings.IndexByte(key, '/')
	if i <= 0 {
		return "", "", ErrInvalidRecordType
	}

	return key[:i], key[i+1:], nil
}
