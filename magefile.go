// +build mage

package main

import (
	"bufio"
	"context"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
	"unicode"

	"github.com/blang/semver/v4"
	"github.com/magefile/mage/mg" // mg contains helpful utility functions, like Deps
	"golang.org/x/crypto/sha3"
)

// config

const minimumAndroidVer = "21"
const minimumIOsVer = "12.0"
const requiredJavaVer = "18"

func extLdFlags() string {
	vcsRef := "olol"
	version := "zer"
	return fmt.Sprintf(`-ldflags="-X berty.tech/berty/v2/go/pkg/bertyversion.VcsRef=%s -X berty.tech/berty/v2/go/pkg/bertyversion.Version=%s"`, vcsRef, version)
}

//

var nodeModulesDef = &targetDef{
	name:    "NodeModules",
	output:  "js/node_modules",
	sources: []string{"js/package.json", "js/yarn.lock", "magefile.go"},
	mdeps:   []Rule{yarn, node},
	env:     []string{"CI"},
}

// Install node modules
func NodeModules() error {
	return nodeModulesDef.runTarget(func(ih *implemHelper) error {
		args := []string{"--non-interactive"}
		if os.Getenv("CI") == "true" {
			args = append(args, "--frozen-lockfile", "--network-timeout", "1200000", "--network-concurrency", "1")
		}

		if err := ih.execWd("js", "yarn", args...); err != nil {
			return err
		}

		return osTouch(nodeModulesDef.output)
	})
}

var nodeModules = &mtarget{nodeModulesDef, NodeModules}

/// go modules

var goModsDef = &targetDef{
	name:    "GoMods",
	output:  ".meta/GoMods",
	mdeps:   []Rule{goTool},
	sources: []string{"go.mod", "go.sum", "magefile.go"},
}

func GoMods() error {
	return goModsDef.runTarget(func(ih *implemHelper) error {
		return ih.exec("go", "mod", "download")
	})
}

var goMods = &mtarget{goModsDef, GoMods}

// pbjs flags

var pbjsFlagsDef = &targetDef{
	name:   "PbjsFlags",
	output: "js/.pbjs-flags.json",
	mdeps:  []Rule{goMods},
}

// Build common pbjs flags
func PbjsFlags() error {
	return pbjsFlagsDef.runTarget(func(_ *implemHelper) error {
		// Warning: this assumes that pbjs will be called in the js/ dir

		googleApi, err := buildExecWdString("js", "go", "list", "-m", "-modfile=../go.mod", "-mod=mod", "-f", "{{.Dir}}", "github.com/grpc-ecosystem/grpc-gateway")
		if err != nil {
			return err
		}
		if googleApi = strings.TrimFunc(googleApi+"/third_party/googleapis", unicode.IsSpace); googleApi == "" {
			return errors.New("empty googleApi protobuf path")
		}

		protobufApi, err := buildExecWdString("js", "go", "list", "-m", "-modfile=../go.mod", "-mod=mod", "-f", "{{.Dir}}", "github.com/gogo/protobuf")
		if err != nil {
			return err
		}
		if protobufApi = strings.TrimFunc(protobufApi, unicode.IsSpace); protobufApi == "" {
			return errors.New("empty protobufApi protobuf path")
		}

		args := []string{"--force-long", "-p", "../api", "-p", "node_modules/@googleapis/googleapis", "-p", googleApi, "-p", protobufApi, "-p", "node_modules/@protocolbuffers/protobuf/src"}

		return pbjsFlagsDef.outputStringSliceWrite(args...)
	})
}

var pbjsFlags = &mtarget{pbjsFlagsDef, PbjsFlags}

// pbjs

// the pbjs cli has an init phase that is not paralelisable
var pbjsDef = &targetDef{
	name:   "PbjsInit",
	output: ".meta/PbjsInit",
	mdeps:  []Rule{nodeModules, npx, pbjsFlags},
}

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

func PbjsInit() error {
	return pbjsDef.runTarget(func(ih *implemHelper) error {
		return ih.execWd("js", "npx", "pbjs", "--version", "-")
	})
}

