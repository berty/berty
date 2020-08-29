import React, { useState, useEffect, useRef } from 'react'
import { messenger as messengerpb } from '@berty-tech/api/index.js'
import BlurView from '../shared-components/BlurView'
import {
	TouchableOpacity,
	View,
	StyleSheet,
	FlatList,
	ActivityIndicator,
	KeyboardAvoidingView,
} from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
// import { Messenger, Settings } from '@berty-tech/store/oldhooks'
import { useNavigation, ScreenProps } from '@berty-tech/navigation'
import FromNow from '../shared-components/FromNow'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'
import { Message } from './shared-components/Message'
// import { ChatFooter, ChatDate } from './shared-components/Chat'

// import { useReadEffect } from '../hooks'
import { useMsgrContext, useConversation, useContact } from '@berty-tech/store/hooks'
import { values } from 'lodash'
import { ChatFooter } from './shared-components/Chat'

//
// Chat
//

// Styles
const useStylesChat = () => {
	const [{ flex, text }] = useStyles()
	return {
		headerName: flex.large,
		headerNameText: text.size.scale(20),
	}
}

const CenteredActivityIndicator: React.FC = (props: ActivityIndicator['props']) => {
	const { children, ...propsToPass } = props
	return (
		<View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator {...propsToPass} />
		</View>
	)
}

