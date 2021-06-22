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
	highlightCid: CID
	setHighlightCid: (cid: CID) => void
}>({
	activePopoverCid: null,
	setActivePopoverCid: () => {},
	activeEmojiKeyboardCid: null,
	setActiveEmojiKeyboardCid: () => {},
	activeReplyInte: undefined,
	setActiveReplyInte: () => {},
	highlightCid: null,
	setHighlightCid: () => {},
})

export const ReplyReactionProvider: React.FC = ({ children }) => {
	const [activePopoverCid, setActivePopoverCid] = useState<CID>()
	const [highlightCid, setHighlight] = useState<CID>()
	const [activeEmojiKeyboardCid, setActiveEmojiKeyboardCid] = useState<CID>()
	const [activeReplyInte, setActiveReplyInte] = useState<Interaction | undefined>()

	const value = {
		activePopoverCid,
		setActivePopoverCid,
		activeEmojiKeyboardCid,
		setActiveEmojiKeyboardCid,
		activeReplyInte,
		setActiveReplyInte,
		highlightCid,
		setHighlightCid: (cid: CID) => {
			setTimeout(() => setHighlight(cid), 400)
			setTimeout(() => setHighlight(null), 2000)
		},
	}

	return (
		<ReplyReactionContext.Provider value={value}>
			{typeof children === 'function' ? children(value) : children}
		</ReplyReactionContext.Provider>
	)
}

export const useReplyReaction = () => useContext(ReplyReactionContext)
