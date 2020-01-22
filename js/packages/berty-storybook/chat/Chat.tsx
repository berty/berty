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
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'
import { berty } from '@berty-tech/api'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'

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

const InfosChat: React.FC<{}> = () => {
	const [{ padding }] = useStyles()
	return (
		<View style={[padding.medium]}>
			<ChatDate date='Today' />
		</View>
	)
}

const MessageListSpinner: React.FC<{ error?: Error }> = () => <ActivityIndicator size='large' />

const MessageList: React.FC<berty.chatmodel.IConversation> = (props) => {
	const [cursors] = useState([0])
	const [{ row, overflow, flex, color }] = useStyles()

	return (
		<FlatList
			style={[overflow, row.item.fill, flex.tiny]}
			data={cursors}
			inverted
			ListFooterComponent={<InfosChat />}
			renderItem={() => (
				<Store.MessageList
					request={{ filter: { conversationId: props.id } }}
					fallback={MessageListSpinner}
				>
					{(_) => _.map((_) => <Message {..._.message} color={color.blue} bgColor='#CED2FF99' />)}
				</Store.MessageList>
			)}
		/>
	)
}

export const Chat: React.FC<ScreenProps.Chat.One2One> = ({ route: { params } }) => {
	const [inputIsFocused, setInputFocus] = useState(true)
	const [{ flex, background }] = useStyles()
	return (
		<View style={[StyleSheet.absoluteFill, background.white]}>
			<KeyboardAvoidingView style={[flex.tiny]} behavior='padding'>
				<ChatHeader {...params} />
				<MessageList {...params} />
				<ChatFooter isFocused={inputIsFocused} setFocus={setInputFocus} />
			</KeyboardAvoidingView>
		</View>
	)
}