var pbjs = &mtarget{pbjsDef, PbjsInit}

var pbjsProtos = []string{"../api/bertyaccount.proto", "../api/protocoltypes.proto", "../api/messengertypes.proto"}

var pbjsRootDef = &targetDef{
	name:    "PbjsRoot",
	output:  "js/packages/api/root.pb.js",
	sources: []string{"api/*.proto"},
	mdeps:   []Rule{pbjs},
}

// Build root protobuf javascript
func PbjsRoot() error {
	return pbjsRootDef.runTarget(func(ih *implemHelper) error {
		commonFlags, err := pbjsFlagsDef.outputStringSlice()
		if err != nil {
			return err
		}

		args := append([]string{"pbjs"}, commonFlags...)
		args = append(args,
			"--no-comments",
			"-t", "json-module",
			"-w", "es6",
			"-o", pbjsRootDef.output[len("js/"):],
		)
		args = append(args, pbjsProtos...)

		return ih.execWd("js", "npx", args...)
	})
}

var pbjsRoot = &mtarget{pbjsRootDef, PbjsRoot}

var pbtsRootDef = &targetDef{
	name:    "PbtsRoot",
	output:  "js/packages/api/root.pb.d.ts",
	sources: []string{"api/*.proto"},
	mdeps:   []Rule{pbjs},
}

// Build root protobuf typescript
func PbtsRoot() error {
	return pbtsRootDef.runTarget(func(_ *implemHelper) error {
		commonFlags, err := pbjsFlagsDef.outputStringSlice()
		if err != nil {
			return err
		}

		args := append([]string{"pbjs"}, commonFlags...)
		args = append(args, "-t", "static-module")
		args = append(args, pbjsProtos...)
		pbjsOut, err := buildExecWdReader("js", "npx", args...)
		if err != nil {
			return err
		}
		defer pbjsOut.Close()

		data, err := buildExecWdSinkBytes("js", pbjsOut, "npx", "pbts", "--no-comments", "-")
		if err != nil {
			return err
		}

		// json-module codegen doesn't support "new", so we remove the constructor declarations
		re := regexp.MustCompile(".*constructor.*\n")
		cleanedData := re.ReplaceAll(data, []byte(""))

		if err := ioutil.WriteFile(pbtsRootDef.output, cleanedData, os.ModePerm); err != nil {
			return err
		}

		return nil
	})
}

var pbtsRoot = &mtarget{pbtsRootDef, PbtsRoot}

// clients types

const genWelshClientsSrc = "js/packages/grpc-bridge/gen-clients.js"

var welshClientsTypesDef = &targetDef{
	name:    "WelshClientsTypes",
	output:  "js/packages/grpc-bridge/welsh-clients.gen.ts",
	sources: []string{"magefile.go", genWelshClientsSrc},
	mdeps:   []Rule{nodeModules, pbjsRoot, npx},
}

// Build protobuf welsh clients types
func WelshClientsTypes() error {
	return welshClientsTypesDef.runTarget(func(ih *implemHelper) error {
		const c = "npx"
		const workDir = "js"

		output := welshClientsTypesDef.output

		args := []string{"babel-node", genWelshClientsSrc[len("js/"):]}

		cmd := exec.Command(c, args...)
		cmd.Dir = "js"
		cmd.Stderr = os.Stderr

		fmt.Println(strings.Join(append([]string{"🏃", path.Join(".", workDir), "❯", c}, args...), " "), ">", output[len("js/"):])
		out, err := cmd.Output()
		if err != nil {
			return err
		}

		if err := ioutil.WriteFile(output, out, os.ModePerm); err != nil {
			return err
		}

		if err := ih.execWd("js", "npx", "eslint", "--no-ignore", "--fix", output[len("js/"):]); err != nil {
			return err
		}

		return nil
	})
}

var welshClientsTypes = &mtarget{welshClientsTypesDef, WelshClientsTypes}

//

const genStoreTypesSrc = "js/packages/store/gen-type-utils.js"

