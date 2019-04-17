module berty.tech/client/react-native/desktop

go 1.12

require (
	berty.tech/client/react-native/gomobile v0.0.0
	berty.tech/core v0.0.0
	github.com/akavel/rsrc v0.0.0-20170831122431-f6a15ece2cfd // indirect
	github.com/asticode/go-astiamqp v1.0.0 // indirect
	github.com/asticode/go-astilectron v0.8.1-0.20190413132916-5aeb8e509a8d // indirect
	github.com/asticode/go-astilectron-bootstrap v0.0.0-20180616141213-b3211646d205
	github.com/asticode/go-astilog v1.0.0
	github.com/asticode/go-bindata v0.0.0-20151023091102-a0ff2567cfb7 // indirect
	github.com/pkg/browser v0.0.0-20180916011732-0a3d74bf9ce4
	github.com/pkg/errors v0.8.1
	github.com/sam-kamerer/go-plister v0.0.0-20190202124357-57f251aa88ff // indirect
	github.com/shibukawa/configdir v0.0.0-20170330084843-e180dbdc8da0
	go.uber.org/zap v1.9.1
)

replace berty.tech/core v0.0.0 => ../../../core

replace berty.tech/client/react-native/gomobile v0.0.0 => ../gomobile
