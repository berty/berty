export enum GlobalPersistentOptionsKeys {
	TyberHost = 'tyberHost',
	DisplayName = 'displayName',
	IsHidden = 'isHidden',
	LogFilters = 'logFilters',
	ForceMock = 'forceMock',
}

export type GlobalPersistentOptions = {
	[GlobalPersistentOptionsKeys.LogFilters]: GlobalPersistentOptionsLogFilters
	[GlobalPersistentOptionsKeys.TyberHost]: GlobalPersistentOptionsTyberHost
	[GlobalPersistentOptionsKeys.ForceMock]: GlobalPersistentOptionsForceMock
}

type GlobalPersistentOptionsLogFilters = {
	format: string
}

type GlobalPersistentOptionsTyberHost = {
	address: string
}

type GlobalPersistentOptionsForceMock = boolean
