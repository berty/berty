module berty.tech/core

go 1.12

require (
	cloud.google.com/go v0.34.0 // indirect
	github.com/0xAX/notificator v0.0.0-20181105090803-d81462e38c21
	github.com/99designs/gqlgen v0.7.2
	github.com/NaySoftware/go-fcm v0.0.0-20180207124314-28fff9381d17
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
	github.com/gopherjs/gopherjs v0.0.0-20181103185306-d547d1d9531e // indirect
	github.com/gorilla/websocket v1.4.0
	github.com/gosimple/slug v1.4.2
	github.com/grpc-ecosystem/go-grpc-middleware v1.0.1-0.20190222133341-cfaf5686ec79
	github.com/improbable-eng/grpc-web v0.9.1
	github.com/ipfs/go-cid v0.0.2
	github.com/ipfs/go-datastore v0.0.5
	github.com/ipfs/go-ipfs-addr v0.0.1
	github.com/ipfs/go-ipfs-routing v0.1.0
	github.com/ipfs/go-ipfs-util v0.0.1
	github.com/ipfs/go-log v0.0.1
	github.com/jinzhu/gorm v1.9.2
	github.com/jinzhu/now v1.0.0 // indirect
	github.com/jtolds/gls v4.2.2-0.20181110203027-b4936e06046b+incompatible // indirect
	github.com/karrick/godirwalk v1.8.0 // indirect
	github.com/libp2p/go-conn-security v0.1.0
	github.com/libp2p/go-conn-security-multistream v0.1.0
	github.com/libp2p/go-libp2p v0.1.1
	github.com/libp2p/go-libp2p-circuit v0.1.0
	github.com/libp2p/go-libp2p-connmgr v0.1.0
	github.com/libp2p/go-libp2p-core v0.0.3
	github.com/libp2p/go-libp2p-crypto v0.1.0
	github.com/libp2p/go-libp2p-discovery v0.1.0
	github.com/libp2p/go-libp2p-host v0.1.0
	github.com/libp2p/go-libp2p-interface-connmgr v0.1.0
	github.com/libp2p/go-libp2p-interface-pnet v0.1.0
	github.com/libp2p/go-libp2p-kad-dht v0.1.0
	github.com/libp2p/go-libp2p-metrics v0.1.0
	github.com/libp2p/go-libp2p-net v0.1.0
	github.com/libp2p/go-libp2p-peer v0.2.0
	github.com/libp2p/go-libp2p-peerstore v0.1.0
	github.com/libp2p/go-libp2p-pnet v0.1.0
	github.com/libp2p/go-libp2p-protocol v0.1.0
	github.com/libp2p/go-libp2p-quic-transport v0.1.2-0.20190602113809-9400928a835e
	github.com/libp2p/go-libp2p-record v0.1.0
	github.com/libp2p/go-libp2p-routing v0.1.0
	github.com/libp2p/go-libp2p-swarm v0.1.0
	github.com/libp2p/go-libp2p-tls v0.1.0
	github.com/libp2p/go-libp2p-transport v0.1.0
	github.com/libp2p/go-libp2p-transport-upgrader v0.1.1
	github.com/libp2p/go-maddr-filter v0.0.4
	github.com/libp2p/go-reuseport v0.0.1
	github.com/libp2p/go-reuseport-transport v0.0.2
	github.com/libp2p/go-stream-muxer v0.1.0
	github.com/libp2p/go-tcp-transport v0.1.0
	github.com/libp2p/go-ws-transport v0.1.0
	github.com/libp2p/go-yamux v1.2.3
	github.com/maruel/circular v0.0.0-20161028021427-97eeabbe7b43
	github.com/maruel/ut v1.0.0 // indirect
	github.com/multiformats/go-multiaddr v0.0.4
	github.com/multiformats/go-multiaddr-net v0.0.1
	github.com/multiformats/go-multihash v0.0.5
	github.com/multiformats/go-multistream v0.1.0
	github.com/mwitkow/go-conntrack v0.0.0-20161129095857-cc309e4a2223 // indirect
	github.com/nicksnyder/go-i18n/v2 v2.0.0-beta.6
	github.com/opentracing/opentracing-go v1.0.2
	github.com/pkg/errors v0.8.1
	github.com/rainycape/unidecode v0.0.0-20150907023854-cb7f23ec59be // indirect
	github.com/rogpeppe/go-internal v1.2.2 // indirect
	github.com/rs/cors v1.6.0
	github.com/sideshow/apns2 v0.0.0-20181014012405-060d44b53d05
	github.com/smartystreets/assertions v0.0.0-20190215210624-980c5ac6f3ac // indirect
	github.com/smartystreets/goconvey v0.0.0-20190222223459-a17d461953aa
	github.com/sparrc/go-ping v0.0.0-20181106165434-ef3ab45e41b0
	github.com/spf13/cobra v0.0.3
	github.com/spf13/pflag v1.0.3
	github.com/spf13/viper v1.3.1
	github.com/teris-io/shortid v0.0.0-20171029131806-771a37caa5cf
	github.com/uber-go/atomic v1.3.2 // indirect
	github.com/uber/jaeger-client-go v2.15.0+incompatible
	github.com/uber/jaeger-lib v1.5.0 // indirect
	github.com/vektah/gqlparser v1.1.1
	github.com/whyrusleeping/go-logging v0.0.0-20170515211332-0457bb6b88fc
	github.com/whyrusleeping/go-smux-multistream v2.0.2+incompatible
	github.com/whyrusleeping/mafmt v1.2.8
	github.com/xeodou/go-sqlcipher v0.0.0-20180523161204-7f9cd319987f
	go.uber.org/atomic v1.3.2 // indirect
	go.uber.org/multierr v1.1.0 // indirect
	go.uber.org/zap v1.9.1
	golang.org/x/net v0.0.0-20190522155817-f3200d17e092
	golang.org/x/text v0.3.2
	golang.org/x/tools v0.0.0-20190521203540-521d6ed310dd // indirect
	google.golang.org/genproto v0.0.0-20190307195333-5fe7a883aa19
	google.golang.org/grpc v1.19.0
	gopkg.in/gormigrate.v1 v1.4.0
	gopkg.in/natefinch/lumberjack.v2 v2.0.0
	gopkg.in/yaml.v2 v2.2.2
)
