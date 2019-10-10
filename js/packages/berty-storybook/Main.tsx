import React, { useState, useEffect } from 'react'
import {
	Dimensions,
	TouchableOpacity,
	ScrollViewProps,
	View,
	ViewProps,
	Image,
	SafeAreaView,
	StyleSheet,
	ScrollView,
	TouchableHighlight,
	LayoutChangeEvent,
	StyleProp,
	TextInput,
} from 'react-native'
import { Layout, Text, Button, Icon, Toggle } from 'react-native-ui-kitten'
import { styles, colors } from './styles'
import { Translation } from 'react-i18next'
import { berty, google } from '@berty-tech/berty-api'
import * as dateFns from '@berty-tech/berty-i18n/dateFns'
import { useLayout } from './hooks'
import { Footer } from './shared-components/shared-components.tsx'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import ButtonSetting from './settings/SharedComponentSettings'

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
type UserProps = {
	avatarUri: string
	name: string
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
		top: -26,
		borderRadius: 51,
		borderColor: colors.white,
		borderWidth: 4,
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
					<View style={[_stylesList.tinyAvatar, styles.shadow]}>
						<Image style={_stylesList.tinyAvatarImage} source={{ uri: avatarUri }} />
					</View>
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
			<Image source={{ uri: avatarUri }} style={{ width: 39, height: 39, borderRadius: 39 }} />
			<View style={[styles.flex, styles.col, styles.paddingLeft]}>
				<View style={[styles.row, styles.alignItems, styles.spaceBetween]}>
					<View style={[styles.row, styles.alignItems]}>
						<Text numberOfLines={1} style={[{ maxWidth: 120 }]}>
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
								{ width: 15, height: 15, borderRadius: 15 },
							]}
						>
							<Text
								style={[
									styles.textWhite,
									styles.textBold,
									styles.absolute,
									styles.textCenter,
									{ fontSize: 9 },
								]}
							>
								2
							</Text>
						</View>
						<View style={[{ paddingLeft: 5 }]}>
							<Text style={[styles.textSmall, styles.textGrey]}>
								{dateFns.fuzzy(date(createdAt))}
							</Text>
						</View>
						<View style={[{ paddingLeft: 5 }]}>
							<Icon name='paper-plane' width={12} height={12} fill={colors.blue} />
						</View>
					</View>
				</View>
				<View style={[styles.bigMarginRight]}>
					<Text numberOfLines={1} style={[styles.textSmall, styles.textGrey, { maxWidth: 240 }]}>
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
			<View
				style={[
					styles.bgWhite,
					styles.absolute,
					styles.bottom,
					styles.left,
					styles.right,
					{
						height: 100,
						opacity: 0.8,
					},
				]}
			/>
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

//
// Request Accept/Refuse
//

// Types
type RequestProps = {
	user: UserProps
}

type BodyRequestTabProps = {
	name: string
	icon: string
	enable?: boolean
}

// Style
const _stylesRequest = StyleSheet.create({
	bodyRequest: { width: '90%', marginTop: 70 },
	bodyRequestContent: { bottom: 90 },
	bodyGroupRequestContent: { bottom: 100 },
	circleAvatar: { width: 130, height: 130, borderRadius: 65 },
	imageAvatar: { width: 120, height: 120, borderRadius: 60 },
	groupCircleAvatar: { width: 100, height: 100, borderRadius: 50 },
	groupImageAvatar: { width: 90, height: 90, borderRadius: 45 },
	bodyRequestTabBarEnable: {
		width: '95%',
		borderWidth: 2,
		borderColor: colors.blue,
		borderRadius: 2,
	},
	bodyRequestTabBarDisable: {
		width: '95%',
		borderWidth: 2,
		borderColor: colors.black,
		borderRadius: 2,
	},
})

const BodyRequestAvatar: React.FC<UserProps> = ({ avatarUri, name }) => (
	<View>
		<View
			style={[
				styles.center,
				styles.bgWhite,
				styles.shadow,
				styles.spaceCenter,
				styles.centerItems,
				_stylesRequest.circleAvatar,
			]}
		>
			<Image style={[_stylesRequest.imageAvatar]} source={{ uri: avatarUri }} />
		</View>
		<Text
			category='h6'
			style={[styles.center, styles.fontFamily, styles.textBlack, styles.paddingTop]}
		>
			{name}
		</Text>
	</View>
)

const BodyRequestTab: React.FC<BodyRequestTabProps> = ({ name, icon, enable = false }) => (
	<View style={[styles.centerItems, !enable ? { opacity: 0.2 } : null]}>
		<Icon fill={enable ? colors.blue : colors.black} name={icon} width={25} height={25} />
		<Text
			style={[
				enable ? styles.textBlue : styles.textBlack,
				styles.fontFamily,
				{ fontSize: 12, fontWeight: 'bold' },
			]}
		>
			{name}
		</Text>
		<View
			style={[
				enable ? _stylesRequest.bodyRequestTabBarEnable : _stylesRequest.bodyRequestTabBarDisable,
			]}
		/>
	</View>
)

const BodyRequestTabs: React.FC<{}> = () => {
	const [enable, setEnable] = useState('Fingerprint')

	const handleEnable = (enable: string) => {
		setEnable(enable)
	}

	return (
		<View style={[styles.marginTop]}>
			<View style={[styles.row, styles.spaceEvenly]}>
				<TouchableOpacity onPress={() => handleEnable('Fingerprint')} style={[styles.flex]}>
					<BodyRequestTab
						name='Fingerprint'
						icon='code-outline'
						enable={enable === 'Fingerprint'}
					/>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => handleEnable('Infos')} style={[styles.flex]}>
					<BodyRequestTab name='Infos' icon='info-outline' enable={enable === 'Infos'} />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => handleEnable('Devices')} style={[styles.flex]} disabled>
					<BodyRequestTab name='Devices' icon='smartphone-outline' enable={enable === 'Devices'} />
				</TouchableOpacity>
			</View>
		</View>
	)
}

