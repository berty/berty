`astilectron` is an Electron app that provides an API over a TCP socket that allows executing Electron's method as well as capturing Electron's events.

# Architecture

    +-----------------------+    TCP    +-------------+    IPC   +---------------------+
    + Client App (any Lang) |<--------->+ Astilectron +<-------->+ win1: (HTML/JS/CSS) +
    +-----------------------+           +-------------+     |    +---------------------++
                 |                             |            +---->+ win2: (HTML/JS/CSS) +
                 |         +----------+        |               |  +---------------------++
                 +---------+ Electron +--------+               +-->+ win3: (HTML/JS/CSS) +
                           +----------+                            +---------------------+
                            
# Language bindings

Language bindings play a major role with `astilectron` as they allow communicating with its TCP socket and therefore interacting with its API in any language.

## I want to develop language bindings for a new language

Great! :)

Here's a few things you need to know:

- it's the responsibility of the language bindings to provision `astilectron` which usually consists of downloading and unzipping `astilectron` as well as `electron`
- the TCP addr is sent to `astilectron` through a command line argument therefore your command line when calling `astilectron` should look like `<path to electron executable> <path to astilectron directory>/main.js <tcp addr>`

## Language bindings for GO

Check out [go-astilectron](https://github.com/asticode/go-astilectron) for `astilectron` GO language bindings

# Features and roadmap

- [x] window basic methods (create, show, close, resize, minimize, maximize, ...)
- [x] window basic events (close, blur, focus, unresponsive, crashed, ...)
- [x] remote messaging (messages between GO and the JS in the webserver)
- [x] multi screens/displays
- [x] menu methods and events (create, insert, append, popup, clicked, ...)
- [x] dialogs (open or save file, alerts, ...)
- [ ] accelerators (shortcuts)
- [ ] file methods (drag & drop, ...)
- [ ] clipboard methods
- [ ] power monitor events (suspend, resume, ...)
- [ ] notifications (macosx)
- [ ] desktop capturer (audio and video)
- [ ] session methods
- [ ] session events
- [ ] window advanced options (add missing ones)
- [ ] window advanced methods (add missing ones)
- [ ] window advanced events (add missing ones)
- [ ] child windows

# Contribute

For now only GO has its official bindings with `astilectron`, but the more language has its bindings the better! Therefore if you feel like implementing bindings with `astilectron` in some other language feel free to reach out to me to get some more info and finally to get your repo listed here.

Also I'm far from being an expert in Node.JS therefore if you see anything that seems wrong in `astilectron` feel free to create an issue or even better contribute through a PR!

You know you want to! :D

# Cheers to

[thrust](https://github.com/breach/thrust) which is awesome but unfortunately not maintained anymore. It inspired this project.
