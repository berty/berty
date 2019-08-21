module berty.tech/core

go 1.12

require (
	berty.tech/network v0.0.0
	cloud.google.com/go v0.34.0 // indirect
	github.com/0xAX/notificator v0.0.0-20181105090803-d81462e38c21
	github.com/NaySoftware/go-fcm v0.0.0-20180207124314-28fff9381d17
	github.com/akavel/rsrc v0.0.0-20170831122431-f6a15ece2cfd // indirect
	github.com/asticode/go-astiamqp v1.0.0 // indirect
	github.com/asticode/go-astilectron v0.8.1-0.20190415090856-5d5f14367434
	github.com/asticode/go-astilectron-bootstrap v0.0.0-20180616141213-b3211646d205
	github.com/asticode/go-astilectron-bundler v0.0.0-20190426172205-155c2a10bbb1 // indirect
	github.com/asticode/go-astilog v1.0.0
	github.com/asticode/go-bindata v0.0.0-20151023091102-a0ff2567cfb7 // indirect
	github.com/brianvoe/gofakeit v3.17.0+incompatible
	github.com/codahale/hdrhistogram v0.0.0-20161010025455-3a0bb77429bd // indirect
	github.com/denisenkom/go-mssqldb v0.0.0-20190204142019-df6d76eb9289 // indirect
	github.com/dgrijalva/jwt-go v3.2.0+incompatible // indirect
	github.com/gobuffalo/envy v1.6.15 // indirect
	github.com/gobuffalo/flect v0.1.0 // indirect
	github.com/gobuffalo/logger v0.0.0-20190224201004-be78ebfea0fa // indirect
	github.com/gobuffalo/packd v0.0.0-20190224160250-d04dd98aca5b // indirect
	github.com/gobuffalo/packr/v2 v2.0.1
	github.com/gofrs/uuid v3.2.0+incompatible
	github.com/gogo/protobuf v1.2.1
	github.com/golang/protobuf v1.3.1
	github.com/google/uuid v1.1.1
	github.com/gosimple/slug v1.4.2
	github.com/grpc-ecosystem/go-grpc-middleware v1.0.1-0.20190222133341-cfaf5686ec79
	github.com/improbable-eng/grpc-web v0.9.1
	github.com/ipfs/go-log v0.0.1
	github.com/jinzhu/gorm v1.9.2
	github.com/jinzhu/now v1.0.0 // indirect
	github.com/karrick/godirwalk v1.8.0 // indirect
	github.com/libp2p/go-libp2p-crypto v0.1.0
	github.com/libp2p/go-libp2p-host v0.1.0
	github.com/libp2p/go-reuseport v0.0.1
	github.com/maruel/circular v0.0.0-20161028021427-97eeabbe7b43
	github.com/maruel/ut v1.0.0 // indirect
	github.com/mwitkow/go-conntrack v0.0.0-20161129095857-cc309e4a2223 // indirect
	github.com/nicksnyder/go-i18n/v2 v2.0.0-beta.6
	github.com/opentracing/opentracing-go v1.0.2
	github.com/pkg/browser v0.0.0-20180916011732-0a3d74bf9ce4
	github.com/pkg/errors v0.8.1
	github.com/rainycape/unidecode v0.0.0-20150907023854-cb7f23ec59be // indirect
	github.com/rogpeppe/go-internal v1.2.2 // indirect
	github.com/rs/cors v1.6.0 // indirect
	github.com/sam-kamerer/go-plister v0.0.0-20190202124357-57f251aa88ff // indirect
	github.com/shibukawa/configdir v0.0.0-20170330084843-e180dbdc8da0
	github.com/sideshow/apns2 v0.0.0-20181014012405-060d44b53d05
	github.com/smartystreets/goconvey v0.0.0-20190222223459-a17d461953aa
	github.com/spf13/cobra v0.0.3
	github.com/spf13/pflag v1.0.3
	github.com/spf13/viper v1.3.1
	github.com/syndtr/goleveldb v1.0.0
	github.com/teris-io/shortid v0.0.0-20171029131806-771a37caa5cf
	github.com/uber-go/atomic v1.3.2 // indirect
	github.com/uber/jaeger-client-go v2.15.0+incompatible
	github.com/uber/jaeger-lib v1.5.0 // indirect
	github.com/whyrusleeping/go-logging v0.0.0-20170515211332-0457bb6b88fc
	github.com/xeodou/go-sqlcipher v0.0.0-20180523161204-7f9cd319987f
	go.uber.org/zap v1.9.1
	golang.org/x/net v0.0.0-20190628185345-da137c7871d7
	golang.org/x/text v0.3.2
	golang.org/x/tools v0.0.0-20190628222527-fb37f6ba8261 // indirect
	google.golang.org/genproto v0.0.0-20190307195333-5fe7a883aa19
	google.golang.org/grpc v1.19.0
	gopkg.in/gormigrate.v1 v1.4.0
	gopkg.in/natefinch/lumberjack.v2 v2.0.0
	gopkg.in/yaml.v2 v2.2.2
)

replace berty.tech/network v0.0.0 => ../network

replace github.com/libp2p/go-libp2p-quic-transport => github.com/berty/go-libp2p-quic-transport v0.1.2-0.20190805113730-01a06cdc5461
