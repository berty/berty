# go-libp2p-transport-upgrader

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![GoDoc](https://godoc.org/github.com/libp2p/go-libp2p-transport-upgrader?status.svg)](https://godoc.org/github.com/libp2p/go-libp2p-transport-upgrader)
[![Coverage Status](https://coveralls.io/repos/github/libp2p/go-libp2p-transport-upgrader/badge.svg?branch=master)](https://coveralls.io/github/libp2p/go-libp2p-transport-upgrader?branch=master)
[![Build Status](https://travis-ci.org/libp2p/go-libp2p-transport-upgrader.svg?branch=master)](https://travis-ci.org/libp2p/go-libp2p-transport-upgrader)

> Stream connection to libp2p connection upgrader

This package provides the necessary logic to upgrade [multiaddr-net][manet] connections listeners into full [libp2p-transport][tpt] connections and listeners.

To use, construct a new `Upgrader` with:

* An optional [pnet][pnet] `Protector`.
* An optional [multiaddr-net][manet] address `Filter`.
* A mandatory [stream security transport][ss].
* A mandatory [stream multiplexer transport][smux].

[tpt]: https://github.com/libp2p/go-libp2p-transport
[manet]: https://github.com/multiformats/go-multiaddr-net
[ss]: https://github.com/libp2p/go-conn-security
[smux]: https://github.com/libp2p/go-stream-muxer
[pnet]: https://github.com/libp2p/go-libp2p-interface-pnet

Note: This package largely replaces the functionality of [go-libp2p-conn](https://github.com/libp2p/go-libp2p-conn) but with half the code.

## Install

`go-libp2p-transport-upgrader` is a standard Go module which can be installed with:

```sh
go get github.com/libp2p/go-libp2p-transport-upgrader
```

Note that `go-libp2p-transport-upgrader` is packaged with Gx, so it is recommended to use Gx to install and use it (see the Usage section).

## Usage

This module is packaged with [Gx](https://github.com/whyrusleeping/gx). In order to use it in your own project it is recommended that you:

```sh
go get -u github.com/whyrusleeping/gx
go get -u github.com/whyrusleeping/gx-go
cd <your-project-repository>
gx init
gx import github.com/libp2p/go-libp2p-transport-upgrader
gx install --global
gx-go --rewrite
```

Please check [Gx](https://github.com/whyrusleeping/gx) and [Gx-go](https://github.com/whyrusleeping/gx-go) documentation for more information.

## Example

Below is a simplified TCP transport implementation using the transport upgrader. In practice, you'll want to use [go-tcp-transport](https://github.com/libp2p/go-tcp-transport) (which has reuseport support).

```go
package tcptransport

import (
	"context"

	tptu "github.com/libp2p/go-libp2p-transport-upgrader"

	ma "github.com/multiformats/go-multiaddr"
	mafmt "github.com/whyrusleeping/mafmt"
	manet "github.com/multiformats/go-multiaddr-net"
	tpt "github.com/libp2p/go-libp2p-transport"
)

// TcpTransport is a simple TCP transport.
type TcpTransport struct {
	// Connection upgrader for upgrading insecure stream connections to
	// secure multiplex connections.
	Upgrader *tptu.Upgrader
}

var _ tpt.Transport = &TcpTransport{}

// NewTCPTransport creates a new TCP transport instance.
func NewTCPTransport(upgrader *tptu.Upgrader) *TcpTransport {
	return &TcpTransport{Upgrader: upgrader}
}

// CanDial returns true if this transport believes it can dial the given
// multiaddr.
func (t *TcpTransport) CanDial(addr ma.Multiaddr) bool {
	return mafmt.TCP.Matches(addr)
}

// Dial dials the peer at the remote address.
func (t *TcpTransport) Dial(ctx context.Context, raddr ma.Multiaddr, p peer.ID) (tpt.Conn, error) {
    var dialer manet.Dialer
    conn, err := dialer.DialContext(ctx, raddr)
	if err != nil {
		return nil, err
	}
	return t.Upgrader.UpgradeOutbound(ctx, t, conn, p)
}

// Listen listens on the given multiaddr.
func (t *TcpTransport) Listen(laddr ma.Multiaddr) (tpt.Listener, error) {
	list, err := manet.Listen(laddr)
	if err != nil {
		return nil, err
	}
	return t.Upgrader.UpgradeListener(t, list), nil
}

// Protocols returns the list of terminal protocols this transport can dial.
func (t *TcpTransport) Protocols() []int {
	return []int{ma.P_TCP}
}

// Proxy always returns false for the TCP transport.
func (t *TcpTransport) Proxy() bool {
	return false
}
```

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/libp2p/go-libp2p-transport-upgrader/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/libp2p/community/blob/master/code-of-conduct.md).

### Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

MIT
