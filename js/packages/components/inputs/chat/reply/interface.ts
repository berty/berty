import { ReplyTargetInteraction } from '@berty/redux/reducers/chatInputs.reducer'

export interface ReplyMessageProps {
	convPK: string
}

export interface ActiveReplyInteractionProps {
	activeReplyInteraction: ReplyTargetInteraction | null
}
