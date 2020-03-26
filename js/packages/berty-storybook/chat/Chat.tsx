import React, { useState } from 'react'
import {
	TouchableOpacity,
	View,
	SafeAreaView,
	StyleSheet,
	FlatList,
	ActivityIndicator,
	KeyboardAvoidingView,
} from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { Message } from './shared-components/Message'
import { ChatFooter, ChatDate } from './shared-components/Chat'
import { CircleAvatar } from '../shared-components/CircleAvatar'
import { Chat as ChatHooks } from '@berty-tech/hooks'
import { useNavigation } from '@berty-tech/berty-navigation'
import { berty } from '@berty-tech/api'

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

const ChatHeader: React.FC<berty.chatmodel.IConversation> = (props) => {
	const { avatarUri, title } = props
	const { navigate, goBack } = useNavigation()
	const _styles = useStylesChat()
	const [{ row, padding, column, margin, text, flex }] = useStyles()
	return (
		<SafeAreaView>
			<View style={[row.center, padding.medium]}>
				<TouchableOpacity style={[flex.tiny]} onPress={goBack}>
					<Icon name='arrow-back-outline' width={30} height={30} />
				</TouchableOpacity>
				<View style={[column.justify, margin.top.small, _styles.headerName]}>
					<Text numberOfLines={1} style={[text.align.center, text.bold, _styles.headerNameText]}>
						{title || ''}
					</Text>
					<Text numberOfLines={1} style={[text.color.grey, text.align.center]}>
						Last seen just now
					</Text>
				</View>
				<TouchableOpacity style={[flex.tiny]} onPress={() => navigate.chat.one2OneSettings(props)}>
					<CircleAvatar avatarUri={avatarUri || ''} size={40} diffSize={5} />
				</TouchableOpacity>
			</View>
		</SafeAreaView>
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

const MessageListSpinner: React.FC<{ error?: Error }> = () => <ActivityIndicator size='large' />

const AppMessage: React.FC<{ message: string }> = ({ message }) => {
	const msg = ChatHooks.useGetMessage(message)
	return !!msg && <Message payload={msg} />
}

const MessageList: React.FC<{ id: string }> = (props) => {
	const [cursors, setCursor] = useState([0])
	const [{ row, overflow, flex, color }] = useStyles()
	const conversation = ChatHooks.useGetConversation(props.id)

	return (
		<FlatList
			style={[overflow, row.item.fill, flex.tiny]}
			data={cursors}
			inverted
			ListFooterComponent={<InfosChat createdAt={conversation.createdAt} />}
			renderItem={() => (
				<View>
					{conversation &&
						conversation.messages &&
						conversation.messages.map((message) => <AppMessage key={message} message={message} />)}
				</View>
			)}
		/>
	)
}

export const Chat: React.FC<{ route: any }> = ({ route }) => {
	const [inputIsFocused, setInputFocus] = useState(true)
	const [{ flex, background }] = useStyles()
	return (
		<View style={[StyleSheet.absoluteFill, background.white]}>
			<KeyboardAvoidingView style={[flex.tiny]} behavior='padding'>
				<ChatHeader />
				<MessageList id={route.params.convId} />
				<ChatFooter
					convId={route.params.convId}
					isFocused={inputIsFocused}
					setFocus={setInputFocus}
				/>
			</KeyboardAvoidingView>
		</View>
	)
}
