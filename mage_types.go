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
	"path/filepath"
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
	Name() string
	Phony() bool
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

func (t *mtarget) Name() string {
	return t.def.name
}

func (t *mtarget) Phony() bool {
	return t.def.phony
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

func (t *mtool) Name() string {
	return t.def.name
}

func (t *mtool) Phony() bool {
	return true
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

// FIXME: refracto
func (t *targetDef) runTarget(implem func(*implemHelper) error) error {
	if os.Getenv("PRINT_CACHE_GA_JSON_PATHS") == "true" {
		paths := strings.Join(append([]string{t.output, t.infoPath()}, t.artifacts...), "\n")
		jsonBytes, err := json.Marshal(paths)
		if err != nil {
			return err
		}
		fmt.Println(string(jsonBytes))
		return nil
	}

	var allDeps []interface{}
	var stableDeps []interface{}
	var phonyDeps []interface{}
	allSources := t.sources
	for _, mdep := range t.mdeps {
		allDeps = append(allDeps, mdep.Implem())
		allSources = append(allSources, mdep.InfoPath())
		if mdep.Phony() {
			phonyDeps = append(phonyDeps, mdep.Implem())
		} else {
			stableDeps = append(stableDeps, mdep.Implem())
		}
	}
	allDeps = append(allDeps, t.deps...)

	depsStart := time.Now()
	mg.Deps(allDeps...)
	depsEnd := time.Now()

	if os.Getenv("PRINT_CACHE_INFO") == "true" {
		// YOU NEED TO RUN THIS ON A CLEAN BUILD
		// ^ FIXME: use "void" for stable (not phony) rules output hash even if the real manifest is present

		srcs := []string(nil)
		for _, g := range allSources {
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

		if t.phony {
			//fmt.Printf("🔨 %s: building (phony)\n", t.name)
			if err := implem(newImplemHelper(os.Stdout)); err != nil {
				return fmt.Errorf("❌ %s: %s", t.name, err.Error())
			}
			//fmt.Printf("✅ %s: built\n", t.name)
		}

		m, err := htgtManifestGenerate(t.output, t.env, srcs, nil, false)
		if err != nil {
			return err
		}
		//fmt.Printf("name: %s\nhash: %s\nmanifest: %s\n%s\n------\n", t.name, stringBase64Sha3(m), t.infoPath(), m)
		fmt.Println(stringBase64Sha3(m))
		return htgtManifestWritePath(t.output, t.env, srcs...)
	}

	allOut := []byte(nil)
	buildStart := time.Now()
	buildEnd := buildStart
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

		err := implem(ih)
		buildEnd = time.Now()

		_ = out.Close()
		<-ch
		return err
	}

	err := htgtTargetGlob(t.output, allSources, t.env, implemWrapper, t.phony)
	totalDuration := buildEnd.Sub(depsStart)
	implemDuration := buildEnd.Sub(buildStart)
	depsDuration := depsEnd.Sub(depsStart)
	if err == errUpToDate {
		fmt.Printf("ℹ️  %s: up-to-date\n", t.name)

		{
			// TODO: extract

			deps := make([]string, len(t.mdeps))
			for i, d := range t.mdeps {
				deps[i] = d.Name()
			}
			profile, err := json.Marshal(map[string]interface{}{
				"deps":           deps,
				"totalDuration":  totalDuration,
				"implemDuration": implemDuration,
				"depsDuration":   depsDuration,
				"upToDate":       true,
				"phony":          t.phony,
			})
			if err != nil {
				fmt.Printf("WARNING: failed to marshal profiling data for %s: %s\n", t.name, err.Error())
			}
			profilePath := path.Join(".build-info/.meta/profil", t.name)
			if err := os.MkdirAll(path.Dir(profilePath), os.ModePerm); err != nil {
				fmt.Printf("WARNING: failed to create profiling data dir %s: %s\n", t.name, err.Error())
			}
			if err := ioutil.WriteFile(profilePath, profile, os.ModePerm); err != nil {
				fmt.Printf("WARNING: failed to save profiling data %s: %s\n", t.name, err.Error())
			}
		}

		return nil
	} else if err != nil {
		var oerr error
		if len(allOut) == 0 {
			oerr = fmt.Errorf("❌ %s: %s", t.name, err.Error())
		} else {
			oerr = fmt.Errorf("❌ %s: %s\n%s", t.name, err.Error(), string(allOut))
		}

		{
			// TODO: extract

			deps := make([]string, len(t.mdeps))
			for i, d := range t.mdeps {
				deps[i] = d.Name()
			}
			profile, err := json.Marshal(map[string]interface{}{
				"deps":           deps,
				"totalDuration":  totalDuration,
				"implemDuration": implemDuration,
				"depsDuration":   depsDuration,
				"error":          oerr.Error(),
				"phony":          t.phony,
			})
			if err != nil {
				fmt.Printf("WARNING: failed to marshal profiling data for %s: %s\n", t.name, err.Error())
			}
			profilePath := path.Join(".build-info/.meta/profil", t.name)
			if err := os.MkdirAll(path.Dir(profilePath), os.ModePerm); err != nil {
				fmt.Printf("WARNING: failed to create profiling data dir %s: %s\n", t.name, err.Error())
			}
			if err := ioutil.WriteFile(profilePath, profile, os.ModePerm); err != nil {
				fmt.Printf("WARNING: failed to save profiling data %s: %s\n", t.name, err.Error())
			}
		}

		return oerr
	}

	add := ""
	if os.Getenv("BERTY_BUILD_VERBOSE") == "true" && len(allOut) > 0 {
		add = string(allOut)
		if len(add) != 0 && add[len(add)-1] != '\n' {
			add += "\n"
		}
	}
	fmt.Printf("%s✅ %s: built in %v (own: %v, deps: %v) \n", add, t.name, totalDuration, implemDuration, depsDuration)

	{
		// TODO: extract

		deps := make([]string, len(t.mdeps))
		for i, d := range t.mdeps {
			deps[i] = d.Name()
		}
		profile, err := json.Marshal(map[string]interface{}{
			"deps":           deps,
			"totalDuration":  totalDuration,
			"implemDuration": implemDuration,
			"depsDuration":   depsDuration,
			"phony":          t.phony,
		})
		if err != nil {
			fmt.Printf("WARNING: failed to marshal profiling data for %s: %s\n", t.name, err.Error())
		}
		profilePath := path.Join(".build-info/.meta/profil", t.name)
		if err := os.MkdirAll(path.Dir(profilePath), os.ModePerm); err != nil {
			fmt.Printf("WARNING: failed to create profiling data dir %s: %s\n", t.name, err.Error())
		}
		if err := ioutil.WriteFile(profilePath, profile, os.ModePerm); err != nil {
			fmt.Printf("WARNING: failed to save profiling data %s: %s\n", t.name, err.Error())
		}
	}

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
	_, _ = ih.w.Write([]byte(fmt.Sprintln(strings.Join(append(append([]string{"🏃", path.Clean(workDir), "❯"}, env...), append([]string{command}, args...)...), " "))))

	cmd := exec.Command(command, args...)
	cmd.Dir = workDir
	cmd.Stdout = ih.w
	cmd.Stderr = ih.w
	cmd.Env = append(os.Environ(), env...)

	return cmd.Run()
}

func (ih *implemHelper) execToFile(p string, name string, arg ...string) error {
	_, _ = ih.w.Write([]byte(fmt.Sprintln(strings.Join(append([]string{"🏃", ".", "❯"}, append([]string{name}, arg...)...), " "), ">", p)))

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
	if val := os.Getenv(key); len(val) > 0 {
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
