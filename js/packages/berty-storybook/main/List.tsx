import React, { useMemo } from 'react'
import {
	Text,
	Dimensions,
	TouchableOpacity,
	ScrollViewProps,
	View,
	ViewProps,
	SafeAreaView,
	StyleSheet,
	ScrollView,
	TouchableHighlight,
	ActivityIndicator,
} from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { Translation } from 'react-i18next'
import { berty, google } from '@berty-tech/berty-api'
import * as dateFns from '@berty-tech/berty-i18n/dateFns'
import { useLayout } from '../hooks'
import { Footer } from './Footer'
import { useStyles } from '@berty-tech/styles'
import { ConversationAvatar, CircleAvatar } from '../shared-components/CircleAvatar'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import { useNavigation } from '@berty-tech/berty-navigation'

type Navigation<T extends {} | undefined = undefined> = (arg0: T) => void
type Form<T extends {} | undefined = undefined> = (arg0: T) => Promise<any>

//
// Main List
//

// Types
enum RequestKind {
	Unknown = 0,
	Contact = 1,
	Conversation = 2,
}
type RequestsItemProps =
	| (berty.chatmodel.IContact & {
			requestKind: RequestKind.Contact
			accept: Form<berty.chat.ContactRequestAccept.IRequest>
			decline: Form<berty.chat.ContactRequestDecline.IRequest>
	  })
	| (berty.chatmodel.IConversation & {
			requestKind: RequestKind.Conversation
			accept: Form<berty.chat.ConversationInvitationAccept.IRequest>
			decline: Form<berty.chat.ConversationInvitationDecline.IRequest>
	  })
type RequestsProps = ViewProps & {
	items: Array<RequestsItemProps>
}

type ConversationsItemProps = berty.chatmodel.IConversation & {
	navigate: Navigation<berty.chatmodel.IConversation>
}

type ConversationsProps = ScrollViewProps & {
	items: Array<berty.chatmodel.IConversation>
}

// Functions

const date = (timestamp?: google.protobuf.ITimestamp | null): Date => {
	const { seconds, nanos } = timestamp || { seconds: 0, nanos: 0 }
	const _ = new Date()
	_.setTime((seconds as number) * 1000 + (nanos as number) / 1000)
	return _
}

// Style
const useAccount = (): [berty.chatmodel.IAccount | null | undefined, Error?] => {
	// fetch requests
	const [accountGet, error] = Store.useAccountGet({ id: 0 })
	if (error) {
		return [undefined, error]
	}
	return [accountGet?.account, error]
}

type GroupRequestInvitation = berty.chatmodel.IMember & {
	role: berty.chatmodel.Member.Role.Invited
}
const useGroupRequestInvitations = (): [Array<GroupRequestInvitation>?, Error?] => {
	const [account, error] = useAccount()
	if (error) {
		return [undefined, error]
	}
	const [invitations, invitationsError] = Store.useMemberList(
		{
			filter: {
				role: berty.chatmodel.Member.Role.Invited,
				contactId: account?.contactId,
			},
		},
		[account],
	)
	if (error) {
		return [undefined, invitationsError]
	}
	return [invitations?.map((_) => _.member).filter((_) => _ != null), error]
}

const useRequests = (): [
	Array<berty.chatmodel.IContact | berty.chatmodel.IConversation | null | undefined>?,
	Error?,
] => {
	const [account, error] = useAccount()
	if (error) {
		return [undefined, error]
	}

	const [contactListReply, contactListError] = Store.useContactList(
		{
			filter: { kind: berty.chatmodel.Contact.Kind.PendingInc },
		},
		[account],
	)

	const [conversationListReply, conversationListError] = Store.useConversationList(
		{
			filter: {},
		},
		[account],
	)

	const data = [
		...(contactListReply || []).map((_) => {
			if (_?.contact as RequestsItemProps) {
				_.contact.requestKind = RequestKind.Contact
			}
			return _?.contact
		}),
		...(conversationListReply || []).map((_) => {
			if (_?.conversation as RequestsItemProps) {
				_.conversation.requestKind = RequestKind.Conversation
			}
			return _?.conversation
		}),
	].sort((a, b) => (a?.id as number) - (b?.id as number))
	const err = contactListError || conversationListError

	if (data.length === 0) {
		return [undefined, err]
	}
	return [data, err]
}

