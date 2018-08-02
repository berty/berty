# go-libp2p release notes

## 6.0.0

We're pleased to announce go-libp2p 6.0.0. This release includes a massive
refactor of go-libp2p that paves the way for new transports such as QUIC.
Unfortunately, as it is broad sweeping, there are some breaking changes,
*especially* for maintainers of custom transports.

Below, we cover the changes you'll likely care about. For convenience, we've
broken this into a section for users and transport authors/maintainers. However,
transport maintainers should really read both sections.

### For Users

Libp2p users should be aware of a few major changes.

* Guarantees and performance concerning connect/disconnect notification
  processing have improved.
* Handling of half-closed streams has changed (READ THIS SECTION).
* Some constructors and method signatures have changed slightly.

#### Dialing And Source Addresses

We've improved the logic that selects the source address when dialing. In the
past, you may have run into an issue where you couldn't dial non-local nodes
when listening on 127.0.0.1 as opposed to 0.0.0.0. This happened because
go-libp2p would randomly pick the source address from the set of addresses on
which the node was listening. We did this to ensure that the other end could
dial us back at the same address. Unfortunately, one can't use 127.0.0.1 as a
source address when dialing any non-local address so outbound dials failed.

go-libp2p now tries to be smarter about this and avoids picking source addresses
that have no route to the destination address.

#### Bandwidth Metrics

To start out on an unhappy note, bandwidth metrics are now less accurate. In the
past, transports returned "minimal" connections (e.g., a TCP connection) so we
could wrap these transport connections in "metrics" connections that counted
every byte sent and received.

Unfortunately, now that we've moved encryption and multiplexing down into the
transport layer, the connection we're wrapping has significantly more
under-the-covers overhead.