var storeTypesDef = &targetDef{
	name:    "StoreTypes",
	output:  "js/packages/store/types.gen.ts",
	sources: []string{genStoreTypesSrc},
	mdeps:   []Rule{nodeModules, pbjsRoot, npx},
}

// Build javascript store types
func StoreTypes() error {
	return storeTypesDef.runTarget(func(ih *implemHelper) error {
		src := genStoreTypesSrc[len("js/"):]
		output := storeTypesDef.output

		args := []string{"babel-node", src}
		const c = "npx"
		const workDir = "js"

		cmd := exec.Command(c, args...)
		cmd.Dir = workDir
		cmd.Stderr = os.Stderr

		fmt.Println(strings.Join(append([]string{"🏃", path.Join(".", workDir), "❯", c}, args...), " "), ">", output[len("js/"):])
		out, err := cmd.Output()
		if err != nil {
			return err
		}

		if err := ioutil.WriteFile(output, out, os.ModePerm); err != nil {
			return err
		}

		return ih.execWd("js", "npx", "eslint", "--no-ignore", "--fix", output[len("js/"):])
	})
}

var storeTypes = &mtarget{storeTypesDef, StoreTypes}

//

var frontGenDef = &targetDef{
	name:    "FrontGen",
	output:  ".meta/FrontGen",
	sources: []string{},
	mdeps:   []Rule{storeTypes, welshClientsTypes, pbjsRoot, pbtsRoot},
}

// Build javascript and typescript generated files
func FrontGen() error { return frontGenDef.runTarget(func(_ *implemHelper) error { return nil }) }

var frontGen = &mtarget{frontGenDef, FrontGen}

//

var gomobileDef = &targetDef{
	name:   "Gomobile",
	output: ".meta/GomobileInit",
	mdeps:  []Rule{goMods},
}

// Initialize gomobile
func GomobileInit() error {
	return gomobileDef.runTarget(func(ih *implemHelper) error {
		return ih.exec("go", "run", "golang.org/x/mobile/cmd/gomobile", "init")
	})
}

var gomobile = &mtarget{gomobileDef, GomobileInit}

//

var androidFrameworkDef = &targetDef{
	name:    "AndroidFramework",
	output:  "js/android/libs/gobridge.aar",
	sources: []string{"go"},
	mdeps:   []Rule{gomobile},
}

// Build android gomobile framework
func AndroidFramework() error {
	return androidFrameworkDef.runTarget(func(ih *implemHelper) error {
		if err := osMkdirs("js/android/libs"); err != nil {
			return err
		}

		cachePath, err := filepath.Abs("js/android/.gomobile-cache")
		if err != nil {
			return err
		}

		env := []string{"GO111MODULE=on"}
		if err := ih.execEnv(env, "go", "run", "golang.org/x/mobile/cmd/gomobile", "bind",
			"-v",
			extLdFlags(),
			"-o", androidFrameworkDef.output,
			"-cache", cachePath,
			"-target", "android",
			"-androidapi", minimumAndroidVer,
			"./go/framework/bertybridge",
		); err != nil {
			return err
		}

		if err := osTouch(androidFrameworkDef.output); err != nil {
			return err
		}

		return nil
	})
}

var androidFramework = &mtarget{androidFrameworkDef, AndroidFramework}

// Android App

var androidDebugDef = &targetDef{
	name:   "AndroidDebug",
	output: ".meta/AndroidDebug",
	mdeps:  []Rule{frontGen, androidFramework, npx, java},
	env:    []string{"ANDROID_DEVICE", "METRO_RN_PORT"},
}

// Build and run debug android app
func AndroidDebug() error {
	return androidDebugDef.runTarget(func(ih *implemHelper) error {
		args := []string{"react-native", "run-android",
			"--no-packager",
			"--port", metroRnPort(),
			"--variant", "Debug",
			"--appIdSuffix", "debug",
		}
		if androidDevice := os.Getenv("ANDROID_DEVICE"); androidDevice != "" {
			args = append(args, "--deviceId", androidDevice)
		}
		return ih.execWd("js", "npx", args...)
	})
}

