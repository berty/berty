package core

type MobileOptions struct {
	logger        NativeLogger
	datastorePath string
	nickname      string
}

func (cfg *MobileOptions) WithDatastorePath(path string) *MobileOptions {
	cfg.datastorePath = path
	return cfg
}

func (cfg *MobileOptions) WithLoggerDriver(logger NativeLogger) *MobileOptions {
	cfg.logger = logger
	return cfg
}

func (cfg *MobileOptions) WithNickname(nickname string) *MobileOptions {
	cfg.nickname = nickname
	return cfg
}
