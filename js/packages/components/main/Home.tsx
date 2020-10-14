import React, { useMemo, useRef, useState } from 'react'
import { CommonActions } from '@react-navigation/native'
import { Translation } from 'react-i18next'
import {
	ScrollView,
	Text as TextNative,
	TouchableHighlight,
	TouchableOpacity,
	View,
	ViewProps,
	Image,
} from 'react-native'
import { SafeAreaConsumer, SafeAreaView } from 'react-native-safe-area-context'
import { Icon, Text } from 'react-native-ui-kitten'
import LinearGradient from 'react-native-linear-gradient'

import { ScreenProps, useNavigation, Routes } from '@berty-tech/navigation'
import {
	useConversationLength,
	useIncomingContactRequests,
	useMsgrContext,
	useLastConvInteraction,
	usePersistentOptions,
	useSortedConversationList,
} from '@berty-tech/store/hooks'
import messengerMethodsHooks from '@berty-tech/store/methods'
import { messenger as messengerpb } from '@berty-tech/api/index.js'
import * as api from '@berty-tech/api/index.pb'
import { useStyles } from '@berty-tech/styles'

import { useLayout } from '../hooks'
import { pbDateToNum, strToTimestamp, timeFormat } from '../helpers'
import FromNow from '../shared-components/FromNow'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'
import { SwipeHelperReactNavTabBar } from '../shared-components/SwipeNavRecognizer'

import Logo from './1_berty_picto.svg'
import EmptyChat from './empty_chat.svg'
import AvatarGroup19 from './Avatar_Group_Copy_19.png'

//
// Main List
//

type ConversationsProps = ViewProps & {
	items: Array<any>
}

type ConversationsItemProps = any

//
// Styles
//

const useStylesContactRequest: any = () => {
	const [{ border, padding, margin, width, height, row, background, flex }] = useStyles()
	return {
		contactReqContainer: [
			background.white,
			border.radius.medium,
			border.shadow.medium,
			flex.align.center,
			flex.justify.flexEnd,
			height(160),
			margin.medium,
			margin.top.huge,
			padding.horizontal.tiny,
			padding.top.scale(33),
			padding.bottom.medium,
			width(121),
		],
		declineButton: [
			background.white,
			border.color.light.grey,
			border.medium,
			border.medium,
			border.radius.tiny,
			border.shadow.tiny,
			flex.align.center,
			height(25),
			padding.tiny,
			{ flexShrink: 2, flexGrow: 0 },
		],
		acceptButton: [
			background.light.blue,
			border.radius.tiny,
			border.shadow.tiny,
			flex.align.center,
			height(25),
			padding.horizontal.tiny,
			row.fill,
			row.item.justify,
		],
		buttonsWrapper: [
			flex.align.center,
			row.center,
			{
				flexGrow: 2,
				flexShrink: 0,
				marginBottom: -4,
				marginTop: 3,
				width: '100%',
			},
		],
	}
}

// Functions

const ContactRequest: React.FC<api.berty.messenger.v1.IContact> = ({
	displayName,
	publicKey,
	conversationPublicKey,
	createdDate: createdDateStr,
}) => {
	const { refresh: accept } = messengerMethodsHooks.useContactAccept()
	const decline: any = () => {} // Messenger.useDiscardContactRequest()
	const { dispatch } = useNavigation()
	const {
		contactReqContainer,
		declineButton,
		acceptButton,
		buttonsWrapper,
	} = useStylesContactRequest()

	const id = publicKey
	const [{ border, padding, row, absolute, text, color }, { scaleSize }] = useStyles()
	const createdDate = typeof createdDateStr === 'string' ? parseInt(createdDateStr, 10) : Date.now()
	const textColor = '#AFB1C0'
	return (
		<Translation>
			{(t): React.ReactNode => (
				<TouchableOpacity
					style={contactReqContainer}
					onPress={() => {
						if (conversationPublicKey) {
							dispatch(
								CommonActions.navigate({
									name: Routes.Chat.OneToOne,
									params: {
										convId: conversationPublicKey,
									},
								}),
							)
							// display({ contactId: id })
						}
					}}
				>
					<ProceduralCircleAvatar
						style={[absolute.center, border.shadow.medium, absolute.scale({ top: -27.5 })]}
						seed={publicKey}
						size={55}
						diffSize={16}
					/>
					<View
						style={{
							flexGrow: 2,
							justifyContent: 'center',
							flexShrink: 0,
							flexBasis: 45,
						}}
					>
						<Text
							style={[text.align.center, text.color.black, text.bold.small, text.size.scale(14)]}
							numberOfLines={2}
						>
							{displayName || ''}
						</Text>
					</View>
					<View
						style={{
							flexGrow: 1,
							flexShrink: 0,
							justifyContent: 'flex-end',
							alignSelf: 'center',
						}}
					>
						<Text
							style={[
								text.size.scale(11),
								text.align.center,
								{
									lineHeight: (text.size.scale(11) as any).fontSize * 1.6,
									color: textColor,
								},
							]}
						>
							Contact request!
						</Text>
						<Text
							style={[
								text.size.scale(10),
								text.align.center,
								{ lineHeight: (text.size.scale(11) as any).fontSize * 2, color: '#888' },
							]}
						>
							<FromNow date={createdDate} />
						</Text>
					</View>
					<View style={buttonsWrapper}>
						<TouchableOpacity
							style={declineButton}
							onPress={(): void => {
								decline({ id })
							}}
						>
							<Icon
								name='close-outline'
								fill={textColor}
								width={17 * scaleSize}
								height={17 * scaleSize}
								style={[padding.tiny, row.item.justify]}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							style={acceptButton}
							onPress={() => {
								accept({ publicKey })
							}}
						>
							<Icon
								name='checkmark-outline'
								fill={color.blue}
								width={17 * scaleSize}
								height={17 * scaleSize}
							/>
							<Text style={[text.size.scale(10), text.color.blue, padding.horizontal.tiny]}>
								{t('main.requests.accept')}
							</Text>
						</TouchableOpacity>
					</View>
				</TouchableOpacity>
			)}
		</Translation>
	)
}

