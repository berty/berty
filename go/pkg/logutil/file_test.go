package logutil

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"moul.io/u"
)

func TestLogfile(t *testing.T) {
	// setup volatile directory for the test
	tempdir, err := ioutil.TempDir("", "logutil-file")
	require.NoError(t, err)
	defer os.RemoveAll(tempdir)

	// check loading log files from an invalid directory
	{
		files, err := LogfileList(filepath.Join(tempdir, "doesnotexist"))
		require.Error(t, err)
		require.Nil(t, files)
	}

	// check loading files from empty valid directory
	{
		files, err := LogfileList(tempdir)
		require.NoError(t, err)
		require.Empty(t, files)
	}

	// create dummy files
	{
		dummyNames := []string{
			"2021-05-25T21-12-02.650.log",
			"cli.info-2021-05-25T21-12-02.aaa.log",
			"blah.log",
		}
		for _, name := range dummyNames {
			f, err := os.Create(filepath.Join(tempdir, name))
			require.NoError(t, err)
			err = f.Close()
			require.NoError(t, err)
		}
	}

	// check loading files from valid directory with only dummy files
	{
		files, err := LogfileList(tempdir)
		require.NoError(t, err)
		require.Empty(t, files)
	}

	// create a first logger of kind-1
	{
		writer, err := newFileWriteCloser(tempdir, "kind-1")
		require.NoError(t, err)
		require.NotNil(t, writer)
		_, err = writer.Write([]byte("blah\n"))
		require.NoError(t, err)
		err = writer.Close()
		require.NoError(t, err)
	}

	// check loading files from the directory, should have one now
	{
		files, err := LogfileList(tempdir)
		require.NoError(t, err)
		require.Len(t, files, 1)
		require.Equal(t, files[0].Dir, tempdir)
		require.NotEmpty(t, files[0].Name)
		require.Equal(t, files[0].Path(), filepath.Join(tempdir, files[0].Name))
		require.True(t, u.FileExists(files[0].Path()))
		require.True(t, files[0].Latest)
		require.Equal(t, files[0].Kind, "kind-1")
	}

	// create a second logger of kind-1
	{
		time.Sleep(time.Second)
		writer, err := newFileWriteCloser(tempdir, "kind-1")
		require.NoError(t, err)
		require.NotNil(t, writer)
		_, err = writer.Write([]byte("blah blah\n"))
		require.NoError(t, err)
		err = writer.Close()
		require.NoError(t, err)
	}

	// check loading files from the directory, should have two now
	{
		files, err := LogfileList(tempdir)
		require.NoError(t, err)
		require.Len(t, files, 2)
		for _, file := range files {
			require.Equal(t, file.Dir, tempdir)
			require.NotEmpty(t, file.Name)
			require.Equal(t, file.Path(), filepath.Join(tempdir, file.Name))
			require.True(t, u.FileExists(file.Path()))
		}
	}

	// try to gc with fewer files than the limit
	{
		err := LogfileGC(tempdir, 10)
		require.NoError(t, err)
	}

	// create 10 new files
	{
		for i := 0; i < 10; i++ {
			writer, err := newFileWriteCloser(tempdir, fmt.Sprintf("hello-%d", i))
			require.NoError(t, err)
			err = writer.Close()
			require.NoError(t, err)
		}
	}

	// check loading files from the directory, should have twelve now
	{
		files, err := LogfileList(tempdir)
		require.NoError(t, err)
		require.Len(t, files, 12)
		for _, file := range files {
			require.Equal(t, file.Dir, tempdir)
			require.NotEmpty(t, file.Name)
			require.Equal(t, file.Path(), filepath.Join(tempdir, file.Name))
			require.True(t, u.FileExists(file.Path()))
		}
	}

	// try to gc with fewer files than the limit
	{
		err := LogfileGC(tempdir, 10)
		require.NoError(t, err)
	}

	// check loading files from the directory, should have ten now
	{
		files, err := LogfileList(tempdir)
		require.NoError(t, err)
		require.Len(t, files, 10)
	}

	// try to gc with the current amount of files
	{
		err := LogfileGC(tempdir, 10)
		require.NoError(t, err)
	}

	// check loading files from the directory, should still have ten
	{
		files, err := LogfileList(tempdir)
		require.NoError(t, err)
		require.Len(t, files, 10)
	}

	// try to gc with only one
	{
		err := LogfileGC(tempdir, 1)
		require.NoError(t, err)
	}

	// check loading files from the directory, should now have only one
	{
		files, err := LogfileList(tempdir)
		require.NoError(t, err)
		require.Len(t, files, 1)
	}
}