const BodyRequestContent: React.FC<{}> = () => {
	const [isToggled, setIsToggled] = useState(false)

	const handleToggled = () => {
		setIsToggled(!isToggled)
	}

	return (
		<View style={[styles.bigMarginTop]}>
			<View style={[styles.bgLightBlueGrey, styles.borderRadius, styles.padding]}>
				<View style={[styles.col]}>
					<View style={[styles.row, styles.spaceAround]}>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							72EC
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							F46A
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							56B4
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							AD39
						</Text>
					</View>
					<View style={[styles.row, styles.spaceAround]}>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							C907
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							BBB7
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							1646
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							B09N
						</Text>
					</View>
					<View style={[styles.row, styles.spaceAround]}>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							JH87
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							7JUI
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							QVCS
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							H87H
						</Text>
					</View>
					<View style={[styles.row, styles.spaceAround]}>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							87JD
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							LOW9
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							8883
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							ALW6
						</Text>
					</View>
				</View>
			</View>
			<View
				style={[
					styles.marginTop,
					styles.padding,
					styles.borderRadius,
					{ borderColor: isToggled ? colors.blue : colors.lightBlueGrey, borderWidth: 2 },
				]}
			>
				<View style={[styles.row, styles.spaceAround, styles.centerItems]}>
					<Icon
						name='checkmark-circle-2'
						width={30}
						height={30}
						fill={isToggled ? colors.blue : colors.lightBlueGrey}
					/>
					<Text style={[styles.fontFamily]}>Mark as verified</Text>
					<Toggle status='primary' checked={isToggled} onChange={handleToggled} />
				</View>
				<Text style={[styles.textGrey, styles.marginTop, { fontSize: 10, fontWeight: 'bold' }]}>
					Compare the fingerprint displayed above with the one on Caterpillar’s phone. If they are
					identical, end-to-end encryption is guaranted on you can mark this contact as verified.
				</Text>
			</View>
		</View>
	)
}

const BodyRequestButtons: React.FC<{}> = () => (
	<View style={[styles.row, styles.spaceBetween, styles.bigMarginTop]}>
		<TouchableOpacity
			style={[
				styles.littlePaddingRight,
				styles.row,
				styles.flex,
				styles.spaceEvenly,
				styles.centerItems,
				styles.littleMarginRight,
				{
					borderColor: colors.grey,
					borderWidth: 2,
					opacity: 0.5,
					borderRadius: 6,
					paddingTop: 7,
					paddingBottom: 7,
				},
			]}
		>
			<Icon name='close-outline' width={30} height={30} fill={colors.grey} />
			<Text style={[styles.textGrey, styles.fontFamily, { fontSize: 15, fontWeight: 'bold' }]}>
				REFUSE
			</Text>
		</TouchableOpacity>
		<TouchableOpacity
			style={[
				styles.littlePaddingRight,
				styles.bgLightBlue,
				styles.row,
				styles.flex,
				styles.spaceEvenly,
				styles.centerItems,
				styles.littleMarginLeft,
				{ borderRadius: 6, paddingTop: 7, paddingBottom: 7 },
			]}
		>
			<Icon name='checkmark-outline' width={30} height={30} fill={colors.blue} />
			<Text style={[styles.textBlue, styles.fontFamily, { fontSize: 15, fontWeight: 'bold' }]}>
				ACCEPT
			</Text>
		</TouchableOpacity>
	</View>
)

const BodyRequest: React.FC<RequestProps> = ({ user }) => (
	<View style={[styles.bigPadding]}>
		<View style={[_stylesRequest.bodyRequestContent]}>
			<BodyRequestAvatar {...user} />
			<BodyRequestTabs />
			<BodyRequestContent />
			<BodyRequestButtons />
		</View>
	</View>
)

export const Request: React.FC<RequestProps> = ({ user }) => {
	const [layout, setLayout] = useState()

	const handleLayout = (e: LayoutChangeEvent) => {
		if (!layout) {
			setLayout(e.nativeEvent.layout.height)
		}
	}

	return (
		<Layout style={[styles.flex, styles.bgBlue]}>
			<SafeAreaView style={[styles.flex]}>
				<View
					style={[
						styles.absolute,
						styles.bottom,
						styles.left,
						styles.right,
						styles.bigMarginBottom,
					]}
				>
					<View
						onLayout={(e) => handleLayout(e)}
						style={[
							styles.bgWhite,
							styles.center,
							styles.shadow,
							_stylesRequest.bodyRequest,
							{ borderRadius: 28 },
							layout ? { height: layout - 90 } : null,
						]}
					>
						<BodyRequest user={user} />
					</View>
					<TouchableOpacity
						style={[
							styles.bgWhite,
							styles.center,
							styles.spaceCenter,
							styles.centerItems,
							styles.shadow,
							styles.marginTop,
							{ width: 45, height: 45, borderRadius: 22.5 },
						]}
					>
						<Icon
							style={[{ opacity: 0.5 }]}
							name='close-outline'
							width={25}
							height={25}
							fill={colors.grey}
						/>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</Layout>
	)
}

//
// RequestGroup
//

// Types
type BodyGroupRequestContentItemProps = {
	avatarUri: string
	name: string
	state?: {
		value: string
		color: string
		bgColor: string
	}
	separateBar?: boolean
	isConnected?: boolean
	previewValue?: string
}

const BodyGroupRequestAvatar: React.FC<UserProps> = ({ avatarUri, name }) => (
	<View>
		<View style={[styles.row, styles.center, { marginBottom: 45, marginRight: 45 }]}>
			<View style={[styles.absolute, { marginLeft: 45, marginTop: 45 }]}>
				<View
					style={[
						styles.center,
						styles.bgWhite,
						styles.shadow,
						styles.spaceCenter,
						styles.centerItems,
						_stylesRequest.groupCircleAvatar,
					]}
				>
					<Image style={[_stylesRequest.groupImageAvatar]} source={{ uri: avatarUri }} />
				</View>
			</View>
			<View
				style={[
					styles.center,
					styles.bgWhite,
					styles.shadow,
					styles.spaceCenter,
					styles.centerItems,
					_stylesRequest.groupCircleAvatar,
				]}
			>
				<Image style={[_stylesRequest.groupImageAvatar]} source={{ uri: avatarUri }} />
			</View>
		</View>
		<Text
			category='h6'
			style={[styles.center, styles.fontFamily, styles.textBlack, styles.paddingTop]}
		>
			{name}
		</Text>
	</View>
)

const BodyGroupRequestTab: React.FC<BodyRequestTabProps> = ({ name, icon, enable = false }) => (
	<View style={[styles.centerItems, !enable ? { opacity: 0.2 } : null]}>
		<Icon fill={enable ? colors.blue : colors.black} name={icon} width={25} height={25} />
		<Text
			style={[
				enable ? styles.textBlue : styles.textBlack,
				styles.fontFamily,
				{ fontSize: 12, fontWeight: 'bold' },
			]}
		>
			{name}
		</Text>
		<View
			style={[
				enable ? _stylesRequest.bodyRequestTabBarEnable : _stylesRequest.bodyRequestTabBarDisable,
			]}
		/>
	</View>
)