const UnreadCount: React.FC<{ value: number; isConvBadge?: boolean }> = ({
	value,
	isConvBadge = false,
}) => {
	const dimension = isConvBadge ? 15 : 21
	const fontSize = isConvBadge ? 10 : 13
	const lineHeight = isConvBadge ? 14 : 17

	return value ? (
		<View
			style={{
				backgroundColor: 'red',
				justifyContent: 'center',
				borderRadius: 1000,
				height: dimension,
				minWidth: dimension,
				paddingHorizontal: 2,
			}}
		>
			<Text
				style={{
					color: 'white',
					fontWeight: '700',
					textAlign: 'center',
					fontSize,
					lineHeight,
				}}
			>
				{value.toString()}
			</Text>
		</View>
	) : null
}

const IncomingRequests: React.FC<any> = ({ items, onLayout }) => {
	const [{ padding, text, background, row }, { scaleHeight, scaleSize }] = useStyles()
	return items?.length ? (
		<SafeAreaView onLayout={onLayout} style={[background.blue]}>
			<View style={[padding.top.medium]}>
				<View style={[row.left]}>
					<Text style={[text.color.white, text.size.huge, text.bold.medium, padding.medium]}>
						Requests
					</Text>
					<View style={{ position: 'relative', top: -2, left: -(23 * scaleSize) }}>
						<UnreadCount value={items.length} />
					</View>
				</View>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					{items.map((c: any) => {
						return <ContactRequest key={c.publicKey} {...c} />
					})}
				</ScrollView>
			</View>
		</SafeAreaView>
	) : null
}

const MessageStatus: React.FC<{ interaction: any; isAccepted: boolean }> = ({
	interaction,
	isAccepted,
}) => {
	const [{ color }] = useStyles()
	if (interaction?.type !== messengerpb.AppMessage.Type.TypeUserMessage && isAccepted) {
		return null
	}
	return (
		<View style={{ width: 25, justifyContent: 'center', alignItems: 'center' }}>
			<Icon
				name={
					(interaction && !interaction.acknowledged) || !isAccepted
						? 'navigation-2-outline'
						: 'navigation-2'
				}
				width={14}
				height={14}
				fill={color.blue}
			/>
		</View>
	)
}

const interactionsFilter = (inte: any) => inte.type === messengerpb.AppMessage.Type.TypeUserMessage

