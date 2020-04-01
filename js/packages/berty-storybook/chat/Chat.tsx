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
import { Chat as ChatHooks } from '@berty-tech/hooks'
import { useNavigation, Routes } from '@berty-tech/berty-navigation'
import { ConversationProceduralAvatar } from '../shared-components/ProceduralCircleAvatar'
import { CommonActions } from '@react-navigation/core'

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

const ChatHeader: React.FC<{ id: any }> = ({ id }) => {
	const { dispatch, goBack } = useNavigation()
	const _styles = useStylesChat()
	const [
		{ absolute, row, padding, column, margin, text, flex, background, border, color },
	] = useStyles()
	const conversation = ChatHooks.useGetConversation(id)
	const contact = ChatHooks.useOneToOneConversationContact(conversation.id)
	return (
		<SafeAreaView style={[background.white, absolute.top, absolute.right, absolute.left]}>
			<View style={[row.fill, padding.medium]}>
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
						{contact?.name || ''}
					</Text>
					<Text numberOfLines={1} style={[text.size.small, text.color.grey, text.align.center]}>
						Last seen just now
					</Text>
				</View>
				<TouchableOpacity
					style={[flex.tiny, row.item.justify]}
					onPress={() =>
						dispatch(
							CommonActions.navigate({
								name: Routes.Chat.One2OneSettings,
								params: {
									contact,
								},
							}),
						)
					}
				>
					<ConversationProceduralAvatar size={45} conversationId={id} />
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
	const [{ row, overflow, flex, margin }] = useStyles()
	const conversation = ChatHooks.useGetConversation(props.id)

	return (
		<FlatList
			style={[overflow, row.item.fill, flex.tiny, margin.top.scale(140)]}
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
