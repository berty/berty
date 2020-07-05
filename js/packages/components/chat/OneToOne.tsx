import React, { useState, useEffect, useRef } from 'react'
import { BlurView } from '@react-native-community/blur'
import {
	TouchableOpacity,
	View,
	StyleSheet,
	FlatList,
	ActivityIndicator,
	KeyboardAvoidingView,
	Text as TextNative,
} from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { Messenger, Settings } from '@berty-tech/hooks'
import { useNavigation, ScreenProps, Routes } from '@berty-tech/navigation'
import { useNavigation as useReactNavigation } from '@react-navigation/native'
import FromNow from '../shared-components/FromNow'
import { ConversationProceduralAvatar } from '../shared-components/ProceduralCircleAvatar'
import { Message } from './shared-components/Message'
import { ChatFooter, ChatDate } from './shared-components/Chat'
import { SafeAreaView } from 'react-native-safe-area-context'
import { messenger } from '@berty-tech/store'
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

export const ChatHeader: React.FC<{ id: any }> = ({ id }) => {
	const { navigate, goBack } = useNavigation()
	const _styles = useStylesChat()
	const [
		{ absolute, row, padding, column, margin, text, flex, opacity, color, border, width, height },
	] = useStyles()
	const conversation = Messenger.useGetConversation(id)
	const contact = Messenger.useOneToOneConversationContact(id)
	const lastDate = Messenger.useGetDateLastContactMessage(id)
	const debugGroup = Settings.useDebugGroup({ pk: conversation?.pk || '' })
	const main = Settings.useSettings()
	const state = main?.debugGroup?.state

	useEffect(() => {
		if (!state) {
			debugGroup()
		}
	})

	useEffect(() => {
		const interval = setInterval(() => {
			debugGroup()
		}, 10000)
		return () => clearInterval(interval)
	}, [debugGroup])

	if (!conversation) {
		goBack()
		return <CenteredActivityIndicator />
	}

	const title =
		conversation.kind === 'fake' ? `SAMPLE - ${conversation.title}` : contact?.name || ''

	return (
		<BlurView
			style={[row.fill, padding.medium, absolute.top, absolute.right, absolute.left]}
			blurType='light'
			blurAmount={30}
		>
			<SafeAreaView style={[row.fill, { width: '100%' }]}>
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
						<TouchableOpacity onPress={() => debugGroup()}>
							<Text
								numberOfLines={1}
								style={[text.align.center, text.bold.medium, _styles.headerNameText]}
							>
								{title}
							</Text>
						</TouchableOpacity>
						{state === 'error' && (
							<Icon name='close-outline' width={14} height={14} fill={color.red} />
						)}
						{state === 'done' ? (
							<View
								style={[
									width(14),
									height(14),
									border.radius.scale(7),
									margin.left.large,
									{ backgroundColor: main?.debugGroup?.peerIds?.length ? color.green : color.red },
								]}
							/>
						) : (
							<ActivityIndicator size='small' style={[margin.left.large]} />
						)}
					</View>
					{lastDate && (
						<Text numberOfLines={1} style={[text.size.small, text.color.grey, text.align.center]}>
							Last seen <FromNow date={lastDate} />
						</Text>
					)}
				</View>
				<View style={[flex.tiny, row.fill, { alignItems: 'center' }]}>
					<TouchableOpacity
						activeOpacity={contact ? 0.2 : 0.5}
						style={[flex.tiny, row.item.justify, !contact ? opacity(0.5) : null]}
						onPress={() => navigate.chat.settings({ convId: id })}
					>
						<ConversationProceduralAvatar size={45} diffSize={9} conversationId={id} />
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</BlurView>
	)
}

const InfosChat: React.FC<{ createdAt: number }> = ({ createdAt }) => {
	const [{ padding }] = useStyles()
	return (
		<View style={[padding.medium]}>
			<ChatDate date={createdAt} />
		</View>
	)
}

// const MessageListSpinner: React.FC<{ error?: Error }> = () => <ActivityIndicator size='large' />

// hack until Message props type is fixed
const TypedMessage = Message as React.FC<{
	payload: ReturnType<typeof Messenger.useGetMessage>
}>

const AppMessage: React.FC<{ message: string }> = ({ message }) => {
	const msg = Messenger.useGetMessage(message)
	return msg ? <TypedMessage payload={msg} /> : null
}

const MessageList: React.FC<{ id: string; scrollToMessage?: number }> = (props) => {
	const [{ row, overflow, flex, margin }] = useStyles()
	const conversation = Messenger.useGetConversation(props.id)
	const flatListRef = useRef<FlatList<messenger.message.Entity['id']>>(null)

	const onScrollToIndexFailed = () => {
		// Not sure why this happens (something to do with item/screen dimensions I think)
		flatListRef.current?.scrollToIndex({ index: 0 })
	}

	return !conversation ? (
		<CenteredActivityIndicator />
	) : (
		<FlatList
			initialScrollIndex={
				conversation && props.scrollToMessage
					? conversation.messages.length - props.scrollToMessage
					: undefined
			}
			onScrollToIndexFailed={onScrollToIndexFailed}
			ref={flatListRef}
			keyboardDismissMode='on-drag'
			style={[overflow, row.item.fill, flex.tiny, margin.top.scale(140)]}
			data={conversation ? [...conversation.messages].reverse() : []}
			inverted
			keyExtractor={(item) => item}
			ListFooterComponent={<InfosChat createdAt={conversation.createdAt} />}
			renderItem={({ item }: { item: string }) => <AppMessage message={item} />}
		/>
	)
}

const useReadEffect = (convId: string, timeout: number) => {
	// timeout is the duration (in ms) that the user must stay on the page to set messages as read
	const navigation = useReactNavigation()
	const startRead = Messenger.useStartReadConversation(convId)
	const stopRead = Messenger.useStopReadConversation(convId)

	useEffect(() => {
		let timeoutID: ReturnType<typeof setTimeout> | null = null
		const handleStart = () => {
			if (timeoutID === null) {
				timeoutID = setTimeout(() => {
					timeoutID = null
					startRead()
				}, timeout)
			}
		}
		handleStart()
		const unsubscribeFocus = navigation.addListener('focus', handleStart)
		const handleStop = () => {
			if (timeoutID !== null) {
				clearTimeout(timeoutID)
				timeoutID = null
			}
			stopRead()
		}
		const unsubscribeBlur = navigation.addListener('blur', handleStop)
		return () => {
			unsubscribeFocus()
			unsubscribeBlur()
			handleStop()
		}
	}, [navigation, startRead, stopRead, timeout])
}

export const OneToOne: React.FC<ScreenProps.Chat.OneToOne> = ({ route }) => {
	const [inputIsFocused, setInputFocus] = useState(true)
	const [{ flex, background }] = useStyles()
	useReadEffect(route.params.convId, 1000)
	return (
		<View style={[StyleSheet.absoluteFill, background.white]}>
			<KeyboardAvoidingView style={[flex.tiny]} behavior='padding'>
				<MessageList id={route.params.convId} scrollToMessage={route.params.scrollToMessage} />
				<ChatFooter
					convId={route.params.convId}
					isFocused={inputIsFocused}
					setFocus={setInputFocus}
				/>
				<ChatHeader id={route.params.convId} />
			</KeyboardAvoidingView>
		</View>
	)
}
