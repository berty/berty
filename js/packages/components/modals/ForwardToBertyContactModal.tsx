import React from 'react'

import { Buffer } from 'buffer'

import { Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import { View, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'

import beapi from '@berty-tech/api'
import { useAllConversations, useOneToOneContact } from '@berty-tech/react-redux'
import {
	useMessengerContext,
	useThemeColor,
	useMessengerClient,
	Maybe,
	prepareMediaBytes,
} from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'

import { ConversationAvatar } from '../avatars'

const Item: React.FC<{ conversation: beapi.messenger.IConversation; image: any }> = React.memo(
	({ conversation, image }) => {
		const [{ border, padding, margin }] = useStyles()
		const colors = useThemeColor()
		const ctx = useMessengerContext()
		const client = useMessengerClient()
		const contact = useOneToOneContact(conversation.publicKey || '')
		const [sending, setSending] = React.useState(false)
		const { t } = useTranslation()

		const prepareMediaAndSend = async (convPk: Maybe<string>) => {
			if (!client) {
				return
			}
			if (sending) {
				return
			}
			setSending(true)

			try {
				const { filename, mimeType, displayName } = image
				const mediaBytes = Buffer.from(image.uri.split('base64,')[1], 'base64')
				const cid = await prepareMediaBytes(client, { filename, mimeType, displayName }, mediaBytes)

				const buf = beapi.messenger.AppMessage.UserMessage.encode({ body: '' }).finish()
				await client.interact({
					conversationPublicKey: convPk,
					type: beapi.messenger.AppMessage.Type.TypeUserMessage,
					payload: buf,
					mediaCids: [cid],
				})
				ctx.playSound('messageSent')
			} catch (err) {
				console.warn('error sending message:', err)
			}
			setSending(false)
		}

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
					disabled={sending}
					onPress={() => prepareMediaAndSend(conversation.publicKey)}
				>
					{sending ? (
						<ActivityIndicator color={colors['reverted-main-text']} />
					) : (
						<Text style={{ color: colors['reverted-main-text'] }}>
							<>{t('chat.files.forward')}</>
						</Text>
					)}
				</TouchableOpacity>
			</View>
		)
	},
)

export const ForwardToBertyContactModal: React.FC<{
	image: any
	onClose: () => void
}> = ({ image, onClose }) => {
	const [{ border }, { windowHeight }] = useStyles()
	const colors = useThemeColor()
	const conversations = useAllConversations()

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
				{conversations.map(conv => (
					<Item key={conv.publicKey} conversation={conv} image={image} />
				))}
			</ScrollView>
		</Modal>
	)
}
