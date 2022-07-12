import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import beapi from '@berty/api'
import { ChatDate } from '@berty/components/chat/ChatDate'
import { ChatFooter } from '@berty/components/chat/footer/ChatFooter'
import { MessageList } from '@berty/components/chat/MessageList'
import { useLastConvInteraction } from '@berty/hooks'
import { pbDateToNum } from '@berty/utils/convert/time'

interface MultiMemberContentProps {
	conv?: beapi.messenger.IConversation
	convId: string
}

export const MultiMemberContent: React.FC<MultiMemberContentProps> = props => {
	const { t } = useTranslation()

	const lastInte = useLastConvInteraction(props.convId)
	const lastUpdate = props.conv?.lastUpdate || lastInte?.sentDate || props.conv?.createdDate || null

	const [stickyDate, setStickyDate] = useState(lastUpdate || null)
	const [showStickyDate, setShowStickyDate] = useState(false)

	return (
		<>
			<MessageList id={props.convId} {...{ setStickyDate, setShowStickyDate }} isGroup />
			<ChatFooter convPK={props.convId} placeholder={t('chat.multi-member.input-placeholder')} />
			{!!stickyDate && !!showStickyDate && (
				<View style={styles.chatDateWrapper}>
					<ChatDate date={pbDateToNum(stickyDate)} />
				</View>
			)}
		</>
	)
}

const styles = StyleSheet.create({
	chatDateWrapper: {
		position: 'absolute',
		top: 110,
		left: 0,
		right: 0,
	},
})
