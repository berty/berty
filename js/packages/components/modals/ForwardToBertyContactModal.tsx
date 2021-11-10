import React from 'react'
import { View, Modal, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import { Buffer } from 'buffer'

import { useStyles } from '@berty-tech/styles'
import beapi from '@berty-tech/api'
import {
	useSortedConversationList,
	useMessengerContext,
	useThemeColor,
	useMessengerClient,
	Maybe,
	prepareMediaBytes,
} from '@berty-tech/store'

import { ConversationAvatar } from '../avatars'

export const ForwardToBertyContactModal: React.FC<{
	image: any
	onClose: () => void
}> = ({ image, onClose }) => {
	const [{ border, padding, margin }, { windowHeight }] = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()
	const conversations = useSortedConversationList()
	const ctx = useMessengerContext()
	const client = useMessengerClient()

	const prepareMediaAndSend = async (convPk: Maybe<string>) => {
		if (!client) {
			return
		}

		const { filename, mimeType, displayName } = image
		const mediaBytes = Buffer.from(image.uri.split('base64,')[1], 'base64')
		const cid = await prepareMediaBytes(client, { filename, mimeType, displayName }, mediaBytes)

		const buf = beapi.messenger.AppMessage.UserMessage.encode({ body: '' }).finish()
		client
			.interact({
				conversationPublicKey: convPk,
				type: beapi.messenger.AppMessage.Type.TypeUserMessage,
				payload: buf,
				mediaCids: [cid],
			})
			.then(() => {
				ctx.playSound('messageSent')
			})
			.catch(e => {
				console.warn('e sending message:', e)
			})
	}

	return (
		<Modal transparent animationType='slide' onRequestClose={onClose}>
			<TouchableOpacity onPress={onClose} style={{ flex: 1 }} />
			<ScrollView
				style={[
					border.radius.top.small,
					{
						height: windowHeight / 1.3,
						position: 'absolute',
						left: 0,
						bottom: 0,
						right: 0,
						backgroundColor: colors['main-background'],
					},
				]}
			>
				{conversations
					.filter(conv => !conv.displayName)
					.map(conversation => {
						const contact = Object.values(ctx.contacts).find(
							c => c?.conversationPublicKey === conversation.publicKey,
						)

						const userDisplayName =
							(conversation.type === beapi.messenger.Conversation.Type.MultiMemberType
								? conversation.displayName
								: contact?.displayName) || ''
						return (
							<View
								key={conversation.publicKey}
								style={[
									padding.medium,
									{
										flexDirection: 'row',
										alignItems: 'center',
										justifyContent: 'space-between',
									},
								]}
							>
								<View style={{ flexDirection: 'row', alignItems: 'center' }}>
									<ConversationAvatar size={40} publicKey={conversation.publicKey} />
									<Text style={[{ color: colors['main-text'] }, margin.left.small]}>
										{userDisplayName || undefined}
									</Text>
								</View>
								<TouchableOpacity
									style={[
										{ backgroundColor: colors['background-header'] },
										padding.vertical.small,
										padding.horizontal.medium,
										border.radius.small,
									]}
									onPress={() => prepareMediaAndSend(conversation.publicKey)}
									activeOpacity={0.6}
								>
									<Text style={{ color: colors['reverted-main-text'] }}>
										{t('chat.files.forward')}
									</Text>
								</TouchableOpacity>
							</View>
						)
					})}
			</ScrollView>
		</Modal>
	)
}