export const ChatHeader: React.FC<{ convPk: any }> = ({ convPk }) => {
	const { navigate, goBack } = useNavigation()
	const conv = useConversation(convPk)
	const contact = useContact(conv.contactPublicKey)

	const _styles = useStylesChat()
	const [
		{ absolute, row, padding, column, margin, text, flex, opacity, color, border, width, height },
		{ scaleHeight },
	] = useStyles()

	// const lastDate = Messenger.useGetDateLastContactMessage(convPk)
	// const lastDate = new Date()
	// const debugGroup = Settings.useDebugGroup({ pk: conv?.pk || '' })
	// const main = Settings?.useSettings()
	// const state = main?.debugGroup?.state

	// useEffect(() => {
	// 	if (!state) {
	// 		debugGroup()
	// 	}
	// })

	// useEffect(() => {
	// 	const interval = setInterval(() => {
	// 		debugGroup()
	// 	}, 10000)
	// 	return () => clearInterval(interval)
	// }, [debugGroup])

	if (!conv) {
		goBack()
		return <CenteredActivityIndicator />
	}
	const title = conv.fake ? `FAKE - ${contact.displayName}` : contact?.displayName || ''
	return (
		<View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
			<BlurView
				blurType='light'
				blurAmount={30}
				style={{ position: 'absolute', bottom: 0, top: 0, left: 0, right: 0 }}
			/>
			<View
				style={[
					padding.horizontal.medium,
					{
						alignItems: 'center',
						flexDirection: 'row',
						marginTop: 50 * scaleHeight,
						paddingBottom: 20 * scaleHeight,
					},
				]}
			>
				<TouchableOpacity style={[flex.tiny, row.item.justify]} onPress={goBack}>
					<Icon name='arrow-back-outline' width={25} height={25} fill={color.black} />
				</TouchableOpacity>
				<View
					style={[
						flex.huge,
						column.justify,
						row.item.justify,
						margin.top.small,
						_styles.headerName,
					]}
				>
					<View style={[{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}>
						<TouchableOpacity
						// onPress={() => debugGroup()}
						>
							<Text
								numberOfLines={1}
								style={[text.align.center, text.bold.medium, _styles.headerNameText]}
							>
								{title}
							</Text>
						</TouchableOpacity>
						{/* {state === 'error' && (
							<Icon name='close-outline' width={14} height={14} fill={color.red} />
						)} */}
						{/* {state === 'done' ? (
							<View
								style={[
									width(14),
									height(14),
									border.radius.scale(7),
									margin.left.large,
									{
										backgroundColor: main?.debugGroup?.peerIds?.length ? color.green : color.red,
									},
								]}
							/>
						) : (
							<ActivityIndicator size='small' style={[margin.left.large]} />
						)} */}
					</View>
					{/* {lastDate && (
						<Text numberOfLines={1} style={[text.size.small, text.color.grey, text.align.center]}>
							Last seen <FromNow date={lastDate} />
						</Text>
					)} */}
				</View>
				<View style={[flex.tiny, row.fill, { alignItems: 'center' }]}>
					<TouchableOpacity
						activeOpacity={contact ? 0.2 : 0.5}
						style={[flex.tiny, row.item.justify, !contact ? opacity(0.5) : null]}
						onPress={() => navigate.chat.oneToOneSettings({ convId: convPk })}
					>
						<ProceduralCircleAvatar size={45} diffSize={9} seed={conv.contactPublicKey} />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}

const InfosChat: React.FC<{ createdAt: number }> = ({ createdAt }) => {
	const [{ padding }] = useStyles()
	return <View style={[padding.medium]}>{/* <ChatDate date={createdAt} /> */}</View>
}

// const MessageListSpinner: React.FC<{ error?: Error }> = () => <ActivityIndicator size='large' />

const MessageList: React.FC<{ convPk: string; scrollToMessage?: number }> = ({
	convPk,
	scrollToMessage,
}) => {
	const ctx: any = useMsgrContext()
	const conv = ctx.conversations[convPk]
	const messages: any = values(ctx.interactions[convPk] as any)
		.filter((msg) => msg.type === messengerpb.AppMessage.Type.TypeUserMessage)
		.sort(
			(a, b) =>
				(a.payload.sentDate ? parseInt(a.payload.sentDate, 10) : Date.now()) -
				(b.payload.sentDate ? parseInt(b.payload.sentDate, 10) : Date.now()),
		)
	const getPreviousMessageId = (item = '', messageList: string[] = []): string => {
		const messagePosition: number = !item ? -1 : messageList.indexOf(item)
		return messagePosition < 1 ? '' : (messageList[messagePosition - 1] as any).cid
	}

	const [{ row, overflow, flex, margin }, { scaleHeight }] = useStyles()

	const flatListRef = useRef(null)

	// const flatListRef = useRef<FlatList<messenger.message.Entity['convPk']>>(null)

	const onScrollToIndexFailed = () => {
		// Not sure why this happens (something to do with item/screen dimensions I think)
		flatListRef.current?.scrollToIndex({ index: 0 })
	}

	return (
		<FlatList
			// initialScrollIndex={
			// 	conversation && props.scrollToMessage
			// 		? conversation.messages.length - props.scrollToMessage
			// 		: undefined
			// }
			// onScrollToIndexFailed={onScrollToIndexFailed}
			ref={flatListRef}
			// keyboardDismissMode='on-drag'
			// style={[
			// 	overflow,
			// 	row.item.fill,
			// 	flex.tiny,
			// 	margin.bottom.medium,
			// 	{ marginTop: 150 * scaleHeight },
			// ]}
			data={messages.reverse()}
			inverted
			keyExtractor={(item: any) => item.cid}
			// ListFooterComponent={<InfosChat createdAt={conversation.createdAt} />}
			// renderItem={({ item }) => <Message convPk={item} convKind={'1to1'} />}
			renderItem={({ item }: { item: any }) => (
				<Message
					id={item.cid}
					convKind={messengerpb.Conversation.Type.ContactType}
					convPK={conv.publicKey}
					membersNames={conv.membersNames}
					previousMessageId={getPreviousMessageId(item, messages)}
				/>
			)}
		/>
	)
}

export const OneToOne: React.FC<ScreenProps.Chat.OneToOne> = ({ route }) => {
	const [inputIsFocused, setInputFocus] = useState(true)
	const [{ flex, background }] = useStyles()
	// useReadEffect(route.params.convId, 1000)
	return (
		<View style={[StyleSheet.absoluteFill, background.white]}>
			<KeyboardAvoidingView style={[flex.tiny]} behavior='padding'>
				<MessageList
					convPk={route.params.convId}
					// scrollToMessage={route.params.scrollToMessage || 0}
				/>
				<ChatFooter
					convPk={route.params.convId}
					isFocused={inputIsFocused}
					setFocus={setInputFocus}
				/>
				<ChatHeader convPk={route.params.convId} />
			</KeyboardAvoidingView>
		</View>
	)
}
