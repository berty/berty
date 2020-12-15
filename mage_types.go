// +build mage

package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"path"
	"strings"
	"time"

	"github.com/blang/semver/v4"
	"github.com/magefile/mage/mg"
)

// TOREFACTOR: split hash-invalidation features from dependency-management features

type Rule interface {
	InfoPath() string // TODO: maybe rename infoPath to manifestPath or sumPath or lockPath or something else
	Implem() interface{}
	CacheManifest() (string, error)
	OutputString() (string, error)
}

// toolDef

type toolDef struct {
	name             string                               // tool name, this is what will be searched in PATH, also used for logging and cache paths
	versionArgs      []string                             // args to pass to the tool to print version informations to stdout
	versionTransform func(string) (semver.Version, error) // function used to transform the version output into a semantic version string
	semverRange      string                               // version range
}

func (t *toolDef) infoPath() string {
	return htgtInfoPath(fmt.Sprintf(".meta/tools/%s", t.name))
}

func (t *toolDef) info() (string, string, error) {
	return checkProgramGetVersionSemver(t.name, t.versionArgs, t.versionTransform)
}

func (t *toolDef) infoWrite() error {
	sver, p, err := t.info()
	if err != nil {
		return err
	}

	fmt.Printf("🔍 %s v%s @%s\n", t.name, sver, p)

	if t.semverRange != "" {
		srange, err := semver.ParseRange(t.semverRange)
		if err != nil {
			return err
		}
		svo, err := semver.Make(sver)
		if err != nil {
			return err
		}
		if !srange(svo) {
			return fmt.Errorf("version v%s not in range: %s", sver, t.semverRange)
		}
	}

	infop := t.infoPath()
	if err := os.MkdirAll(path.Dir(infop), os.ModePerm); err != nil {
		return err
	}
	return ioutil.WriteFile(infop, []byte(sver), os.ModePerm)
}

// mtarget

type mtarget struct {
	def    *targetDef
	implem interface{}
}

func (t *mtarget) InfoPath() string {
	return t.def.infoPath()
}

func (t *mtarget) Implem() interface{} {
	return t.implem
}

func (t *mtarget) CacheManifest() (string, error) {
	return t.def.cacheManifest()
}

func (t *mtarget) OutputString() (string, error) {
	return t.def.outputString()
}

var _ Rule = (*mtarget)(nil)

// mtool

type mtool struct {
	def    *toolDef
	implem interface{}
}

func (t *mtool) InfoPath() string {
	return t.def.infoPath()
}

func (t *mtool) Implem() interface{} {
	return t.implem
}

func (t *mtool) CacheManifest() (string, error) {
	return t.OutputString()
}

func (t *mtool) OutputString() (string, error) {
	sver, _, err := t.def.info()
	return sver, err
}

var _ Rule = (*mtool)(nil)

// targetDef

type targetDef struct {
	name      string        // rule name, used for logging, TODO: remove this field and use output
	output    string        // output path, can be a directory
	sources   []string      // filesystem deps, is a go glob list, folders will be recursed into
	mdeps     []Rule        // Rule dependencies TODO rename to rdeps
	deps      []interface{} // classic mage dependencies (functions) TODO rename to cdeps
	env       []string      // environment variables used in the rule, the values at build time will be added to the cache sum
	artifacts []string      // additonalOutputs, used for cache
	phony     bool          // rebuild every time
}

func (t *targetDef) infoPath() string {
	return htgtInfoPath(t.output)
}

func (t *targetDef) outputBytes() ([]byte, error) {
	// TODO: warn missing dep if file does not exists
	return ioutil.ReadFile(t.output)
}

