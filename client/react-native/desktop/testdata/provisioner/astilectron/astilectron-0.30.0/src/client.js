'use strict'

const net = require('net');
const url = require('url');

// Client can read/write messages from a TCP server
class Client {
    // init initializes the Client
    init() {
        let u = url.parse("tcp://" + process.argv[2], false, false)
        this.socket = new net.Socket()
        this.socket.connect(u.port, u.hostname, function() {});
        this.socket.on('close', function() {
            process.exit()
        })
        return this
    }

    // write writes an event to the server
    write(targetID, eventName, payload) {
        let data = {name: eventName, targetID: targetID}
        if (typeof payload !== "undefined") Object.assign(data, payload)
        this.socket.write(JSON.stringify(data) + "\n")
    }
}

module.exports = new Client()
