import { InteractionUserMessage, ParsedInteraction } from '@berty/utils/api'

export interface UserMessageContentProps {
	inte: InteractionUserMessage
	setMessageLayoutWidth: (value: number) => void
	setIsMenuVisible: (value: boolean) => void
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
