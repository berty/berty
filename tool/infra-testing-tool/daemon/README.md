# Infra daemon
```
 AWS Instance
┌─────────────────────────────────┐
│                                 │
│  ┌───────────┐   ┌───────────┐  │
│  │ Berty     │   │Token      │  │
│  │ Daemon    │   │Server     │  │
│  │           │◄─►│           │  │
│  │localhost  │   │localhost  │  │
│  └─┬──┬──────┘   └───────────┘  │
│    │  │                         │
│    │  │                         │
│    │  │                         │
│    │  │          ┌───────────┐  │
│    │  │          │ Infra     │  │
│    │  └─────────►│ Daemon    │  │
│    │   gRPC 9091 │           │  │
│    │             │0.0.0.0    │  │
│    │             └────┬──────┘  │
│    │                  │         │
└────┼──────────────────┼─────────┘
     │                  │
     │                  │
     ▼                  ▼
    WAN            Controller
```

The infra daemon works as a smart control proxy between the actual Berty daemon.

This looks like just another abstraction, but it serves a good purpose. Before this infra-daemon the process used for starting tests was handling all messaging too.
This meant all traffic between daemons came from a single location. Which became a bottleneck quickly.
In addition to this, chaos engineering was not possible because once the node lost connection with the original server, it wouldn't be able to send messages (because it couldn't).
Now we have the infra-daemon sending messages to the berty daemon on the instance itself. this means the access to WAN can disappear, but it will still keep trying.


```protobuf
service Peer {
  rpc TestConnection(TestConnection_Request) returns (TestConnection_Response) {}
  rpc ConnectToPeer(ConnectToPeer_Request) returns (ConnectToPeer_Response) {}
}

service Group {
  rpc TestConnection(TestConnection_Request) returns (TestConnection_Response) {}
  rpc CreateInvite(CreateInvite_Request) returns (CreateInvite_Response) {}
  rpc JoinGroup(JoinGroup_Request) returns (JoinGroup_Response) {}
  rpc StartReceiveMessage(StartReceiveMessage_Request) returns (StartReceiveMessage_Response) {}
  rpc StopReceiveMessage(StopReceiveMessage_Request) returns (StopReceiveMessage_Response) {}
}

service Test {
  rpc TestConnection(TestConnection_Request) returns (TestConnection_Response) {}
  rpc NewTest(NewTest_Request) returns (NewTest_Response) {}
  rpc StartTest(StartTest_Request) returns (StartTest_Response) {}
  rpc IsTestRunning(IsTestRunning_Request) returns (IsTestRunning_Response) {}
}
```

## running protoc
```
cd daemon/grpc

protoc \
    --go_out=./daemon --go_opt=paths=source_relative \
    --go-grpc_out=./daemon --go-grpc_opt=paths=source_relative \
    daemon.proto
```

infra-daemon.service is used in the packer image to tell systemd to start up the daemon on startup.
