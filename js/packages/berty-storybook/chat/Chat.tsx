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
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { styles, colors } from '@berty-tech/styles'
import { Message } from './shared-components/Message'
import { ChatFooter, ChatDate } from './shared-components/Chat'
import { CircleAvatar } from '../shared-components/CircleAvatar'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'
import { berty } from '@berty-tech/berty-api'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import { BlurView } from '@react-native-community/blur'

//
// Chat
//

// Styles
const _chatStyles = StyleSheet.create({
	headerName: {
		flex: 5,
	},
	headerNameText: {
		fontSize: 20,
	},
})

const ChatHeader: React.FC<berty.chatmodel.IConversation> = (props) => {
	const { avatarUri, title } = props
	const { navigate, goBack } = useNavigation()
	return (
		<BlurView blurType='light' style={[styles.padding, { zIndex: 1 }]}>
			<SafeAreaView>
				<View style={[styles.row, styles.centerItems, styles.spaceCenter]}>
					<TouchableOpacity style={[styles.flex]} onPress={goBack}>
						<Icon name='arrow-back-outline' width={30} height={30} />
					</TouchableOpacity>
					<View
						style={[styles.col, styles.centerItems, styles.littleMarginTop, _chatStyles.headerName]}
					>
						<Text
							numberOfLines={1}
							style={[styles.textCenter, styles.textBold, _chatStyles.headerNameText]}
						>
							{title || ''}
						</Text>
						<Text numberOfLines={1} style={[styles.textGrey]}>
							Last seen just now
						</Text>
					</View>
					<TouchableOpacity
						style={[styles.flex]}
						onPress={() => navigate.chat.one2OneSettings(props)}
					>
						<CircleAvatar
							style={styles.centerItems}
							avatarUri={avatarUri || ''}
							size={40}
							diffSize={5}
						/>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</BlurView>
	)
}

const InfosChat: React.FC<{}> = () => (
	<View style={[styles.padding]}>
		<ChatDate date='Today' />
	</View>
)

const MessageListSpinner: React.FC<{ error?: Error }> = () => <ActivityIndicator size='large' />

const MessageList: React.FC<berty.chatmodel.IConversation> = (props) => {
	const [cursors, setCursor] = useState([0])

	return (
		<FlatList
			style={[styles.overflow, styles.stretch, styles.flex]}
			data={cursors}
			inverted
			ListFooterComponent={<InfosChat />}
			renderItem={() => (
				<Store.MessageList
					request={{ filter: { conversationId: props.id } }}
					fallback={MessageListSpinner}
				>
					{(_) =>
						_.map((_) => (
							<Message
								{..._.message}
								date='9:42'
								message='Bonkur fjhfjhefefbe hjfgvddd g hjheg jgjhgjehgjhg jhge jhghdjkwlfuy wtyrygv gg hrhg rjygr'
								color={colors.blue}
								bgColor={colors.lightMsgBlue}
							/>
						))
					}
				</Store.MessageList>
			)}
		/>
	)
}

export const Chat: React.FC<ScreenProps.Chat.One2One> = ({ route: { params } }) => {
	const [inputIsFocused, setInputFocus] = useState(true)
	return (
		<View style={[StyleSheet.absoluteFill, styles.bgWhite]}>
			<KeyboardAvoidingView style={[styles.flex]} behavior='padding'>
				<ChatHeader {...params} />
				<MessageList {...params} />
				<ChatFooter isFocused={inputIsFocused} setFocus={setInputFocus} />
			</KeyboardAvoidingView>
		</View>
	)
}