However, we do hope to improve this and get even *better* bandwidth metrics than
we did before. See [libp2p/go-libp2p-transport#31][] for details.

[libp2p/go-libp2p-transport#31]: https://github.com/libp2p/go-libp2p-transport/issues/31

#### Notifications

This release brings performance improvements and easy to reason about ordering
guarantees libp2p connect/disconnect events:

1. For any given connection/stream, libp2p will wait for all connect/open event
   handlers to finish exit before triggering a disconnect/close event for the
   connection/stream.
2. When a user calls the Close (or `Reset`) method on a connection or stream,
   go-libp2p will process the close event asynchronously (i.e., not block the
   call to `Close`). Otherwise, a call to `Close` from within a connect event
   handler would deadlock.
3. Unless otherwise noted, events will be handled in parallel.

What does this mean for end users? Well:

1. Reference counting connections to a peer using connect/disconnect events
   should "just work" and should never go negative.
2. Under heavy connect/disconnect loads, connecting to new peers should be
   faster (usually).

For those interested in the history of this issue, ...

In the past, (dis)connect and stream open/close notifications have been a bit of
a pain point. For a long time, they were fired off in parallel and one could, for
example, process a disconnect notification before a connect notification (we had
to support *negative* ref-counts in several places to account for this).

After no end of trouble, we finally "fixed" this by synchronizing notification
delivery. We still delivered notifications to all notifiees in parallel, we just
processed the events in series.

Unfortunately, under heavy connect/disconnect load, new connections could easily
get stuck on open behind a queue of connect events all being handled in series.
In theory, these events should have been handled quickly but in practice, it's
very hard to avoid locks *entirely* (bitswap's event handlers were especially
problematic).

Worse, this serial delivery guarantee didn't actually provide us with an
*in-order* delivery guarantee as it was still possible for a disconnect to
happen before we even *started* to fire the connect event. The situation was
slightly better than before because the events couldn't overlap but still far
from optimal.

However, this has all been resolved now. From now on, you'll never receive a
disconnect event before a connect event.

#### Conn.GetStreams Signature Change

The signature of the `GetStreams` method on `go-libp2p-net.Conn` has changed from:

```go
GetStreams() ([]Stream, error)
```

To:

```go
GetStreams() []Stream
```

Listing the streams on an open connection should never involve IO or do anything
that can fail so we removed this error to improve usability.

#### Libp2p Constructor

If you're not already doing so, you should be using the `libp2p.New` constructor
to make your libp2p nodes. This release brings quite a few new options to the
libp2p constructor so if it hasn't been flexible enough for you in the past, I
recommend that you try again. A simple example can be found in the
[echo][example:echo] example.

Given this work and in an attempt to consolidate all of our configuration logic
in one place, we've removed all default transports from go-libp2p-swarm.

TL;DR: Please use the libp2p constructor.

#### Zombie Streams

From this release on, when you're done with a stream, you must either call
`Reset` on it (in case of an error) or close it and read an EOF (or some other
error). Otherwise, libp2p can't determine if the stream is *actually* closed and
will hang onto it indefinitely.

To make properly closing streams a bit easier, we've added two methods to
[go-libp2p-net][]: `AwaitEOF` and `FullClose`.

* `AwaitEOF(stream)` tries to read a single byte from the stream. If `Read`
returns an EOF, `AwaitEOF` returns success. Otherwise, if `Read` either reads
some data or returns some other error, `AwaitEOF` resets the stream and returns
an error. To avoid waiting indefinitely, `AwaitEOF` resets the stream
unconditionally after 1 minute.
* `FullClose(stream)` is a convenience function that closes the stream and then
calls `AwaitEOF` on it.

Like with libp2p notifications, this issue has a bit of history...

In the beginning, libp2p assumed that calling `Close` on a stream would close
the stream for both reading and writing. Unfortunately, *none* of our stream
multiplexers actually behaved this way. In practice, `Close` always closed the
stream for writing.

After realizing this, we made two changes:

1. We accepted the fact that `Close` only closed the stream for writing.
2. We added a `Reset` method for killing the stream (closing it in both
   directions, throwing away any buffered data).

However, we ran into a bit of a snag because we try to track open streams and
need some way to tell when a stream has been closed. In the past this was easy:
when the user calls `Close` on the stream, stop tracking it. However, now that
`Close` only closes the stream for writing, we still *technically* needed to
track it until the *other* end closed the stream as well. Unfortunately, without
actually reading from the stream, we have no way of knowing about this.
Therefore, if the user calls `Close` on a stream and then walks away, we'd have
to hang onto the stream indefinitely.

Our solution was to simply stop tracking streams once they were closed for
writing. This wasn't the *correct* behavior but it avoided leaking memory in the
common case:

1. The user calls `Close` and drops all references to the stream.
2. The other end calls `Close` without writing any additional data.
3. The stream multiplexer observes both closes and drops *its* reference to the stream.
4. The garbage collector garbage collects the stream.

However, this meant that:

1. The list of "open" streams was technically incomplete.
2. If the other side either failed to call `Close` or tried to send data before
   closing, the stream would remain "open" (until the connection was closed).

In this release, we've changed this behavior. Now, when you `Close` a stream for
writing, libp2p *continues* to track it. We only stop tracking it when either:

1. You call `Reset` (throwing away the stream).
2. You finish reading any data off of it and observe either an EOF or an error.

This way, we never "forget" about open streams or leave them in a half-forgotten
state.

In the future, I'd like to add a `CloseAndForget` method to streams that:

1. Closes the stream (sends an EOF).
2. Tells the swarm to stop tracking the stream.
3. Tells the stream muxer to stop tracking the stream and throw away any data
   the other side may send (possibly resetting the stream on unexpected data).

However:

1. This would likely require modifying our stream muxers which may not be
   feasible.
2. Explicitly waiting for an EOF is still the correct thing to do unless you
   really don't care if the operation succeeded.

### For Transport Maintainers

For transport maintainers, quite a bit has changed. Before this change,
transports created simple, unencrypted, stream connections and it was the job of
the libp2p Network (go-libp2p-swarm) to negotiate security, multiplexing, etc.

However, when attempting to add support for the QUIC protocol, we realized that
this was going to be a problem: QUIC already handles authentication and
encryption (using TLS1.3) and multiplexing. After much debate, we inverted our
current architecture and made transports responsible for encrypting/multiplexing
their connections (before returning them).

To make this palatable, we've also introduced a new ["upgrader"
library][go-libp2p-transport-upgrader] for upgrading go-multiaddr-net
connections/listeners to full libp2p transport connections/listeners. Transports
that don't support encryption/multiplexing out of the box can expect to have an
upgrader passed into the constructor.

To get a feel for how this new transport system works, take a look at the TCP
and WebSocket transports and the transport interface documentation:

* [TCP Transport][go-tcp-transport]
* [WebSocket Transport][go-ws-transport]
* [Transport Interface][doc:go-libp2p-transport]

#### Deprecated Packages

This release sees the deprecation of a few packages:

* [go-peerstream][] has been deprecated and all functionality has been merged
  into [go-libp2p-swarm][]. [go-peerstream][] was written as a general-purpose
  (not libp2p specific) listener, connection, and stream manager. However, this
  package caused more problems than it solved and was incompatible with the new
  transport interface.
* [go-libp2p-interface-conn][] has been deprecated. These interfaces to bridge
  the gap between transport-level connections and [go-libp2p-net][] connections
  however, now that transport connections are fully multiplexed/encrypted, this
  is no longer needed.
* [go-libp2p-conn][] has also been deprecated and most of the functionality has
  been moved to [go-libp2p-transport-upgrader][]. This package used to provide
  connection "upgrade" logic for upgrading transport-level connections to
  [go-libp2p-interface-conn][] connections however, transport-level connections
  now provide the required functionality out of the box.

#### Testing

We've moved `GenSwarmNetwork` in [go-libp2p-netutil][] to `GenSwarm` in
[go-libp2p-swarm/testing][] because:

1. The swarm duplicated this exact function for its own tests.
2. The swarm couldn't depend on [go-libp2p-netutil][] because
   [go-libp2p-netutil][] depends on [go-libp2p-swarm][].

We've also added a new transport test suit
[go-libp2p-transport/test][]. If you implement a new transport, please consider
testing against these suite. If you find a bug in an existing transport, please
consider adding a test to this suite.

#### go-addr-util

In go-addr-util, we've removed the `SupportedTransportStrings` and
`SupportedTransportProtocols` transport registries and the associated
`AddTransport` function. These registries were updated by `init` functions in
packages providing transports and were used to keep track of known transports.

However, *importing* a transport doesn't mean any libp2p nodes have been
configured to actually *use* that transport. Therefore, in the new go-libp2p,
it's go-libp2p-swarm's job to keep track of which transports are supported
(i.e., which transports have been registered with the swarm).

We've also removed the associated `AddrUsable`, `FilterUsableAddrs`, and
`AddrUsableFunc` functions.

#### Pluggable Security Transports

This release brings a new pluggable security transport framework. Implementing a
new security framework is now as simple as:

1. Implement the interfaces defined in [go-conn-security][].
2. Pass it into the libp2p constructor using the `Security` option.

[go-conn-security]: https://github.com/libp2p/go-conn-security
[go-libp2p-conn]: https://github.com/libp2p/go-libp2p-conn
[go-libp2p-interface-conn]: https://github.com/libp2p/go-libp2p-interface-conn
[go-libp2p-net]: https://github.com/libp2p/go-libp2p-net
[go-libp2p-netutil]: https://github.com/libp2p/go-libp2p/go-libp2p-netutil
[go-libp2p-swarm]: https://github.com/libp2p/go-libp2p/go-libp2p-swarm
[go-libp2p-swarm/testing]: https://github.com/libp2p/go-libp2p/go-libp2p-swarm/testing
[go-libp2p-transport]: https://github.com/libp2p/go-libp2p-transport
[go-libp2p-transport/test]: https://github.com/libp2p/go-libp2p-transport/test
[go-libp2p-transport-upgrader]: https://github.com/libp2p/go-libp2p-transport-upgrader
[go-peerstream]: https://github.com/libp2p/go-peerstream
[go-tcp-transport]: https://github.com/libp2p/go-tcp-transport
[go-ws-transport]: https://github.com/libp2p/go-ws-transport

[example:echo]: https://github.com/libp2p/go-libp2p/tree/master/examples/echo

[doc:go-libp2p-transport]: https://godoc.org/github.com/libp2p/go-libp2p-transport
