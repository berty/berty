// +build mage

package main

import (
	"encoding/hex"
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"unicode"

	"github.com/blang/semver/v4"
	"github.com/magefile/mage/mg"
	"golang.org/x/crypto/sha3"
)

// Check all tools
func CheckTools() error {
	mg.Deps(CheckYarn, CheckNpx, CheckRubyBundle, CheckSwift, CheckUnzip, CheckGo, CheckTar, CheckNode, CheckJava, CheckGit)

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
	semverRange: ">=2.1.0",
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

		return semver.Make(version + "+" + build)
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

// git

var gitToolDef = &toolDef{
	name:        "git",
	versionArgs: []string{"version", "--build-options"},
	versionTransform: func(raw string) (semver.Version, error) {
		parts := strings.FieldsFunc(raw, unicode.IsSpace)
		if len(parts) < 3 {
			return semver.Version{}, fmt.Errorf("expected at least 3 parts in git version, got %i", len(parts))
		}
		return semver.Make(parts[2])
	},
}

// Check if git is available
func CheckGit() error { return gitToolDef.infoWrite() }

var gitTool = &mtool{gitToolDef, CheckGit}
