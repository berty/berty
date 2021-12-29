import React from 'react'
import { ActivityIndicator, StyleProp, TouchableHighlight, View, ViewProps } from 'react-native'
import { Icon, Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import beapi from '@berty-tech/api'
import {
	pbDateToNum,
	useLastConvInteraction,
	useThemeColor,
	ParsedInteraction,
} from '@berty-tech/store'
import { useNavigation } from '@berty-tech/navigation'
import { useAppSelector, useOneToOneContact } from '@berty-tech/react-redux'
import { selectChatInputText } from '@berty-tech/redux/reducers/chatInputs.reducer'

import { ConversationAvatar, HardcodedAvatar, HardcodedAvatarKey } from '../../avatars'
import { timeFormat } from '../../helpers'
import { UnreadCount } from './UnreadCount'
import { selectChatInputSending } from '@berty-tech/redux/reducers/chatInputsVolatile.reducer'

type ConversationsProps = ViewProps & {
	items: Array<any>
	suggestions: Array<any>
	configurations: Array<any>
	addBot: any
}

type ConversationsItemProps = any

// Functions

const MessageStatus: React.FC<{
	interaction: ParsedInteraction
	isAccepted: boolean
	sending?: boolean
}> = ({ interaction, isAccepted, sending }) => {
	const colors = useThemeColor()
	if (interaction?.type !== beapi.messenger.AppMessage.Type.TypeUserMessage && isAccepted) {
		return null
	}

	return sending ? (
		<ActivityIndicator />
	) : (
		<Icon
			name={
				(interaction && !interaction.acknowledged) || !isAccepted
					? 'navigation-2-outline'
					: 'navigation-2'
			}
			width={14}
			height={14}
			fill={colors['background-header']}
		/>
	)
}

const interactionsFilter = (inte: ParsedInteraction) =>
	inte.type === beapi.messenger.AppMessage.Type.TypeUserMessage

const ConversationsItem: React.FC<ConversationsItemProps> = props => {
	const {
		publicKey = '',
		displayName = '',
		fake = false,
		type = beapi.messenger.Conversation.Type.ContactType,
		unreadCount,
		createdDate,
		lastUpdate,
		isLast,
	} = props

	const { t } = useTranslation()

	const lastInte = useLastConvInteraction(publicKey, interactionsFilter)
	const displayDate = lastUpdate || createdDate ? pbDateToNum(lastUpdate || createdDate) : null

	const contact = useOneToOneContact(publicKey)
	const isAccepted = contact && contact.state === beapi.messenger.Contact.State.Accepted
	const isIncoming = contact && contact.state === beapi.messenger.Contact.State.IncomingRequest

	const [{ row, border, flex, padding, text, opacity, margin }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { navigate } = useNavigation()
	const chatInputText = useAppSelector(state => selectChatInputText(state, publicKey))
	const chatInputSending = useAppSelector(state => selectChatInputSending(state, publicKey))

	let description
	if (lastInte?.type === beapi.messenger.AppMessage.Type.TypeUserMessage) {
		description = lastInte.payload?.body
	} else {
		if (contact?.state === beapi.messenger.Contact.State.OutgoingRequestSent) {
			description = t('main.home.conversations.request-sent')
		} else {
			description = ''
		}
	}

	let messageType: 'picture' | 'audio' | '' = ''

	const userDisplayName =
		type === beapi.messenger.Conversation.Type.MultiMemberType
			? displayName
			: contact?.displayName || ''

	if (!chatInputText && lastInte?.medias?.length) {
		if (lastInte.medias[0].mimeType?.startsWith('image')) {
			messageType = 'picture'
			description = `${lastInte.isMine ? 'You' : userDisplayName} sent ${
				lastInte.isMine ? userDisplayName : 'you'
			} ${lastInte.medias.length > 1 ? `${lastInte.medias.length} pics` : 'a pic'}`
		} else if (lastInte.medias[0].mimeType?.startsWith('audio')) {
			messageType = 'audio'
			description = `${lastInte.isMine ? 'You' : userDisplayName} sent ${
				lastInte.isMine ? userDisplayName : 'you'
			} ${lastInte.medias.length > 1 ? `${lastInte.medias.length} audio files` : 'an audio file'}`
		}
	}

	if (chatInputSending) {
		description = t('chat.sending')
	} else if (chatInputText) {
		description = t('main.home.conversations.draft', {
			message: chatInputText,
		})
	}

	return !isIncoming ? (
		<TouchableHighlight
			underlayColor={`${colors['secondary-text']}80`}
			style={[
				padding.horizontal.medium,
				!isAccepted && type !== beapi.messenger.Conversation.Type.MultiMemberType && opacity(0.6),
			]}
			onPress={
				type === beapi.messenger.Conversation.Type.MultiMemberType
					? () =>
							navigate({
								name: 'Chat.Group',
								params: {
									convId: publicKey,
								},
							})
					: () =>
							navigate({
								name: 'Chat.OneToOne',
								params: {
									convId: publicKey,
								},
							})
			}
		>
			<View
				style={[
					row.center,
					!isLast && border.bottom.medium,
					border.color.light.grey,
					padding.vertical.scale(7),
				]}
			>
				<View
					style={[
						row.item.center,
						flex.align.center,
						flex.justify.center,
						margin.right.small,
						{
							flexBasis: 45,
							flexGrow: 0,
							flexShrink: 0,
						},
					]}
				>
					<ConversationAvatar size={40 * scaleSize} publicKey={publicKey} />
				</View>
				<View
					style={[
						flex.justify.spaceAround,
						{
							flexBasis: 2,
							flexGrow: 2,
							flexShrink: 0,
						},
					]}
				>
					{/* Conversation title, unread count, and time */}
					<View style={[flex.direction.row, flex.justify.flexStart]}>
						{/* Title */}
						<View
							style={{
								flexShrink: 1,
							}}
						>
							<Text numberOfLines={1} style={[text.size.medium, { color: colors['main-text'] }]}>
								{fake ? `FAKE - ${userDisplayName}` : userDisplayName}
							</Text>
						</View>
						{/* Timestamp and unread count */}
						<View
							style={[
								flex.direction.row,
								flex.align.center,
								flex.justify.flexEnd,
								{ marginLeft: 'auto' },
							]}
						>
							<>
								<UnreadCount value={unreadCount} isConvBadge />
								{displayDate && (
									<Text
										style={[
											padding.left.small,
											text.size.small,
											unreadCount
												? [text.bold.medium, { color: colors['main-text'] }]
												: { color: colors['secondary-text'] },
										]}
									>
										{timeFormat.fmtTimestamp1(displayDate)}
									</Text>
								)}
							</>
						</View>
					</View>
					<View
						style={[
							flex.direction.row,
							flex.align.center,
							{
								height: text.size.small.fontSize * 1.8, // Keep row height even if no description/message
							},
						]}
					>
						{!!messageType && (
							<Icon
								name={messageType === 'audio' ? 'headphones' : 'image'}
								fill={colors['main-text']}
								height={20 * scaleSize}
								width={20 * scaleSize}
								style={[margin.right.tiny]}
							/>
						)}
						<Text
							numberOfLines={1}
							style={[
								{
									flexGrow: 2,
									flexShrink: 1,
									fontStyle: chatInputText ? 'italic' : 'normal',
								},
								text.size.small,
								unreadCount
									? [text.bold.medium, { color: colors['main-text'] }]
									: { color: colors['secondary-text'] },
							]}
						>
							{description || ''}
						</Text>

						{/* Message status */}
						<View
							style={[
								row.item.center,
								row.right,
								{
									flexBasis: 16,
									flexGrow: 0,
									flexShrink: 0,
								},
							]}
						>
							{lastInte && lastInte.isMine && (
								<MessageStatus
									interaction={lastInte}
									isAccepted={
										isAccepted || type === beapi.messenger.Conversation.Type.MultiMemberType
									}
									sending={chatInputSending}
								/>
							)}
						</View>
					</View>
				</View>
			</View>
		</TouchableHighlight>
	) : null
}

const SuggestionsItem: React.FC<{
	displayName: string
	desc: string
	link: string
	addBot: any
	icon: HardcodedAvatarKey
	isLast?: boolean
	style?: StyleProp<any>
}> = ({ displayName, desc, link, addBot, icon, style, isLast = false }) => {
	const [{ row, border, flex, padding, text, margin }, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	return (
		<>
			<TouchableHighlight
				underlayColor={`${colors['secondary-text']}80`}
				style={[padding.horizontal.medium, style]}
				onPress={() => addBot({ displayName, link, isVisible: true })}
			>
				<View
					style={[
						row.center,
						!isLast && border.bottom.medium,
						border.color.light.grey,
						padding.vertical.scale(7),
					]}
				>
					<View
						style={[
							row.item.center,
							flex.align.center,
							flex.justify.center,
							margin.right.small,
							{
								flexBasis: 45,
								flexGrow: 0,
								flexShrink: 0,
							},
						]}
					>
						<HardcodedAvatar size={40 * scaleSize} name={icon} />
					</View>
					<View
						style={[
							flex.justify.spaceAround,
							{
								flexBasis: 2,
								flexGrow: 2,
								flexShrink: 0,
							},
						]}
					>
						{/* Conversation title, unread count, and time */}
						<View style={[flex.direction.row, flex.justify.flexStart]}>
							{/* Title */}
							<View
								style={{
									flexShrink: 1,
								}}
							>
								<Text numberOfLines={1} style={[text.size.medium, { color: colors['main-text'] }]}>
									{displayName}
								</Text>
							</View>
						</View>
						<View
							style={[
								flex.direction.row,
								flex.align.center,
								{
									height: text.size.small.fontSize * 1.8, // Keep row height even if no description/message
								},
							]}
						>
							<Text
								numberOfLines={1}
								style={[
									{ flexGrow: 2, flexShrink: 1 },
									text.size.small,
									{ color: colors['secondary-text'] },
								]}
							>
								{desc}
							</Text>
							{/* Message status */}
							<View
								style={[
									row.item.center,
									row.right,
									{
										flexBasis: 16,
										flexGrow: 0,
										flexShrink: 0,
									},
								]}
							>
								<Icon
									name='info-outline'
									width={15}
									height={15}
									fill={colors['background-header']}
								/>
							</View>
						</View>
					</View>
				</View>
			</TouchableHighlight>
		</>
	)
}

export const Conversations: React.FC<ConversationsProps> = ({
	items,
	suggestions,
	configurations,
	addBot,
	onLayout,
}) => {
	const [{ padding }] = useStyles()
	const { t }: any = useTranslation()
	const colors = useThemeColor()

	return items.length || suggestions.length || configurations.length ? (
		<View
			onLayout={onLayout}
			style={[
				padding.bottom.medium,
				{
					flex: 1,
					backgroundColor: colors['main-background'],
				},
			]}
		>
			{/* TODO configurations conv ? */}
			{items.map((i, key) => (
				<ConversationsItem
					key={i.publicKey}
					{...i}
					isLast={!suggestions.length && key === items.length - 1}
				/>
			))}
			{suggestions.map((i: any, key: any) => (
				<SuggestionsItem
					key={key}
					isLast={key === suggestions.length - 1}
					{...i}
					desc={`${t('main.suggestion-display-name-initial')} ${i.displayName}`}
					addBot={addBot}
				/>
			))}
		</View>
	) : null
}
