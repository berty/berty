// +build mage

package main

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"unicode"

	"github.com/blang/semver/v4"
	"github.com/magefile/mage/mg"
)

// config

const masterBranch = "master"
const minimumAndroidVer = "21"
const minimumIOsVer = "12.0"
const requiredJavaVer = "18"

//

var globalVersionDef = &targetDef{
	name:   "GlobalVersion",
	output: ".build-artifacts/global-version",
	mdeps:  []Rule{goMods, gitTool},
	env:    []string{"VERSION"},
	phony:  true, // because it depends on git data
}

func GlobalVersion() error {
	return globalVersionDef.runTarget(func(ih *implemHelper) error {
		version, err := ih.getenvFallbackExec("VERSION", "go", "run", "-mod=readonly", "-modfile=go.mod", "github.com/mdomke/git-semver/v5")
		if err != nil {
			return err
		}
		version = unitrim(version)
		if version[0] == 'v' {
			version = version[1:]
		}

		sver, err := semver.Make(version)
		if err != nil {
			return err
		}

		branch, err := ih.strExec("git", "branch", "--show-current")
		if err != nil {
			return err
		}

		if unitrim(branch) != masterBranch {
			// pull request
			sver.Pre = []semver.PRVersion{{VersionStr: "pullrequest"}}
			sver.Build = []string{}
			if err := sver.Validate(); err != nil {
				return err
			}
		}

		return globalVersionDef.outputWriteString(sver.String())
	})
}

var globalVersion = &mtarget{globalVersionDef, GlobalVersion}

//

var frameworkRefDef = &targetDef{
	name:   "FrameworkRef",
	output: ".build-artifacts/js/framework-ref",
	mdeps:  []Rule{gitTool, gitRevParse},
	env:    []string{"VCS_REF"},
	phony:  true,
}

func FrameworkRef() error {
	return frameworkRefDef.runTarget(func(ih *implemHelper) error {
		branch, err := ih.strExec("git", "branch", "--show-current")
		if err != nil {
			return err
		}
		if unitrim(branch) == masterBranch {
			vcsRef := os.Getenv("VCS_REF")
			if vcsRef == "" {
				var err error
				if vcsRef, err = gitRevParse.OutputString(); err != nil {
					return err
				}
			}

			return frameworkRefDef.outputWriteString(vcsRef)
		}
		// pull request
		return frameworkRefDef.outputWriteString("deadbeefdeadbeefdeadbeefdeadbeefdeadbeef")
	})
}

var frameworkRef = &mtarget{frameworkRefDef, FrameworkRef}

//

var frameworkLdflagsDef = &targetDef{
	name:   "FrameworkLdflags",
	output: ".build-artifacts/js/framework-ldflags",
	mdeps:  []Rule{globalVersion, frameworkRef},
}

// Build version info
func FrameworkLdflags() error {
	return frameworkLdflagsDef.runTarget(func(ih *implemHelper) error {
		ref, err := frameworkRef.OutputString()
		if err != nil {
			return err
		}

		version, err := globalVersion.OutputString()
		if err != nil {
			return err
		}

		ldFlags := fmt.Sprintf(
			`-ldflags="-X berty.tech/berty/v2/go/pkg/bertyversion.VcsRef=%s -X berty.tech/berty/v2/go/pkg/bertyversion.Version=v%s"`,
			unitrim(ref), unitrim(version))

		return frameworkLdflagsDef.outputWriteString(ldFlags)
	})
}

var frameworkLdFlags = &mtarget{frameworkLdflagsDef, FrameworkLdflags}

//

