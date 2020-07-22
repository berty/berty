import React, { useRef, useEffect, useState } from 'react'
import {
	TouchableOpacity,
	View,
	ViewProps,
	ScrollView,
	TouchableHighlight,
	Text as TextNative,
} from 'react-native'
import { Translation } from 'react-i18next'
import { useLayout } from '../hooks'
import { useStyles } from '@berty-tech/styles'
import {
	ProceduralCircleAvatar,
	ConversationProceduralAvatar,
} from '../shared-components/ProceduralCircleAvatar'
import { Messenger } from '@berty-tech/hooks'
import { ScreenProps, useNavigation, Routes } from '@berty-tech/navigation'
import { CommonActions } from '@react-navigation/core'
import { messenger } from '@berty-tech/store'
import { Icon, Text } from 'react-native-ui-kitten'
import { SafeAreaView, SafeAreaConsumer } from 'react-native-safe-area-context'
import FromNow from '../shared-components/FromNow'
import Logo from './1_berty_picto.svg'
import EmptyChat from './empty_chat.svg'
import { scaleHeight } from '@berty-tech/styles/constant'

//
// Main List
//

type RequestsProps = ViewProps & {
	items: Array<messenger.contact.Entity>
	isShow: boolean
}

type ConversationsProps = ViewProps & {
	items: Array<messenger.conversation.Entity>
}

type ConversationsItemProps = messenger.conversation.Entity

// Functions

const RequestsItem: React.FC<{
	id: string
	name: string
	publicKey: string
	display: (params: { contactId: string }) => void
	accept: (kwargs: { id: string }) => void
	decline: (kwargs: { id: string }) => void
	addedDate: number
}> = (props) => {
	const { id, name, display, decline, accept, publicKey, addedDate } = props
	const [
		{ border, padding, margin, width, height, column, row, background, absolute, text },
	] = useStyles()
	return (
		<Translation>
			{(t): React.ReactNode => (
				<TouchableOpacity
					style={[
						column.fill,
						width(121),
						height(177),
						background.white,
						margin.medium,
						margin.top.huge,
						padding.medium,
						padding.top.huge,
						border.radius.medium,
						border.shadow.medium,
					]}
					onPress={() => display({ contactId: id })}
				>
					<ProceduralCircleAvatar
						style={[absolute.center, border.shadow.medium, absolute.scale({ top: -32.5 })]}
						seed={publicKey}
						size={65}
						diffSize={20}
					/>
					<Text style={[text.align.center, text.color.black, text.size.medium]} numberOfLines={2}>
						{name}
					</Text>
					<Text
						style={[
							text.size.tiny,
							text.color.grey,
							text.align.center,
							{ lineHeight: (text.size.tiny as any).fontSize * 1.25 },
						]}
					>
						<FromNow date={addedDate} />
					</Text>
					<View style={[row.center]}>
						<TouchableOpacity
							style={[
								border.medium,
								border.color.light.grey,
								row.item.justify,
								border.medium,
								border.radius.tiny,
								border.shadow.tiny,
								background.white,
								padding.horizontal.tiny,
								margin.right.tiny,
							]}
							onPress={(): void => {
								decline({ id })
							}}
						>
							<Text style={[text.size.tiny, text.color.grey, row.item.justify, padding.small]}>
								x
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								background.light.blue,
								row.item.justify,
								border.radius.tiny,
								border.shadow.tiny,
								padding.horizontal.tiny,
								margin.left.tiny,
							]}
							onPress={() => {
								accept({ id })
							}}
						>
							<Text style={[text.size.tiny, text.color.blue, row.item.justify, padding.small]}>
								{t('main.requests.accept')}
							</Text>
						</TouchableOpacity>
					</View>
				</TouchableOpacity>
			)}
		</Translation>
	)
}

