export enum AppMessageType {
	UserMessage = 'UserMessage',
	UserReaction = 'UserReaction',
	GroupInvitation = 'GroupInvitation',
	SetGroupName = 'SetGroupName',
	Acknowledge = 'Acknowledge',
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
	groupPk: string
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
