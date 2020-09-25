package main

import (
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/Masterminds/semver"
	"github.com/fatih/color"
	"moul.io/u"
)

const (
	goVersionConstraint = ">= 1.14"
	mustHavePrograms    = "sh make shasum go"
	mayHavePrograms     = "yarn lsof adb golangci-lint docker"
)

func main() {
	// check for programs
	{
		for _, program := range strings.Split(mustHavePrograms, " ") {
			path, err := exec.LookPath(program)
			if err != nil {
				newError(fmt.Sprintf("%q is not available in $PATH, it is required for most commands.", program))
			} else {
				newOk(fmt.Sprintf("%q is present in $PATH (%s).", program, path))
			}
		}
		for _, program := range strings.Split(mayHavePrograms, " ") {
			path, err := exec.LookPath(program)
			if err != nil {
				newWarn(fmt.Sprintf("%q is not available in $PATH, it is only needed for advanced usages.", program))
			} else {
				newOk(fmt.Sprintf("%q is present in $PATH (%s).", program, path))
			}
		}
	}

	// check go version
	{
		goVersionOutput := u.SafeExec(exec.Command("go", "version"))
		if strings.HasPrefix(goVersionOutput, "go version go1.") {
			versionString := strings.Split(goVersionOutput, " ")[2][2:]
			version, err := semver.NewVersion(versionString)
			if err != nil {
				newError(fmt.Sprintf("failed to parse semver in 'go version' (%q): %v.", versionString, err))
			} else {
				constraint, err := semver.NewConstraint(goVersionConstraint)
				checkErr(err)
				if constraint.Check(version) {
					newOk(fmt.Sprintf("valid go version: %q.", version))
				} else {
					newError(fmt.Sprintf("invalid go version: %q, should match %q.", version, goVersionConstraint))
				}
			}
		} else {
			newError("failed to call `go version`")
		}
	}

	// check vendor dir
	{
		if u.DirExists("./vendor") {
			newWarn("'./vendor' directory exists, it may cause strange behavior during development.")
		} else {
			newOk("'./vendor' directory does not exist.")
		}
	}

	// FIXME: berty: if installed, make some checks
	// FIXME: git: check if outdated
	// FIXME: docker: version check
	// FIXME: go env
	// FIXME: android sdk
	// FIXME: node version
	// FIXME: check termcaps support for mini

	// summary
	{
		if warns > 0 || errs > 0 {
			fmt.Printf("[-] %d warns, %d errors.", warns, errs)
		}
		if errs > 0 {
			os.Exit(1)
		}
	}
}

var (
	warns, errs int
	green       = color.New(color.FgGreen).SprintFunc()
	yellow      = color.New(color.FgYellow).SprintFunc()
	red         = color.New(color.FgRed).SprintFunc()
)

func newOk(msg string) {
	fmt.Printf("[+] %s     %s\n", green("OK"), msg)
}

func newWarn(msg string) {
	fmt.Printf("[-] %s   %s\n", yellow("WARN"), msg)
	warns++
}

func newError(msg string) {
	fmt.Printf("[-] %s  %s\n", red("ERROR"), msg)
	errs++
}

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}
