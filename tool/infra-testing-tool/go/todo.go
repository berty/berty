package main

// MVP

//TODO:
// automatic instance size based on amount of connections

//FIXME:
// clean up message testing

//FIXME
// panic: rpc error: code = Unknown desc = RequestError: send request failed
// caused by: Get "https://s3.eu-west-3.amazonaws.com/": dial tcp 52.95.155.45:443: i/o timeout

//FIXME:
// protocol/transport selection
// for each protocol, add a new swarm listener
// improve the security groups
// if connected to internet, wide open
// if not, restricted grpc only
// certain ports for certain protocols, etc

// OTHER FEATURES

//TODO:
// chaos engineering
// chaos logging
// configurable reliability

//TODO:
// set flags

//TODO:
// download all logs to /infraState

//TODO:
// automatic pem generation

//TODO:
// message hashing and comparing
