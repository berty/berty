package main

import (
	"io"
	"os"
	"os/exec"
)

type daemon struct {
	cmd *exec.Cmd
}

func newDaemon(storeDir, addr, ipfsAddr, webuiAddr, dumpPath string, sOut, sErr io.Writer) (*daemon, error) {
	if err := os.MkdirAll(storeDir, os.ModePerm); err != nil {
		return nil, err
	}

	cmd := exec.Command("berty", "daemon",
		"-store.dir="+storeDir,
		"-node.events-dump-path="+dumpPath,
		"-node.listeners="+addr,
		"-p2p.ipfs-api-listeners="+ipfsAddr,
		"-p2p.webui-listener="+webuiAddr,
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		return nil, err
	}

	return &daemon{
		cmd: cmd,
	}, nil
}

func (d *daemon) Close() error {
	if err := d.cmd.Process.Kill(); err != nil {
		return err
	}

	if err := d.cmd.Wait(); err != nil && err.Error() != "signal: killed" {
		return err
	}

	return nil
}
