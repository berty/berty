import React from 'react'
import { View, Image, SafeAreaView, StyleSheet, ScrollView } from 'react-native'
import { Layout, Text, Button } from 'react-native-ui-kitten'
import { Card } from '@berty-tech/shared-storybook'
import styles from './styles'
import { berty } from '@berty-tech/berty-api'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'

type Navigation = () => void
type Form<T> = (arg0: T) => Promise<void>

type RequestsItemProps = {
	name: string
	avatar: string
	at: Date
	accept: Form<void>
	discard: Form<void>
}

type RequestsProps = {
	items: Array<RequestsItemProps>
}

enum ConversationsItemStatus {
	Sending = 0,
	Sent,
	Failed,
	Seen,
}
type ConversationsItemProps = berty.chatmodel.IConversation & {
	avatar: string
	title: string
	intro: string
	at: Date
	badge: number
	verified: boolean
	status: ConversationsItemStatus
}
type ConversationsProps = {
	items: Array<ConversationsItemProps>
}
type FooterProps = {
	search: Navigation
	plus: Navigation
	account: Navigation
}
type ListProps = {}

const RequestsItem: React.FC<RequestsItemProps> = ({ name, avatar, at, accept, discard }) => (
	<Card>
		<Image source={{ uri: avatar }} />
		<Text>{name}</Text>
		<Text category='s2'>{`Received ${at.toLocaleDateString()}`}</Text>
		<View style={styles.row}>
			<Button
				onPress={(): void => {
					discard()
				}}
			>
				X
			</Button>
			<Button
				onPress={(): void => {
					accept()
				}}
			>
				Accept
			</Button>
		</View>
	</Card>
)

const Requests: React.FC<RequestsProps> = ({ items }) => (
	<SafeAreaView style={styles.bgBlue}>
		<View style={[styles.paddingVertical]}>
			<Text category='h4' style={[styles.textWhite, styles.paddingHorizontal]}>
				Requests
			</Text>
			<ScrollView horizontal>
				{items.map((props) => (
					<RequestsItem {...props} />
				))}
			</ScrollView>
		</View>
	</SafeAreaView>
)

const ConversationsItem: React.FC<ConversationsItemProps> = ({
	avatar,
	title,
	intro,
	at,
	badge,
	verified,
	status,
}) => (
	<View style={styles.row}>
		<Text>{title}</Text>
		<Text category='s2'>{intro}</Text>
	</View>
)

const Conversations: React.FC<ConversationsProps> = () => (
	<SafeAreaView>
		<Layout style={styles.padding}>
			<Text category='h4'>Messages</Text>
			<ScrollView>
				<Store.ConversationList request={{}}>
					{(list) =>
						list.map(
							({ conversation: props }): React.ReactElement => <ConversationsItem {...props} />,
						)
					}
				</Store.ConversationList>
			</ScrollView>
		</Layout>
	</SafeAreaView>
)

const Footer: React.FC<FooterProps> = ({ search, plus, account }) => (
	<View
		style={[
			styles.absolute,
			styles.bottom,
			styles.left,
			styles.right,
			styles.padding,
			styles.margin,
			styles.row,
			styles.spaceAround,
		]}
	>
		<Button>S</Button>
		<Button>+</Button>
		<Button>A</Button>
	</View>
)

export const List: React.FC<ListProps> = ({ requests, footer }) => (
	<Layout style={StyleSheet.absoluteFill}>
		<Requests {...requests} />
		<Conversations />
		<Footer {...footer} />
	</Layout>
)