const BodyGroupRequestTabs: React.FC<{}> = () => {
	const [enable, setEnable] = useState('Members')

	const handleEnable = (enable: string) => {
		setEnable(enable)
	}

	return (
		<View style={[styles.marginTop]}>
			<View style={[styles.row, styles.spaceEvenly]}>
				<TouchableOpacity onPress={() => handleEnable('Members')} style={[styles.flex]}>
					<BodyGroupRequestTab name='Members' icon='people-outline' enable={enable === 'Members'} />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => handleEnable('Fingerprint')} style={[styles.flex]}>
					<BodyGroupRequestTab
						name='Fingerprint'
						icon='code-outline'
						enable={enable === 'Fingerprint'}
					/>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => handleEnable('Infos')} style={[styles.flex]}>
					<BodyGroupRequestTab name='Infos' icon='info-outline' enable={enable === 'Infos'} />
				</TouchableOpacity>
			</View>
		</View>
	)
}

const BodyGroupRequestContentItem: React.FC<BodyGroupRequestContentItemProps> = ({
	avatarUri,
	name,
	state = {},
	separateBar = true,
	isConnected = false,
	previewValue = null,
}) => (
	<View>
		<View style={[styles.flex, styles.row, styles.paddingLeft, styles.paddingRight]}>
			<View style={[styles.row, styles.alignVertical, { marginRight: 85 }]}>
				<Image
					style={[{ width: 51, height: 51, borderRadius: 51 }, styles.marginRight]}
					source={{ uri: avatarUri }}
				/>
				<Text numberOfLines={1}>{name}</Text>
				{isConnected && (
					<Icon
						style={[styles.littleMarginLeft]}
						name='checkmark-circle-2'
						width={15}
						height={15}
						fill={colors.blue}
					/>
				)}
			</View>
			{state && state.value && (
				<View style={[styles.center, styles.alignItems]}>
					<View
						style={[
							styles.borderRadius,
							styles.alignItems,
							{
								paddingTop: 2,
								paddingBottom: 2,
								paddingLeft: 8,
								paddingRight: 8,
								backgroundColor: state.bgColor,
							},
						]}
					>
						<Text style={[styles.center, { color: state.color, fontSize: 8, fontWeight: 'bold' }]}>
							{state.value}
						</Text>
					</View>
				</View>
			)}
			{previewValue && (
				<View style={[styles.center, styles.alignItems]}>
					<Text style={[styles.textBlue, { fontSize: 15 }]}>{previewValue}</Text>
				</View>
			)}
		</View>
		{separateBar && (
			<View
				style={[{ borderColor: 'gray', opacity: 0.2, borderWidth: 0.5 }, styles.littleMargin]}
			/>
		)}
	</View>
)

const BodyGroupRequestContent: React.FC<UserProps> = ({ avatarUri, name }) => (
	<ScrollView style={[styles.bigMarginTop, { height: 300 }]}>
		<BodyGroupRequestContentItem
			avatarUri={avatarUri}
			name={name}
			state={{ value: 'Creator', color: colors.white, bgColor: colors.blue }}
		/>
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} />
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} isConnected={true} />
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} />
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} isConnected={true} />
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} isConnected={true} />
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} />
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} />
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} />
		<BodyGroupRequestContentItem avatarUri={avatarUri} name={name} />
		<BodyGroupRequestContentItem
			avatarUri={avatarUri}
			name={name}
			previewValue='Me'
			separateBar={false}
		/>
	</ScrollView>
)

const BodyGroupRequest: React.FC<RequestProps> = ({ user }) => (
	<View style={[styles.bigPadding]}>
		<View style={[_stylesRequest.bodyGroupRequestContent]}>
			<BodyGroupRequestAvatar {...user} />
			<BodyGroupRequestTabs />
			<BodyGroupRequestContent {...user} />
			<BodyRequestButtons />
		</View>
	</View>
)

export const GroupRequest: React.FC<RequestProps> = ({ user }) => {
	const [layout, setLayout] = useState()

	const handleLayout = (e: LayoutChangeEvent) => {
		if (!layout) {
			setLayout(e.nativeEvent.layout.height)
		}
	}
	return (
		<Layout style={[styles.flex, styles.bgBlue]}>
			<SafeAreaView style={[styles.flex]}>
				<View
					style={[
						styles.absolute,
						styles.bottom,
						styles.left,
						styles.right,
						styles.bigMarginBottom,
					]}
				>
					<View
						onLayout={(e) => handleLayout(e)}
						style={[
							styles.bgWhite,
							styles.center,
							styles.shadow,
							_stylesRequest.bodyRequest,
							{ borderRadius: 28 },
							layout ? { height: layout - 90 } : null,
						]}
					>
						<BodyGroupRequest user={user} />
					</View>
					<TouchableOpacity
						style={[
							styles.bgWhite,
							styles.center,
							styles.spaceCenter,
							styles.centerItems,
							styles.shadow,
							styles.marginTop,
							{ width: 45, height: 45, borderRadius: 22.5 },
						]}
					>
						<Icon
							style={[{ opacity: 0.5 }]}
							name='close-outline'
							width={25}
							height={25}
							fill={colors.grey}
						/>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</Layout>
	)
}

//
// ChatGroup
//

// Types
type ChatGroupMemberItemProps = {
	avatarUri: string
	name: string
	color: string
	icon: string
	state: {
		value: string
		color: string
		bgColor: string
	}
	style?: StyleProp<any>
}

type ChatMessageItemProps = {
	avatarUri: string
	name: string
	date: string
	message: string
	color: string
	bgColor: string
	me?: boolean
	state?: {
		value: string
		icon: string
		color: string
	}[]
	isGroup?: boolean
	style?: StyleProp<any>
	styleMsg?: StyleProp<any>
}

const HeaderChatGroup: React.FC<UserProps> = ({ avatarUri, name }) => (
	<View style={[styles.padding]}>
		<View style={[styles.row, styles.centerItems, styles.spaceCenter]}>
			<TouchableOpacity style={[styles.flex]}>
				<Icon name='arrow-back-outline' width={30} height={30} />
			</TouchableOpacity>
			<View style={[{ flex: 5 }]}>
				<Text numberOfLines={1} style={[styles.textCenter, { fontSize: 20, fontWeight: 'bold' }]}>
					Surprise Party
				</Text>
			</View>
			<View style={[styles.flex]}>
				<View style={[styles.row, styles.center, { marginBottom: 20, marginRight: 20 }]}>
					<View style={[styles.absolute, { marginLeft: 20, marginTop: 20 }]}>
						<View
							style={[
								styles.center,
								styles.bgWhite,
								styles.shadow,
								styles.spaceCenter,
								styles.centerItems,
								{ width: 40, height: 40, borderRadius: 40 },
							]}
						>
							<Image
								style={[{ width: 35, height: 35, borderRadius: 35 }]}
								source={{ uri: avatarUri }}
							/>
						</View>
					</View>
					<View
						style={[
							styles.center,
							styles.bgWhite,
							styles.shadow,
							styles.spaceCenter,
							styles.centerItems,
							{ width: 40, height: 40, borderRadius: 40 },
						]}
					>
						<Image
							style={[{ width: 35, height: 35, borderRadius: 35 }]}
							source={{ uri: avatarUri }}
						/>
					</View>
				</View>
			</View>
		</View>
	</View>
)

