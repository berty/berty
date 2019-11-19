import React, { useState } from 'react'
import { TouchableOpacity, View, Image, SafeAreaView, StyleSheet, ScrollView } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { styles, colors } from '../styles'
import { UserProps, RequestProps } from '../shared-props/User'
import { Message } from './shared-components/Message'
import { ChatFooter, ChatDate } from './shared-components/Chat'
import { CircleAvatar } from '../shared-components/CircleAvatar'

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

const ChatHeader: React.FC<UserProps> = ({ avatarUri, name }) => (
	<View style={[styles.padding]}>
		<View style={[styles.row, styles.centerItems, styles.spaceCenter]}>
			<TouchableOpacity style={[styles.flex]}>
				<Icon name='arrow-back-outline' width={30} height={30} />
			</TouchableOpacity>
			<View
				style={[styles.col, styles.centerItems, styles.littleMarginTop, _chatStyles.headerName]}
			>
				<Text
					numberOfLines={1}
					style={[styles.textCenter, styles.textBold, _chatStyles.headerNameText]}
				>
					{name}
				</Text>
				<Text numberOfLines={1} style={[styles.textGrey]}>
					Last seen just now
				</Text>
			</View>
			<View style={[styles.flex]}>
				<CircleAvatar style={styles.centerItems} avatarUri={avatarUri} size={40} diffSize={5} />
			</View>
		</View>
	</View>
)

const InfosChat: React.FC<{}> = () => (
	<View style={[styles.padding]}>
		<ChatDate date='Today' />
	</View>
)

const ChatList: React.FC<RequestProps> = ({ user }) => (
	<View style={[styles.padding]}>
		<Message
			{...user}
			date='9:42'
			message='Bonkur fjhfjhefefbe hjfgvddd g hjheg jgjhgjehgjhg jhge jhghdjkwlfuy wtyrygv gg hrhg rjygr'
			color={colors.blue}
			bgColor={colors.lightMsgBlue}
		/>
		<Message
			{...user}
			date='9:42'
			message='Bonkur fjhfjhefefbe hjfgvddd g hjheg jgjhgjehgjhg jhge jhghdjkwlfuy wtyrygv gg hrhg rjygr'
			color={colors.white}
			bgColor={colors.blue}
			isMe
			state={[{ icon: 'paper-plane', color: colors.blue, value: 'sending...' }]}
		/>
	</View>
)

export const Chat: React.FC<RequestProps> = ({ user }) => {
	const [isFocus, setIsFocus] = useState(false)
	return (
		<Layout style={[styles.flex]}>
			<SafeAreaView style={[StyleSheet.absoluteFill]}>
				<ChatHeader {...user} />
				<ScrollView contentContainerStyle={[isFocus && styles.littlePaddingBottom]}>
					<InfosChat />
					<ChatList user={user} />
				</ScrollView>
				<ChatFooter isFocus={isFocus} setIsFocus={setIsFocus} />
			</SafeAreaView>
		</Layout>
	)
}
