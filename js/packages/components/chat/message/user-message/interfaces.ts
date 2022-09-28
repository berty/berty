import { InteractionUserMessage, ParsedInteraction } from '@berty/utils/api'

export interface UserMessageBoxProps {
	inte: InteractionUserMessage
	highlightCid: string | null | undefined
	isFollowedMessage: boolean | undefined
	previousMessage?: ParsedInteraction
	nextMessage?: ParsedInteraction
	msgBorderColor?: {
		borderColor: string
	}
	msgBackgroundColor: string
	msgTextColor: string
}
