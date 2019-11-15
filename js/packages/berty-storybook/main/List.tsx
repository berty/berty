import React, { useMemo, useContext } from 'react'
import {
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
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { Translation } from 'react-i18next'
import { berty, google } from '@berty-tech/berty-api'
import * as dateFns from '@berty-tech/berty-i18n/dateFns'
import { useLayout } from '../hooks'
import { Footer } from './Footer'
import { styles, colors } from '../styles'
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

const _stylesList = StyleSheet.create({
	tinyAvatarImage: {
		width: 51,
		borderRadius: 51,
		height: 51,
	},
	tinyAvatar: {
		position: 'absolute',
		top: -32.5,
	},
	tinyCard: {
		margin: 16,
		marginTop: 16 + 26,
		padding: 16,
		paddingTop: 16 + 26,
		width: 121,
		height: 177,
		borderRadius: 20,
		backgroundColor: colors.white,
		alignItems: 'center',
	},
	tinyAcceptButton: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		marginHorizontal: 4,
	},
	tinyDiscardButton: {
		paddingHorizontal: 4,
		paddingVertical: 4,
		borderRadius: 4,
		marginHorizontal: 4,
	},
	draggableView: {
		borderRadius: 30,
		paddingBottom: 80,
	},
	// ConversationItem
	conversationItemAvatar: {
		width: 39,
		height: 39,
		borderRadius: 39,
	},
	conversationItemName: {
		maxWidth: 120,
	},
	conversationItemBadge: {
		width: 15,
		height: 15,
		borderRadius: 15,
	},
	conversationItemBadgeText: {
		fontSize: 9,
	},
	conversationItemEndInfos: {
		paddingLeft: 5,
	},
	conversationItemMessage: {
		maxWidth: 240,
	},
})

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
	return (
		<Translation>
			{(t): React.ReactNode => (
				<TouchableOpacity
					style={[_stylesList.tinyCard, styles.shadow, styles.col]}
					onPress={() => display({ id })}
				>
					<CircleAvatar
						style={_stylesList.tinyAvatar}
						avatarUri={avatarUris[0]}
						size={65}
						diffSize={8}
					/>
					<Text style={[styles.center, styles.textCenter, styles.flex]}>{name}</Text>
					<Text
						category='c1'
						style={[styles.paddingVertical, styles.textCenter, styles.textTiny, styles.textGrey]}
					>
						{dateFns.distanceInWordsToNow(date(timestamp))}
					</Text>
					<View style={[styles.row]}>
						<TouchableOpacity
							style={[_stylesList.tinyDiscardButton, styles.border, styles.justifyContent]}
							onPress={(): void => {
								decline({ id })
							}}
						>
							<Icon name='close-outline' width={15} height={15} fill={colors.grey} />
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								_stylesList.tinyAcceptButton,
								styles.bgLightBlue,
								styles.row,
								styles.alignItems,
								styles.justifyContent,
							]}
							onPress={(): void => {
								accept({ id })
							}}
						>
							<Icon name='checkmark-outline' width={15} height={15} fill={colors.blue} />
							<Text style={[styles.textTiny, styles.textBlue]}>{t('main.requests.accept')}</Text>
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
	return items?.length ? (
		<SafeAreaView onLayout={onLayout} style={style}>
			<View style={[styles.paddingTop]}>
				<Text category='h4' style={[styles.textWhite, styles.paddingHorizontal]}>
					Requests
				</Text>
				<ScrollView
					horizontal
					style={[styles.paddingVertical]}
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
	return (
		<TouchableHighlight
			underlayColor={colors.lightGrey}
			style={[styles.paddingHorizontal]}
			onPress={() => navigate(props)}
		>
			<View style={[styles.row, styles.borderBottom, styles.centerItems]}>
				<ConversationAvatar {...props} size={39} />
				<View style={[styles.flex, styles.col, styles.padding]}>
					<View style={[styles.row, styles.alignItems, styles.spaceBetween]}>
						<View style={[styles.row, styles.alignItems]}>
							<Text numberOfLines={1} style={_stylesList.conversationItemName}>
								{title || ''}
							</Text>
							<Icon
								style={[styles.littleMarginLeft]}
								name='checkmark-circle-2'
								width={15}
								height={15}
								fill={colors.blue}
							/>
						</View>
						<View style={[styles.row, styles.end, styles.alignItems]}>
							<View
								style={[
									styles.bgRed,
									styles.alignItems,
									styles.spaceCenter,
									_stylesList.conversationItemBadge,
								]}
							>
								<Text
									style={[
										styles.textWhite,
										styles.textBold,
										styles.absolute,
										styles.textCenter,
										_stylesList.conversationItemBadgeText,
									]}
								>
									2
								</Text>
							</View>
							<View style={_stylesList.conversationItemEndInfos}>
								<Text style={[styles.textSmall, styles.textGrey]}>
									{dateFns.fuzzy(date(createdAt))}
								</Text>
							</View>
							<View style={_stylesList.conversationItemEndInfos}>
								<Icon name='paper-plane' width={12} height={12} fill={colors.blue} />
							</View>
						</View>
					</View>
					<View style={[styles.bigMarginRight]}>
						<Text
							numberOfLines={1}
							style={[styles.textSmall, styles.textGrey, _stylesList.conversationItemMessage]}
						>
							Salut je voulais savoir comment tu allais mais finalement j'ai pas envie de savoir ta
							reponse
						</Text>
					</View>
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
	return (
		<Translation>
			{(t): React.ReactNode => (
				<ScrollView
					style={[styles.overflow, styles.shadow]}
					contentContainerStyle={[styles.bgWhite, _stylesList.draggableView, contentContainerStyle]}
				>
					<SafeAreaView>
						<Layout style={[_stylesList.draggableView]}>
							<Text category='h4' style={[styles.padding, styles.marginHorizontal]}>
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
						</Layout>
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

	return (
		<View style={[styles.flex, styles.bgBlue]}>
			<Requests items={requests} onLayout={onLayoutRequests} />
			{conversations ? (
				<Conversations
					style={[styles.flex]}
					items={conversations}
					contentContainerStyle={conversationContentContainerStyle}
				/>
			) : (
				<ActivityIndicator style={styles.flex} size='large' color='white' />
			)}
			<Footer {...navigation} />
		</View>
	)
}

export default List