var nodeModulesDef = &targetDef{
	name:    "NodeModules",
	output:  "js/node_modules",
	sources: []string{"js/package.json", "js/yarn.lock"},
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
	sources: []string{"go.mod", "go.sum"},
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
	output: ".build-artifacts/js/pbjs-flags.json",
	mdeps:  []Rule{goMods},
	// TODO: workDir: "js",
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

func PbjsInit() error {
	return pbjsDef.runTarget(func(ih *implemHelper) error {
		return ih.execWd("js", "npx", "pbjs", "--version", "-")
	})
}

var pbjs = &mtarget{pbjsDef, PbjsInit}

//

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

//

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
		cleanedData := regexp.MustCompile(".*constructor.*").ReplaceAll(data, []byte(""))

		if err := pbtsRootDef.outputWrite(cleanedData); err != nil {
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
	sources: []string{genWelshClientsSrc},
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

		if err := welshClientsTypesDef.outputWrite(out); err != nil {
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
		cmd.Stderr = ih.w

		fmt.Println(strings.Join(append([]string{"🏃", path.Join(".", workDir), "❯", c}, args...), " "), ">", output[len("js/"):])
		out, err := cmd.Output()
		if err != nil {
			return err
		}

		if err := storeTypesDef.outputWrite(out); err != nil {
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

const androidFrameworkCache = "js/android/.gomobile-cache"

var androidFrameworkDef = &targetDef{
	name:      "AndroidFramework",
	output:    "js/android/libs/gobridge.aar",
	sources:   []string{"go"},
	mdeps:     []Rule{gomobile, frameworkLdFlags},
	artifacts: []string{androidFrameworkCache},
}

// Build android gomobile framework
func AndroidFramework() error {
	return androidFrameworkDef.runTarget(func(ih *implemHelper) error {
		if err := osMkdirs("js/android/libs"); err != nil {
			return err
		}

		cachePath, err := filepath.Abs(androidFrameworkCache)
		if err != nil {
			return err
		}

		ldflags, err := ioutil.ReadFile(frameworkLdFlags.def.output)
		if err != nil {
			return err
		}

		env := []string{"GO111MODULE=on"}
		if err := ih.execEnv(env, "go", "run", "golang.org/x/mobile/cmd/gomobile", "bind",
			"-v",
			string(ldflags),
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
	phony:  true,
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
	output: ".build-artifacts/js/ios/.tor-version",
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

		return torVersionDef.outputWriteString(goLibtorVer)
	})
}

var torVersion = &mtarget{torVersionDef, TorVersion}

// iOS tor libs

var iOSTorDef = &targetDef{
	name:   "IOSTor",
	output: "js/ios/tor-deps",
	mdeps:  []Rule{torVersion, tar},
}

// Fetch tor deps for iOS
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

const iOSFrameworkCache = "js/ios/.gomobile-cache"

var iOSFrameworkDef = &targetDef{
	name:      "IOSFramework",
	output:    "js/ios/Frameworks/Bertybridge.framework",
	sources:   []string{"go"},
	mdeps:     []Rule{iOSTor, gomobile, frameworkLdFlags},
	artifacts: []string{iOSFrameworkCache},
}

// Build iOS gomobile framework
func IOSFramework() error {
	return iOSFrameworkDef.runTarget(func(ih *implemHelper) error {
		if err := osMkdirs("js/ios/Frameworks"); err != nil {
			return err
		}

		cachePath, err := filepath.Abs(iOSFrameworkCache)
		if err != nil {
			return err
		}

		ldflags, err := ioutil.ReadFile(frameworkLdFlags.def.output)
		if err != nil {
			return err
		}

		env := []string{"GO111MODULE=on"}
		if err := ih.execEnv(env, "go", "run", "golang.org/x/mobile/cmd/gomobile", "bind",
			"-v",
			string(ldflags),
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

// gitRevParse

var gitRevParseDef = &targetDef{name: "GitRevParse", output: ".build-artifacts/git-rev-parse", mdeps: []Rule{gitTool}, phony: true}

func GitRevParse() error { return gitRevParseDef.runExecToOutput("git", "rev-parse", "HEAD") }

var gitRevParse = &mtarget{gitRevParseDef, GitRevParse}

// gitRevList

var gitRevListDef = &targetDef{name: "GitRevList", output: ".build-artifacts/git-rev-list", mdeps: []Rule{gitTool}, phony: true}

func GitRevList() error { return gitRevListDef.runExecToOutput("git", "rev-list", "HEAD") }

var gitRevList = &mtarget{gitRevListDef, GitRevList}

//

var iOSAppBundleVersionDef = &targetDef{
	name:   "IOSBundleVersion",
	output: ".build-artifacts/js/ios/app-bundle-version",
	mdeps:  []Rule{gitTool, gitRevList},
	phony:  true,
}

func IOSAppBundleVersion() error {
	return iOSAppBundleVersionDef.runTarget(func(ih *implemHelper) error {
		branch, err := ih.strExec("git", "branch", "--show-current")
		if err != nil {
			return err
		}
		if unitrim(branch) == masterBranch {
			gitRevList, err := gitRevList.OutputString()
			if err != nil {
				return err
			}
			iOSBundleVersion := strings.Count(gitRevList, "\n")
			return iOSAppBundleVersionDef.outputWriteString(strconv.Itoa(iOSBundleVersion))
		}
		// pull request
		return iOSAppBundleVersionDef.outputWriteString("0") // TODO: use commit count on shared base with master
	})
}

var iOSAppBundleVersion = &mtarget{iOSAppBundleVersionDef, IOSAppBundleVersion}

// xcodeproj

const xcodeProjCache = "js/ios/vendor/xcodegen/.cache/berty-app"

var xcodeProjDef = &targetDef{
	name:      "XcodeProj",
	output:    "js/ios/Berty.xcodeproj",
	sources:   []string{"js/ios/*.yaml", "js/ios/Berty/Sources"},
	mdeps:     []Rule{xcodeGen, swift, frameworkRef, iOSAppBundleVersion, globalVersion},
	artifacts: []string{"js/ios/Berty/main.jsbundle", "js/ios/Berty/Info.plist", xcodeProjCache},
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

		iOSBundleVersion, err := iOSAppBundleVersion.OutputString()
		if err != nil {
			return err
		}

		globalVersion, err := globalVersion.OutputString()
		if err != nil {
			return err
		}
		iOSShortBundleVersion := strings.Split(globalVersion, "-")[0]

		iOSCommit, err := frameworkRef.OutputString()
		if err != nil {
			return err
		}

		env := []string{
			"IOS_BUNDLE_VERSION=" + unitrim(iOSBundleVersion),
			"IOS_SHORT_BUNDLE_VERSION=" + unitrim(iOSShortBundleVersion),
			"IOS_COMMIT=" + unitrim(iOSCommit),
		}

		return ih.execWdEnv("js", env, "swift", "run", "--package-path", "ios/vendor/xcodegen", "xcodegen",
			"--spec", "ios/berty.yaml",
			"--cache-path", xcodeProjCache[len("js/"):],
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
	phony:  true,
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
