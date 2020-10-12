package packingutil

import (
	"io"
	mrand "math/rand"
	"os"
	"runtime"
	"strconv"
	"sync"

	"github.com/fabiokung/shm"
	"github.com/markbates/pkger"
	"moul.io/srand"
)

// embedToSHM translate a pkger embedded file to a shared memory one.
func EmbedToSHM(path string) (*PseudoFile, error) {
	fname := strconv.FormatUint(mrand.New(mrand.NewSource(srand.SafeFast())).Uint64(), 36) // nolint:gosec
	f, err := shm.Open(fname, os.O_WRONLY|os.O_CREATE|os.O_EXCL|os.O_SYNC, 0o600)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	pf, err := pkger.Open(path)
	if err != nil {
		return nil, err
	}
	defer pf.Close()

	_, err = io.Copy(f, pf)
	if err != nil {
		shm.Unlink(fname) // nolint:errcheck
		return nil, err
	}

	r := &PseudoFile{
		name: f.Name(),
		link: fname,
	}
	runtime.SetFinalizer(r, terminate)
	return r, nil
}

type PseudoFile struct {
	link       string
	unlinkOnce sync.Once
	name       string
}

// Name returns the path of a pseudo file.
func (pf *PseudoFile) Name() string {
	return pf.name
}

func (pf *PseudoFile) Close() error {
	pf.unlinkOnce.Do(func() { shm.Unlink(pf.link) }) // nolint:errcheck
	return nil
}

func terminate(pf *PseudoFile) {
	pf.Close()
}