const ChatGroupMemberItem: React.FC<ChatGroupMemberItemProps> = ({
	avatarUri,
	name,
	color,
	icon,
	state,
	style = null,
}) => {
	const [layout, setLayout] = useState()

	const handleLayout = (e: LayoutChangeEvent) => {
		if (!layout) {
			setLayout(e.nativeEvent.layout.height)
		}
	}

	return (
		<View
			onLayout={(e) => handleLayout(e)}
			style={[
				styles.borderRadius,
				styles.shadow,
				styles.bgWhite,
				styles.padding,
				styles.marginRight,
				layout && { height: layout - 45 },
				{ width: 100 },
				style,
			]}
		>
			<View style={[{ bottom: 45 }]}>
				<View>
					<View
						style={[
							styles.center,
							styles.spaceCenter,
							styles.centerItems,
							{ width: 60, height: 60, borderRadius: 60, backgroundColor: color },
						]}
					>
						<Image
							style={[{ width: 55, height: 55, borderRadius: 55 }]}
							source={{ uri: avatarUri }}
						/>
					</View>
					<View style={[styles.absolute, { right: -5, top: -10 }]}>
						<Icon name={icon} width={30} height={30} fill={color} />
					</View>
				</View>
				<Text numberOfLines={1} style={[styles.textCenter, { fontSize: 10 }]}>
					{name}
				</Text>
				<View
					style={[
						styles.littleMarginTop,
						styles.center,
						styles.borderRadius,
						{
							backgroundColor: state.bgColor,
							paddingTop: 2,
							paddingBottom: 2,
							paddingRight: 8,
							paddingLeft: 8,
						},
					]}
				>
					<Text numberOfLines={1} style={[{ color: state.color, fontSize: 10 }, styles.textBold]}>
						{state.value}
					</Text>
				</View>
			</View>
		</View>
	)
}

const ChatGroupMemberList: React.FC<RequestProps> = ({ user }) => (
	<ScrollView
		style={[styles.bigMarginTop, styles.paddingBottom, styles.paddingRight, { paddingTop: 40 }]}
		horizontal
		showsHorizontalScrollIndicator={false}
	>
		<ChatGroupMemberItem
			{...user}
			color={colors.blue}
			icon='checkmark-circle-2'
			state={{ value: 'Creator', color: colors.white, bgColor: colors.blue }}
			style={styles.marginLeft}
		/>
		<ChatGroupMemberItem
			{...user}
			color={colors.green}
			icon='checkmark-circle-2'
			state={{ value: 'Accepted', color: colors.green, bgColor: colors.lightGreen }}
		/>
		<ChatGroupMemberItem
			{...user}
			color={colors.green}
			icon='checkmark-circle-2'
			state={{ value: 'Accepted', color: colors.green, bgColor: colors.lightGreen }}
		/>
		<ChatGroupMemberItem
			{...user}
			color={colors.yellow}
			icon='clock'
			state={{ value: 'Pending', color: colors.yellow, bgColor: colors.lightYellow }}
		/>
	</ScrollView>
)

const InfosChatGroup: React.FC<RequestProps> = ({ user }) => (
	<View style={[styles.padding]}>
		<View
			style={[
				styles.borderRadius,
				styles.center,
				styles.bgLightGrey,
				{ paddingTop: 2, paddingBottom: 2, paddingRight: 8, paddingLeft: 8, opacity: 0.5 },
			]}
		>
			<Text style={[styles.center, styles.textBlack, { fontSize: 12 }]}>Today</Text>
		</View>
		<View style={[styles.center, styles.marginTop]}>
			<Text style={[styles.center, styles.textBlack, styles.textBold, { fontSize: 14 }]}>
				Test created the group
			</Text>
		</View>
		<ChatGroupMemberList user={user} />
	</View>
)

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
	avatarUri,
	name,
	date,
	message,
	color,
	bgColor,
	me = false,
	state = [],
	isGroup = false,
	style = null,
	styleMsg = null,
}) => (
	<View style={[me ? { marginLeft: 70, right: 0 } : { marginRight: 70 }, { marginTop: 6 }]}>
		<View style={[styles.row]}>
			{!me && isGroup && (
				<View style={[styles.flex, styles.littleMarginRight, styles.end]}>
					<Image
						style={[{ width: 35, height: 35, borderRadius: 35 }]}
						source={{ uri: avatarUri }}
					/>
				</View>
			)}
			<View style={[{ flex: 8 }, styles.col]}>
				{!me && isGroup && (
					<View style={[styles.littleMarginLeft]}>
						<Text style={[{ color: color, fontSize: 10 }, styles.textBold]}>{name}</Text>
					</View>
				)}
				<View
					style={[
						styles.littlePadding,
						styles.borderRadius,
						styleMsg,
						{ backgroundColor: bgColor },
					]}
				>
					<Text style={[{ color: color, fontSize: 11 }, styles.textBold]}>{message}</Text>
				</View>
				<View style={[me && styles.end]}>
					{!state.length && <Text style={[styles.textGrey, { fontSize: 10 }]}>9:42</Text>}
					{state &&
						state.map((value) => (
							<View style={[styles.row, styles.centerItems]}>
								<Text style={[styles.textGrey, { fontSize: 10, paddingRight: 5 }]}>9:42</Text>
								<Icon name={value.icon} width={12} height={12} fill={value.color} />
								<Text style={[{ fontSize: 10, color: value.color, paddingLeft: 1.5 }]}>
									{value.value}
								</Text>
							</View>
						))}
				</View>
			</View>
		</View>
	</View>
)