// Force to reinstall the android app
func AndroidDebugRe() error {
	if err := os.Remove(androidDebugDef.infoPath()); err != nil {
		return err
	}

	mg.Deps(AndroidDebug)

	return nil
}

// metro

// Run metro in foreground (first kill program running on port if any)
func MetroStart() error {
	mg.Deps(CheckNpx, NodeModules, FrontGen)

	ih := newImplemHelper(os.Stdout)

	// $(call kill-program-using-port, $(METRO_RN_PORT))
	return ih.execWd("js", "npx", "react-native", "start",
		"--port", metroRnPort(),
	)
}

func metroRnPort() string {
	r := os.Getenv("METRO_RN_PORT")
	if r == "" {
		r = "8081"
	}
	return r
}

// go-libtor version

var torVersionDef = &targetDef{
	name:   "TorVersion",
	output: "js/ios/.tor-version",
	mdeps:  []Rule{goMods},
}

// Extract tor version from go module
func TorVersion() error {
	return torVersionDef.runTarget(func(_ *implemHelper) error {
		// implem buildString
		words, err := buildWords("", "go", "list", "-mod=readonly", "-modfile=go.mod", "-f", "{{.Version}}", "-m", "berty.tech/go-libtor")
		if err != nil {
			return err
		}

		goLibtorVer := ""
		if len(words) > 0 {
			goLibtorVer = words[0]
		}

		return ioutil.WriteFile(torVersionDef.output, []byte(goLibtorVer), os.ModePerm)
	})
}

var torVersion = &mtarget{torVersionDef, TorVersion}

// iOS tor libs

var iOSTorDef = &targetDef{
	name:   "IOSTor",
	output: "js/ios/tor-deps",
	mdeps:  []Rule{torVersion, tar},
}

// Fetch tor for iOS
func IOSTor(ctx context.Context) error {
	return iOSTorDef.runTarget(func(ih *implemHelper) error {
		versionBytes, err := ioutil.ReadFile(torVersion.def.output)
		if err != nil {
			return err
		}
		version := string(versionBytes)

		tmp := tmp() + "/tor-deps/ios"
		if err := osMkdirs(iOSTorDef.output, tmp); err != nil {
			return err
		}

		stream, err := wget(ctx, "https://github.com/berty/go-libtor/releases/tag/"+version)
		if err != nil {
			return err
		}
		defer stream.Close()
		libs := uniq(grepo(stream, `ios-.*-universal\.tar\.gz`))

		scanner := bufio.NewScanner(libs)
		for scanner.Scan() {
			lib := scanner.Text()
			p := path.Join(tmp, lib)
			if err := wdl(ctx, "https://github.com/berty/go-libtor/releases/download/"+version+"/"+lib, p); err != nil {
				return err
			}
			if err := ih.exec("tar", "xf", p, "-C", iOSTorDef.output); err != nil {
				return err
			}
		}
		return nil
	})
}

var iOSTor = &mtarget{iOSTorDef, IOSTor}

// iOS Framework

var iOSFrameworkDef = &targetDef{
	name:    "IOSFramework",
	output:  "js/ios/Frameworks/Bertybridge.framework",
	sources: []string{"go"},
	mdeps:   []Rule{iOSTor, gomobile},
}

// Build iOS gomobile framework
func IOSFramework() error {
	return iOSFrameworkDef.runTarget(func(ih *implemHelper) error {
		if err := osMkdirs("js/ios/Frameworks"); err != nil {
			return err
		}

		cachePath, err := filepath.Abs("js/ios/.gomobile-cache")
		if err != nil {
			return err
		}

		env := []string{"GO111MODULE=on"}
		if err := ih.execEnv(env, "go", "run", "golang.org/x/mobile/cmd/gomobile", "bind",
			"-v",
			extLdFlags(),
			"-o", iOSFrameworkDef.output,
			"-cache", cachePath,
			"-target", "ios",
			"-iosversion", minimumIOsVer,
			"./go/framework/bertybridge",
		); err != nil {
			return err
		}

		return nil

	})
}

