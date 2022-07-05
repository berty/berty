export enum GlobalPersistentOptionsKeys {
	TyberHost = 'tyberHost',
	DisplayName = 'displayName',
	IsHidden = 'isHidden',
	LogFilters = 'logFilters',
}

export type GlobalPersistentOptions = {
	[GlobalPersistentOptionsKeys.LogFilters]: GlobalPersistentOptionsLogFilters
	[GlobalPersistentOptionsKeys.TyberHost]: GlobalPersistentOptionsTyberHost
}

type GlobalPersistentOptionsLogFilters = {
	format: string
}

type GlobalPersistentOptionsTyberHost = {
	address: string
}