const ContactRequestsItem: React.FC<messenger.contact.Entity> = ({
	id,
	name,
	publicKey,
	addedDate,
}) => {
	const accept = Messenger.useAcceptContactRequest()
	const decline = Messenger.useDiscardContactRequest()
	const { navigate } = useNavigation()
	return (
		<RequestsItem
			id={id}
			name={name}
			publicKey={publicKey}
			display={navigate.main.contactRequest}
			accept={accept}
			decline={decline}
			addedDate={addedDate}
		/>
	)
}

const Requests: React.FC<RequestsProps> = ({ items, style, onLayout, isShow }) => {
	const [{ padding, text, background }] = useStyles()
	return items?.length && isShow ? (
		<SafeAreaView onLayout={onLayout} style={[style, background.blue]}>
			<View style={[padding.top.medium]}>
				<Text style={[text.color.white, text.size.huge, text.bold.medium, padding.medium]}>
					Requests
				</Text>
				<ScrollView
					horizontal
					style={[padding.bottom.medium]}
					showsHorizontalScrollIndicator={false}
				>
					{items.map((_) => {
						return <ContactRequestsItem {..._} />
					})}
				</ScrollView>
			</View>
		</SafeAreaView>
	) : null
}

const formatTimestamp = (date: Date) => {
	const arr = date.toString().split(' ')
	const hours = arr[4].split(':')
	const hour = hours[0] + ':' + hours[1]
	return hour
}

const UnreadCount: React.FC<{ value: number }> = ({ value }) => {
	const [{ flex }] = useStyles()
	return value ? (
		<View
			style={[
				flex.justify.center,
				{
					backgroundColor: 'red',
					borderRadius: 1000,
					height: 15,
					minWidth: 15,
					paddingHorizontal: 2,
				},
			]}
		>
			<Text
				style={{
					color: 'white',
					fontWeight: '700',
					fontSize: 10,
					textAlign: 'center',
					lineHeight: 14,
				}}
			>
				{value.toString()}
			</Text>
		</View>
	) : null
}

const MessageStatus: React.FC<{ messageID: string }> = ({ messageID }) => {
	const [{ color, flex }] = useStyles()
	const message = Messenger.useGetMessage(messageID)
	if (message?.type !== messenger.AppMessageType.UserMessage) {
		return null
	}
	return (
		<View style={[{ width: 25 }, flex.justify.center, flex.align.center]}>
			{message ? (
				<Icon
					name={message.acknowledged ? 'navigation-2' : 'navigation-2-outline'}
					width={14}
					height={14}
					fill={color.blue}
				/>
			) : null}
		</View>
	)
}

const ConversationsItem: React.FC<ConversationsItemProps> = (props) => {
	const { dispatch } = useNavigation()
	const { title, kind, id, messages, unreadCount, lastSentMessage, fake } = props
	const [{ color, row, border, flex, column, padding, text }] = useStyles()
	const message = Messenger.useGetMessage(messages ? messages[messages.length - 1] : '')

	return (
		<TouchableHighlight
			underlayColor={color.light.grey}
			style={[padding.horizontal.medium]}
			onPress={
				kind === messenger.conversation.ConversationKind.MultiMember
					? () =>
							dispatch(
								CommonActions.navigate({
									name: Routes.Chat.Group,
									params: {
										convId: id,
									},
								}),
							)
					: () =>
							dispatch(
								CommonActions.navigate({
									name: Routes.Chat.OneToOne,
									params: {
										convId: id,
									},
								}),
							)
			}
		>
			<View
				style={[row.center, border.bottom.medium, border.color.light.grey, padding.vertical.small]}
			>
				<ConversationProceduralAvatar
					conversationId={props.id}
					size={50}
					style={[padding.tiny, row.item.justify]}
				/>
				<View style={[flex.big, column.fill, padding.small]}>
					<View style={[row.fill]}>
						<View style={[row.left]}>
							<Text
								numberOfLines={1}
								style={[text.size.medium, text.color.black, unreadCount && text.bold.medium]}
							>
								{(fake && 'FAKE - ') || ''}
								{title || ''}
							</Text>
						</View>
						<View style={[row.right, flex.align.center]}>
							<UnreadCount value={unreadCount} />
							<Text
								style={[
									padding.left.small,
									text.size.small,
									unreadCount ? [text.bold.medium, text.color.black] : text.color.grey,
								]}
							>
								{message?.type === messenger.AppMessageType.UserMessage
									? formatTimestamp(new Date(message.sentDate))
									: formatTimestamp(new Date(Date.now()))}
							</Text>
							{lastSentMessage && <MessageStatus messageID={lastSentMessage} />}
						</View>
					</View>
					<Text
						numberOfLines={1}
						style={[
							text.size.small,
							unreadCount ? [text.bold.medium, text.color.black] : text.color.grey,
						]}
					>
						{message?.type === messenger.AppMessageType.UserMessage ? message.body : ''}
					</Text>
				</View>
			</View>
		</TouchableHighlight>
	)
}