const useConversations = (): [Array<berty.chatmodel.IConversation | null | undefined>?, Error?] => {
	const [account, error] = useAccount()
	if (error) {
		return [undefined, error]
	}

	const [conversationListReply, conversationListError] = Store.useConversationList(
		{
			filter: {},
		},
		[account],
	)

	return [(conversationListReply || []).map((_) => _?.conversation), conversationListError]
}

const RequestsItem: React.FC<{
	id: number
	name: string
	timestamp: google.protobuf.Timestamp
	avatarUris: Array<string>
	display: Navigation<{ id: number }>
	accept: Form<{ id: number }>
	decline: Form<{ id: number }>
}> = (props) => {
	const { id, name, timestamp, avatarUris, display, decline, accept } = props
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
					onPress={() => display({ id })}
				>
					<CircleAvatar
						style={[absolute.center, absolute.compute({ top: -32.5 })]}
						avatarUri={avatarUris[0]}
						size={65}
						diffSize={8}
					/>
					<Text style={[text.align.center, text.color.black, text.size.medium]} numberOfLines={2}>
						{name}
					</Text>
					<Text style={[text.size.tiny, text.color.grey, text.align.center]}>
						{dateFns.distanceInWordsToNow(date(timestamp))}
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
							onPress={(): void => {
								accept({ id })
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

const ContactRequestsItem: React.FC<berty.chatmodel.IContact> = ({
	id,
	name,
	createdAt,
	avatarUri,
}) => {
	const { navigate } = useNavigation()
	return (
		<RequestsItem
			id={id as number}
			name={name as string}
			timestamp={createdAt as google.protobuf.Timestamp}
			avatarUris={[avatarUri as string]}
			display={navigate.main.contactRequest}
			accept={(_) => {}}
			decline={(_) => {}}
		/>
	)
}

const ConversationRequestsItem: React.FC<berty.chatmodel.IConversation> = ({
	id,
	title,
	avatarUri,
}) => {
	const { navigate } = useNavigation()
	const [invitation, error] = useGroupRequestInvitations()
	return error ? null : (
		<RequestsItem
			id={id as number}
			name={title as string}
			timestamp={invitation?.createdAt as google.protobuf.Timestamp}
			avatarUris={[avatarUri || '']}
			display={navigate.main.groupRequest}
			accept={() => {}}
			decline={() => {}}
		/>
	)
}

const Requests: React.FC<RequestsProps> = ({ items, style, onLayout }) => {
	const [{ padding, text }] = useStyles()
	return items?.length ? (
		<SafeAreaView onLayout={onLayout} style={style}>
			<View style={[padding.top.medium]}>
				<Text style={[text.color.white, text.size.huge, text.bold, padding.medium]}>Requests</Text>
				<ScrollView
					horizontal
					style={[padding.bottom.medium]}
					showsHorizontalScrollIndicator={false}
				>
					{items.map((_) => {
						if (_.requestKind === RequestKind.Conversation) {
							return <ConversationRequestsItem {..._} />
						} else {
							return <ContactRequestsItem {..._} />
						}
					})}
				</ScrollView>
			</View>
		</SafeAreaView>
	) : null
}

const ConversationsItem: React.FC<ConversationsItemProps> = (props) => {
	const { createdAt, title, navigate } = props
	const [
		{ color, row, border, width, height, flex, column, padding, margin, text, background },
	] = useStyles()
	return (
		<TouchableHighlight
			underlayColor={color.light.grey}
			style={[padding.horizontal.medium]}
			onPress={() => navigate(props)}
		>
			<View style={[row.center, border.bottom.medium, border.color.light.grey]}>
				<ConversationAvatar {...props} size={50} style={[padding.tiny, row.item.justify]} />
				<View style={[flex.big, column.fill, padding.small]}>
					<View style={[row.fill]}>
						<View style={[row.left]}>
							<Text numberOfLines={1} style={[text.size.medium, text.color.black]}>
								{title || ''}
							</Text>
							<Icon
								style={margin.left.small}
								name='checkmark-circle-2'
								width={15}
								height={15}
								fill={color.blue}
							/>
						</View>
						<View style={[row.right]}>
							<View
								style={[
									background.red,
									row.center,
									width(15),
									height(15),
									border.radius.compute(15 / 2),
								]}
							>
								<Text
									style={[
										row.item.justify,
										text.color.white,
										text.bold,
										text.align.center,
										text.align.justify,
										text.size.tiny,
									]}
								>
									2
								</Text>
							</View>
							<Text style={[padding.left.small, text.size.small, text.color.grey]}>
								{dateFns.fuzzy(date(createdAt))}
							</Text>
							<View style={[padding.left.small]}>
								<Icon name='paper-plane' width={12} height={12} fill={color.blue} />
							</View>
						</View>
					</View>
					<Text numberOfLines={1} style={[text.size.small, text.color.grey]}>
						Salut je voulais savoir comment tu allais mais finalement j'ai pas envie de savoir ta
						reponse
					</Text>
				</View>
			</View>
		</TouchableHighlight>
	)
}

const Conversations: React.FC<ConversationsProps> = ({ items, contentContainerStyle }) => {
	const { navigate } = useNavigation()
	const navigationKind: { [key: number]: () => void } = {
		[berty.chatmodel.Conversation.Kind.Unknown]: () => {},
		[berty.chatmodel.Conversation.Kind.Self]: navigate.chat.one2One,
		[berty.chatmodel.Conversation.Kind.OneToOne]: navigate.chat.one2One,
		[berty.chatmodel.Conversation.Kind.PrivateGroup]: navigate.chat.group,
	}
	const [{ overflow, border, padding, margin, text, background }] = useStyles()
	return (
		<Translation>
			{(t): React.ReactNode => (
				<ScrollView
					style={[overflow, border.shadow.medium]}
					contentContainerStyle={[background.white, border.radius.big]}
				>
					<SafeAreaView>
						<View style={[padding.bottom.compute(80)]}>
							<Text
								style={[
									text.color.black,
									text.size.huge,
									text.bold,
									padding.medium,
									margin.horizontal.medium,
								]}
							>
								{t('main.messages.title')}
							</Text>
							{items
								.filter(
									(conversation) =>
										conversation?.kind !== berty.chatmodel.Conversation.Kind.Unknown,
								)
								.map((conversation) =>
									conversation ? (
										<ConversationsItem
											key={conversation?.id?.toString()}
											{...conversation}
											navigate={
												navigationKind[
													conversation?.kind || berty.chatmodel.Conversation.Kind.Unknown
												]
											}
										/>
									) : null,
								)}
						</View>
					</SafeAreaView>
				</ScrollView>
			)}
		</Translation>
	)
}

export const List: React.FC = () => {
	const navigation = useNavigation()
	// TODO: do something to animate the requests
	const windowHeight = Dimensions.get('window').height
	const [{ height: requestsHeight }, onLayoutRequests] = useLayout()
	const [{ height: footerHeight }, onLayoutFooter] = useLayout()
	const conversationContentContainerStyle = useMemo(
		() => ({
			minHeight: windowHeight - requestsHeight,
			paddingBottom: footerHeight + 16,
		}),
		[requestsHeight, footerHeight, windowHeight],
	)

	const [requests] = useRequests()
	const [conversations] = useConversations()

	const [{ absolute, background, flex }] = useStyles()

	return (
		<View style={[absolute.fill, background.blue]}>
			<Requests items={requests} onLayout={onLayoutRequests} />
			{conversations ? (
				<Conversations
					items={conversations}
					contentContainerStyle={conversationContentContainerStyle}
				/>
			) : (
				<ActivityIndicator style={flex.medium} size='large' color='white' />
			)}
			<Footer {...navigation} />
		</View>
	)
}

export default List