var iOSFramework = &mtarget{iOSFrameworkDef, IOSFramework}

// xcworkspace

var xcWorkspaceDef = &targetDef{
	name:      "XCWorkspace",
	output:    "js/ios/Berty.xcworkspace",
	mdeps:     []Rule{nodeModules, xcodeProj, rubyGems, rubyBundle},
	sources:   []string{"js/ios/Podfile", "js/ios/Podfile.lock", "js/ios/OpenSSL-Universal-Override.podspec"},
	env:       []string{"CI"},
	artifacts: []string{"js/ios/Pods"}, // maybe merge with "output" into an "outputs" field
}

// Install CocoaPods and build xcworkspace
func XCWorkspace() error {
	return xcWorkspaceDef.runTarget(func(ih *implemHelper) error {
		args := []string{"exec", "pod", "install"}
		if os.Getenv("CI") != "true" {
			args = append(args, "--repo-update") // update Podfile.lock when not on ci
		}
		return ih.execWd("js/ios", "bundle", args...)
	})
}

var xcWorkspace = &mtarget{xcWorkspaceDef, XCWorkspace}

// ruby gems

var rubyGemsDef = &targetDef{
	name:    "RubyGems",
	output:  "js/ios/vendor/bundle",
	sources: []string{"js/ios/Gemfile", "js/ios/Gemfile.lock"},
	mdeps:   []Rule{rubyBundle},
}

// Build ruby gems
func RubyGems() error {
	return rubyGemsDef.runTarget(func(ih *implemHelper) error {
		return ih.execWd("js/ios", "bundle", "install")
	})
}

var rubyGems = &mtarget{rubyGemsDef, RubyGems}

// xcodeproj

var xcodeProjDef = &targetDef{
	name:    "XcodeProj",
	output:  "js/ios/Berty.xcodeproj",
	sources: []string{"js/ios/*.yaml", "js/ios/Berty/Sources"},
	mdeps:   []Rule{xcodeGen, swift},
}

// Build xcodeproj
func XcodeProj() error {
	return xcodeProjDef.runTarget(func(ih *implemHelper) error {
		if err := osMkdirs("js/ios/Berty"); err != nil {
			return err
		}

		if err := osTouch("js/ios/Berty/main.jsbundle"); err != nil {
			return nil
		}

		//IOS_BUNDLE_VERSION=$(shell echo -n $(shell git rev-list HEAD | wc -l)) \
		iOSBundleVersion := "wololo"
		//IOS_SHORT_BUNDLE_VERSION=$(shell echo "$(VERSION)" | cut -c2- | cut -f1 -d '-') \
		iOSShortBundleVersion := "wo"
		//IOS_COMMIT=$(shell git rev-parse HEAD) \
		iOSCommit := "shasha"

		env := []string{"IOS_BUNDLE_VERSION=" + iOSBundleVersion, "IOS_SHORT_BUNDLE_VERSION=" + iOSShortBundleVersion, "IOS_COMMIT=" + iOSCommit}

		return ih.execWdEnv("js", env, "swift", "run", "--package-path", "ios/vendor/xcodegen", "xcodegen",
			"--spec", "ios/berty.yaml",
			"--cache-path", "ios/vendor/xcodegen/.cache/berty-app",
			"--use-cache",
		)
	})
}

var xcodeProj = &mtarget{xcodeProjDef, XcodeProj}

// XcodeGen

const xcodeGenVersionFile = "js/ios/XcodeGen.version"

var xcodeGenDef = &targetDef{
	name:    "XcodeGen",
	output:  "js/ios/vendor/xcodegen",
	mdeps:   []Rule{unzip},
	sources: []string{xcodeGenVersionFile},
}

