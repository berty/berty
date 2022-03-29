# `@berty/grpc-bridge`

Berty GRPC plumbing

# Usage

## React

Tested with a raw `create-react-app`

```sh
yarn add '@berty/grpc-bridge@2.361.5' '@berty/api@2.361.1' '@improbable-eng/grpc-web@^0.15.0' 'google-protobuf@^3.14.0'
```

```js
import './App.css';
import beapi from "@berty/api"
import { Service, rpcWeb, logger } from "@berty/grpc-bridge"
import { grpc } from "@improbable-eng/grpc-web"

function App() {
  return (
    <div className="App">
      <button onClick={async () => {
        const opts = {
          transport: grpc.CrossBrowserHttpTransport({ withCredentials: false }),
          host: "http://127.0.0.1:9091",
        }
        const rpc = rpcWeb(opts)
        const client = Service(beapi.messenger.MessengerService, rpc, logger.create('MESSENGER'))

        const accountReply = await client.accountGet({})
        console.log("account", accountReply)

        const stream = await client.eventStream({})
        stream.onMessage(msg => console.log("got msg:", msg))
        stream.start()

        await client.accountUpdate({ displayName: "niceeee" })
      }}>
        Test
      </button>
    </div>
  );
}

export default App;
```

## Node

```sh
yarn add '@berty/grpc-bridge@2.361.5' '@berty/api@2.361.1' '@improbable-eng/grpc-web@^0.15.0' '@improbable-eng/grpc-web-node-http-transport@^0.15.0' 'google-protobuf@^3.14.0'
```

```js
const beapi = require("@berty/api")
const { Service, rpcWeb, logger } = require("@berty/grpc-bridge")
const { NodeHttpTransport } = require('@improbable-eng/grpc-web-node-http-transport')

const opts = {
    transport: NodeHttpTransport(),
    host: "http://127.0.0.1:9091",
}
const rpc = rpcWeb(opts)

const client = Service(beapi.messenger.MessengerService, rpc, logger.create('MESSENGER'))

client.eventStream({}).then(stream => {
    stream.onMessage(msg => console.log("msg:", msg))
    stream.start().then((r) => {
        console.log("eventStream started:", r)
        client.accountUpdate({ displayName: "toto" })
    })
})
```