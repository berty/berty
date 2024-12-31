import beapi from '@berty/api'

import { UnaryType, ResponseStreamType } from './types'

export type ServiceClientType<S> = S extends beapi.protocol.ProtocolService
	? WelshProtocolServiceClient
	: S extends beapi.account.AccountService
	? WelshAccountServiceClient
	: S extends beapi.messenger.MessengerService
	? WelshMessengerServiceClient
	: S extends beapi.bridge.BridgeService
	? WelshBridgeServiceClient
	: never

export interface WelshProtocolServiceClient {
	serviceExportData: ResponseStreamType<beapi.protocol.ProtocolService['serviceExportData']>
	serviceGetConfiguration: UnaryType<beapi.protocol.ProtocolService['serviceGetConfiguration']>
	contactRequestReference: UnaryType<beapi.protocol.ProtocolService['contactRequestReference']>
	contactRequestDisable: UnaryType<beapi.protocol.ProtocolService['contactRequestDisable']>
	contactRequestEnable: UnaryType<beapi.protocol.ProtocolService['contactRequestEnable']>
	contactRequestResetReference: UnaryType<
		beapi.protocol.ProtocolService['contactRequestResetReference']
	>
	contactRequestSend: UnaryType<beapi.protocol.ProtocolService['contactRequestSend']>
	contactRequestAccept: UnaryType<beapi.protocol.ProtocolService['contactRequestAccept']>
	contactRequestDiscard: UnaryType<beapi.protocol.ProtocolService['contactRequestDiscard']>
	shareContact: UnaryType<beapi.protocol.ProtocolService['shareContact']>
	decodeContact: UnaryType<beapi.protocol.ProtocolService['decodeContact']>
	contactBlock: UnaryType<beapi.protocol.ProtocolService['contactBlock']>
	contactUnblock: UnaryType<beapi.protocol.ProtocolService['contactUnblock']>
	contactAliasKeySend: UnaryType<beapi.protocol.ProtocolService['contactAliasKeySend']>
	multiMemberGroupCreate: UnaryType<beapi.protocol.ProtocolService['multiMemberGroupCreate']>
	multiMemberGroupJoin: UnaryType<beapi.protocol.ProtocolService['multiMemberGroupJoin']>
	multiMemberGroupLeave: UnaryType<beapi.protocol.ProtocolService['multiMemberGroupLeave']>
	multiMemberGroupAliasResolverDisclose: UnaryType<
		beapi.protocol.ProtocolService['multiMemberGroupAliasResolverDisclose']
	>
	multiMemberGroupAdminRoleGrant: UnaryType<
		beapi.protocol.ProtocolService['multiMemberGroupAdminRoleGrant']
	>
	multiMemberGroupInvitationCreate: UnaryType<
		beapi.protocol.ProtocolService['multiMemberGroupInvitationCreate']
	>
	appMetadataSend: UnaryType<beapi.protocol.ProtocolService['appMetadataSend']>
	appMessageSend: UnaryType<beapi.protocol.ProtocolService['appMessageSend']>
	groupMetadataList: ResponseStreamType<beapi.protocol.ProtocolService['groupMetadataList']>
	groupMessageList: ResponseStreamType<beapi.protocol.ProtocolService['groupMessageList']>
	groupInfo: UnaryType<beapi.protocol.ProtocolService['groupInfo']>
	activateGroup: UnaryType<beapi.protocol.ProtocolService['activateGroup']>
	deactivateGroup: UnaryType<beapi.protocol.ProtocolService['deactivateGroup']>
	groupDeviceStatus: ResponseStreamType<beapi.protocol.ProtocolService['groupDeviceStatus']>
	debugListGroups: ResponseStreamType<beapi.protocol.ProtocolService['debugListGroups']>
	debugInspectGroupStore: ResponseStreamType<
		beapi.protocol.ProtocolService['debugInspectGroupStore']
	>
	debugGroup: UnaryType<beapi.protocol.ProtocolService['debugGroup']>
	systemInfo: UnaryType<beapi.protocol.ProtocolService['systemInfo']>
	credentialVerificationServiceInitFlow: UnaryType<
		beapi.protocol.ProtocolService['credentialVerificationServiceInitFlow']
	>
	credentialVerificationServiceCompleteFlow: UnaryType<
		beapi.protocol.ProtocolService['credentialVerificationServiceCompleteFlow']
	>
	verifiedCredentialsList: ResponseStreamType<
		beapi.protocol.ProtocolService['verifiedCredentialsList']
	>
	replicationServiceRegisterGroup: UnaryType<
		beapi.protocol.ProtocolService['replicationServiceRegisterGroup']
	>
	peerList: UnaryType<beapi.protocol.ProtocolService['peerList']>
	outOfStoreReceive: UnaryType<beapi.protocol.ProtocolService['outOfStoreReceive']>
	outOfStoreSeal: UnaryType<beapi.protocol.ProtocolService['outOfStoreSeal']>
	refreshContactRequest: UnaryType<beapi.protocol.ProtocolService['refreshContactRequest']>
}

