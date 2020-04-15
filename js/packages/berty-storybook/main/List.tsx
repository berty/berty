import React, { useEffect, useState } from 'react'
import {
	Text,
	TouchableOpacity,
	View,
	ViewProps,
	SafeAreaView,
	ScrollView,
	TouchableHighlight,
} from 'react-native'
import { Translation } from 'react-i18next'
import { google, berty } from '@berty-tech/api'
import { useLayout } from '../hooks'
import { useStyles } from '@berty-tech/styles'
import {
	ProceduralCircleAvatar,
	ConversationProceduralAvatar,
} from '../shared-components/ProceduralCircleAvatar'
import { Chat } from '@berty-tech/hooks'
import { ScreenProps, useNavigation, Routes } from '@berty-tech/berty-navigation'
import { CommonActions } from '@react-navigation/core'
import { chat } from '@berty-tech/store'
import { Icon } from 'react-native-ui-kitten'

type Navigation<T extends {} | undefined = undefined> = (arg0: T) => void

//
// Main List
//

type RequestsProps = ViewProps & {
	items: Array<chat.contact.Entity>
}

type ConversationsProps = ViewProps & {
	items: Array<chat.conversation.Entity>
}

type ConversationsItemProps = chat.conversation.Entity

// Functions

const RequestsItem: React.FC<{
	id: string
	name: string
	seed: string
	display: Navigation<{ id: string }>
	accept: (kwargs: { id: string }) => void
	decline: (kwargs: { id: string }) => void
}> = (props) => {
	const { id, name, seed, display, decline, accept } = props
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
					onPress={() => display({ id, name, accept, decline })}
				>
					<ProceduralCircleAvatar
						style={[absolute.center, absolute.scale({ top: -32.5 })]}
						seed={seed}
						size={65}
						diffSize={20}
					/>
					<Text style={[text.align.center, text.color.black, text.size.medium]} numberOfLines={2}>
						{name}
					</Text>
					<Text style={[text.size.tiny, text.color.grey, text.align.center]}>
						Some time a long ago (in a galaxy far far away)
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
							onPress={async () => {
								await accept({ id })
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

const ContactRequestsItem: React.FC<chat.contact.Entity> = ({ id, name, publicKey }) => {
	const accept = Chat.useAcceptContactRequest()
	const decline = Chat.useDiscardContactRequest()
	const { navigate } = useNavigation()
	return (
		<RequestsItem
			id={id}
			name={name}
			seed={publicKey}
			display={navigate.main.contactRequest /*({ id }) => {}*/}
			accept={accept}
			decline={decline}
		/>
	)
}

const Requests: React.FC<RequestsProps> = ({ items, style, onLayout }) => {
	const [{ padding, text }] = useStyles()
	return items?.length ? (
		<SafeAreaView onLayout={onLayout} style={style}>
			<View style={[padding.top.medium]}>
				<Text style={[text.color.white, text.size.huge, text.bold.medium, padding.medium]}>
					Requests
				</Text>
				<ScrollView
					horizontal
					style={[padding.bottom.medium]}
					showsHorizontalScrollIndicator={false}
				>
					{items.map((_) => {
						return <ContactRequestsItem {..._} />
					})}
				</ScrollView>
			</View>
		</SafeAreaView>
	) : null
}

const formatTimestamp = (date: Date) => {
	const arr = date.toString().split(' ')
	const hours = arr[4].split(':')
	const hour = hours[0] + ':' + hours[1]
	return hour
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
			<Text style={{ color: 'white', fontWeight: '700', fontSize: 10, textAlign: 'center' }}>
				{value}
			</Text>
		</View>
	) : null

const MessageStatus: React.FC<{ messageID: string }> = ({ messageID }) => {
	const [{ color }] = useStyles()
	const message = Chat.useGetMessage(messageID)
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
	const { dispatch } = useNavigation()
	const { title, kind, id, messages, unreadCount, lastSentMessage } = props
	const [{ color, row, border, flex, column, padding, text }] = useStyles()
	const message = Chat.useGetMessage(messages ? messages[messages.length - 1] : '')

	return (
		<TouchableHighlight
			underlayColor={color.light.grey}
			style={[padding.horizontal.medium]}
			onPress={
				kind === berty.chatmodel.Conversation.Kind.PrivateGroup
					? () =>
							dispatch(
								CommonActions.navigate({
									name: Routes.Chat.Group,
									params: {
										convId: id,
									},
								}),
							)
					: () =>
							dispatch(
								CommonActions.navigate({
									name: Routes.Chat.One2One,
									params: {
										convId: id,
									},
								}),
							)
			}
		>
			<View
				style={[row.center, border.bottom.medium, border.color.light.grey, padding.vertical.small]}
			>
				<ConversationProceduralAvatar
					conversationId={props.id}
					size={50}
					style={[padding.tiny, row.item.justify]}
				/>
				<View style={[flex.big, column.fill, padding.small]}>
					<View style={[row.fill]}>
						<View style={[row.left]}>
							<Text numberOfLines={1} style={[text.size.medium, text.color.black]}>
								{kind === 'fake' && 'SAMPLE - '}
								{title || ''}
							</Text>
						</View>
						<View style={[row.right, { alignItems: 'center' }]}>
							<UnreadCount value={unreadCount} />
							<Text style={[padding.left.small, text.size.small, text.color.grey]}>
								{message && formatTimestamp(new Date(message.sentDate))}
							</Text>
							<MessageStatus messageID={lastSentMessage} />
						</View>
					</View>
					<Text numberOfLines={1} style={[text.size.small, text.color.grey]}>
						{message && message.body}
					</Text>
				</View>
			</View>
		</TouchableHighlight>
	)
}

const Conversations: React.FC<ConversationsProps> = ({ items }) => {
	const [{ overflow, border, padding, margin, text, background }] = useStyles()
	return items?.length ? (
		<Translation>
			{(t): React.ReactNode => (
				<ScrollView
					style={[overflow, border.shadow.medium]}
					contentContainerStyle={[background.white, border.radius.big]}
				>
					<SafeAreaView>
						<View style={[padding.bottom.scale(80)]}>
							<Text
								style={[
									text.color.black,
									text.size.huge,
									text.bold.medium,
									padding.medium,
									margin.horizontal.medium,
								]}
							>
								{t('main.messages.title')}
							</Text>
							{items.map((_) => {
								return <ConversationsItem {..._} />
							})}
						</View>
					</SafeAreaView>
				</ScrollView>
			)}
		</Translation>
	) : null
}

export const List: React.FC<ScreenProps.Chat.List> = () => {
	// TODO: do something to animate the requests
	const [, onLayoutRequests] = useLayout()

	const requests = Chat.useAccountContactsWithIncomingRequests().filter(
		(contact) => !(contact.request.accepted || contact.request.discarded),
	)
	const conversations = Chat.useConversationList()

	const [{ absolute, background }] = useStyles()

	return (
		<View style={[absolute.fill, background.blue]}>
			<Requests items={requests} onLayout={onLayoutRequests} />
			<Conversations items={conversations} />
		</View>
	)
}

export default List
