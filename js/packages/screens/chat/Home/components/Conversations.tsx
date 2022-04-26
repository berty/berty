import React from 'react'
import { ActivityIndicator, TouchableHighlight, View, ViewProps, ViewStyle } from 'react-native'
import { Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useStyles, defaultStylesDeclaration } from '@berty/contexts/styles'
import beapi from '@berty/api'
import { pbDateToNum, useThemeColor, ParsedInteraction } from '@berty/store'
import { useNavigation } from '@berty/navigation'
import { useAppSelector, useOneToOneContact, useLastConvInteraction } from '@berty/hooks'
import { selectChatInputText } from '@berty/redux/reducers/chatInputs.reducer'
import { ConversationAvatar, HardcodedAvatar, HardcodedAvatarKey } from '@berty/components/avatars'
import { timeFormat } from '@berty/components/helpers'
import { selectChatInputIsSending } from '@berty/redux/reducers/chatInputsVolatile.reducer'
import { Suggestion, Configuration } from '@berty/redux/reducers/persistentOptions.reducer'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

import { UnreadCount } from './UnreadCount'

type AddBotCallback = React.Dispatch<
	React.SetStateAction<{
		link: string
		displayName: string
		isVisible: boolean
	}>
>

// Functions

const MessageStatus: React.FC<{
	interaction: ParsedInteraction
	isAccepted: boolean
	sending?: boolean
}> = React.memo(({ interaction, isAccepted, sending }) => {
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
})

const interactionsFilter = (inte: ParsedInteraction) =>
	inte.type === beapi.messenger.AppMessage.Type.TypeUserMessage ||
	inte.type === beapi.messenger.AppMessage.Type.TypeGroupInvitation

const ConversationsItem: React.FC<
	beapi.messenger.IConversation & { fake?: boolean; isLast: boolean }
> = React.memo(props => {
	const {
		fake = false,
		type = beapi.messenger.Conversation.Type.ContactType,
		unreadCount,
		createdDate,
		lastUpdate,
		isLast,
	} = props

	const publicKey = props.publicKey || ''
	const displayName = props.displayName || ''

	const { t } = useTranslation()

	const lastInte = useLastConvInteraction(publicKey, interactionsFilter)
	const displayDate = lastUpdate || createdDate ? pbDateToNum(lastUpdate || createdDate) : null

	const contact = useOneToOneContact(publicKey)
	const isAccepted = contact && contact.state === beapi.messenger.Contact.State.Accepted
	const isIncoming = contact && contact.state === beapi.messenger.Contact.State.IncomingRequest

	const { row, border, flex, padding, text, opacity, margin } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const { navigate } = useNavigation()
	const chatInputText = useAppSelector(state => selectChatInputText(state, publicKey))
	const chatInputIsSending = useAppSelector(state => selectChatInputIsSending(state, publicKey))

	let description
	if (lastInte?.type === beapi.messenger.AppMessage.Type.TypeUserMessage) {
		description = lastInte.payload?.body
	} else if (lastInte?.type === beapi.messenger.AppMessage.Type.TypeGroupInvitation) {
		description = lastInte.isMine
			? 'You sent group invitation!'
			: 'You received new group invitation!'
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

	if (chatInputIsSending) {
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
					<View style={[flex.direction.row, flex.justify.start]}>
						{/* Title */}
						<View
							style={{
								flexShrink: 1,
							}}
						>
							<UnifiedText numberOfLines={1}>
								{fake ? `FAKE - ${userDisplayName}` : userDisplayName}
							</UnifiedText>
						</View>
						{/* Timestamp and unread count */}
						<View
							style={[
								flex.direction.row,
								flex.align.center,
								flex.justify.end,
								{ marginLeft: 'auto' },
							]}
						>
							<>
								<UnreadCount value={unreadCount || 0} isConvBadge />
								{displayDate && (
									<UnifiedText
										style={[
											padding.left.small,
											text.size.small,
											unreadCount ? [text.bold] : { color: colors['secondary-text'] },
										]}
									>
										{timeFormat.fmtTimestamp1(displayDate)}
									</UnifiedText>
								)}
							</>
						</View>
					</View>
					<View
						style={[
							flex.direction.row,
							flex.align.center,
							{
								height: defaultStylesDeclaration.text.sizes.small * 1.8, // Keep row height even if no description/message
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
						<UnifiedText
							numberOfLines={1}
							style={[
								{ flexGrow: 2, flexShrink: 1 },
								(chatInputText ||
									lastInte?.type === beapi.messenger.AppMessage.Type.TypeGroupInvitation) &&
									text.italic,
								text.size.small,
								unreadCount ? [text.bold] : { color: colors['secondary-text'] },
							]}
						>
							{description || ''}
						</UnifiedText>

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
									sending={chatInputIsSending}
								/>
							)}
						</View>
					</View>
				</View>
			</View>
		</TouchableHighlight>
	) : null
})

const SuggestionsItem: React.FC<{
	displayName: string
	desc: string
	link: string
	addBot: AddBotCallback
	icon: string
	isLast?: boolean
	style?: ViewStyle
}> = React.memo(({ displayName, desc, link, addBot, icon, style, isLast = false }) => {
	const { row, border, flex, padding, text, margin } = useStyles()
	const { scaleSize } = useAppDimensions()
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
						<HardcodedAvatar size={40 * scaleSize} name={icon as HardcodedAvatarKey} />
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
						<View style={[flex.direction.row, flex.justify.start]}>
							{/* Title */}
							<View
								style={{
									flexShrink: 1,
								}}
							>
								<UnifiedText numberOfLines={1}>{displayName}</UnifiedText>
							</View>
						</View>
						<View
							style={[
								flex.direction.row,
								flex.align.center,
								{
									height: defaultStylesDeclaration.text.sizes.small * 1.8, // Keep row height even if no description/message
								},
							]}
						>
							<UnifiedText
								numberOfLines={1}
								style={[
									{ flexGrow: 2, flexShrink: 1 },
									text.size.small,
									{ color: colors['secondary-text'] },
								]}
							>
								{desc}
							</UnifiedText>
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
})

export const Conversations: React.FC<
	ViewProps & {
		items: beapi.messenger.IConversation[]
		suggestions: Suggestion[]
		configurations: Configuration[]
		addBot: AddBotCallback
	}
> = React.memo(({ items, suggestions, configurations, addBot }) => {
	const { padding } = useStyles()
	const { t } = useTranslation()
	const colors = useThemeColor()

	return items.length || suggestions.length || configurations.length ? (
		<View
			style={[
				padding.bottom.medium,
				{
					flex: 1,
					backgroundColor: colors['main-background'],
				},
			]}
		>
			{/* TODO configurations conv ? */}
			{items.map((conv, index) => (
				<ConversationsItem
					key={conv.publicKey}
					{...conv}
					isLast={!suggestions.length && index === items.length - 1}
				/>
			))}
			{suggestions.map((suggestion, index) => (
				<SuggestionsItem
					key={`__suggestion_${index}`}
					isLast={index === suggestions.length - 1}
					{...suggestion}
					desc={`${t('main.suggestion-display-name-initial')} ${suggestion.displayName}`}
					addBot={addBot}
				/>
			))}
		</View>
	) : null
})