const ChatGroupMessageList: React.FC<RequestProps> = ({ user }) => (
	<View style={[styles.padding]}>
		<ChatMessageItem
			{...user}
			date='oui'
			message='Je test un message pour voir et assez long pour gerer la width du component'
			isGroup
			color={colors.blue}
			bgColor={colors.lightMsgBlue}
		/>
		<ChatMessageItem
			{...user}
			date='oui'
			message='Je test un message pour voir et assez long pour gerer la width du component'
			color={colors.white}
			isGroup
			bgColor={colors.blue}
			me={true}
			state={[{ icon: 'navigation-2', color: colors.blue, value: 'sent' }]}
		/>
		<ChatMessageItem
			{...user}
			date='oui'
			message='Je test un message pour voir et assez long pour gerer la width du component hfhgfgfgegfeg  g fgf ufufufufuf uf ufufuftftf efw tfetrfetf tef tf tefytfyfyf ygy gyegygygy geyg yegy geyeg yg'
			color={colors.yellow}
			isGroup
			bgColor={colors.lightMsgYellow}
		/>
		<ChatMessageItem
			{...user}
			date='oui'
			message='Je test un message pour voir et assez long pour gerer la width du component'
			color={colors.white}
			bgColor={colors.blue}
			isGroup
			me={true}
			state={[{ icon: 'done-all-outline', color: colors.blue, value: 'read' }]}
		/>
		<ChatMessageItem
			{...user}
			date='oui'
			message='Je test un message pour voir et assez long pour gerer la width du component'
			color={colors.red}
			isGroup
			bgColor={colors.lightMsgRed}
		/>
		<ChatMessageItem
			{...user}
			date='oui'
			message='Je test un message pour voir'
			color={colors.blue}
			bgColor={colors.white}
			me={true}
			isGroup
			styleMsg={{ borderColor: colors.blue, borderWidth: 2 }}
			state={[{ icon: 'paper-plane', color: colors.blue, value: 'sending...' }]}
		/>
		<ChatMessageItem
			{...user}
			date='oui'
			message='Je test un message pour voir'
			color={colors.red}
			bgColor={colors.white}
			me={true}
			isGroup
			styleMsg={{ borderColor: colors.red, borderWidth: 2 }}
			state={[
				{ icon: 'alert-circle-outline', color: colors.red, value: 'failed to send!' },
				{ icon: 'paper-plane', color: colors.blue, value: 'retry sending...' },
			]}
		/>
	</View>
)

const ChatFooter: React.FC<{
	isFocus: boolean
	setIsFocus: React.Dispatch<React.SetStateAction<any>>
}> = ({ isFocus, setIsFocus }) => {
	return (
		<View
			style={[
				styles.row,
				styles.centerItems,
				styles.paddingTop,
				styles.paddingLeft,
				styles.paddingRight,
				isFocus && styles.paddingBottom,
				styles.bgWhite,
			]}
		>
			<View
				style={[
					styles.flex,
					styles.borderRadius,
					styles.row,
					styles.littlePadding,
					styles.spaceBetween,
					styles.centerItems,
					{ backgroundColor: isFocus ? colors.lightMsgBlueGrey : colors.lightGrey },
				]}
			>
				<TextInput
					multiline={true}
					onFocus={() => setIsFocus(true)}
					onBlur={() => setIsFocus(false)}
					style={[{ flex: 10 }, isFocus && { color: colors.blue, maxHeight: 80 }]}
					placeholder='Write a secure message...'
					placeholderTextColor={isFocus ? colors.blue : colors.grey}
				/>
				<TouchableOpacity style={[styles.flex, { paddingLeft: 4 }]}>
					<Icon
						name='paper-plane-outline'
						width={30}
						height={30}
						fill={isFocus ? colors.blue : colors.grey}
					/>
				</TouchableOpacity>
			</View>
		</View>
	)
}

export const ChatGroup: React.FC<RequestProps> = ({ user }) => {
	const [isFocus, setIsFocus] = useState(false)
	return (
		<Layout style={[styles.flex]}>
			<SafeAreaView style={[StyleSheet.absoluteFill]}>
				<HeaderChatGroup {...user} />
				<ScrollView contentContainerStyle={[isFocus && styles.littlePaddingBottom]}>
					<InfosChatGroup user={user} />
					<ChatGroupMessageList user={user} />
				</ScrollView>
				<ChatFooter isFocus={isFocus} setIsFocus={setIsFocus} />
			</SafeAreaView>
		</Layout>
	)
}

//
// Chat
//

const ChatHeader: React.FC<UserProps> = ({ avatarUri, name }) => (
	<View style={[styles.padding]}>
		<View style={[styles.row, styles.centerItems, styles.spaceCenter]}>
			<TouchableOpacity style={[styles.flex]}>
				<Icon name='arrow-back-outline' width={30} height={30} />
			</TouchableOpacity>
			<View style={[{ flex: 5 }]}>
				<Text numberOfLines={1} style={[styles.textCenter, { fontSize: 20, fontWeight: 'bold' }]}>
					{name}
				</Text>
			</View>
			<View style={[styles.flex]}>
				<View
					style={[
						styles.center,
						styles.bgWhite,
						styles.shadow,
						styles.spaceCenter,
						styles.centerItems,
						{ width: 40, height: 40, borderRadius: 40 },
					]}
				>
					<Image
						style={[{ width: 35, height: 35, borderRadius: 35 }]}
						source={{ uri: avatarUri }}
					/>
				</View>
			</View>
		</View>
	</View>
)

const InfosChat: React.FC<{}> = () => (
	<View style={[styles.padding]}>
		<View
			style={[
				styles.borderRadius,
				styles.center,
				styles.bgLightGrey,
				{ paddingTop: 2, paddingBottom: 2, paddingRight: 8, paddingLeft: 8, opacity: 0.5 },
			]}
		>
			<Text style={[styles.center, styles.textBlack, { fontSize: 12 }]}>Today</Text>
		</View>
	</View>
)

