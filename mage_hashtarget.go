// +build mage

package main

import (
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"

	"golang.org/x/crypto/sha3"
)

func htgtTargetPath(name string, target string, sources []string, env []string, implem func() error, phony bool) error {
	// FIXME: race condition: if a source is modified externally while the rule is running, the written manifest could be desynced
	if newSources, err := htgtPath(target, env, sources...); err != nil || !newSources {
		if err != nil {
			return err
		}
		if !phony {
			return errUpToDate
		}
	}

	fmt.Printf("🔨 %s: building\n", name)

	if err := implem(); err != nil {
		return err
	}

	if err := htgtManifestWritePath(target, env, sources...); err != nil {
		return err
	}

	return nil
}

var errUpToDate = errors.New("up-to-date")

func htgtTargetGlob(name string, target string, globs []string, env []string, implem func() error, phony bool) error {
	srcs := []string{}
	for _, g := range globs {
		if !strings.ContainsRune(g, '*') {
			srcs = append(srcs, g)
			continue
		}
		matches, err := filepath.Glob(g)
		if err != nil {
			return err
		}
		srcs = append(srcs, matches...)
	}

	return htgtTargetPath(name, target, srcs, env, implem, phony)
}

func htgtInfoDir(target string) string {
	return path.Join(".build-info", path.Dir(target))
}

func htgtInfoPath(target string) string {
	return path.Join(htgtInfoDir(target), path.Base(target)+".txt")
}

func htgtGlob(target string, env []string, globs ...string) (bool, error) {
	srcs := []string{}
	for _, g := range globs {
		matches, err := filepath.Glob(g)
		if err != nil {
			return true, err
		}
		srcs = append(srcs, matches...)
	}
	return htgtPath(target, env, srcs...)
}

func htgtPath(target string, env []string, srcs ...string) (bool, error) {
	if !strings.HasPrefix(target, ".meta/") {
		if _, err := os.Stat(target); os.IsNotExist(err) {
			return true, nil
		}
	}

	targetManifest := htgtInfoPath(target)

	if _, err := os.Stat(targetManifest); err != nil && os.IsNotExist(err) {
		return true, nil
	}

	oldManif, err := ioutil.ReadFile(targetManifest)
	if err != nil {
		return true, err
	}

	newManif, err := htgtManifestGenerate(target, env, srcs, nil, false)
	if err != nil {
		return true, err
	}

	hasDiff := string(oldManif) != newManif
	if hasDiff {
		err := os.Remove(targetManifest)
		if err != nil {
			return true, err
		}
	}

	return hasDiff, nil
}

func htgtManifestWriteGlob(target string, env []string, globs ...string) error {
	srcs := []string{}
	for _, g := range globs {
		if !strings.ContainsRune(g, '*') {
			srcs = append(srcs, g)
			continue
		}
		matches, err := filepath.Glob(g)
		if err != nil {
			return err
		}
		srcs = append(srcs, matches...)
	}
	return htgtManifestWritePath(target, env, srcs...)
}

func htgtManifestWritePath(target string, env []string, srcs ...string) error {
	manif, err := htgtManifestGenerate(target, env, srcs, nil, false)
	if err != nil {
		return err
	}

	if err := os.MkdirAll(htgtInfoDir(target), os.ModePerm); err != nil {
		return err
	}

	return ioutil.WriteFile(htgtInfoPath(target), ([]byte)(manif), os.ModePerm)
}

func fileBase64Sha3(fp string) (string, error) {
	f, err := os.Open(fp)
	if err != nil {
		return "", err
	}

	h := sha3.New256()

	if _, err := io.Copy(h, f); err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(h.Sum([]byte{})), nil
}

func stringBase64Sha3(str string) string {
	h := sha3.Sum256([]byte(str))
	return base64.StdEncoding.EncodeToString(h[:])
}

func htgtManifestGenerate(target string, env []string, srcs []string, injected map[string]string, cacheMode bool) (string, error) {
	targetInfo, err := os.Stat(target)
	if err != nil && !os.IsNotExist(err) {
		return "", err
	}

	var sum string
	if os.IsNotExist(err) {
		sum = "void"
	} else if targetInfo.IsDir() {
		sum = "dir"
	} else {
		sum, err = fileBase64Sha3(target)
		if err != nil {
			return "", err
		}
	}

	manifestLines := []string(nil)
	if !cacheMode {
		manifestLines = append(manifestLines, "Output:", "", target, sum, "")
	}

	if len(env) > 0 {
		manifestLines = append(manifestLines, "Environment:", "")
		for _, key := range env {
			value := os.Getenv(key)
			manifestLines = append(manifestLines, key+"="+value)
		}
		manifestLines = append(manifestLines, "")
	}

	manifestLines = append(manifestLines, "Sources:", "")
	//srcs = removeDuplicatesUnordered(srcs)
	//sort.Strings(srcs)
	sums := make(map[string]string)
	for _, src := range srcs {
		if _, err := os.Stat(src); os.IsNotExist(err) {
			sums[path.Clean(src)] = "void"
			//manifestLines = append(manifestLines, "void "+path.Clean(src))
			continue
		}

		if err := filepath.Walk(src, func(p string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}

			if info.IsDir() {
				return nil
			}

			sum, err := fileBase64Sha3(p)
			if err != nil {
				return err
			}

			sums[path.Clean(p)] = sum
			//manifestLines = append(manifestLines, sum+" "+p)

			return nil
		}); err != nil {
			return "", err
		}
	}

	for k, v := range injected {
		sums[path.Clean(k)] = v
	}

	sumsKeys := strdictKeys(sums)
	sort.Strings(sumsKeys)
	for _, k := range sumsKeys {
		manifestLines = append(manifestLines, sums[k]+" "+k)
	}

	return strings.Join(manifestLines, "\n"), nil
}

func strdictKeys(sd map[string]string) []string {
	keys := []string(nil)
	for k := range sd {
		keys = append(keys, k)
	}
	return keys
}

func removeDuplicatesUnordered(elements []string) []string {
	// https://www.dotnetperls.com/duplicates-go

	encountered := map[string]bool{}

	// Create a map of all unique elements.
	for v := range elements {
		encountered[elements[v]] = true
	}

	// Place all keys from the map into a slice.
	result := []string{}
	for key, _ := range encountered {
		result = append(result, key)
	}
	return result
}
