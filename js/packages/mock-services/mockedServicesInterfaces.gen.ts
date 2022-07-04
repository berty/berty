import beapi from '@berty/api'

import { UnaryMock, RequestStreamMock, ResponseStreamMock } from './types'

export interface IProtocolServiceMock {
	InstanceExportData: ResponseStreamMock<
		beapi.protocol.InstanceExportData.IRequest,
		beapi.protocol.InstanceExportData.IReply
	>
	InstanceGetConfiguration: UnaryMock<
		beapi.protocol.InstanceGetConfiguration.IRequest,
		beapi.protocol.InstanceGetConfiguration.IReply
	>
	ContactRequestReference: UnaryMock<
		beapi.protocol.ContactRequestReference.IRequest,
		beapi.protocol.ContactRequestReference.IReply
	>
	ContactRequestDisable: UnaryMock<
		beapi.protocol.ContactRequestDisable.IRequest,
		beapi.protocol.ContactRequestDisable.IReply
	>
	ContactRequestEnable: UnaryMock<
		beapi.protocol.ContactRequestEnable.IRequest,
		beapi.protocol.ContactRequestEnable.IReply
	>
	ContactRequestResetReference: UnaryMock<
		beapi.protocol.ContactRequestResetReference.IRequest,
		beapi.protocol.ContactRequestResetReference.IReply
	>
	ContactRequestSend: UnaryMock<
		beapi.protocol.ContactRequestSend.IRequest,
		beapi.protocol.ContactRequestSend.IReply
	>
	ContactRequestAccept: UnaryMock<
		beapi.protocol.ContactRequestAccept.IRequest,
		beapi.protocol.ContactRequestAccept.IReply
	>
	ContactRequestDiscard: UnaryMock<
		beapi.protocol.ContactRequestDiscard.IRequest,
		beapi.protocol.ContactRequestDiscard.IReply
	>
	ContactBlock: UnaryMock<beapi.protocol.ContactBlock.IRequest, beapi.protocol.ContactBlock.IReply>
	ContactUnblock: UnaryMock<
		beapi.protocol.ContactUnblock.IRequest,
		beapi.protocol.ContactUnblock.IReply
	>
	ContactAliasKeySend: UnaryMock<
		beapi.protocol.ContactAliasKeySend.IRequest,
		beapi.protocol.ContactAliasKeySend.IReply
	>
	MultiMemberGroupCreate: UnaryMock<
		beapi.protocol.MultiMemberGroupCreate.IRequest,
		beapi.protocol.MultiMemberGroupCreate.IReply
	>
	MultiMemberGroupJoin: UnaryMock<
		beapi.protocol.MultiMemberGroupJoin.IRequest,
		beapi.protocol.MultiMemberGroupJoin.IReply
	>
	MultiMemberGroupLeave: UnaryMock<
		beapi.protocol.MultiMemberGroupLeave.IRequest,
		beapi.protocol.MultiMemberGroupLeave.IReply
	>
	MultiMemberGroupAliasResolverDisclose: UnaryMock<
		beapi.protocol.MultiMemberGroupAliasResolverDisclose.IRequest,
		beapi.protocol.MultiMemberGroupAliasResolverDisclose.IReply
	>
	MultiMemberGroupAdminRoleGrant: UnaryMock<
		beapi.protocol.MultiMemberGroupAdminRoleGrant.IRequest,
		beapi.protocol.MultiMemberGroupAdminRoleGrant.IReply
	>
	MultiMemberGroupInvitationCreate: UnaryMock<
		beapi.protocol.MultiMemberGroupInvitationCreate.IRequest,
		beapi.protocol.MultiMemberGroupInvitationCreate.IReply
	>
	AppMetadataSend: UnaryMock<
		beapi.protocol.AppMetadataSend.IRequest,
		beapi.protocol.AppMetadataSend.IReply
	>
	AppMessageSend: UnaryMock<
		beapi.protocol.AppMessageSend.IRequest,
		beapi.protocol.AppMessageSend.IReply
	>
	GroupMetadataList: ResponseStreamMock<
		beapi.protocol.GroupMetadataList.IRequest,
		beapi.protocol.IGroupMetadataEvent
	>
	GroupMessageList: ResponseStreamMock<
		beapi.protocol.GroupMessageList.IRequest,
		beapi.protocol.IGroupMessageEvent
	>
	GroupInfo: UnaryMock<beapi.protocol.GroupInfo.IRequest, beapi.protocol.GroupInfo.IReply>
	ActivateGroup: UnaryMock<
		beapi.protocol.ActivateGroup.IRequest,
		beapi.protocol.ActivateGroup.IReply
	>
	DeactivateGroup: UnaryMock<
		beapi.protocol.DeactivateGroup.IRequest,
		beapi.protocol.DeactivateGroup.IReply
	>
	GroupDeviceStatus: ResponseStreamMock<
		beapi.protocol.GroupDeviceStatus.IRequest,
		beapi.protocol.GroupDeviceStatus.IReply
	>
	MonitorGroup: ResponseStreamMock<
		beapi.protocol.MonitorGroup.IRequest,
		beapi.protocol.MonitorGroup.IReply
	>
	DebugListGroups: ResponseStreamMock<
		beapi.protocol.DebugListGroups.IRequest,
		beapi.protocol.DebugListGroups.IReply
	>
	DebugInspectGroupStore: ResponseStreamMock<
		beapi.protocol.DebugInspectGroupStore.IRequest,
		beapi.protocol.DebugInspectGroupStore.IReply
	>
	DebugGroup: UnaryMock<beapi.protocol.DebugGroup.IRequest, beapi.protocol.DebugGroup.IReply>
	DebugAuthServiceSetToken: UnaryMock<
		beapi.protocol.DebugAuthServiceSetToken.IRequest,
		beapi.protocol.DebugAuthServiceSetToken.IReply
	>
	SystemInfo: UnaryMock<beapi.protocol.SystemInfo.IRequest, beapi.protocol.SystemInfo.IReply>
	AuthServiceInitFlow: UnaryMock<
		beapi.protocol.AuthServiceInitFlow.IRequest,
		beapi.protocol.AuthServiceInitFlow.IReply
	>
	AuthServiceCompleteFlow: UnaryMock<
		beapi.protocol.AuthServiceCompleteFlow.IRequest,
		beapi.protocol.AuthServiceCompleteFlow.IReply
	>
	ServicesTokenList: ResponseStreamMock<
		beapi.protocol.ServicesTokenList.IRequest,
		beapi.protocol.ServicesTokenList.IReply
	>
	ReplicationServiceRegisterGroup: UnaryMock<
		beapi.protocol.ReplicationServiceRegisterGroup.IRequest,
		beapi.protocol.ReplicationServiceRegisterGroup.IReply
	>
	PeerList: UnaryMock<beapi.protocol.PeerList.IRequest, beapi.protocol.PeerList.IReply>
	AttachmentPrepare: RequestStreamMock<
		beapi.protocol.AttachmentPrepare.IRequest,
		beapi.protocol.AttachmentPrepare.IReply
	>
	AttachmentRetrieve: ResponseStreamMock<
		beapi.protocol.AttachmentRetrieve.IRequest,
		beapi.protocol.AttachmentRetrieve.IReply
	>
	PushReceive: UnaryMock<beapi.protocol.PushReceive.IRequest, beapi.protocol.PushReceive.IReply>
	PushSend: UnaryMock<beapi.protocol.PushSend.IRequest, beapi.protocol.PushSend.IReply>
	PushShareToken: UnaryMock<
		beapi.protocol.PushShareToken.IRequest,
		beapi.protocol.PushShareToken.IReply
	>
	PushSetDeviceToken: UnaryMock<
		beapi.protocol.PushSetDeviceToken.IRequest,
		beapi.protocol.PushSetDeviceToken.IReply
	>
	PushSetServer: UnaryMock<
		beapi.protocol.PushSetServer.IRequest,
		beapi.protocol.PushSetServer.IReply
	>
	RefreshContactRequest: UnaryMock<
		beapi.protocol.RefreshContactRequest.IRequest,
		beapi.protocol.RefreshContactRequest.IReply
	>
}

