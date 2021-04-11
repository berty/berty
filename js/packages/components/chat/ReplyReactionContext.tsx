import React, { createContext, useContext, useState } from 'react'
import { InteractionUserMessage } from '@berty-tech/store/types.gen'

interface Interaction extends InteractionUserMessage {
	backgroundColor: string
	textColor: string
}
type CID = string | undefined | null

export const ReplyReactionContext = createContext<{
	activePopoverCid: CID
	setActivePopoverCid: (cid: CID) => void
	activeEmojiKeyboardCid: CID
	setActiveEmojiKeyboardCid: (cid: CID) => void
	activeReplyInte: Interaction | undefined
	setActiveReplyInte: (inte?: Interaction) => void
}>({
	activePopoverCid: null,
	setActivePopoverCid: () => {},
	activeEmojiKeyboardCid: null,
	setActiveEmojiKeyboardCid: () => {},
	activeReplyInte: undefined,
	setActiveReplyInte: () => {},
})

export const ReplyReactionProvider: React.FC = ({ children }) => {
	const [activePopoverCid, setActivePopoverCid] = useState<CID>()
	const [activeEmojiKeyboardCid, setActiveEmojiKeyboardCid] = useState<CID>()

	const [activeReplyInte, setActiveReplyInte] = useState<Interaction | undefined>()

	const value = {
		activePopoverCid,
		setActivePopoverCid,
		activeEmojiKeyboardCid,
		setActiveEmojiKeyboardCid,
		activeReplyInte,
		setActiveReplyInte,
	}

	return (
		<ReplyReactionContext.Provider value={value}>
			{typeof children === 'function' ? children(value) : children}
		</ReplyReactionContext.Provider>
	)
}

export const useReplyReaction = () => useContext(ReplyReactionContext)
