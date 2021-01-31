# GomobileIPFS

## concept

### Driver
```
┌───────────────┐             ┌───────────────┐            ┌───────────────┐
│               │             │               │            │               │
│    Native     │             │  Init Driver  │            │      Go       │
│ (IOS/Android) │────────────▶│               │───────────▶│               │
│               │             │               │            │               │
└───────────────┘             └───────────────┘            └───────────────┘
        │                                                          │
        │                                                          │
        │                                                          │
        │                                                          ▼
        │                                                  ┌───────────────┐
        │                                                  │               │
        │                         implement                │   Interface   │
        └─────────────────────────────────────────────────▶│   (Driver)    │
                                                           │               │
                                                           └───────────────┘
```

- Go can call Native by calling **Driver** method directly
- Native can call Go Method with **Driver** `RegisterHandler` method

#### RegisterHandler example
_example from berty_
```go
// BackgroundTask

type BackgroundTaskHandlerDriver interface {
    RegisterHandler(BackgroundTaskHandler)
}

type BackgroundTaskHandler interface {
    HandleTask() LifeCycleBackgroundTask
}

type BackgroundTaskDriver interface {
    Execute() (success bool)
}
```
[berty](https://github.com/berty/berty/blob/master/go/framework/bertynative/driver_lifecycle.go)


##### implement in swift
```swift
// BackgroundTaskDriver implement BackgroundTaskHandler
public class BackgroundTaskDriver: BackgroundTaskHandlerDriverProtocol {
    let handler: BackgroundTaskHandlerProtocol
    func registerHandler(handler: BackgroundTaskHandlerProtocol) {
            self.handler = handler
    }

    func executeGoBackgroundTask() {
          let success = self.handler.Execute()
    }
}
```
[berty](https://github.com/berty/berty/blob/master/js/ios/Berty/Sources/LifeCycle.swift#L24)

##### Usage in gomobileipfs
user will then simply register the driver to ios background task system then pass it to go
```swift
// pseudo code below
// ...
backgroundDriver = BackgroundTaskDriver()

// user register
registerLifecycleBackgroundTaskToIOS("myapp.ios.background-task", backgroundDriver)

// go node init
let node = IPFSNode()
node.withBackgroundTaskDriver(backgroundDriver)
// ...
```
[berty](https://github.com/berty/berty/blob/master/js/ios/Berty/AppDelegate.m#L54)


### GomobileIPFS \w berty


```
╔════════╦━━━━━━━━━━━━━━━━┓        ┏╦═════════════╦━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
║ Berty  ║                ┃        ┃║GomobileIPFS ║                                                     ┃
╠════════╝                ┃        ┃╚═════════════╝                                                     ┃
┃                         ┃        ┃                                                                    ┃
┃     ┌────────────┐      ┃        ┃                           ┌────────────┐                           ┃
┃     │            │      ┃        ┃                           │            │                           ┃
┃     │    pkg     │      ┃        ┃                           │    pkg     │                           ┃
┃     │            │      ┃        ┃                           │            │                           ┃
┃     └────────────┘      ┃        ┃                           └────────────┘                           ┃
┃            │            ┃        ┃                                  │                                 ┃
┃            │            ┃        ┃               ┌──────────────────┴────────────────┐                ┃
┃            ▼            ┃        ┃               ▼                                   ▼                ┃
┃     ┌────────────┐      ┃        ┃        ┌────────────┐                      ┌────────────┐          ┃
┃     │            │      ┃        ┃        │            │                      │            │          ┃
┃     │   bridge   │◀─────╋─import─╋────────│   driver   │────────import─┐      │    node    │          ┃
┃     │            │      ┃        ┃        │            │               │      │            │          ┃
┃     └────────────┘      ┃        ┃        └────────────┘               │      └────────────┘          ┃
┃            │            ┃        ┃            ▲     ▲                  │             │                ┃
┃            │            ┃        ┃            │     │                  │             └───────┐        ┃
┃            │            ┃        ┃            │     │                  │                     ▼        ┃
┃            │            ┃        ┃            │     │                  │               ┌───────────┐  ┃
┃            │            ┃        ┃            │     │                  │               │           │  ┃
┃            │            ┃        ┃            │     │                  └──────────────▶│   bind    │  ┃
┃            │            ┃        ┃            │     │                                  │           │  ┃
┃            │            ┃        ┃            │     │                                  └───────────┘  ┃
┃            │            ┃        ┃            │     │                                        │        ┃
┃            │            ┃        ┃            │     │                                        │        ┃
┃            │            ┃        ┃           implement                                       │        ┃
┃            │            ┃        ┃            │     │                                        │        ┃
┃            │            ┃        ┃            │     │                                        │        ┃
┃          gobind         ┃        ┃            │     │                                      gobind     ┃
┃            │            ┃        ┃            │     │                                        │        ┃
┃            │            ┃        ┃            │     │                                        │        ┃
┃            │            ┃        ┃            │     │                                        │        ┃
┃            │            ┃        ┃            │     │                                        │        ┃
┃            │            ┃        ┃            │     │                                        │        ┃
┃            ▼            ┃        ┃            │     │                                        ▼        ┃
┃     ┏━━━━━━━━━━━━┓      ┃        ┃            │     │                                 ┏━━━━━━━━━━━━┓  ┃
┃     ┃   Berty    ┃      ┃        ┃            │     │                                 ┃GomobileIPFS┃  ┃
┃     ┃ Framework  ┃──────╋────────╋────────────┘     └─────────────────────────────────┃ Framework  ┃  ┃
┃     ┃            ┃      ┃        ┃                                                    ┃            ┃  ┃
┃     ┗━━━━━━━━━━━━┛      ┃        ┃                                                    ┗━━━━━━━━━━━━┛  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛        ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```
