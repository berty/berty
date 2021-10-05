import React from 'react'
import { StyleProp, TouchableHighlight, View, ViewProps } from 'react-native'
import { CommonActions } from '@react-navigation/native'
import { Icon, Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'

import { useStyles } from '@berty-tech/styles'
import beapi from '@berty-tech/api'
import { PersistentOptionsKeys, useMsgrContext } from '@berty-tech/store/context'
import { useLastConvInteraction, useThemeColor } from '@berty-tech/store/hooks'
import { Routes } from '@berty-tech/navigation'

import { ConversationAvatar, HardcodedAvatar } from '../../avatars'
import { pbDateToNum, timeFormat } from '../../utils'
import { UnreadCount } from './UnreadCount'
import { checkPermissions } from '@berty-tech/components/utils'
import { RESULTS } from 'react-native-permissions'

type ConversationsProps = ViewProps & {
	items: Array<any>
	suggestions: Array<any>
	configurations: Array<any>
	addBot: any
}

type ConversationsItemProps = any

// Functions

const MessageStatus: React.FC<{ interaction: any; isAccepted: boolean }> = ({
	interaction,
	isAccepted,
}) => {
	const colors = useThemeColor()
	if (interaction?.type !== beapi.messenger.AppMessage.Type.TypeUserMessage && isAccepted) {
		return null
	}

	return (
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

const interactionsFilter = (inte: any) =>
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

	const ctx = useMsgrContext()
	const { t }: any = useTranslation()

	const lastInte = useLastConvInteraction(publicKey, interactionsFilter)
	const displayDate = lastUpdate || createdDate ? pbDateToNum(lastUpdate || createdDate) : null

	const contact =
		Object.values(ctx.contacts).find((c: any) => c.conversationPublicKey === publicKey) || null
	const isAccepted = contact && contact.state === beapi.messenger.Contact.State.Accepted
	const isIncoming = contact && contact.state === beapi.messenger.Contact.State.IncomingRequest

	const [{ row, border, flex, padding, text, opacity, margin }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { dispatch } = useNavigation()

	let description
	if (lastInte?.type === beapi.messenger.AppMessage.Type.TypeUserMessage) {
		description = (lastInte.payload as any)?.body
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

	if (lastInte?.medias?.length) {
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

	if (ctx.convsTextInputValue[publicKey]) {
		description = t('main.home.conversations.draft', {
			message: ctx.convsTextInputValue[publicKey],
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
							dispatch(
								CommonActions.navigate({
									name: Routes.Chat.Group,
									params: {
										convId: publicKey,
									},
								}),
							)
					: () =>
							dispatch(
								CommonActions.navigate({
									name: Routes.Chat.OneToOne,
									params: {
										convId: publicKey,
									},
								}),
							)
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
									fontStyle: ctx.convsTextInputValue[publicKey] ? 'italic' : 'normal',
								},
								text.size.small,
								unreadCount
									? [text.bold.medium, { color: colors['main-text'] }]
									: { color: colors['secondary-text'] },
							]}
						>
							{description}
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
	icon: string
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
	const { navigate } = useNavigation()
	const colors = useThemeColor()
	const ctx = useMsgrContext()

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
			{configurations.map(config => (
				<SuggestionsItem
					key={config.key}
					displayName={t(config.displayName)}
					desc={t(config.desc)}
					link=''
					icon={config.icon}
					addBot={async () => {
						switch (config.key) {
							case 'network':
								navigate('Main.NetworkOptions')
								return
							case 'notification':
								const status = await checkPermissions('notification', navigate)
								await ctx.setPersistentOption({
									type: PersistentOptionsKeys.Configurations,
									payload: {
										...ctx.persistentOptions.configurations,
										notification: {
											...ctx.persistentOptions.configurations.notification,
											state: status === RESULTS.GRANTED ? 'added' : 'skipped',
										},
									},
								})
								return
							case 'replicate':
								navigate('Onboarding.ServicesAuth')
								return
						}
					}}
					style={{ backgroundColor: `${colors[`${config.color}`]}20` }}
				/>
			))}

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
