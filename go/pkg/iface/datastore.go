package iface

import "context"

type CryptoConfigRepository interface {
	GetPublicRendezvousPointSeed(ctx context.Context) ([]byte, error)
	ResetPublicRendezvousPointSeed(ctx context.Context) ([]byte, error)
}

type ProtocolConfigRepository interface {
	IsPublicRendezvousPointEnabled(ctx context.Context) (bool, error)
	EnablePublicRendezvousPoint(ctx context.Context) (bool, error)
	DisablePublicRendezvousPoint(ctx context.Context) (bool, error)
}

type ConfigRepository interface {
	CryptoConfigRepository
	ProtocolConfigRepository
}

type CryptoDataStore interface {
	Config() CryptoConfigRepository
}

type ProtocolDataStore interface {
	Config() ProtocolConfigRepository
}

type DataStore interface {
	Config() ConfigRepository
}
