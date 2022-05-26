import { CommonActions } from '@react-navigation/native'
import { Icon } from '@ui-kitten/components'
import { Buffer } from 'buffer'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, TouchableOpacity, View } from 'react-native'

import {
	HorizontalButtons,
	SecondaryButtonIconLeft,
	TertiaryButtonIconLeft,
} from '@berty/components/buttons'
import { useStyles } from '@berty/contexts/styles'
import { useOneToOneContact, useConversation } from '@berty/hooks'
import { useNavigation } from '@berty/navigation'
import { useMessengerClient, useThemeColor } from '@berty/store'
import { InteractionGroupInvitation } from '@berty/store/types.gen'
import { base64ToURLBase64 } from '@berty/utils/convert/base64'

import { MultiMemberAvatar } from '../../avatars'
import { UnifiedText } from '../../shared-components/UnifiedText'
import { MessageSystemWrapper } from './MessageSystemWrapper'

export const MessageInvitationButton: React.FC<{
	onPress?: () => void
	activeOpacity: any
	backgroundColor: any
	icon: any
	color: any
	title: string
	styleOpacity?: any
	disabled?: boolean
	loading?: boolean
}> = ({
	onPress,
	activeOpacity,
	backgroundColor,
	icon,
	color,
	title,
	styleOpacity,
	disabled = false,
	loading,
}) => {
	const { flex, padding, border, width, row, text, opacity } = useStyles()
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
				{loading ? (
					<ActivityIndicator />
				) : (
					<Icon name={icon} width={24} height={24} fill={color} style={[opacity(styleOpacity)]} />
				)}
				<UnifiedText
					style={[
						text.align.center,
						text.bold,
						opacity(styleOpacity),
						{ color, textTransform: 'uppercase' },
					]}
				>
					{title}
				</UnifiedText>
			</View>
		</TouchableOpacity>
	)
}

const MessageInvitationSent: React.FC<{ message: InteractionGroupInvitation }> = ({ message }) => {
	const { text } = useStyles()
	const { t } = useTranslation()

	const conversationContact = useOneToOneContact(message.conversationPublicKey || '')
	return (
		<UnifiedText style={[text.size.scale(14), text.align.center]}>
			{`${t('chat.one-to-one.contact-request-box.you-invited')} ${
				conversationContact?.displayName || t('chat.one-to-one.contact-request-box.this-contact')
			} ${t('chat.one-to-one.contact-request-box.to-a-group')}`}
		</UnifiedText>
	)
}

const MessageInvitationReceived: React.FC<{ message: InteractionGroupInvitation }> = ({
	message,
}) => {
	const { row, flex, text, margin } = useStyles()
	const colors = useThemeColor()
	const client = useMessengerClient()
	const { t } = useTranslation()
	const { dispatch } = useNavigation()
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
				.then(() => {
					dispatch(
						CommonActions.reset({
							routes: [
								{ name: 'Chat.Home' },
								{
									name: 'Chat.Group',
									params: {
										convId: convPk,
									},
								},
							],
						}),
					)
				})
				.catch(err => {
					console.warn(err)
					setError(true)
				})
				.finally(() => {
					setAccepting(false)
				})
		}
	}, [client, convPk, conv, accepting, error, link, dispatch])

	return (
		<>
			<View style={[row.left, flex.align.center, flex.justify.center]}>
				<UnifiedText style={[text.bold, { textTransform: 'uppercase' }]}>
					{t('chat.one-to-one.contact-request-box.group-invitation')}
				</UnifiedText>
			</View>
			<View style={[margin.top.small, flex.align.center, flex.justify.center]}>
				<View style={margin.bottom.small}>
					<MultiMemberAvatar publicKey={convPk} size={40} fallbackNameSeed={displayName} />
				</View>
				<UnifiedText style={[text.size.small, text.light, margin.bottom.small]}>
					{displayName}
				</UnifiedText>
			</View>
			<View style={[margin.top.medium, margin.horizontal.large]}>
				<HorizontalButtons>
					<TertiaryButtonIconLeft
						disabled
						name='close-outline'
						onPress={undefined} // TODO: Command to refuse invitation
					>
						{t('chat.one-to-one.contact-request-box.refuse-button')}
					</TertiaryButtonIconLeft>
					<SecondaryButtonIconLeft onPress={handleAccept} disabled={acceptDisabled ? true : false}>
						{!conv
							? t('chat.one-to-one.contact-request-box.accept-button')
							: t('chat.one-to-one.contact-request-box.accepted-button')}
					</SecondaryButtonIconLeft>
				</HorizontalButtons>
			</View>
			{error && (
				<UnifiedText
					style={[
						margin.top.small,
						margin.horizontal.small,
						text.size.small,
						text.light,
						text.align.center,
						{ color: colors['warning-asset'] },
					]}
				>
					{t('chat.one-to-one.contact-request-box.error')}
				</UnifiedText>
			)}
		</>
	)
}

export const MessageInvitation: React.FC<{ message: InteractionGroupInvitation }> = ({
	message,
}) => {
	const { row, padding, margin } = useStyles()

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