export interface IAccountServiceMock {
	OpenAccount: UnaryMock<beapi.account.OpenAccount.IRequest, beapi.account.OpenAccount.IReply>
	OpenAccountWithProgress: ResponseStreamMock<
		beapi.account.OpenAccountWithProgress.IRequest,
		beapi.account.OpenAccountWithProgress.IReply
	>
	CloseAccount: UnaryMock<beapi.account.CloseAccount.IRequest, beapi.account.CloseAccount.IReply>
	CloseAccountWithProgress: ResponseStreamMock<
		beapi.account.CloseAccountWithProgress.IRequest,
		beapi.account.CloseAccountWithProgress.IReply
	>
	ListAccounts: UnaryMock<beapi.account.ListAccounts.IRequest, beapi.account.ListAccounts.IReply>
	DeleteAccount: UnaryMock<beapi.account.DeleteAccount.IRequest, beapi.account.DeleteAccount.IReply>
	ImportAccount: UnaryMock<beapi.account.ImportAccount.IRequest, beapi.account.ImportAccount.IReply>
	ImportAccountWithProgress: ResponseStreamMock<
		beapi.account.ImportAccountWithProgress.IRequest,
		beapi.account.ImportAccountWithProgress.IReply
	>
	CreateAccount: UnaryMock<beapi.account.CreateAccount.IRequest, beapi.account.CreateAccount.IReply>
	UpdateAccount: UnaryMock<beapi.account.UpdateAccount.IRequest, beapi.account.UpdateAccount.IReply>
	GetGRPCListenerAddrs: UnaryMock<
		beapi.account.GetGRPCListenerAddrs.IRequest,
		beapi.account.GetGRPCListenerAddrs.IReply
	>
	LogfileList: UnaryMock<beapi.account.LogfileList.IRequest, beapi.account.LogfileList.IReply>
	GetUsername: UnaryMock<beapi.account.GetUsername.IRequest, beapi.account.GetUsername.IReply>
	NetworkConfigSet: UnaryMock<
		beapi.account.NetworkConfigSet.IRequest,
		beapi.account.NetworkConfigSet.IReply
	>
	NetworkConfigGet: UnaryMock<
		beapi.account.NetworkConfigGet.IRequest,
		beapi.account.NetworkConfigGet.IReply
	>
	NetworkConfigGetPreset: UnaryMock<
		beapi.account.NetworkConfigGetPreset.IRequest,
		beapi.account.NetworkConfigGetPreset.IReply
	>
	PushReceive: UnaryMock<beapi.account.PushReceive.IRequest, beapi.account.PushReceive.IReply>
	PushPlatformTokenRegister: UnaryMock<
		beapi.account.PushPlatformTokenRegister.IRequest,
		beapi.account.PushPlatformTokenRegister.IReply
	>
	AppStoragePut: UnaryMock<beapi.account.AppStoragePut.IRequest, beapi.account.AppStoragePut.IReply>
	AppStorageGet: UnaryMock<beapi.account.AppStorageGet.IRequest, beapi.account.AppStorageGet.IReply>
	AppStorageRemove: UnaryMock<
		beapi.account.AppStorageRemove.IRequest,
		beapi.account.AppStorageRemove.IReply
	>
	GetOpenedAccount: UnaryMock<
		beapi.account.GetOpenedAccount.IRequest,
		beapi.account.GetOpenedAccount.IReply
	>
}

