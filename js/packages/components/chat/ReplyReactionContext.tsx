import React, { createContext, useContext, useState } from 'react'

import { InteractionUserMessage } from '@berty-tech/store/types.gen'

interface ReplyTargetInteraction extends InteractionUserMessage {
	backgroundColor: string
	textColor: string
}
type CID = string | undefined | null

export const ReplyReactionContext = createContext<{
	activePopoverCid: CID
	setActivePopoverCid: (cid: CID) => void
	activeEmojiKeyboardCid: CID
	setActiveEmojiKeyboardCid: (cid: CID) => void
	activeReplyInte: ReplyTargetInteraction | undefined
	setActiveReplyInte: (inte?: ReplyTargetInteraction) => void
	highlightCid: CID
	setHighlightCid: (cid: CID) => void
	isActivePopoverOnKeyboardClose: boolean
	setIsActivePopoverOnKeyboardClose: (activePopover: boolean) => void
}>({
	activePopoverCid: null,
	setActivePopoverCid: () => {},
	activeEmojiKeyboardCid: null,
	setActiveEmojiKeyboardCid: () => {},
	activeReplyInte: undefined,
	setActiveReplyInte: () => {},
	highlightCid: null,
	setHighlightCid: () => {},
	isActivePopoverOnKeyboardClose: false,
	setIsActivePopoverOnKeyboardClose: () => {},
})

export const ReplyReactionProvider: React.FC = React.memo(({ children }) => {
	const [activePopoverCid, setActivePopoverCid] = useState<CID>()
	const [highlightCid, setHighlight] = useState<CID>()
	const [activeEmojiKeyboardCid, setActiveEmojiKeyboardCid] = useState<CID>()
	const [activeReplyInte, setActiveReplyInte] = useState<ReplyTargetInteraction | undefined>()
	const [isActivePopoverOnKeyboardClose, setIsActivePopoverOnKeyboardClose] =
		useState<boolean>(false)

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
		isActivePopoverOnKeyboardClose,
		setIsActivePopoverOnKeyboardClose,
	}

	return (
		<ReplyReactionContext.Provider value={value}>
			{typeof children === 'function' ? children(value) : children}
		</ReplyReactionContext.Provider>
	)
})

export const useReplyReaction = () => useContext(ReplyReactionContext)
