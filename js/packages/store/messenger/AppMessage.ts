import * as api from '@berty-tech/api'

export enum AppMessageType {
	UserMessage = 'UserMessage',
	UserReaction = 'UserReaction',
	GroupInvitation = 'GroupInvitation',
	SetGroupName = 'SetGroupName',
	Acknowledge = 'Acknowledge',
}

// this is api.berty.types.IGroup with buffers encoded to base64 strings
export type JSONGroup = {
	// public_key is the identifier of the group, it signs the group secret and the initial member of a multi-member group
	publicKey: string
	// secret is the symmetric secret of the group, which is used to encrypt the metadata
	secret: string
	// secret_sig is the signature of the secret used to ensure the validity of the group
	secretSig: string
	// group_type specifies the type of the group
	groupType: api.berty.types.GroupType
}

export type UserMessage = {
	type: AppMessageType.UserMessage
	body: string
	attachments: Array<{ uri: string }>
	sentDate: number
}

export type UserReaction = {
	type: AppMessageType.UserReaction
	emoji: string
}

export type GroupInvitation = {
	type: AppMessageType.GroupInvitation
	group: JSONGroup
	name: string
}

export type SetGroupName = {
	type: AppMessageType.SetGroupName
	name: string
}

export type Acknowledge = {
	type: AppMessageType.Acknowledge
	target: string
}

export type AppMessage = UserMessage | UserReaction | GroupInvitation | SetGroupName | Acknowledge