const Conversations: React.FC<ConversationsProps> = ({ items, onLayout, style }) => {
	const [{ background }] = useStyles()
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
						items.map((_) => {
							return <ConversationsItem key={_.id} {..._} />
						})}
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
	const [{ border, padding, margin, text, background, flex, color }] = useStyles()

	return (
		<View onLayout={onLayout}>
			<Translation>
				{(t): React.ReactNode => (
					<View
						style={[
							background.white,
							border.radius.top.big,
							padding.horizontal.scale(27),

							flex.align.center,
							flex.direction.row,
							flex.justify.spaceBetween,
							{
								paddingTop: !hasRequests
									? 40 * scaleHeight
									: isOnTop
									? 40 * scaleHeight
									: 20 * scaleHeight,
							},
						]}
					>
						<View style={[flex.direction.row, flex.justify.start, flex.align.center]}>
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
	const [layoutRequests, onLayoutRequests] = useLayout()
	const [layoutConversations, onLayoutConversations] = useLayout()
	const [layoutHeader, onLayoutHeader] = useLayout()

	const requests = Messenger.useAccountContactsWithIncomingRequests().filter(
		(contact) => !(contact.request.accepted || contact.request.discarded),
	)
	const conversations = Messenger.useConversationList().sort((a, b) => {
		if (!a.fake && !b.fake) {
			return (b.lastMessageDate || 0) - (a.lastMessageDate || 0)
		}
		return 0
	})
	const isConversation = Messenger.useConversationLength()

	const [{ color, text, opacity, flex, margin }] = useStyles()
	const scrollRef = useRef<ScrollView>(null)
	const [offset, setOffset] = useState<any>()
	const [isOnTop, setIsOnTop] = useState<boolean>(false)
	const [dirScroll, setDirScroll] = useState<string>('')
	const [bgColor, setBgColor] = useState<any>()

	useEffect(() => {
		if (!requests.length) {
			setBgColor(color.white)
		} else if ((dirScroll === 'up' && isOnTop) || isOnTop) {
			setBgColor(color.white)
		} else if ((dirScroll === 'down' && !isOnTop) || !isOnTop) {
			setBgColor(color.blue)
		}
	}, [dirScroll, isOnTop, color.white, color.blue, requests.length])

	return (
		<View style={[flex.tiny]}>
			<ScrollView
				ref={scrollRef}
				style={[{ backgroundColor: bgColor }]}
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
						if (offset && e.nativeEvent.contentOffset.y >= offset.y) {
							setDirScroll('up')
						} else if (offset && e.nativeEvent.contentOffset.y < offset.y) {
							setDirScroll('down')
						}
						setOffset(e.nativeEvent.contentOffset)
					}
				}}
			>
				<Requests items={requests} onLayout={onLayoutRequests} isShow={true} />
				<HomeHeader
					isOnTop={isOnTop}
					onLayout={onLayoutHeader}
					hasRequests={requests.length > 0}
					scrollRef={scrollRef}
				/>
				{isConversation ? (
					<Conversations items={conversations} onLayout={onLayoutConversations} />
				) : (
					<View style={[flex.justify.center, flex.align.center, margin.top.scale(60)]}>
						<EmptyChat width={350} height={350} />
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
				)}
			</ScrollView>
		</View>
	)
}

export default Home
