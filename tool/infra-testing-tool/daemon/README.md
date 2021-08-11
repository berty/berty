# Infra daemon
```
 AWS Instance
┌─────────────────────────────────┐
│                                 │
│  ┌───────────┐   ┌───────────┐  │
│  │ Berty     │   │Token      │  │
│  │ Daemon    │   │Server     │  │
│  │           │   │           │  │
│  │localhost  │   │0.0.0.0    │  │
│  │:9091      │   │:8091      │  │
│  └───────────┘   └───────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Infra                     │  │
│  │ Daemon                    │  │
│  │                           │  │
│  │ 0.0.0.0                   │  │
│  │ :7091                     │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

The infra daemon works as a smart control proxy between the actual Berty daemon.

This looks like just another abstraction, but it serves a good purpose. Before this infra-daemon the process used for starting tests was handling all messaging too.
This meant all traffic between daemons came from a single location. Which became a bottleneck quickly.
In addition to this, chaos engineering was not possible because once the node lost connection with the original server, it wouldn't be able to send messages (because it couldn't).
Now we have the infra-daemon sending messages to the berty daemon on the instance itself. this means the access to WAN can disappear, but it will still keep trying.


infra-daemon.service is used in the packer image to tell systemd to start up the daemon on startup.

```protobuf
service Proxy {
    rpc TestConnection(TestConnection.Request) returns (TestConnection.Response) {}
    rpc TestConnectionToPeer(TestConnectionToPeer.Request) returns (TestConnectionToPeer.Response) {}
    rpc IsProcessRunning(StartTest.Request) returns (StartTest.Response) {}

    rpc ConnectToPeer(ConnectToPeer.Request) returns (ConnectToPeer.Response) {}
    rpc UploadLogs(UploadLogs.Request) returns (UploadLogs.Response) {}

    rpc CreateInvite(CreateInvite.Request) returns (CreateInvite.Response) {}
    rpc JoinGroup(JoinGroup.Request) returns (JoinGroup.Response) {}
    rpc StartReceiveMessage(StartReceiveMessage.Request) returns (StartReceiveMessage.Response) {}
    rpc StopReceiveMessage(StopReceiveMessage.Request) returns (StopReceiveMessage.Response) {}
    rpc AddReplication(AddReplication.Request) returns (AddReplication.Response) {}

    rpc NewTest(NewTest.Request) returns (NewTest.Response) {}
    rpc StartTest(StartTest.Request) returns (StartTest.Response) {}
    rpc IsTestRunning(IsTestRunning.Request) returns (IsTestRunning.Response) {}
}
```

## running protoc
assuming you have `protoc` and `protoc-gen-go` installed
```
cd daemon/grpc

protoc \
    --go_out=./daemon --go_opt=paths=source_relative \
    --go-grpc_out=./daemon --go-grpc_opt=paths=source_relative \
    daemon.proto
```
