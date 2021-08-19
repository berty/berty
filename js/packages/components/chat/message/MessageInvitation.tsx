import React, { useState } from 'react'
import { Text as TextNative, TouchableOpacity, View } from 'react-native'
import { Icon, Text } from '@ui-kitten/components'
import { Buffer } from 'buffer'

import {
	useClient,
	useConversation,
	useOneToOneContact,
	useThemeColor,
} from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'
import { InteractionGroupInvitation } from '@berty-tech/store/types.gen'

import { MessageSystemWrapper } from './MessageSystemWrapper'
import { MultiMemberAvatar } from '../../avatars'
import { base64ToURLBase64 } from '../../utils'

export const MessageInvitationButton: React.FC<{
	onPress?: any
	activeOpacity: any
	backgroundColor: any
	icon: any
	color: any
	title: any
	styleOpacity?: any
	disabled?: boolean
}> = ({
	onPress,
	activeOpacity,
	backgroundColor,
	icon,
	color,
	title,
	styleOpacity,
	disabled = false,
}) => {
	const [{ flex, padding, border, width, row, text, opacity }] = useStyles()
	return (
		<TouchableOpacity
			style={[flex.align.center]}
			activeOpacity={activeOpacity}
			onPress={onPress}
			disabled={disabled}
		>
			<View
				style={[
					padding.tiny,
					padding.vertical.small,
					border.radius.tiny,
					width(120),
					row.center,
					flex.align.center,
					padding.right.small,
					{ backgroundColor },
				]}
			>
				<Icon name={icon} width={24} height={24} fill={color} style={[opacity(styleOpacity)]} />
				<TextNative
					style={[
						text.align.center,
						text.size.scale(14),
						text.bold.medium,
						opacity(styleOpacity),
						{ fontFamily: 'Open Sans', color },
					]}
				>
					{title}
				</TextNative>
			</View>
		</TouchableOpacity>
	)
}

const MessageInvitationSent: React.FC<{ message: InteractionGroupInvitation }> = ({ message }) => {
	const [{ text }] = useStyles()
	const conversationContact = useOneToOneContact(message.conversationPublicKey)
	return (
		<Text style={[text.size.scale(14), text.align.center]}>
			You invited {conversationContact?.displayName || 'this contact'} to a group! 💌
		</Text>
	)
}

const MessageInvitationReceived: React.FC<{ message: InteractionGroupInvitation }> = ({
	message,
}) => {
	const [{ row, flex, text, margin }] = useStyles()
	const colors = useThemeColor()
	const client = useClient()
	const [error, setError] = useState(false)
	const [{ convPk, displayName }, setPdlInfo] = useState({ convPk: '', displayName: '' })
	const [accepting, setAccepting] = useState(false)
	const conv = useConversation(convPk)
	const { link } = message.payload || {}
	const acceptDisabled = !!(accepting || conv || !convPk || error)

	// Parse deep link
	React.useEffect(() => {
		if (client && !convPk && link && !conv) {
			setError(false)
			client
				.parseDeepLink({
					link,
				})
				.then(reply => {
					setPdlInfo({
						displayName: reply.link?.bertyGroup?.displayName || '',
						convPk: base64ToURLBase64(
							Buffer.from(reply.link?.bertyGroup?.group?.publicKey || '').toString('base64'),
						),
					})
				})
				.catch(err => {
					console.warn(err)
					setError(true)
				})
		}
	}, [convPk, conv, link, client])

	const handleAccept = React.useCallback(() => {
		if (client && convPk && !conv && !accepting && !error) {
			setAccepting(true)
			client
				.conversationJoin({ link })
				.catch(err => {
					console.warn(err)
					setError(true)
				})
				.finally(() => {
					setAccepting(false)
				})
		}
	}, [client, link, conv, convPk, accepting, error])

	return (
		<>
			<View style={[row.left, flex.align.center, flex.justify.center]}>
				<TextNative
					style={[
						text.size.scale(15),
						text.bold.medium,
						{ fontFamily: 'Open Sans', color: colors['main-text'] },
					]}
				>
					GROUP INVITATION
				</TextNative>
			</View>
			<View style={[margin.top.small, flex.align.center, flex.justify.center]}>
				<View style={margin.bottom.small}>
					<MultiMemberAvatar publicKey={convPk} size={40} fallbackNameSeed={displayName} />
				</View>
				<TextNative
					style={[
						text.size.scale(13),
						text.bold.small,
						margin.bottom.small,
						{ fontFamily: 'Open Sans', color: colors['main-text'] },
					]}
				>
					{displayName}
				</TextNative>
			</View>
			<View style={[row.center, flex.justify.spaceEvenly, flex.align.center, margin.top.medium]}>
				<MessageInvitationButton
					onPress={undefined} // TODO: Command to refuse invitation
					activeOpacity={!conv ? 0.2 : 1}
					icon='close-outline'
					color={colors['secondary-text']}
					title='REFUSE'
					backgroundColor={colors['main-background']}
					styleOpacity={0.6}
					disabled
				/>
				<MessageInvitationButton
					onPress={handleAccept}
					activeOpacity={!conv ? 0.2 : 1}
					icon='checkmark-outline'
					color={
						error
							? colors['secondary-text']
							: !conv
							? colors['background-header']
							: colors['secondary-text']
					}
					title={!conv ? 'ACCEPT' : 'ACCEPTED'}
					backgroundColor={
						error
							? colors['main-background']
							: !conv
							? colors['positive-asset']
							: `${colors['secondary-text']}20`
					}
					styleOpacity={acceptDisabled ? 0.6 : undefined}
					disabled={acceptDisabled ? true : false}
				/>
			</View>
			{error && (
				<Text
					style={[
						margin.top.small,
						margin.horizontal.small,
						text.size.small,
						text.bold.small,
						text.align.center,
						{ color: colors['warning-asset'] },
					]}
				>
					Error adding you to the group ☹️ Our bad!
				</Text>
			)}
		</>
	)
}

export const MessageInvitation: React.FC<{ message: InteractionGroupInvitation }> = ({
	message,
}) => {
	const [{ row, padding, margin }] = useStyles()

	return (
		<View style={[row.center, padding.horizontal.medium, margin.bottom.small, { paddingTop: 2 }]}>
			{message.isMine ? (
				<MessageSystemWrapper logo={false}>
					<MessageInvitationSent message={message} />
				</MessageSystemWrapper>
			) : (
				<MessageSystemWrapper>
					<MessageInvitationReceived message={message} />
				</MessageSystemWrapper>
			)}
		</View>
	)
}