// Fetch XcodeGen
func XcodeGen(ctx context.Context) error {
	return xcodeGenDef.runTarget(func(ih *implemHelper) error {
		xcodeGenVerBytes, err := ioutil.ReadFile(xcodeGenVersionFile)
		if err != nil {
			return err
		}
		xcodeGenVer := strings.TrimFunc(string(xcodeGenVerBytes), unicode.IsSpace)

		tmpDir := path.Clean(tmp() + "/xcodegen_dl")

		if err := osMkdirs(tmpDir, xcodeGenDef.output); err != nil {
			return err
		}

		tmpArchive := path.Clean(tmpDir + "/xcodegen.zip")

		if err := wdl(ctx, "https://github.com/yonaskolb/XcodeGen/archive/"+xcodeGenVer+".zip", tmpArchive); err != nil {
			return err
		}

		if err := ih.exec("unzip", "-o", "-q", tmpArchive, "-d", tmpDir); err != nil {
			return err
		}

		filesToInstall, err := filepath.Glob(tmpDir + "/*/*")
		if err != nil {
			return err
		}
		if err := ih.exec("cp", append([]string{"-rf"}, append(filesToInstall, xcodeGenDef.output)...)...); err != nil {
			return err
		}

		return rimraf(tmpDir)
	})
}

var xcodeGen = &mtarget{xcodeGenDef, XcodeGen}

// iOS App

var iOSAppDeps = []Rule{nodeModules, frontGen, xcWorkspace, iOSFramework, npx}

// Build iOS app deps
func IOSAppDeps() error {
	deps := make([]interface{}, len(iOSAppDeps))
	for i, d := range iOSAppDeps {
		deps[i] = d.Implem()
	}
	mg.Deps(deps...)
	return nil
}

var iOSDebugDef = &targetDef{
	name:   "IOSDebug",
	output: ".meta/IOSDebug",
	mdeps:  iOSAppDeps,
	env:    []string{"IOS_DEVICE", "METRO_RN_PORT"},
}

// Build and run debug ios app
func IOSDebug() error {
	return iOSDebugDef.runTarget(func(ih *implemHelper) error {
		args := []string{"react-native", "run-ios",
			"--no-packager",
			"--port", metroRnPort(),
			"--configuration", "Debug",
			"--scheme", "Berty Debug",
		}

		if iosDevice := os.Getenv("IOS_DEVICE"); iosDevice != "" {
			args = append(args, "--simulator", iosDevice)
		}

		return ih.execWd("js", "npx", args...)
	})
}

// Force to reinstall the ios app
func IOSDebugRe() error {
	if err := os.Remove(iOSDebugDef.infoPath()); err != nil {
		return err
	}

	mg.Deps(IOSDebug)

	return nil
}

// yarn

var yarnDef = &toolDef{
	name:        "yarn",
	versionArgs: []string{"-v"},
}

// Check-in yarn version
func CheckYarn() error { return yarnDef.infoWrite() }

var yarn = &mtool{yarnDef, CheckYarn}

// node

var nodeDef = &toolDef{
	name:        "node",
	semverRange: ">=14.0.0",
	versionArgs: []string{"-v"},
	versionTransform: func(s string) (semver.Version, error) {
		return semver.Make(s[len("v"):])
	},
}

// Check-in node version
func CheckNode() error { return nodeDef.infoWrite() }

var node = &mtool{nodeDef, CheckNode}

// xcodebuild

var xcodebuildDef = &toolDef{
	name:        "xcodebuild",
	versionArgs: []string{"-version"},
	versionTransform: func(raw string) (semver.Version, error) {
		words := strings.FieldsFunc(raw, unicode.IsSpace)
		if len(words) < 2 {
			return semver.Version{}, errors.New("expected at least two words in 'xcodebuild -version' output")
		}
		build := ""
		if len(words) >= 5 {
			build = words[4] + "."
		}
		sum := sha3.Sum224([]byte(raw))
		build += hex.EncodeToString(sum[:])[:7]
		return semver.Make(words[1] + "+" + build)
	},
}

func CheckXcodebuild() error { return xcodebuildDef.infoWrite() }

var xcodebuild = &mtool{xcodebuildDef, CheckXcodebuild}

// npx

