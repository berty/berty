import { ScreenProps, useNavigation, Routes } from '@berty-tech/navigation'
import {
	useConversationLength,
	useConversationList,
	useIncomingContactRequests,
	useMsgrContext,
} from '@berty-tech/store/hooks'
import messengerMethodsHooks from '@berty-tech/store/methods'
import { Messenger } from '@berty-tech/store/oldhooks'
import { useStyles } from '@berty-tech/styles'
import React, { useEffect, useRef, useState } from 'react'
import { Translation } from 'react-i18next'
import {
	ScrollView,
	Text as TextNative,
	TouchableHighlight,
	TouchableOpacity,
	View,
	ViewProps,
} from 'react-native'
import { SafeAreaConsumer, SafeAreaView } from 'react-native-safe-area-context'
import { Icon, Text } from 'react-native-ui-kitten'
import { useLayout } from '../hooks'
import FromNow from '../shared-components/FromNow'
import {
	ConversationProceduralAvatar,
	ProceduralCircleAvatar,
} from '../shared-components/ProceduralCircleAvatar'
import Logo from './1_berty_picto.svg'
import EmptyChat from './empty_chat.svg'
import { CommonActions } from '@react-navigation/native'

//
// Main List
//

type ConversationsProps = ViewProps & {
	items: Array<any>
}

type ConversationsItemProps = any

// Functions

const ContactRequest: React.FC<any> = ({ displayName, publicKey, addedDate }) => {
	const { refresh: accept } = messengerMethodsHooks.useContactAccept()
	const decline = () => {} // Messenger.useDiscardContactRequest()
	const { navigate } = useNavigation()
	const display = navigate.main.contactRequest
	const id = publicKey
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
						{displayName}
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
								accept({ publicKey })
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

const IncomingRequests: React.FC<any> = ({ items, onLayout }) => {
	const [{ padding, text, background }] = useStyles()
	return items?.length ? (
		<SafeAreaView onLayout={onLayout} style={[background.blue]}>
			<View style={[padding.top.medium]}>
				<Text style={[text.color.white, text.size.huge, text.bold.medium, padding.medium]}>
					Requests
				</Text>
				<ScrollView
					horizontal
					style={[padding.bottom.medium]}
					showsHorizontalScrollIndicator={false}
				>
					{items.map((c: any) => {
						return <ContactRequest key={c.publicKey} {...c} />
					})}
				</ScrollView>
			</View>
		</SafeAreaView>
	) : null
}

const UnreadCount: React.FC<{ value: number }> = ({ value }) =>
	value ? (
		<View
			style={{
				backgroundColor: 'red',
				justifyContent: 'center',
				borderRadius: 1000,
				height: 15,
				minWidth: 15,
				paddingHorizontal: 2,
			}}
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

const MessageStatus: React.FC<{ messageID: string }> = ({ messageID }) => {
	const [{ color }] = useStyles()
	const message = Messenger.useGetMessage(messageID)
	// if (message?.type !== messenger.AppMessageType.UserMessage) {
	// 	return null
	// }
	return (
		<View style={{ width: 25, justifyContent: 'center', alignItems: 'center' }}>
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
	// const { dispatch } = useNavigation()
	const {
		publicKey = '',
		displayName = '',
		fake = false,
		kind = '1to1',
		contactPublicKey = '',
	} = props
	const [{ color, row, border, flex, column, padding, text }] = useStyles()
	// TODO: Last message, unread count, navigate to chatroom
	const { dispatch } = useNavigation()

	return (
		<TouchableHighlight
			underlayColor={color.light.grey}
			style={[padding.horizontal.medium]}
			onPress={
				kind === 'multi'
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
				<ProceduralCircleAvatar
					seed={kind === 'multi' ? publicKey : contactPublicKey}
					size={50}
					style={[padding.tiny, row.item.justify]}
				/>
				<View style={[flex.big, column.fill, padding.small]}>
					<View style={[row.fill]}>
						<View style={[row.left]}>
							<Text
								numberOfLines={1}
								style={[
									text.size.medium,
									text.color.black,
									// unreadCount && text.bold.medium
								]}
							>
								{(fake && 'FAKE - ') || ''}
								{displayName || ''}
							</Text>
						</View>
						{/* <View style={[row.right, { alignItems: 'center' }]}>
                            <UnreadCount value={unreadCount} />
                            <Text
                                style={[
                                    padding.left.small,
                                    text.size.small,
                                    unreadCount ? [text.bold.medium, text.color.black] : text.color.grey,
                                ]}
                            >
                                {message?.type === messenger.AppMessageType.UserMessage
                                    ? Date.now() - new Date(message.sentDate).getTime() > 86400000
                                        ? moment(message.sentDate).format('DD/MM/YYYY')
                                        : moment(message.sentDate).format('hh:mm')
                                    : moment().format('hh:mm')}
                            </Text>
                            {lastSentMessage && <MessageStatus messageID={lastSentMessage} />}
                        </View> */}
					</View>
					{/* <Text
                        numberOfLines={1}
                        style={[
                            text.size.small,
                            unreadCount ? [text.bold.medium, text.color.black] : text.color.grey,
                        ]}
                    >
                        {message?.type === messenger.AppMessageType.UserMessage ? message.body : ''}
                    </Text> */}
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
						items.map((i) => {
							return <ConversationsItem key={i.publicKey} {...i} />
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
	const [layoutRequests, onLayoutRequests] = useLayout()
	const [layoutConversations, onLayoutConversations] = useLayout()
	const [layoutHeader, onLayoutHeader] = useLayout()

	const requests: any[] = useIncomingContactRequests()
	const conversations: any[] = useConversationList() // TODO: sort
	const isConversation: number = useConversationLength()

	const [{ color, text, opacity, flex, margin, background }] = useStyles()
	const scrollRef = useRef<ScrollView>(null)
	const [offset, setOffset] = useState<any>()
	const [isOnTop, setIsOnTop] = useState<boolean>(false)
	const [dirScroll, setDirScroll] = useState<string>('')
	const [bgColor, setBgColor] = useState<any>()

	useEffect(() => {
		if (!requests.length) {
			setBgColor(color.white)
		} else {
			setBgColor(color.blue)
		}
	}, [color.white, color.blue, requests.length])

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
				<IncomingRequests items={requests} onLayout={onLayoutRequests} />
				<HomeHeader
					isOnTop={isOnTop}
					onLayout={onLayoutHeader}
					hasRequests={requests.length > 0}
					scrollRef={scrollRef}
				/>
				{isConversation ? (
					<Conversations items={conversations} onLayout={onLayoutConversations} />
				) : (
					<View style={[background.white]}>
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
					</View>
				)}
			</ScrollView>
		</View>
	)
}

export default Home
