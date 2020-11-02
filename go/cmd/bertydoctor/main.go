package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"strings"
	"sync"
	"time"

	"github.com/Masterminds/semver"
	"github.com/fatih/color"
	"moul.io/u"

	"berty.tech/berty/v2/go/internal/config"
)

const (
	goVersionConstraint = ">= 1.14"
	mustHavePrograms    = "sh make shasum go"
	mayHavePrograms     = "yarn lsof adb golangci-lint docker"
	timeout             = time.Minute * 2
)

var verbose bool

func main() {
	flag.BoolVar(&verbose, "v", false, "Enable verbose mode.")
	flag.Parse()
	var wg sync.WaitGroup
	ctx, cancel := context.WithTimeout(context.Background(), timeout)

	// check for programs
	wg.Add(1)
	go func() {
		defer wg.Done()
		for _, program := range strings.Split(mustHavePrograms, " ") {
			path, err := exec.LookPath(program)
			if err != nil {
				newErrorS("%q is not available in $PATH, it is required for most commands.", program)
			} else {
				newOkS("%q is present in $PATH (%s).", program, path)
			}
		}
		for _, program := range strings.Split(mayHavePrograms, " ") {
			path, err := exec.LookPath(program)
			if err != nil {
				newWarnS("%q is not available in $PATH, it is only needed for advanced usages.", program)
			} else {
				newOkS("%q is present in $PATH (%s).", program, path)
			}
		}
	}()

	// check go version
	wg.Add(1)
	go func() {
		defer wg.Done()
		goVersionOutput := u.SafeExec(exec.Command("go", "version"))
		if strings.HasPrefix(goVersionOutput, "go version go1.") {
			versionString := strings.Split(goVersionOutput, " ")[2][2:]
			version, err := semver.NewVersion(versionString)
			if err != nil {
				newErrorS("failed to parse semver in 'go version' (%q): %v.", versionString, err)
			} else {
				constraint, err := semver.NewConstraint(goVersionConstraint)
				checkErr(err)
				if constraint.Check(version) {
					newOkS("valid go version: %q.", version)
				} else {
					newErrorS("invalid go version: %q, should match %q.", version, goVersionConstraint)
				}
			}
		} else {
			newError("failed to call `go version`")
		}
	}()

	// check vendor dir
	{
		if u.DirExists("./vendor") {
			newWarn("'./vendor' directory exists, it may cause strange behavior during development.")
		} else {
			newOk("'./vendor' directory does not exist.")
		}
	}

	// check if RDVPs are online.
	{
		wg.Add(1)
		lenRDVPs := len(config.Config.P2P.RDVP)
		maddrs := make([]string, lenRDVPs)
		for lenRDVPs > 0 {
			lenRDVPs--
			maddrs[lenRDVPs] = config.Config.P2P.RDVP[lenRDVPs].Maddr
		}
		go testRDVPs(ctx, &wg, maddrs)
	}

	// FIXME: berty: if installed, make some checks
	// FIXME: git: check if outdated
	// FIXME: docker: version check
	// FIXME: go env
	// FIXME: android sdk
	// FIXME: node version
	// FIXME: check termcaps support for mini

	// Cancel ctx on sigInt.
	go func() {
		signalChannel := make(chan os.Signal, 1)
		signal.Notify(signalChannel, os.Interrupt)

		select {
		case <-signalChannel:
			cancel()
		case <-ctx.Done():
		}
	}()

	// summary
	{
		wg.Wait()
		if warnc > 0 || errc > 0 {
			fmt.Printf("[-] %d warns, %d errors.\n", warnc, errc)
		}
		if errc > 0 {
			os.Exit(1)
		}
	}
}

var (
	warnc, errc int
	talkLock    sync.Mutex
	green       = color.New(color.FgGreen).SprintFunc()
	yellow      = color.New(color.FgYellow).SprintFunc()
	red         = color.New(color.FgRed).SprintFunc()
)

func newOk(msg string) {
	talkLock.Lock()
	defer talkLock.Unlock()
	fmt.Printf("[+] %s     %s\n", green("OK"), msg)
}

func newOkS(pattern string, v ...interface{}) {
	newOk(fmt.Sprintf(pattern, v...))
}

func newWarn(msg string) {
	talkLock.Lock()
	defer talkLock.Unlock()
	fmt.Printf("[-] %s   %s\n", yellow("WARN"), msg)
	warnc++
}

func newWarnS(pattern string, v ...interface{}) {
	newWarn(fmt.Sprintf(pattern, v...))
}

func newError(msg string) {
	talkLock.Lock()
	defer talkLock.Unlock()
	fmt.Printf("[-] %s  %s\n", red("ERROR"), msg)
	errc++
}

func newErrorS(pattern string, v ...interface{}) {
	newError(fmt.Sprintf(pattern, v...))
}

func checkErr(err error) {
	talkLock.Lock()
	defer talkLock.Unlock()
	if err != nil {
		panic(err)
	}
}
