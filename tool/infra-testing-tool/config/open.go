package config

import (
	"os"
)

// OpenConfig opens the filename and returns the content in bytes
func OpenConfig(filename string) (b []byte, err error) {
	f, err := os.OpenFile(filename, os.O_RDONLY, 0775)
	if err != nil {
		return b, err
	}

	stat, err := f.Stat()
	if err != nil {
		return nil, err
	}

	b = make([]byte, stat.Size())
	_, err = f.Read(b)

	return b, err
}
