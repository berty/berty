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

export type GlobalPersistentOptionsLogFilters = {
	format: string
}

export type GlobalPersistentOptionsTyberHost = {
	address: string
}