const ConversationsItem: React.FC<ConversationsItemProps> = (props) => {
	const {
		publicKey = '',
		displayName = '',
		fake = false,
		type = messengerpb.Conversation.Type.ContactType,
		unreadCount,
		contactPublicKey,
		createdDate,
		lastUpdate,
	} = props

	const ctx = useMsgrContext()

	const lastInte = useLastConvInteraction(publicKey, interactionsFilter)

	const displayDate = lastUpdate || createdDate ? pbDateToNum(lastUpdate || createdDate) : null

	const contact =
		Object.values(ctx.contacts).find((c: any) => c.conversationPublicKey === publicKey) || null
	const isAccepted = contact && contact.state === messengerpb.Contact.State.Accepted
	const isIncoming = contact && contact.state === messengerpb.Contact.State.IncomingRequest

	const [
		{ color, row, border, flex, column, padding, text, opacity, background, margin },
		{ scaleHeight },
	] = useStyles()
	// TODO: Last message, unread count, navigate to chatroom
	const { dispatch } = useNavigation()

	const persistOpts = usePersistentOptions()
	const isBetabot =
		persistOpts &&
		persistOpts.betabot &&
		persistOpts.betabot.convPk &&
		type !== messengerpb.Conversation.Type.MultiMemberType &&
		contactPublicKey.toString() === persistOpts.betabot.convPk.toString()
	const isBetabotAdded = persistOpts && persistOpts.betabot.added
	let description
	if (isBetabot && !isBetabotAdded) {
		description = 'Click here to add the Beta Bot!'
	} else {
		if (lastInte?.type === messengerpb.AppMessage.Type.TypeUserMessage) {
			description = lastInte.payload.body
		} else {
			description = ''
		}
	}
	console.log(isBetabot, isBetabotAdded, lastInte)
	return !isIncoming ? (
		<TouchableHighlight
			underlayColor={color.light.grey}
			style={[
				padding.horizontal.medium,
				!isAccepted && type !== messengerpb.Conversation.Type.MultiMemberType && opacity(0.6),
			]}
			onPress={
				type === messengerpb.Conversation.Type.MultiMemberType
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
				style={[row.center, border.bottom.medium, border.color.light.grey, padding.vertical.small]}
			>
				{type === messengerpb.Conversation.Type.MultiMemberType ? (
					<View style={[padding.tiny, padding.left.small, row.item.justify]}>
						<Image source={AvatarGroup19} style={{ width: 40, height: 40 }} />
					</View>
				) : isBetabot ? (
					<View style={[padding.horizontal.tiny]}>
						<View
							style={[
								border.radius.scale(25),
								border.shadow.medium,
								background.white,
								margin.right.small,
								{
									justifyContent: 'center',
									alignItems: 'center',
									display: 'flex',
									width: 40,
									height: 40,
									alignSelf: 'center',
									right: -(5 * scaleHeight),
									top: 9 * scaleHeight,
								},
							]}
						>
							<Logo width={25} height={25} style={{ right: -1, top: -1 }} />
						</View>
					</View>
				) : (
					<ProceduralCircleAvatar
						seed={contact?.publicKey}
						size={50}
						style={[padding.tiny, row.item.justify]}
					/>
				)}
				<View style={[flex.big, column.fill, padding.small]}>
					<View style={[row.fill]}>
						<View style={[row.left, { flexShrink: 1 }]}>
							<Text numberOfLines={1} style={[text.size.medium, text.color.black]}>
								{(fake && 'FAKE - ') || ''}
								{type === messengerpb.Conversation.Type.MultiMemberType
									? displayName
									: contact?.displayName || ''}
							</Text>
						</View>
						<View style={[row.right, { alignItems: 'center' }]}>
							{isBetabot && !isBetabotAdded ? (
								<View
									style={{
										width: 25,
										justifyContent: 'center',
										alignItems: 'center',
										top: 10 * scaleHeight,
									}}
								>
									<Icon name='info-outline' fill={color.blue} width={20} height={20} />
								</View>
							) : (
								<>
									<UnreadCount value={unreadCount} isConvBadge />
									{displayDate && (
										<Text
											style={[
												padding.left.small,
												text.size.small,
												unreadCount ? [text.bold.medium, text.color.black] : text.color.grey,
											]}
										>
											{/* {Date.now() - new Date(sentDate).getTime() > 86400000
											? moment(sentDate).format('DD/MM/YYYY')
											: moment(sentDate).format('hh:mm')} */}
											{timeFormat.fmtTimestamp1(displayDate)}
										</Text>
									)}
								</>
							)}
							{lastInte && lastInte.isMe && (
								<MessageStatus
									interaction={lastInte}
									isAccepted={isAccepted || type === messengerpb.Conversation.Type.MultiMemberType}
								/>
							)}
						</View>
					</View>
					<Text
						numberOfLines={1}
						style={[
							text.size.small,
							unreadCount
								? isBetabot && !isBetabotAdded
									? text.color.grey
									: [text.bold.medium, text.color.black]
								: text.color.grey,
						]}
					>
						{description}
					</Text>
				</View>
			</View>
		</TouchableHighlight>
	) : null
}

const Conversations: React.FC<ConversationsProps> = ({ items, style, onLayout }) => {
	const [{ background, padding }] = useStyles()
	return items?.length ? (
		<SafeAreaConsumer>
			{(insets) => (
				<View
					onLayout={onLayout}
					style={[
						style,
						background.white,
						{
							paddingBottom: 100 - (insets?.bottom || 0) + (insets?.bottom || 0),
						},
					]}
				>
					{items &&
						items.length &&
						items.map((i) => <ConversationsItem key={i.publicKey} {...i} />)}
				</View>
			)}
		</SafeAreaConsumer>
	) : null
}

const HomeHeader: React.FC<
	ViewProps & {
		hasRequests: boolean
		scrollRef: React.RefObject<ScrollView>
		isOnTop: boolean
	}
> = ({ hasRequests, scrollRef, onLayout, isOnTop }) => {
	const [{ border, padding, margin, text, background }, { scaleHeight }] = useStyles()

	return (
		<View onLayout={onLayout}>
			<Translation>
				{(t): React.ReactNode => (
					<View
						style={[
							background.white,
							border.radius.top.big,
							padding.horizontal.scale(27),
							{
								alignItems: 'center',
								flexDirection: 'row',
								justifyContent: 'space-between',
								paddingTop: !hasRequests
									? 40 * scaleHeight
									: isOnTop
									? 40 * scaleHeight
									: 20 * scaleHeight,
							},
						]}
					>
						<View
							style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}
						>
							<Logo
								width={35}
								height={35}
								onPress={() => {
									scrollRef.current?.scrollTo({ y: 0, animated: true })
								}}
							/>
							<Text
								style={[
									text.color.black,
									text.size.huge,
									text.bold.medium,
									padding.medium,
									padding.top.big,
									margin.horizontal.medium,
								]}
							>
								{t('main.messages.title')}
							</Text>
						</View>
					</View>
				)}
			</Translation>
		</View>
	)
}

