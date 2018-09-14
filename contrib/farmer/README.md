# farmer (dev node manager)

## Usage

```console
$ ./farmer up 1
# start devnodes 1 (create it first if needed)
#     graphql port is exposed on localhost:12801
#     grpc    port is exposed on localhost:12901
$ ./farmer up {10..20}
# equivalent of ./farmer up 10 11 12 13 14 15 16 17 18 19 20
$ ./farmer stop 15
# stop node 15 but keep its data (can be started again with 'up')
$ ./farmer down 15
# stop and remove data of node 15
$ ./farmer stop
# without node number, the command is executed on every available node (a.k.a., 'stop all')
$ ./farmer up
# start every defined nodes
$ ./farmer down
# stop and cleanup everything
$ ./farmer ps
# show current status
$ ./farmer logs
# show logs
$ ./farmer info
# display info line for nodes, containing listening ports and user-id
$ ./farmer build
# rebuild the docker image
```