func (t *targetDef) outputString() (string, error) {
	bytes, err := t.outputBytes()
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func (t *targetDef) outputWriteString(val string) error {
	return t.outputWrite([]byte(val))
}

func (t *targetDef) outputWrite(val []byte) error {
	// fmt.Printf("🤖 . ⬇️  %s\n", t.output)
	if err := os.MkdirAll(path.Dir(t.output), os.ModePerm); err != nil {
		return err
	}
	return ioutil.WriteFile(t.output, val, os.ModePerm)
}

func (t *targetDef) outputStringSlice() ([]string, error) {
	jsonBytes, err := t.outputBytes()
	if err != nil {
		return nil, err
	}
	var strs []string
	if err := json.Unmarshal(jsonBytes, &strs); err != nil {
		return nil, err
	}
	return strs, nil
}

func (t *targetDef) outputStringSliceWrite(args ...string) error {
	jsonBytes, err := json.Marshal(args)
	if err != nil {
		return err
	}
	return t.outputWrite(jsonBytes)
}

func (t *targetDef) cacheManifest() (string, error) {
	allSources := t.sources
	injected := make(map[string]string)
	for _, mdep := range t.mdeps {
		depMan, err := mdep.CacheManifest()
		if err != nil {
			return "", err
		}
		injected[mdep.InfoPath()] = stringBase64Sha3(depMan)
	}

	return htgtManifestGenerate(t.output, t.env, allSources, injected, true)
}

func (t *targetDef) runExecToOutput(name string, arg ...string) error {
	return t.runTarget(func(ih *implemHelper) error {
		parent := path.Dir(t.output)
		if _, err := os.Stat(parent); os.IsNotExist(err) {
			if err := os.MkdirAll(parent, os.ModePerm); err != nil {
				return err
			}
		}
		return ih.execToFile(t.output, name, arg...)
	})
}

func (t *targetDef) runTarget(implem func(*implemHelper) error) error {
	var allDeps []interface{}
	allSources := t.sources
	for _, mdep := range t.mdeps {
		allDeps = append(allDeps, mdep.Implem())
		allSources = append(allSources, mdep.InfoPath())
	}
	allDeps = append(allDeps, t.deps...)

	if os.Getenv("PRINT_CACHE_INFO") == "true" {
		m, err := t.cacheManifest()
		if err != nil {
			return err
		}
		fmt.Println(stringBase64Sha3(m))
		//fmt.Println(m)
		return nil
	}

	if os.Getenv("PRINT_CACHE_GA_JSON_PATHS") == "true" {
		paths := strings.Join(append([]string{t.output, t.infoPath()}, t.artifacts...), "\n")
		jsonBytes, err := json.Marshal(paths)
		if err != nil {
			return err
		}
		fmt.Println(string(jsonBytes))
		return nil
	}

	depsStart := time.Now()
	mg.Deps(allDeps...)
	depsEnd := time.Now()

	allOut := []byte(nil)
	var buildStart time.Time
	var buildEnd time.Time
	implemWrapper := func() error {
		if t.phony {
			fmt.Printf("🔨 %s: building (phony)\n", t.name)
		} else {
			fmt.Printf("🔨 %s: building\n", t.name)
		}

		in, out := io.Pipe()
		ch := make(chan struct{})
		go func() {
			defer close(ch)
			var err error
			if allOut, err = ioutil.ReadAll(in); err != nil {
				fmt.Printf("⚠ %s: read: %s\n", t.name, err.Error())
			}
		}()

		ih := newImplemHelper(out)

		buildStart = time.Now()
		err := implem(ih)
		buildEnd = time.Now()

		_ = out.Close()
		<-ch
		return err
	}

	if err := htgtTargetGlob(t.output, allSources, t.env, implemWrapper, t.phony); err == errUpToDate {
		fmt.Printf("ℹ️  %s: up-to-date\n", t.name)
		return nil
	} else if err != nil {
		if len(allOut) == 0 {
			return fmt.Errorf("❌ %s: %s", t.name, err.Error())
		}
		return fmt.Errorf("❌ %s: %s\n%s", t.name, err.Error(), string(allOut))
	}

	totalDuration := buildEnd.Sub(depsStart)
	implemDuration := buildEnd.Sub(buildStart)
	depsDuration := depsEnd.Sub(depsStart)
	fmt.Printf("✅ %s: built in %v (own: %v, deps: %v) \n", t.name, totalDuration, implemDuration, depsDuration)

	return nil
}

// implemHelper

type implemHelper struct {
	w io.Writer
}

func newImplemHelper(w io.Writer) *implemHelper {
	return &implemHelper{
		w: w,
	}
}

func (ih *implemHelper) exec(cmd string, args ...string) error {
	return ih.execWd("", cmd, args...)
}

func (ih *implemHelper) execWd(workDir string, cmd string, args ...string) error {
	return ih.execWdEnv(workDir, nil, cmd, args...)
}

func (ih *implemHelper) execEnv(env []string, cmd string, args ...string) error {
	return ih.execWdEnv("", env, cmd, args...)
}

func (ih *implemHelper) execWdEnv(workDir string, env []string, command string, args ...string) error {
	fmt.Println(strings.Join(append(append([]string{"🏃", path.Clean(workDir), "❯"}, env...), append([]string{command}, args...)...), " "))
	cmd := exec.Command(command, args...)
	cmd.Dir = workDir
	cmd.Stdout = ih.w
	cmd.Stderr = ih.w
	cmd.Env = append(os.Environ(), env...)
	return cmd.Run()
}

func (ih *implemHelper) execToFile(p string, name string, arg ...string) error {
	fmt.Println(strings.Join(append([]string{"🏃", ".", "❯"}, append([]string{name}, arg...)...), " "), ">", p)
	file, err := os.OpenFile(p, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, os.ModePerm)
	if err != nil {
		return err
	}
	defer file.Close() // TODO: return error
	cmd := exec.Command(name, arg...)
	cmd.Stderr = ih.w
	cmd.Stdout = file
	return cmd.Run()
}

func (ih *implemHelper) getenvFallbackExec(key string, cmd string, args ...string) (string, error) {
	if val := os.Getenv(key); val != "" {
		return val, nil
	}
	val, err := ih.strExec(cmd, args...)
	if err != nil {
		return "", err
	}
	return val, nil
}

func (ih *implemHelper) strExec(name string, arg ...string) (string, error) {
	cmd := exec.Command(name, arg...)
	cmd.Stderr = ih.w
	out, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(out), nil
}