const ChatList: React.FC<RequestProps> = ({ user }) => (
	<View style={[styles.padding]}>
		<ChatMessageItem
			{...user}
			date='oui'
			message='Bonkur fjhfjhefefbe hjfgvddd g hjheg jgjhgjehgjhg jhge jhghdjkwlfuy wtyrygv gg hrhg rjygr'
			color={colors.blue}
			bgColor={colors.lightMsgBlue}
		/>
		<ChatMessageItem
			{...user}
			date='oui'
			message='Bonkur fjhfjhefefbe hjfgvddd g hjheg jgjhgjehgjhg jhge jhghdjkwlfuy wtyrygv gg hrhg rjygr'
			color={colors.white}
			bgColor={colors.blue}
			me={true}
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

//
// Scan Request
//

const BodyScanRequestAvatar: React.FC<UserProps> = ({ avatarUri, name }) => (
	<View>
		<View
			style={[
				styles.center,
				styles.bgWhite,
				styles.shadow,
				styles.spaceCenter,
				styles.centerItems,
				_stylesRequest.circleAvatar,
			]}
		>
			<Image style={[_stylesRequest.imageAvatar]} source={{ uri: avatarUri }} />
		</View>
		<Text
			category='h6'
			style={[styles.center, styles.fontFamily, styles.textBlack, styles.paddingTop]}
		>
			{name}
		</Text>
	</View>
)

const BodyScanRequestTab: React.FC<BodyRequestTabProps> = ({ name, icon, enable = false }) => (
	<View style={[styles.centerItems, !enable ? { opacity: 0.2 } : null]}>
		<Icon fill={enable ? colors.blue : colors.black} name={icon} width={25} height={25} />
		<Text
			style={[
				enable ? styles.textBlue : styles.textBlack,
				styles.fontFamily,
				{ fontSize: 12, fontWeight: 'bold' },
			]}
		>
			{name}
		</Text>
		<View
			style={[
				enable ? _stylesRequest.bodyRequestTabBarEnable : _stylesRequest.bodyRequestTabBarDisable,
			]}
		/>
	</View>
)

const BodyScanRequestTabs: React.FC<{}> = () => {
	const [enable, setEnable] = useState('Fingerprint')

	const handleEnable = (enable: string) => {
		setEnable(enable)
	}

	return (
		<View style={[styles.marginTop]}>
			<View style={[styles.row, styles.spaceEvenly]}>
				<TouchableOpacity onPress={() => handleEnable('Fingerprint')} style={[styles.flex]}>
					<BodyScanRequestTab
						name='Fingerprint'
						icon='code-outline'
						enable={enable === 'Fingerprint'}
					/>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => handleEnable('Infos')} style={[styles.flex]}>
					<BodyScanRequestTab name='Infos' icon='info-outline' enable={enable === 'Infos'} />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => handleEnable('Devices')} style={[styles.flex]} disabled>
					<BodyScanRequestTab
						name='Devices'
						icon='smartphone-outline'
						enable={enable === 'Devices'}
					/>
				</TouchableOpacity>
			</View>
		</View>
	)
}

const BodyScanRequestContent: React.FC<{}> = () => {
	const [isToggled, setIsToggled] = useState(false)

	const handleToggled = () => {
		setIsToggled(!isToggled)
	}

	return (
		<View style={[styles.bigMarginTop]}>
			<View style={[styles.bgLightBlueGrey, styles.borderRadius, styles.padding]}>
				<View style={[styles.col]}>
					<View style={[styles.row, styles.spaceAround]}>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							72EC
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							F46A
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							56B4
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							AD39
						</Text>
					</View>
					<View style={[styles.row, styles.spaceAround]}>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							C907
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							BBB7
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							1646
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							B09N
						</Text>
					</View>
					<View style={[styles.row, styles.spaceAround]}>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							JH87
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							7JUI
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							QVCS
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							H87H
						</Text>
					</View>
					<View style={[styles.row, styles.spaceAround]}>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							87JD
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							LOW9
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							8883
						</Text>
						<Text
							style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}
						>
							ALW6
						</Text>
					</View>
				</View>
			</View>
			<View
				style={[
					styles.marginTop,
					styles.padding,
					styles.borderRadius,
					{ borderColor: isToggled ? colors.blue : colors.lightBlueGrey, borderWidth: 2 },
				]}
			>
				<View style={[styles.row, styles.spaceAround, styles.centerItems]}>
					<Icon
						name='checkmark-circle-2'
						width={30}
						height={30}
						fill={isToggled ? colors.blue : colors.lightBlueGrey}
					/>
					<Text style={[styles.fontFamily]}>Mark as verified</Text>
					<Toggle status='primary' checked={isToggled} onChange={handleToggled} />
				</View>
				<Text style={[styles.textGrey, styles.marginTop, { fontSize: 10, fontWeight: 'bold' }]}>
					Compare the fingerprint displayed above with the one on Caterpillar’s phone. If they are
					identical, end-to-end encryption is guaranted on you can mark this contact as verified.
				</Text>
			</View>
		</View>
	)
}

const BodyScanRequestButtons: React.FC<{}> = () => (
	<View style={[styles.row, styles.spaceBetween, styles.bigMarginTop]}>
		<TouchableOpacity
			style={[
				styles.bgLightBlue,
				styles.flex,
				styles.centerItems,
				{ borderRadius: 6, paddingTop: 12, paddingBottom: 12 },
			]}
		>
			<Text style={[styles.textBlue, styles.fontFamily, { fontSize: 15, fontWeight: 'bold' }]}>
				ADD THIS CONTACT
			</Text>
		</TouchableOpacity>
	</View>
)

const BodyScanRequest: React.FC<RequestProps> = ({ user }) => (
	<View style={[styles.bigPadding]}>
		<View style={[_stylesRequest.bodyRequestContent]}>
			<BodyScanRequestAvatar {...user} />
			<BodyScanRequestTabs />
			<BodyScanRequestContent />
			<BodyScanRequestButtons />
		</View>
	</View>
)

export const ScanRequest: React.FC<RequestProps> = ({ user }) => {
	const [layout, setLayout] = useState()

	const handleLayout = (e: LayoutChangeEvent) => {
		if (!layout) {
			setLayout(e.nativeEvent.layout.height)
		}
	}

	return (
		<Layout style={[styles.flex, styles.bgRed]}>
			<SafeAreaView style={[styles.flex]}>
				<View
					style={[
						styles.absolute,
						styles.bottom,
						styles.left,
						styles.right,
						styles.bigMarginBottom,
					]}
				>
					<View
						onLayout={(e) => handleLayout(e)}
						style={[
							styles.bgWhite,
							styles.center,
							styles.shadow,
							_stylesRequest.bodyRequest,
							{ borderRadius: 28 },
							layout ? { height: layout - 90 } : null,
						]}
					>
						<BodyScanRequest user={user} />
					</View>
					<TouchableOpacity
						style={[
							styles.bgWhite,
							styles.center,
							styles.spaceCenter,
							styles.centerItems,
							styles.shadow,
							styles.marginTop,
							{ width: 45, height: 45, borderRadius: 22.5 },
						]}
					>
						<Icon
							style={[{ opacity: 0.5 }]}
							name='close-outline'
							width={25}
							height={25}
							fill={colors.grey}
						/>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</Layout>
	)
}

//
// Scan
//

const ScanHeader: React.FC<{}> = () => (
	<View>
		<View
			style={[
				styles.littleMarginTop,
				styles.center,
				{ borderWidth: 2.5, borderColor: colors.lightGrey, width: '12%', borderRadius: 4 },
			]}
		/>
		<View style={[styles.row, styles.padding, styles.spaceBetween, styles.alignItems]}>
			<Text style={[styles.fontFamily, styles.textWhite]} category='h4'>
				Scan QR code
			</Text>
			<Icon
				style={[styles.flex, styles.right]}
				name='code-outline'
				width={40}
				height={40}
				fill={colors.white}
			/>
		</View>
	</View>
)

