import React, { useState, useEffect } from 'react'
import { BlurView } from '@react-native-community/blur'
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
import { Messenger } from '@berty-tech/hooks'
import { useNavigation, ScreenProps } from '@berty-tech/navigation'
import { useNavigation as useReactNavigation } from '@react-navigation/native'
import FromNow from '../shared-components/FromNow'
import { ConversationProceduralAvatar } from '../shared-components/ProceduralCircleAvatar'
import { Message } from './shared-components/Message'
import { ChatFooter, ChatDate } from './shared-components/Chat'
import { SafeAreaView } from 'react-native-safe-area-context'
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
	const [{ absolute, row, padding, column, margin, text, flex, opacity, color }] = useStyles()
	const conversation = Messenger.useGetConversation(id)
	const contact = Messenger.useOneToOneConversationContact(id)
	const lastDate = Messenger.useGetDateLastContactMessage(id)
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
					<Text
						numberOfLines={1}
						style={[text.align.center, text.bold.medium, _styles.headerNameText]}
					>
						{title}
					</Text>
					{lastDate && (
						<Text numberOfLines={1} style={[text.size.small, text.color.grey, text.align.center]}>
							Last seen <FromNow date={lastDate} />
						</Text>
					)}
				</View>
				<TouchableOpacity
					activeOpacity={contact ? 0.2 : 0.5}
					style={[flex.tiny, row.item.justify, !contact ? opacity(0.5) : null]}
					onPress={() => navigate.chat.settings({ convId: id })}
				>
					<ConversationProceduralAvatar size={45} diffSize={9} conversationId={id} />
				</TouchableOpacity>
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

const MessageList: React.FC<{ id: string }> = (props) => {
	const [{ row, overflow, flex, margin }] = useStyles()
	const conversation = Messenger.useGetConversation(props.id)
	if (!conversation) {
		return <CenteredActivityIndicator />
	}
	return (
		<FlatList
			keyboardDismissMode='on-drag'
			style={[overflow, row.item.fill, flex.tiny, margin.top.scale(140)]}
			data={conversation ? [...conversation.messages].reverse() : []}
			inverted
			keyExtractor={(item) => item}
			ListFooterComponent={<InfosChat createdAt={conversation.createdAt} />}
			renderItem={({ item }) => <Message id={item} />}
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
				<MessageList id={route.params.convId} />
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
