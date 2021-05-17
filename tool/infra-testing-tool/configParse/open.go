package configParse

import "os"

func OpenConfig(filename string) (b []byte, err error) {
	f, err := os.OpenFile(filename, os.O_RDONLY, 0775)
	if err != nil {
		return nil, err
	}

	stat, err := f.Stat()
	if err != nil {
		return nil, err
	}

	b = make([]byte, stat.Size())
	_, err = f.Read(b)

	return b, err
}

