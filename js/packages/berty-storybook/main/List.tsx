import React from 'react'
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
} from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { Translation } from 'react-i18next'
import { berty, google } from '@berty-tech/berty-api'
import * as dateFns from '@berty-tech/berty-i18n/dateFns'
import { useLayout } from '../hooks'
import { Footer } from '../shared-components/Footer'
import { styles, colors } from '../styles'
import { UserProps } from '../shared-props/User'
import { CircleAvatar } from '../shared-components/CircleAvatar'

type Navigation = () => void
type Form<T> = (arg0: T) => Promise<void>

//
// Main List
//

// Types

type RequestsItemProps = berty.chatmodel.IContact & {
	kind: berty.chatmodel.Contact.Kind.PendingInc
	accept: Form<void>
	discard: Form<void>
}

type RequestsProps = ViewProps & {
	items: Array<RequestsItemProps>
}

type ConversationsItemProps = berty.chatmodel.IConversation & {
	navigate: Navigation
}

type ConversationsProps = ScrollViewProps & {
	items: Array<ConversationsItemProps>
}

type FooterProps = ViewProps & {
	search: Navigation
	plus: Navigation
	account: Navigation
}

type ListProps = {
	conversations: ConversationsProps
	requests: RequestsProps
	footer: FooterProps
	user: UserProps
}

// Functions

const date = ({ seconds, nanos }: google.protobuf.ITimestamp): Date => {
	const _ = new Date()
	_.setTime((seconds as number) * 1000 + nanos / 1000)
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

const RequestsItem: React.FC<RequestsItemProps> = ({
	name,
	avatarUri,
	createdAt,
	accept,
	discard,
}) => {
	return (
		<Translation>
			{(t): React.ReactNode => (
				<View style={[_stylesList.tinyCard, styles.shadow, styles.col]}>
					<CircleAvatar
						style={_stylesList.tinyAvatar}
						avatarUri={avatarUri}
						size={65}
						diffSize={8}
					/>
					<Text style={[styles.center, styles.textCenter, styles.flex]}>{name}</Text>
					<Text
						category='c1'
						style={[styles.paddingVertical, styles.textCenter, styles.textTiny, styles.textGrey]}
					>
						{dateFns.distanceInWordsToNow(date(createdAt))}
					</Text>
					<View style={[styles.row]}>
						<TouchableOpacity
							style={[_stylesList.tinyDiscardButton, styles.border, styles.justifyContent]}
							onPress={(): void => {
								discard()
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
								accept()
							}}
						>
							<Icon name='checkmark-outline' width={15} height={15} fill={colors.blue} />
							<Text style={[styles.textTiny, styles.textBlue]}>{t('main.requests.accept')}</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
		</Translation>
	)
}

const Requests: React.FC<RequestsProps> = ({ items, style, onLayout }) =>
	items.length ? (
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
					{items.map((props) => (
						<RequestsItem key={props.id.toString()} {...props} />
					))}
				</ScrollView>
			</View>
		</SafeAreaView>
	) : null

const ConversationsItem: React.FC<ConversationsItemProps> = ({
	avatarUri,
	createdAt,
	title,
	topic,
	badge,
	members,
	navigate,
}) => (
	<TouchableHighlight
		underlayColor={colors.lightGrey}
		style={[styles.paddingHorizontal]}
		onPress={navigate}
	>
		<View style={[styles.row, styles.borderBottom, styles.padding]}>
			<CircleAvatar avatarUri={avatarUri} size={39} withCircle={false} />
			<View style={[styles.flex, styles.col, styles.paddingLeft]}>
				<View style={[styles.row, styles.alignItems, styles.spaceBetween]}>
					<View style={[styles.row, styles.alignItems]}>
						<Text numberOfLines={1} style={_stylesList.conversationItemName}>
							{title}
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

const Conversations: React.FC<ConversationsProps> = ({
	items,
	onScroll,
	contentContainerStyle,
}) => (
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
						{items.map((props) => (
							<ConversationsItem {...props} />
						))}
					</Layout>
				</SafeAreaView>
			</ScrollView>
		)}
	</Translation>
)

export const List: React.FC<ListProps> = ({ requests, conversations, footer, user }) => {
	// TODO: do something to animate the requests
	const [{ height: requestsHeight }, onLayoutRequests] = useLayout()
	const [{ height: footerHeight }, onLayoutFooter] = useLayout()

	requests.onLayout = onLayoutRequests
	footer.onLayout = onLayoutFooter

	conversations.contentContainerStyle = {
		minHeight: Dimensions.get('window').height - requestsHeight,
		paddingBottom: footerHeight + 16,
	}

	return (
		<View style={[StyleSheet.absoluteFill, styles.bgBlue]}>
			<Requests {...requests} />
			<Conversations {...conversations} />
			<Footer
				left={{ icon: 'search-outline' }}
				center={{
					icon: 'plus-outline',
					backgroundColor: colors.blue,
					size: 50,
					elemSize: 30,
					elemColor: colors.white,
				}}
				right={{ avatarUri: user.avatarUri, elemSize: 40 }}
			/>
		</View>
	)
}

export default List
