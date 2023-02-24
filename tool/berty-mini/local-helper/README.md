# berty mini local helper

A simple Makefile that helps running multiple berty mini instances

## Usage

```console
# start a berty mini instance in a shell
$ make run ID=1
Account
 9L7gKAZS                             /\
                                 /\  / /\  ______
                                / /\/ /  \/  |   \
                               | |  \/   | ()|    |
                                \ \      |   |____|
                                 \ \      \____/ __           __
                                  \/       /    / /  ___ ____/ /___ __
                                  /     __/    / _ \/ -_) __/ __/ // /
                                 /_____/      /____/\__/_/  \__/\__ /
                                /__/                           /___/

          11:18:56 -------- type /help for available commands
          11:18:56 Dp7rlxpX own member id: 9L7gKAZSn0E09Xb5EFMCNExr4MaJde9M1h75/m3Ysl4= (9L7gKAZS)
          11:18:56 -------- start group message subscribe
          >
```

```console
# in another shell you can read the logs in real time
$ make tail ID=43
tail -f /tmp/berty-mini-1.log
{"level":"debug","ts":1592558366.0639644,"logger":"tinder/multi","caller":"tinder/driver_multi.go:94","msg":"looking for peers","key":"/provider/bafkreihyblbn2mnoscxta7wvaookji6qdrjo2sgel2ysyxqxrvccllv4ru"}
{"level":"warn","ts":1592558366.0640278,"logger":"tinder/multi","caller":"tinder/driver_multi.go:61","msg":"failed to advertise","driver":"rdvp","key":"/provider/bafkreihyblbn2mnoscxta7wvaookji6qdrjo2sgel2ysyxqxrvccllv4ru","error":"context canceled"}
{"level":"warn","ts":1592558366.06414,"logger":"tinder/multi","caller":"tinder/driver_multi.go:61","msg":"failed to advertise","driver":"dht","key":"/provider/bafkreihyblbn2mnoscxta7wvaookji6qdrjo2sgel2ysyxqxrvccllv4ru","error":"context canceled"}
{"level":"debug","ts":1592558366.0665712,"logger":"tinder/rdvp","caller":"tinder/driver_rdv.go:143","msg":"found peers","key":"/provider/bafkreighpwtb6awn3kv4ihl2ujud3zydzy6cqzeo2h6jiuiwbfra5ku5zm","count":1}
{"level":"debug","ts":1592558366.0666661,"logger":"tinder/multi","caller":"tinder/driver_multi.go:153","msg":"found a peer","driver":"rdvp","key":"/provider/bafkreighpwtb6awn3kv4ihl2ujud3zydzy6cqzeo2h6jiuiwbfra5ku5zm","peer":"QmWxAQouVHGkDmjWwBn9Kc84thMcpDkk3X95fH3NFQL4Fd"}
{"level":"debug","ts":1592558366.0668595,"logger":"tinder/rdvp","caller":"tinder/driver_rdv.go:143","msg":"found peers","key":"/provider/bafkreihyblbn2mnoscxta7wvaookji6qdrjo2sgel2ysyxqxrvccllv4ru","count":1}
{"level":"debug","ts":1592558366.0670335,"logger":"tinder/multi","caller":"tinder/driver_multi.go:153","msg":"found a peer","driver":"rdvp","key":"/provider/bafkreihyblbn2mnoscxta7wvaookji6qdrjo2sgel2ysyxqxrvccllv4ru","peer":"QmWxAQouVHGkDmjWwBn9Kc84thMcpDkk3X95fH3NFQL4Fd"}
{"level":"debug","ts":1592558366.069787,"logger":"tinder/multi","caller":"tinder/driver_multi.go:153","msg":"found a peer","driver":"dht","key":"/provider/bafkreihyblbn2mnoscxta7wvaookji6qdrjo2sgel2ysyxqxrvccllv4ru","peer":"QmWxAQouVHGkDmjWwBn9Kc84thMcpDkk3X95fH3NFQL4Fd"}
{"level":"debug","ts":1592558366.069814,"logger":"tinder/multi","caller":"tinder/driver_multi.go:153","msg":"found a peer","driver":"dht","key":"/provider/bafkreihyblbn2mnoscxta7wvaookji6qdrjo2sgel2ysyxqxrvccllv4ru","peer":"Qmco8Wcx3AVqQ5PyQxEHcBbTTijFLeNy8Rid9xCMqSbhVg"}
{"level":"debug","ts":1592558366.0698056,"logger":"tinder/multi","caller":"tinder/driver_multi.go:153","msg":"found a peer","driver":"dht","key":"/provider/bafkreighpwtb6awn3kv4ihl2ujud3zydzy6cqzeo2h6jiuiwbfra5ku5zm","peer":"Qmco8Wcx3AVqQ5PyQxEHcBbTTijFLeNy8Rid9xCMqSbhVg"}
{"level":"debug","ts":1592558376.0536752,"logger":"tinder/multi","caller":"tinder/driver_multi.go:138","msg":"find peers done","error":"context deadline exceeded"}
{"level":"debug","ts":1592558376.0640793,"logger":"tinder/multi","caller":"tinder/driver_multi.go:138","msg":"find peers done","error":"context deadline exceeded"}
```

```console
# you can also get some logging statistics
$ make watch-log-stats ID=1
Every 2,0s: make log-stats                                                                                                                                                                                                                                                                                                                                                                              fwrz: Fri Jun 19 11:20:53 2020

make[1]: Entering directory '/home/moul/go/src/berty.tech/berty/tool/berty-mini-local-helper'
cat /tmp/berty-mini-43.log | jq -r '.level + " " + .logger + " " + .msg + " " + .error' | sort | uniq -c
      3 debug  rdvp peer resolved addrs
      5 debug tinder/multi find peers done context deadline exceeded
     11 debug tinder/multi found a peer
      6 debug tinder/multi looking for peers
      6 debug tinder/rdvp found peers
      7 info tinder/multi advertise
      9 warn tinder/multi failed to advertise context canceled
      1 warn tinder/multi failed to advertise failed to find any peer in table
make[1]: Leaving directory '/home/moul/go/src/berty.tech/berty/tool/berty-mini-local-helper'
```