var npxDef = &toolDef{name: "npx", versionArgs: []string{"-v"}}

// Check if npx is available
func CheckNpx() error { return npxDef.infoWrite() }

var npx = &mtool{npxDef, CheckNpx}

// ruby bundle

var rubyBundleDef = &toolDef{
	name:        "bundle",
	versionArgs: []string{"--version"},
	versionTransform: func(raw string) (semver.Version, error) {
		words := strings.FieldsFunc(raw, unicode.IsSpace)
		if len(words) == 0 {
			return semver.Version{}, errors.New("expected at least one word in ruby bundle version")
		}
		return semver.Make(words[len(words)-1])
	},
}

// Check if bundle is available
func CheckRubyBundle() error { return rubyBundleDef.infoWrite() }

var rubyBundle = &mtool{rubyBundleDef, CheckRubyBundle}

// swift

var swiftDef = &toolDef{
	name:        "swift",
	versionArgs: []string{"-version"},
	versionTransform: func(raw string) (semver.Version, error) {
		words := strings.FieldsFunc(raw, unicode.IsSpace)
		if len(words) < 4 {
			return semver.Version{}, errors.New("expected at least 4 words in swift version")
		}
		sum := sha3.Sum224([]byte(raw))
		build := hex.EncodeToString(sum[:])[:7]
		sver := words[3] + ".0+" + build
		return semver.Make(sver)
	},
}

// Check if swift is available
func CheckSwift() error { return swiftDef.infoWrite() }

var swift = &mtool{swiftDef, CheckSwift}

// unzip

var unzipDef = &toolDef{
	name:        "unzip",
	versionArgs: []string{"-v"},
	versionTransform: func(raw string) (semver.Version, error) {
		words := strings.FieldsFunc(raw, unicode.IsSpace)
		if len(words) < 2 {
			return semver.Version{}, errors.New("expected at least 2 words in unzip version")
		}
		parts := strings.SplitN(words[1], ".", 3)

		minor := "0"
		if len(parts) >= 2 {
			if i, err := strconv.ParseInt(parts[1], 10, 0); err == nil {
				minor = strconv.FormatInt(i, 10)
			}
		}

		sum := sha3.Sum224([]byte(raw))
		build := hex.EncodeToString(sum[:])[:7]

		ver := strings.Join([]string{parts[0], minor, "0"}, ".") + "+" + build
		return semver.Make(ver)
	},
}

// Check if unzip is available
func CheckUnzip() error { return unzipDef.infoWrite() }

var unzip = &mtool{unzipDef, CheckUnzip}

// tar

var tarDef = &toolDef{
	name:        "tar",
	versionArgs: []string{"--version"},
	versionTransform: func(raw string) (semver.Version, error) {
		if raw == "" {
			return semver.Version{}, errors.New("expected something in tar version output")
		}

		re := regexp.MustCompile(`^(tar\s+)?(\(GNU tar\)|bsdtar)\s+(\d+(.\d+(.\d+)?)?)`)
		matches := re.FindStringSubmatch(raw)
		if len(matches) < 4 {
			return semver.Version{}, fmt.Errorf("expected at least 4 elems in regexp return, got:\n%v", matches)
		}

		flavor := strings.ReplaceAll(strings.Trim(matches[2], "()"), " ", "")

		version := matches[3]
		if atoms := strings.Split(version, "."); len(atoms) < 3 {
			version += ".0"
		}

		sum := sha3.Sum224([]byte(raw))
		build := flavor + "." + hex.EncodeToString(sum[:])[:7]

		return semver.Make(version + "+" + build) // TODO: check access
	},
}

// Check if tar is available
func CheckTar() error { return tarDef.infoWrite() }

var tar = &mtool{tarDef, CheckTar}

// go

var goDef = &toolDef{
	name:        "go",
	semverRange: ">=1.14.0 !1.15.4",
	versionArgs: []string{"version"},
	versionTransform: func(s string) (semver.Version, error) {
		words := strings.FieldsFunc(s, unicode.IsSpace)
		if len(words) < 3 {
			return semver.Version{}, errors.New("expected at least 3 words in go version output")
		}
		return semver.Make(words[2][len("go"):])
	},
}