export interface WelshAccountServiceClient {
	openAccount: UnaryType<beapi.account.AccountService['openAccount']>
	openAccountWithProgress: ResponseStreamType<
		beapi.account.AccountService['openAccountWithProgress']
	>
	closeAccount: UnaryType<beapi.account.AccountService['closeAccount']>
	closeAccountWithProgress: ResponseStreamType<
		beapi.account.AccountService['closeAccountWithProgress']
	>
	listAccounts: UnaryType<beapi.account.AccountService['listAccounts']>
	deleteAccount: UnaryType<beapi.account.AccountService['deleteAccount']>
	importAccount: UnaryType<beapi.account.AccountService['importAccount']>
	importAccountWithProgress: ResponseStreamType<
		beapi.account.AccountService['importAccountWithProgress']
	>
	createAccount: UnaryType<beapi.account.AccountService['createAccount']>
	updateAccount: UnaryType<beapi.account.AccountService['updateAccount']>
	getGRPCListenerAddrs: UnaryType<beapi.account.AccountService['getGRPCListenerAddrs']>
	logfileList: UnaryType<beapi.account.AccountService['logfileList']>
	streamLogfile: ResponseStreamType<beapi.account.AccountService['streamLogfile']>
	getUsername: UnaryType<beapi.account.AccountService['getUsername']>
	networkConfigSet: UnaryType<beapi.account.AccountService['networkConfigSet']>
	networkConfigGet: UnaryType<beapi.account.AccountService['networkConfigGet']>
	networkConfigGetPreset: UnaryType<beapi.account.AccountService['networkConfigGetPreset']>
	pushReceive: UnaryType<beapi.account.AccountService['pushReceive']>
	pushPlatformTokenRegister: UnaryType<beapi.account.AccountService['pushPlatformTokenRegister']>
	appStoragePut: UnaryType<beapi.account.AccountService['appStoragePut']>
	appStorageGet: UnaryType<beapi.account.AccountService['appStorageGet']>
	appStorageRemove: UnaryType<beapi.account.AccountService['appStorageRemove']>
	getOpenedAccount: UnaryType<beapi.account.AccountService['getOpenedAccount']>
}

