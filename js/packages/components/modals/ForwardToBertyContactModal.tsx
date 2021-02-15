import React, { useEffect } from 'react'
import { useStyles } from '@berty-tech/styles'
import { View, Modal, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import beapi from '@berty-tech/api'
import { ConversationAvatar } from '../avatars'
import { useClient } from '@berty-tech/store/hooks'

import { useSortedConversationList, useMsgrContext } from '@berty-tech/store/hooks'

import RNFS from 'react-native-fs'

export const ForwardToBertyContactModal: React.FC<{
	image: any
	onClose: () => void
}> = ({ image, onClose }) => {
	const tempPath = `${RNFS.TemporaryDirectoryPath}/${image.filename}`

	const [{ color, border, padding, margin }, { windowHeight }] = useStyles()
	const { t }: { t: any } = useTranslation()
	const conversations: any[] = useSortedConversationList()
	const ctx = useMsgrContext()
	const client = useClient()

	useEffect(() => {
		RNFS.writeFile(tempPath, image.uri.split('base64,')[1], 'base64')
			.then((res) => console.log(res))
			.catch((err) => console.log(err))
	}, [image, tempPath])

	const handleClose = async () => {
		try {
			await RNFS.unlink(tempPath)
		} catch (err) {
		} finally {
			onClose()
		}
	}

	const prepareMediaAndSend = async (convPk: string) => {
		const buf = beapi.messenger.AppMessage.UserMessage.encode({ body: '' }).finish()
		const { filename, mimeType, displayName } = image

		const stream = await client?.mediaPrepare({})
		await stream?.emit({
			info: { filename, mimeType, displayName },
			uri: tempPath,
		})
		const reply = await stream?.stopAndRecv()
		if (reply?.cid) {
			ctx.client
				?.interact({
					conversationPublicKey: convPk,
					type: beapi.messenger.AppMessage.Type.TypeUserMessage,
					payload: buf,
					mediaCids: [reply.cid],
				})
				.then(() => {
					ctx.playSound('messageSent')
				})
				.catch((e) => {
					console.warn('e sending message:', e)
				})
		}
	}
	return (
		<Modal transparent style={{}} animationType='slide' onRequestClose={handleClose}>
			<TouchableOpacity
				onPress={handleClose}
				style={{
					flex: 1,
				}}
			/>
			<ScrollView
				style={[
					border.radius.top.small,
					{
						height: windowHeight / 1.3,
						position: 'absolute',
						left: 0,
						bottom: 0,
						right: 0,
						backgroundColor: color.white,
					},
				]}
			>
				{conversations
					.filter((conv) => !conv.displayName)
					.map((conversation) => {
						const contact =
							Object.values(ctx.contacts).find(
								(c: any) => c.conversationPublicKey === conversation.publicKey,
							) || null

						const userDisplayName =
							conversation.type === beapi.messenger.Conversation.Type.MultiMemberType
								? conversation.displayName
								: contact?.displayName || ''
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
								<View
									style={{
										flexDirection: 'row',
										alignItems: 'center',
									}}
								>
									<ConversationAvatar size={40} publicKey={conversation.publicKey} />
									<Text
										style={[
											{
												color: color.black,
											},
											margin.left.small,
										]}
									>
										{userDisplayName}
									</Text>
								</View>
								<TouchableOpacity
									style={[
										{
											backgroundColor: '#3F49EA',
										},
										padding.vertical.small,
										padding.horizontal.medium,
										border.radius.small,
									]}
									onPress={() => prepareMediaAndSend(conversation.publicKey)}
									activeOpacity={0.6}
								>
									<Text
										style={{
											color: color.white,
										}}
									>
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