// Check if go is available
func CheckGo() error { return goDef.infoWrite() }

var goTool = &mtool{goDef, CheckGo}

// java

var javaDef = &toolDef{
	name:        "java",
	semverRange: ">=1.8.0 <1.9.0",
	versionArgs: []string{"-version"},
	versionTransform: func(raw string) (semver.Version, error) {
		words := strings.FieldsFunc(raw, unicode.IsSpace)
		if len(words) < 3 {
			return semver.Version{}, errors.New("expected at least 3 words in java version output")
		}
		ver := words[2]
		sum := sha3.Sum224([]byte(raw))
		build := words[0] + "." + hex.EncodeToString(sum[:])[:7]
		return semver.Make(strings.Split(strings.Trim(ver, "\""), "_")[0] + "+" + build)
	},
}

// Check-in java version
func CheckJava() error { return javaDef.infoWrite() }

var java = &mtool{javaDef, CheckJava}

// misc

// Check all tools
func CheckTools() error {
	mg.Deps(CheckYarn, CheckNpx, CheckRubyBundle, CheckSwift, CheckUnzip, CheckGo, CheckTar, CheckNode, CheckJava)

	return nil
}

// utils

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

// types

// TODO: maybe rename infoPath to manifestPath or sumPath or lockPath or something else
type Rule interface {
	InfoPath() string
	Implem() interface{}
	CacheManifest() (string, error)
}

type toolDef struct {
	name             string                               // tool name, this is what will be searched in PATH, also used for logging and cache paths
	versionArgs      []string                             // args to pass to the tool to print version informations to stdout
	versionTransform func(string) (semver.Version, error) // function used to transform the version output into a semantic version string
	semverRange      string                               // version range
}

func (t *toolDef) infoPath() string {
	return htgtInfoPath(fmt.Sprintf(".meta/tools/%s", t.name))
}

func (t *toolDef) infoString() (string, error) {
	// TODO: warn missing dep if file does not exists
	b, err := ioutil.ReadFile(t.infoPath())
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func (t *toolDef) infoWrite() error {
	sver, p, err := checkProgramGetVersionSemver(t.name, t.versionArgs, t.versionTransform)
	if err != nil {
		return err
	}

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

	fmt.Printf("🔍 %s v%s @%s\n", t.name, sver, p)

	infop := t.infoPath()
	if err := os.MkdirAll(path.Dir(infop), os.ModePerm); err != nil {
		return err
	}
	return ioutil.WriteFile(infop, []byte(sver), os.ModePerm)
}

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
	sver, _, err := checkProgramGetVersionSemver(t.def.name, t.def.versionArgs, t.def.versionTransform)
	return sver, err
}

var _ Rule = (*mtool)(nil)

type targetDef struct {
	name      string        // rule name, used for logging
	output    string        // output path, can be a directory
	sources   []string      // filesystem deps, is a go glob list, folders will be recursed into
	mdeps     []Rule        // Rule dependencies TODO rename to rdeps
	deps      []interface{} // classic mage dependencies (functions) TODO rename to cdeps
	env       []string      // environment variables used in the rule, the values at build time will be added to the cache sum
	artifacts []string      // additonalOutputs, used for cache
}

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

var _ Rule = (*mtarget)(nil)

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
	return ioutil.WriteFile(t.output, jsonBytes, os.ModePerm)
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

	if os.Getenv("PRINT_CACHE_PATHS") == "true" {
		fmt.Println(t.output, t.infoPath(), t.artifacts...)
		return nil
	}

	if os.Getenv("PRINT_CACHE_GA_JSON_PATHS") == "true" {
		paths := strings.Join([]string{t.output, t.infoPath()}, "\n")
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

	if err := htgtTargetGlob(t.name, t.output, allSources, t.env, implemWrapper); err == errUpToDate {
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

// TOREFACTOR: split hash-invalidation features from dependency-management features