const ScanBody: React.FC<{}> = () => (
	<View style={[styles.padding]}>
		<View style={[styles.borderRadius, styles.bgBlack, styles.bigPadding]}>
			<View
				style={[styles.borderRadius, { borderColor: colors.white, borderWidth: 10, height: 300 }]}
			/>
		</View>
	</View>
)

const ScanInfos: React.FC<{}> = () => (
	<View style={[styles.marginTop, styles.padding]}>
		<View style={[styles.row, styles.alignItems, styles.padding]}>
			<View
				style={[
					styles.bgLightGrey,
					styles.marginRight,
					{ width: 10, height: 10, borderRadius: 10 },
				]}
			/>
			<Text style={[styles.textLightGrey]}>Scanning a QR code sends a contact request</Text>
		</View>
		<View style={[styles.row, styles.alignItems, styles.padding]}>
			<View
				style={[
					styles.bgLightGrey,
					styles.marginRight,
					{ width: 10, height: 10, borderRadius: 10 },
				]}
			/>
			<Text style={[styles.textLightGrey]}>
				You need to wait for the request to be accepted in order to chat with the contact
			</Text>
		</View>
	</View>
)

export const Scan: React.FC<{}> = () => (
	<Layout style={[styles.flex]}>
		<SafeAreaView>
			<View
				style={[
					styles.bgRed,
					{ borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '100%' },
				]}
			>
				<ScanHeader />
				<ScanBody />
				<ScanInfos />
			</View>
		</SafeAreaView>
	</Layout>
)

//
// Scan Invalid
//

const InvalidScanBody: React.FC<{}> = () => {
	const [layout, setLayout] = useState()
	return (
		<View style={[styles.padding]}>
			<View
				onLayout={(e) => !layout && setLayout(e.nativeEvent.layout.height)}
				style={[
					styles.bgWhite,
					styles.padding,
					styles.borderRadius,
					layout && { height: layout - 78 },
				]}
			>
				<View style={[{ bottom: 78 }]}>
					<View
						style={[
							styles.bgWhite,
							styles.center,
							styles.shadow,
							styles.bigMarginBottom,
							styles.spaceCenter,
							styles.alignItems,
							{ width: 120, height: 120, borderRadius: 60 },
						]}
					>
						<Icon name='alert-circle-outline' width={100} height={100} fill={colors.red} />
					</View>
					<View>
						<Text style={[styles.textRed, styles.textBold, styles.textCenter]}>
							This QR code is invalid!
						</Text>
					</View>
					<View
						style={[styles.borderRadius, styles.bgLightRed, styles.padding, styles.bigMarginTop]}
					>
						<Text
							style={[
								styles.textRed,
								styles.textCenter,
								styles.textBold,
								{ fontSize: 14, fontFamily: 'Courier' },
							]}
						>
							Invalid format: missing characters
						</Text>
					</View>
					<View
						style={[
							{
								borderColor: colors.lightGrey,
								borderWidth: 2,
								borderRadius: 10,
								marginTop: 50,
								paddingLeft: 10,
								paddingRight: 14,
								paddingTop: 8,
								paddingBottom: 8,
							},
							styles.row,
							styles.center,
							styles.alignItems,
							styles.spaceCenter,
							styles.marginBottom,
						]}
					>
						<Icon name='close' width={30} height={30} fill={colors.grey} />
						<Text style={[styles.textGrey, styles.littlePaddingLeft, { fontSize: 17 }]}>
							DISMISS
						</Text>
					</View>
				</View>
			</View>
		</View>
	)
}

export const InvalidScan: React.FC<{}> = () => (
	<Layout style={[styles.flex, styles.centerItems, styles.spaceCenter, styles.bgRed]}>
		<SafeAreaView>
			<InvalidScanBody />
		</SafeAreaView>
	</Layout>
)

//
// ChatSettings
//

const ChatSettingsHeader: React.FC<UserProps> = ({ avatarUri, name }) => (
	<View style={[styles.padding, styles.bgBlue, styles.row]}>
		<TouchableOpacity style={[styles.flex]}>
			<Icon name='arrow-back' width={30} height={30} fill={colors.white} />
		</TouchableOpacity>
		<View style={[{ flex: 5 }]}>
			<View
				style={[
					{ width: 100, height: 100, borderRadius: 50 },
					styles.bgWhite,
					styles.shadow,
					styles.spaceCenter,
					styles.alignItems,
					styles.center,
				]}
			>
				<Image source={{ uri: avatarUri }} style={{ width: 90, height: 90, borderRadius: 45 }} />
			</View>
			<Text
				numberOfLines={1}
				style={[styles.textWhite, styles.center, styles.littlePaddingTop, styles.textBold]}
			>
				{name}
			</Text>
		</View>
		<TouchableOpacity style={[styles.flex, styles.rowRev]}>
			<Icon name='more-horizontal' width={30} height={30} fill={colors.white} />
		</TouchableOpacity>
	</View>
)

const ChatSettingsHeaderButtons: React.FC<{}> = () => (
	<View style={[styles.paddingLeft, styles.paddingRight, styles.paddingTop]}>
		<View style={[styles.flex, styles.row, styles.spaceBetween, styles.alignItems]}>
			<TouchableOpacity
				style={[
					styles.flex,
					styles.padding,
					styles.alignItems,
					styles.justifyContent,
					styles.shadow,
					styles.bgWhite,
					styles.borderRadius,
					{ marginRight: 20, height: 90 },
				]}
			>
				<Icon name='search-outline' width={30} height={30} fill={colors.blue} />
				<Text
					style={[styles.fontFamily, styles.textBlack, styles.textCenter, { paddingTop: 6 }]}
					category='s4'
				>
					Search
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[
					styles.flex,
					styles.padding,
					styles.alignItems,
					styles.justifyContent,
					styles.shadow,
					styles.bgWhite,
					styles.borderRadius,
					{ marginRight: 20, height: 90 },
				]}
			>
				<Icon name='phone-outline' width={30} height={30} fill={colors.green} />
				<Text
					style={[styles.fontFamily, styles.textBlack, styles.textCenter, { paddingTop: 6 }]}
					category='s4'
					numberOfLines={2}
				>
					Call
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[
					styles.flex,
					styles.padding,
					styles.alignItems,
					styles.justifyContent,
					styles.shadow,
					styles.bgWhite,
					styles.borderRadius,
					{ height: 90 },
				]}
			>
				<Icon name='share-outline' width={30} height={30} fill={colors.blue} />
				<Text
					style={[styles.fontFamily, styles.textBlack, styles.textCenter, { paddingTop: 6 }]}
					category='s4'
					numberOfLines={2}
				>
					Share
				</Text>
			</TouchableOpacity>
		</View>
	</View>
)