export const Home: React.FC<ScreenProps.Main.Home> = () => {
	// TODO: do something to animate the requests
	const requests: any[] = useIncomingContactRequests()
	const conversations: any[] = useSortedConversationList()
	const isConversation: number = useConversationLength()
	const [layoutRequests, onLayoutRequests] = useLayout()
	const [layoutHeader, onLayoutHeader] = useLayout()
	const [layoutConvs, onLayoutConvs] = useLayout()
	const [isOnTop, setIsOnTop] = useState<boolean>(false)

	const [
		{ text, opacity, flex, margin, background, absolute },
		{ windowHeight, scaleSize, scaleHeight },
	] = useStyles()
	const scrollRef = useRef<ScrollView>(null)

	const styleBackground = useMemo(
		() => (requests.length > 0 ? background.blue : background.white),
		[background.blue, background.white, requests.length],
	)

	return (
		<>
			<View style={[flex.tiny, styleBackground]}>
				<SwipeHelperReactNavTabBar>
					<ScrollView
						ref={scrollRef}
						stickyHeaderIndices={[1]}
						showsVerticalScrollIndicator={false}
						scrollEventThrottle={16}
						onScroll={(e) => {
							if (e.nativeEvent.contentOffset) {
								if (e.nativeEvent.contentOffset.y >= layoutRequests.height) {
									setIsOnTop(true)
								} else {
									setIsOnTop(false)
								}
							}
						}}
					>
						<IncomingRequests items={requests} onLayout={onLayoutRequests} />
						<HomeHeader
							isOnTop={isOnTop}
							hasRequests={requests.length > 0}
							scrollRef={scrollRef}
							onLayout={onLayoutHeader}
						/>
						{isConversation ? (
							<Conversations items={conversations} onLayout={onLayoutConvs} />
						) : (
							<View style={[background.white]}>
								<View style={[flex.justify.center, flex.align.center, margin.top.scale(60)]}>
									<View>
										<EmptyChat width={350 * scaleSize} height={350 * scaleHeight} />
										<TextNative
											style={[
												text.align.center,
												text.color.grey,
												text.bold.small,
												opacity(0.3),
												margin.top.big,
											]}
										>
											You don't have any contacts or chat yet
										</TextNative>
									</View>
								</View>
							</View>
						)}
						{requests.length > 0 && (
							<View
								style={[
									{
										backgroundColor: 'white',
										position: 'absolute',
										bottom: windowHeight * -1,
										height: windowHeight,
										width: '100%',
									},
								]}
							/>
						)}
					</ScrollView>
				</SwipeHelperReactNavTabBar>
			</View>
			<LinearGradient
				style={[
					absolute.bottom,
					{ alignItems: 'center', justifyContent: 'center', height: '15%', width: '100%' },
				]}
				colors={['#ffffff00', '#ffffff80', '#ffffffc0', '#ffffffff']}
			/>
		</>
	)
}

export default Home
