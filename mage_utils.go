// +build mage

package main

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"path"
	"regexp"
	"strings"
	"time"
	"unicode"

	"github.com/blang/semver/v4"
)

func tmp() string {
	tmp := os.Getenv("TMP")
	if tmp == "" {
		tmp = os.Getenv("TMPDIR")
	}
	if tmp == "" {
		tmp = "/tmp"
	}
	return path.Clean(tmp)
}

func wget(ctx context.Context, url string) (io.ReadCloser, error) {
	fmt.Printf("🌏 . ➡️  %s\n", url)
	return _wget(ctx, url)
}

func _wget(ctx context.Context, url string) (io.ReadCloser, error) {
	request, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	ctx, cancel_func := context.WithCancel(ctx)
	request = request.WithContext(ctx)

	response, err := http.DefaultClient.Do(request)
	if err != nil {
		cancel_func()
		return nil, err
	}

	if response.StatusCode != 200 {
		cancel_func()
		return nil, fmt.Errorf("INVALID RESPONSE; status: %s", response.Status)
	}

	return response.Body, nil
}

func wdl(ctx context.Context, url string, path string) error {
	fmt.Printf("🌏 . ⬇️  %s > %s\n", url, path)

	file, err := os.OpenFile(path, os.O_TRUNC|os.O_WRONLY|os.O_CREATE, os.ModePerm)
	if err != nil {
		return err
	}
	defer file.Close()

	stream, err := _wget(ctx, url)
	if err != nil {
		return err
	}
	defer stream.Close()

	_, err = io.Copy(file, stream)
	return err
}

func grepo(in io.Reader, arg string) io.Reader {
	re := regexp.MustCompile(arg)
	ret, out := io.Pipe()
	scanner := bufio.NewScanner(in)

	fmt.Printf("🤖 . grep -o %s\n", arg)

	go func() {
		for scanner.Scan() {
			line := scanner.Text()
			if match := re.FindString(line); match != "" {
				if _, err := out.Write([]byte(match + "\n")); err != nil {
					if cErr := out.CloseWithError(err); cErr != nil {
						fmt.Errorf("grepo: close on write error: %s\nhad: %s", cErr.Error(), err.Error())
					}
					return
				}
			}
		}
		if err := out.Close(); err != nil {
			fmt.Errorf("grepo: close: %s", err.Error())
		}
	}()

	return ret
}

func uniq(in io.Reader) io.Reader {
	ret, out := io.Pipe()
	scanner := bufio.NewScanner(in)
	m := make(map[string]struct{})

	fmt.Println("🤖 . uniq")

	go func() {
		for scanner.Scan() {
			line := scanner.Text()
			if line == "" {
				continue
			}
			if _, ok := m[line]; !ok {
				if _, err := out.Write([]byte(line + "\n")); err != nil {
					if cErr := out.CloseWithError(err); cErr != nil {
						fmt.Errorf("uniq: close on write error: %s\nhad: %s", cErr.Error(), err.Error())
						return
					}
				}
				m[line] = struct{}{}
			}
		}
		if err := out.Close(); err != nil {
			fmt.Errorf("uniq: close: %s", err.Error())
		}
	}()

	return ret
}

func rimraf(paths ...string) error {
	fmt.Printf("🤖 . 💣 %s\n", strings.Join(paths, " "))
	for _, p := range paths {
		if err := os.RemoveAll(p); err != nil {
			return err
		}
	}
	return nil
}

func osMkdirs(dirs ...string) error {
	dirs, _ = mapStrings(dirs, func(s string) (string, error) { return path.Clean(s), nil })
	fmt.Printf("🤖 . 🏠 %s\n", strings.Join(dirs, " "))
	for _, dir := range dirs {
		if err := os.MkdirAll(dir, os.ModePerm); err != nil {
			return err
		}
	}
	return nil
}

func osTouch(p string) error {
	p = path.Clean(p)
	fmt.Printf("🤖 . ✋ %s\n", p)
	_, err := os.Stat(p)
	if os.IsNotExist(err) {
		file, err := os.Create(p)
		if err != nil {
			return err
		}
		defer file.Close()
	} else {
		currentTime := time.Now().Local()
		err = os.Chtimes(p, currentTime, currentTime)
		if err != nil {
			return err
		}
	}
	return nil
}

func unitrim(str string) string {
	return strings.TrimFunc(str, unicode.IsSpace)
}

func checkProgramGetVersionSemver(name string, versionArgs []string, transform func(string) (semver.Version, error)) (string, string, error) {
	if transform == nil {
		transform = semver.Make
	}

	cmd := exec.Command("which", name)
	whichOut, err := cmd.CombinedOutput()
	if err != nil {
		return "", "", fmt.Errorf("❌ you must install `%s`\n%s\n%s", name, err.Error(), whichOut)
	}
	p := path.Clean(strings.TrimFunc(string(whichOut), unicode.IsSpace))

	verCmd := exec.Command(name, versionArgs...)
	verOut, err := verCmd.CombinedOutput()
	if err != nil {
		return "", p, fmt.Errorf("❌ checking %s: %s", name, err)
	}

	ver := strings.ReplaceAll(unitrim(string(verOut)), "\n", " ")
	sver, err := transform(ver)
	if err != nil {
		return "", p, fmt.Errorf("❌ checking %s: %s", name, err)
	}

	return sver.String(), p, nil
}

func buildWords(workDir string, command string, args ...string) ([]string, error) {
	fmt.Println(strings.Join(append([]string{"🏃", path.Join(".", workDir), "❯", command}, args...), " "))
	cmd := exec.Command(command, args...)
	cmd.Dir = path.Join(cmd.Dir, workDir)
	cmd.Stderr = os.Stderr
	out, err := cmd.Output()
	if err != nil {
		return nil, err
	}
	return strings.FieldsFunc(string(out), unicode.IsSpace), nil
}

func buildExecWdReader(dir string, command string, args ...string) (io.ReadCloser, error) {
	fmt.Println(strings.Join(append([]string{"🏃", ".", "❯", command}, args...), " "))
	cmd := exec.Command(command, args...)
	cmd.Dir = dir
	pipe, err := cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}
	cmd.Stderr = os.Stderr
	if err := cmd.Start(); err != nil {
		return nil, err
	}
	return pipe, err
}

func buildExecWdString(dir string, command string, args ...string) (string, error) {
	strm, err := buildExecWdReader(dir, command, args...)
	if err != nil {
		return "", err
	}
	b, err := ioutil.ReadAll(strm)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func buildExecWdSinkBytes(dir string, reader io.Reader, command string, args ...string) ([]byte, error) {
	fmt.Println(strings.Join(append([]string{"🏃", ".", "❯", command}, args...), " "))
	cmd := exec.Command(command, args...)
	cmd.Dir = dir
	cmd.Stdin = reader
	cmd.Stderr = os.Stderr
	return cmd.Output()
}

func buildExecSink(reader io.Reader, command string, args ...string) error {
	fmt.Println(strings.Join(append([]string{"🏃", ".", "❯", command}, args...), " "))
	cmd := exec.Command(command, args...)
	cmd.Stdin = reader
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func mapStrings(strings []string, transform func(string) (string, error)) ([]string, error) {
	mapped := make([]string, len(strings))
	for i, str := range strings {
		t, err := transform(str)
		if err != nil {
			return nil, err
		}
		mapped[i] = t
	}
	return mapped, nil
}
