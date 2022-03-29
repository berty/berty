import beapi from '@berty/api'

import { UnaryType, RequestStreamType, ResponseStreamType } from './types'

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
	instanceExportData: ResponseStreamType<beapi.protocol.ProtocolService['instanceExportData']>
	instanceGetConfiguration: UnaryType<beapi.protocol.ProtocolService['instanceGetConfiguration']>
	contactRequestReference: UnaryType<beapi.protocol.ProtocolService['contactRequestReference']>
	contactRequestDisable: UnaryType<beapi.protocol.ProtocolService['contactRequestDisable']>
	contactRequestEnable: UnaryType<beapi.protocol.ProtocolService['contactRequestEnable']>
	contactRequestResetReference: UnaryType<
		beapi.protocol.ProtocolService['contactRequestResetReference']
	>
	contactRequestSend: UnaryType<beapi.protocol.ProtocolService['contactRequestSend']>
	contactRequestAccept: UnaryType<beapi.protocol.ProtocolService['contactRequestAccept']>
	contactRequestDiscard: UnaryType<beapi.protocol.ProtocolService['contactRequestDiscard']>
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
	monitorGroup: ResponseStreamType<beapi.protocol.ProtocolService['monitorGroup']>
	debugListGroups: ResponseStreamType<beapi.protocol.ProtocolService['debugListGroups']>
	debugInspectGroupStore: ResponseStreamType<
		beapi.protocol.ProtocolService['debugInspectGroupStore']
	>
	debugGroup: UnaryType<beapi.protocol.ProtocolService['debugGroup']>
	debugAuthServiceSetToken: UnaryType<beapi.protocol.ProtocolService['debugAuthServiceSetToken']>
	systemInfo: UnaryType<beapi.protocol.ProtocolService['systemInfo']>
	authServiceInitFlow: UnaryType<beapi.protocol.ProtocolService['authServiceInitFlow']>
	authServiceCompleteFlow: UnaryType<beapi.protocol.ProtocolService['authServiceCompleteFlow']>
	servicesTokenList: ResponseStreamType<beapi.protocol.ProtocolService['servicesTokenList']>
	replicationServiceRegisterGroup: UnaryType<
		beapi.protocol.ProtocolService['replicationServiceRegisterGroup']
	>
	peerList: UnaryType<beapi.protocol.ProtocolService['peerList']>
	attachmentPrepare: RequestStreamType<beapi.protocol.ProtocolService['attachmentPrepare']>
	attachmentRetrieve: ResponseStreamType<beapi.protocol.ProtocolService['attachmentRetrieve']>
	pushReceive: UnaryType<beapi.protocol.ProtocolService['pushReceive']>
	pushSend: UnaryType<beapi.protocol.ProtocolService['pushSend']>
	pushShareToken: UnaryType<beapi.protocol.ProtocolService['pushShareToken']>
	pushSetDeviceToken: UnaryType<beapi.protocol.ProtocolService['pushSetDeviceToken']>
	pushSetServer: UnaryType<beapi.protocol.ProtocolService['pushSetServer']>
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
	sendReplyOptions: UnaryType<beapi.messenger.MessengerService['sendReplyOptions']>
	systemInfo: UnaryType<beapi.messenger.MessengerService['systemInfo']>
	echoTest: ResponseStreamType<beapi.messenger.MessengerService['echoTest']>
	echoDuplexTest: never
	conversationStream: ResponseStreamType<beapi.messenger.MessengerService['conversationStream']>
	eventStream: ResponseStreamType<beapi.messenger.MessengerService['eventStream']>
	conversationCreate: UnaryType<beapi.messenger.MessengerService['conversationCreate']>
	conversationJoin: UnaryType<beapi.messenger.MessengerService['conversationJoin']>
	accountGet: UnaryType<beapi.messenger.MessengerService['accountGet']>
	accountUpdate: UnaryType<beapi.messenger.MessengerService['accountUpdate']>
	contactRequest: UnaryType<beapi.messenger.MessengerService['contactRequest']>
	contactAccept: UnaryType<beapi.messenger.MessengerService['contactAccept']>
	interact: UnaryType<beapi.messenger.MessengerService['interact']>
	conversationOpen: UnaryType<beapi.messenger.MessengerService['conversationOpen']>
	conversationClose: UnaryType<beapi.messenger.MessengerService['conversationClose']>
	conversationLoad: UnaryType<beapi.messenger.MessengerService['conversationLoad']>
	servicesTokenList: ResponseStreamType<beapi.messenger.MessengerService['servicesTokenList']>
	replicationServiceRegisterGroup: UnaryType<
		beapi.messenger.MessengerService['replicationServiceRegisterGroup']
	>
	replicationSetAutoEnable: UnaryType<beapi.messenger.MessengerService['replicationSetAutoEnable']>
	bannerQuote: UnaryType<beapi.messenger.MessengerService['bannerQuote']>
	instanceExportData: ResponseStreamType<beapi.messenger.MessengerService['instanceExportData']>
	mediaPrepare: RequestStreamType<beapi.messenger.MessengerService['mediaPrepare']>
	mediaRetrieve: ResponseStreamType<beapi.messenger.MessengerService['mediaRetrieve']>
	mediaGetRelated: UnaryType<beapi.messenger.MessengerService['mediaGetRelated']>
	messageSearch: UnaryType<beapi.messenger.MessengerService['messageSearch']>
	listMemberDevices: ResponseStreamType<beapi.messenger.MessengerService['listMemberDevices']>
	tyberHostSearch: ResponseStreamType<beapi.messenger.MessengerService['tyberHostSearch']>
	tyberHostAttach: UnaryType<beapi.messenger.MessengerService['tyberHostAttach']>
	pushSetAutoShare: UnaryType<beapi.messenger.MessengerService['pushSetAutoShare']>
	pushShareTokenForConversation: UnaryType<
		beapi.messenger.MessengerService['pushShareTokenForConversation']
	>
	pushTokenSharedForConversation: ResponseStreamType<
		beapi.messenger.MessengerService['pushTokenSharedForConversation']
	>
	pushReceive: UnaryType<beapi.messenger.MessengerService['pushReceive']>
	interactionReactionsForEmoji: UnaryType<
		beapi.messenger.MessengerService['interactionReactionsForEmoji']
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