export interface WelshMessengerServiceClient {
	instanceShareableBertyID: UnaryType<beapi.messenger.MessengerService['instanceShareableBertyID']>
	shareableBertyGroup: UnaryType<beapi.messenger.MessengerService['shareableBertyGroup']>
	devShareInstanceBertyID: UnaryType<beapi.messenger.MessengerService['devShareInstanceBertyID']>
	devStreamLogs: ResponseStreamType<beapi.messenger.MessengerService['devStreamLogs']>
	parseDeepLink: UnaryType<beapi.messenger.MessengerService['parseDeepLink']>
	sendContactRequest: UnaryType<beapi.messenger.MessengerService['sendContactRequest']>
	systemInfo: UnaryType<beapi.messenger.MessengerService['systemInfo']>
	echoTest: ResponseStreamType<beapi.messenger.MessengerService['echoTest']>
	echoDuplexTest: never
	conversationStream: ResponseStreamType<beapi.messenger.MessengerService['conversationStream']>
	eventStream: ResponseStreamType<beapi.messenger.MessengerService['eventStream']>
	conversationCreate: UnaryType<beapi.messenger.MessengerService['conversationCreate']>
	conversationJoin: UnaryType<beapi.messenger.MessengerService['conversationJoin']>
	accountGet: UnaryType<beapi.messenger.MessengerService['accountGet']>
	accountUpdate: UnaryType<beapi.messenger.MessengerService['accountUpdate']>
	accountPushConfigure: UnaryType<beapi.messenger.MessengerService['accountPushConfigure']>
	contactRequest: UnaryType<beapi.messenger.MessengerService['contactRequest']>
	contactAccept: UnaryType<beapi.messenger.MessengerService['contactAccept']>
	interact: UnaryType<beapi.messenger.MessengerService['interact']>
	conversationOpen: UnaryType<beapi.messenger.MessengerService['conversationOpen']>
	conversationClose: UnaryType<beapi.messenger.MessengerService['conversationClose']>
	conversationLoad: UnaryType<beapi.messenger.MessengerService['conversationLoad']>
	conversationMute: UnaryType<beapi.messenger.MessengerService['conversationMute']>
	replicationServiceRegisterGroup: UnaryType<
		beapi.messenger.MessengerService['replicationServiceRegisterGroup']
	>
	replicationSetAutoEnable: UnaryType<beapi.messenger.MessengerService['replicationSetAutoEnable']>
	bannerQuote: UnaryType<beapi.messenger.MessengerService['bannerQuote']>
	instanceExportData: ResponseStreamType<beapi.messenger.MessengerService['instanceExportData']>
	messageSearch: UnaryType<beapi.messenger.MessengerService['messageSearch']>
	listMemberDevices: ResponseStreamType<beapi.messenger.MessengerService['listMemberDevices']>
	tyberHostSearch: ResponseStreamType<beapi.messenger.MessengerService['tyberHostSearch']>
	tyberHostAttach: UnaryType<beapi.messenger.MessengerService['tyberHostAttach']>
	debugAuthServiceSetToken: UnaryType<beapi.messenger.MessengerService['debugAuthServiceSetToken']>
	servicesTokenList: ResponseStreamType<beapi.messenger.MessengerService['servicesTokenList']>
	authServiceInitFlow: UnaryType<beapi.messenger.MessengerService['authServiceInitFlow']>
	authServiceCompleteFlow: UnaryType<beapi.messenger.MessengerService['authServiceCompleteFlow']>
	pushSetAutoShare: UnaryType<beapi.messenger.MessengerService['pushSetAutoShare']>
	pushShareTokenForConversation: UnaryType<
		beapi.messenger.MessengerService['pushShareTokenForConversation']
	>
	pushTokenSharedForConversation: ResponseStreamType<
		beapi.messenger.MessengerService['pushTokenSharedForConversation']
	>
	pushReceive: UnaryType<beapi.messenger.MessengerService['pushReceive']>
	pushSend: UnaryType<beapi.messenger.MessengerService['pushSend']>
	pushSetDeviceToken: UnaryType<beapi.messenger.MessengerService['pushSetDeviceToken']>
	pushSetServer: UnaryType<beapi.messenger.MessengerService['pushSetServer']>
	directoryServiceRegister: UnaryType<beapi.messenger.MessengerService['directoryServiceRegister']>
	directoryServiceUnregister: UnaryType<
		beapi.messenger.MessengerService['directoryServiceUnregister']
	>
	directoryServiceQuery: ResponseStreamType<
		beapi.messenger.MessengerService['directoryServiceQuery']
	>
}

export interface WelshBridgeServiceClient {
	clientInvokeUnary: UnaryType<beapi.bridge.BridgeService['clientInvokeUnary']>
	createClientStream: UnaryType<beapi.bridge.BridgeService['createClientStream']>
	clientStreamSend: UnaryType<beapi.bridge.BridgeService['clientStreamSend']>
	clientStreamRecv: UnaryType<beapi.bridge.BridgeService['clientStreamRecv']>
	clientStreamClose: UnaryType<beapi.bridge.BridgeService['clientStreamClose']>
	clientStreamCloseAndRecv: UnaryType<beapi.bridge.BridgeService['clientStreamCloseAndRecv']>
}