export interface IMessengerServiceMock {
	InstanceShareableBertyID: UnaryMock<
		beapi.messenger.InstanceShareableBertyID.IRequest,
		beapi.messenger.InstanceShareableBertyID.IReply
	>
	ShareableBertyGroup: UnaryMock<
		beapi.messenger.ShareableBertyGroup.IRequest,
		beapi.messenger.ShareableBertyGroup.IReply
	>
	DevShareInstanceBertyID: UnaryMock<
		beapi.messenger.DevShareInstanceBertyID.IRequest,
		beapi.messenger.DevShareInstanceBertyID.IReply
	>
	DevStreamLogs: ResponseStreamMock<
		beapi.messenger.DevStreamLogs.IRequest,
		beapi.messenger.DevStreamLogs.IReply
	>
	ParseDeepLink: UnaryMock<
		beapi.messenger.ParseDeepLink.IRequest,
		beapi.messenger.ParseDeepLink.IReply
	>
	SendContactRequest: UnaryMock<
		beapi.messenger.SendContactRequest.IRequest,
		beapi.messenger.SendContactRequest.IReply
	>
	SendReplyOptions: UnaryMock<
		beapi.messenger.SendReplyOptions.IRequest,
		beapi.messenger.SendReplyOptions.IReply
	>
	SystemInfo: UnaryMock<beapi.messenger.SystemInfo.IRequest, beapi.messenger.SystemInfo.IReply>
	EchoTest: ResponseStreamMock<beapi.messenger.EchoTest.IRequest, beapi.messenger.EchoTest.IReply>
	EchoDuplexTest: never
	ConversationStream: ResponseStreamMock<
		beapi.messenger.ConversationStream.IRequest,
		beapi.messenger.ConversationStream.IReply
	>
	EventStream: ResponseStreamMock<
		beapi.messenger.EventStream.IRequest,
		beapi.messenger.EventStream.IReply
	>
	ConversationCreate: UnaryMock<
		beapi.messenger.ConversationCreate.IRequest,
		beapi.messenger.ConversationCreate.IReply
	>
	ConversationJoin: UnaryMock<
		beapi.messenger.ConversationJoin.IRequest,
		beapi.messenger.ConversationJoin.IReply
	>
	AccountGet: UnaryMock<beapi.messenger.AccountGet.IRequest, beapi.messenger.AccountGet.IReply>
	AccountUpdate: UnaryMock<
		beapi.messenger.AccountUpdate.IRequest,
		beapi.messenger.AccountUpdate.IReply
	>
	AccountPushConfigure: UnaryMock<
		beapi.messenger.AccountPushConfigure.IRequest,
		beapi.messenger.AccountPushConfigure.IReply
	>
	ContactRequest: UnaryMock<
		beapi.messenger.ContactRequest.IRequest,
		beapi.messenger.ContactRequest.IReply
	>
	ContactAccept: UnaryMock<
		beapi.messenger.ContactAccept.IRequest,
		beapi.messenger.ContactAccept.IReply
	>
	Interact: UnaryMock<beapi.messenger.Interact.IRequest, beapi.messenger.Interact.IReply>
	ConversationOpen: UnaryMock<
		beapi.messenger.ConversationOpen.IRequest,
		beapi.messenger.ConversationOpen.IReply
	>
	ConversationClose: UnaryMock<
		beapi.messenger.ConversationClose.IRequest,
		beapi.messenger.ConversationClose.IReply
	>
	ConversationLoad: UnaryMock<
		beapi.messenger.ConversationLoad.IRequest,
		beapi.messenger.ConversationLoad.IReply
	>
	ConversationMute: UnaryMock<
		beapi.messenger.ConversationMute.IRequest,
		beapi.messenger.ConversationMute.IReply
	>
	ServicesTokenList: ResponseStreamMock<
		beapi.protocol.ServicesTokenList.IRequest,
		beapi.protocol.ServicesTokenList.IReply
	>
	ReplicationServiceRegisterGroup: UnaryMock<
		beapi.messenger.ReplicationServiceRegisterGroup.IRequest,
		beapi.messenger.ReplicationServiceRegisterGroup.IReply
	>
	ReplicationSetAutoEnable: UnaryMock<
		beapi.messenger.ReplicationSetAutoEnable.IRequest,
		beapi.messenger.ReplicationSetAutoEnable.IReply
	>
	BannerQuote: UnaryMock<beapi.messenger.BannerQuote.IRequest, beapi.messenger.BannerQuote.IReply>
	InstanceExportData: ResponseStreamMock<
		beapi.messenger.InstanceExportData.IRequest,
		beapi.messenger.InstanceExportData.IReply
	>
	MediaPrepare: RequestStreamMock<
		beapi.messenger.MediaPrepare.IRequest,
		beapi.messenger.MediaPrepare.IReply
	>
	MediaRetrieve: ResponseStreamMock<
		beapi.messenger.MediaRetrieve.IRequest,
		beapi.messenger.MediaRetrieve.IReply
	>
	MediaGetRelated: UnaryMock<
		beapi.messenger.MediaGetRelated.IRequest,
		beapi.messenger.MediaGetRelated.IReply
	>
	MessageSearch: UnaryMock<
		beapi.messenger.MessageSearch.IRequest,
		beapi.messenger.MessageSearch.IReply
	>
	ListMemberDevices: ResponseStreamMock<
		beapi.messenger.ListMemberDevices.IRequest,
		beapi.messenger.ListMemberDevices.IReply
	>
	TyberHostSearch: ResponseStreamMock<
		beapi.messenger.TyberHostSearch.IRequest,
		beapi.messenger.TyberHostSearch.IReply
	>
	TyberHostAttach: UnaryMock<
		beapi.messenger.TyberHostAttach.IRequest,
		beapi.messenger.TyberHostAttach.IReply
	>
	PushSetAutoShare: UnaryMock<
		beapi.messenger.PushSetAutoShare.IRequest,
		beapi.messenger.PushSetAutoShare.IReply
	>
	PushShareTokenForConversation: UnaryMock<
		beapi.messenger.PushShareTokenForConversation.IRequest,
		beapi.messenger.PushShareTokenForConversation.IReply
	>
	PushTokenSharedForConversation: ResponseStreamMock<
		beapi.messenger.PushTokenSharedForConversation.IRequest,
		beapi.messenger.PushTokenSharedForConversation.IReply
	>
	PushReceive: UnaryMock<beapi.messenger.PushReceive.IRequest, beapi.messenger.PushReceive.IReply>
	InteractionReactionsForEmoji: UnaryMock<
		beapi.messenger.InteractionReactionsForEmoji.IRequest,
		beapi.messenger.InteractionReactionsForEmoji.IReply
	>
}