const ChatSettingsBody: React.FC<{}> = () => (
	<View style={[styles.paddingLeft, styles.paddingRight]}>
		<ButtonSetting name='Medias, links & docs' icon='image-outline' />
		<ButtonSetting name='Receive notifications' icon='bell-outline' toggled />
		<ButtonSetting
			name='Mutual groups'
			icon='people-outline'
			state={{ value: '3 mutuals', color: colors.blue, bgColor: colors.lightBlue }}
		/>
		<ButtonSetting name='Erase conversation' icon='message-circle-outline' iconColor={colors.red} />
	</View>
)

export const ChatSettings: React.FC<RequestProps> = ({ user }) => (
	<Layout style={[styles.flex]}>
		<ScrollView>
			<SafeAreaView
				style={[styles.bgBlue, styles.borderBottomLeftRadius, styles.borderBottomRightRadius]}
			>
				<ChatSettingsHeader {...user} />
			</SafeAreaView>
			<ChatSettingsHeaderButtons />
			<ChatSettingsBody />
		</ScrollView>
	</Layout>
)

//
// ChatSettingsContact
//

const ChatSettingsContactHeaderContent: React.FC<{}> = () => (
	<View style={[styles.bigMarginTop]}>
		<View style={[styles.bgLightBlueGrey, styles.borderRadius, styles.padding]}>
			<View style={[styles.col]}>
				<View style={[styles.row, styles.spaceAround]}>
					<Text style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}>
						72EC
					</Text>
					<Text style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}>
						F46A
					</Text>
					<Text style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}>
						56B4
					</Text>
					<Text style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}>
						AD39
					</Text>
				</View>
				<View style={[styles.row, styles.spaceAround]}>
					<Text style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}>
						C907
					</Text>
					<Text style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}>
						BBB7
					</Text>
					<Text style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}>
						1646
					</Text>
					<Text style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}>
						B09N
					</Text>
				</View>
				<View style={[styles.row, styles.spaceAround]}>
					<Text style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}>
						JH87
					</Text>
					<Text style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}>
						7JUI
					</Text>
					<Text style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}>
						QVCS
					</Text>
					<Text style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}>
						H87H
					</Text>
				</View>
				<View style={[styles.row, styles.spaceAround]}>
					<Text style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}>
						87JD
					</Text>
					<Text style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}>
						LOW9
					</Text>
					<Text style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}>
						8883
					</Text>
					<Text style={[styles.textBlue, styles.fontCourier, { fontSize: 12, fontWeight: 'bold' }]}>
						ALW6
					</Text>
				</View>
			</View>
		</View>
	</View>
)

const ChatSettingsContactHeaderAvatar: React.FC<{ UserProps; isToggle: boolean }> = ({
	avatarUri,
	name,
	isToggle,
}) => (
	<View>
		<View
			style={[
				styles.center,
				styles.bgWhite,
				styles.shadow,
				styles.spaceCenter,
				styles.centerItems,
				_stylesRequest.circleAvatar,
			]}
		>
			<Image style={[_stylesRequest.imageAvatar]} source={{ uri: avatarUri }} />
		</View>
		<View style={[styles.row, styles.center, styles.alignItems, styles.marginTop]}>
			<Text category='h6' style={[styles.fontFamily, styles.textBlack, styles.textBold]}>
				{name}
			</Text>
			{isToggle && (
				<View style={[{ paddingLeft: 6 }]}>
					<Icon name='checkmark-circle-2' width={20} height={20} fill={colors.blue} />
				</View>
			)}
		</View>
	</View>
)

const ChatSettingsContactHeader: React.FC<{ RequestProps; isToggle: boolean }> = ({
	user,
	isToggle,
}) => (
	<View style={[styles.bigPadding]}>
		<View style={[_stylesRequest.bodyRequestContent]}>
			<ChatSettingsContactHeaderAvatar {...user} isToggle={isToggle} />
			<BodyScanRequestTabs />
			<ChatSettingsContactHeaderContent />
		</View>
	</View>
)

const ChatSettingsContactHeaderNav: React.FC<{}> = () => (
	<View style={[styles.padding]}>
		<View style={[styles.row, styles.spaceBetween, styles.flex, styles.alignItems]}>
			<TouchableOpacity>
				<Icon name='arrow-back' width={25} height={25} fill={colors.white} />
			</TouchableOpacity>
			<TouchableOpacity>
				<Icon name='share-outline' width={25} height={25} fill={colors.white} />
			</TouchableOpacity>
		</View>
	</View>
)

const ChatSettingsContactBody: React.FC<{
	isToggle: boolean
	setIsToggle: React.Dispatch<React.SetStateAction<any>>
}> = ({ isToggle, setIsToggle }) => (
	<View style={[styles.padding]}>
		<ButtonSetting
			icon='checkmark-circle-2'
			name='Mark as verified'
			iconDependToggle
			toggled
			varToggle={isToggle}
			actionToggle={setIsToggle}
		/>
		<ButtonSetting name='Block contact' icon='slash-outline' iconColor={colors.red} />
		<ButtonSetting name='Delete contact' icon='trash-2-outline' iconColor={colors.red} />
	</View>
)

export const ChatSettingsContact: React.FC<RequestProps> = ({ user }) => {
	const [layout, setLayout] = useState()
	const [isToggle, setIsToggle] = useState(true)

	return (
		<Layout style={[styles.flex]}>
			<ScrollView>
				<SafeAreaView style={[styles.bgBlue]}>
					<View style={[styles.absolute, styles.left, styles.right, styles.bigMarginTop]}>
						<View
							style={[styles.bgBlue, styles.borderBottomLeftRadius, styles.borderBottomRightRadius]}
						>
							<View
								onLayout={(e) => !layout && setLayout(e.nativeEvent.layout.height)}
								style={[
									styles.bgWhite,
									styles.center,
									styles.shadow,
									{ borderRadius: 28, marginTop: 90, width: '92%' },
									layout && { height: layout - 90 },
								]}
							>
								<ChatSettingsContactHeader user={user} isToggle={isToggle} />
							</View>
						</View>
						<ChatSettingsContactBody isToggle={isToggle} setIsToggle={setIsToggle} />
					</View>
					<ChatSettingsContactHeaderNav />
				</SafeAreaView>
			</ScrollView>
		</Layout>
	)
}
