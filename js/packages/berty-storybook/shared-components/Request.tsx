import React, { useState } from 'react'
import { View, StyleSheet, StyleProp, TouchableOpacity } from 'react-native'
import { Text, Icon, Toggle } from 'react-native-ui-kitten'
import { UserProps } from '../shared-props/User'
import { styles, colors } from '@berty-tech/styles'
import { TabBar } from './TabBar'
import { FingerprintContent } from './FingerprintContent'
import { Modal } from './Modal'
import { CircleAvatar, GroupCircleAvatar } from './CircleAvatar'

//
// RequestButtons
//

// Types
type RequestProps = {
	accept: (arg0: { id: number }) => Promise<{}>
	decline: (arg0: { id: number }) => Promise<{}>
}

type RequestButtonItemProps = {
	icon: string
	iconSize?: number
	iconColor?: string
	text: string
	textColor?: string
	style?: StyleProp<any>
}

type RequestButtonsProps = {
	buttons?: {
		title: string
		titleColor?: string
		icon: string
		iconColor?: string
		bgColor?: string
		style?: StyleProp<any>[]
	}[]
}

// Styles
const _requestButtonsStyles = StyleSheet.create({
	requestButtonRefuse: {
		borderColor: colors.grey,
		borderWidth: 2,
		opacity: 0.5,
		borderRadius: 6,
		paddingTop: 7,
		paddingBottom: 7,
		marginRight: 10,
	},
	requestButtonAccept: {
		borderRadius: 6,
		paddingTop: 7,
		paddingBottom: 7,
		marginLeft: 10,
		backgroundColor: colors.lightBlue,
	},
})

const RequestButtonItem: React.FC<RequestButtonItemProps> = ({
	icon,
	iconSize = 30,
	iconColor = colors.blue,
	text,
	textColor = colors.blue,
	style = null,
}) => (
	<TouchableOpacity
		style={[styles.row, styles.flex, styles.spaceEvenly, styles.centerItems, style]}
	>
		<Icon name={icon} width={iconSize} height={iconSize} fill={iconColor} />
		<Text style={[styles.fontFamily, styles.textBold, { color: textColor }]}>{text}</Text>
	</TouchableOpacity>
)

export const RequestButtons: React.FC<RequestButtonsProps> = ({
	buttons = [
		{
			style: _requestButtonsStyles.requestButtonRefuse,
			title: 'REFUSE',
			titleColor: colors.grey,
			icon: 'close-outline',
			iconColor: colors.grey,
		},
		{
			style: _requestButtonsStyles.requestButtonAccept,
			title: 'ACCEPT',
			titleColor: colors.blue,
			icon: 'checkmark-outline',
			iconColor: colors.blue,
		},
	],
}) => (
	<View style={[styles.row, styles.padding, styles.marginTop]}>
		{buttons &&
			buttons.map((obj: any) => (
				<RequestButtonItem
					style={obj.style}
					icon={obj.icon}
					iconColor={obj.iconColor}
					text={obj.title}
					textColor={obj.titleColor}
				/>
			))}
	</View>
)

//
// RequestAvatar => (Group and contact)
//

// Types
type RequestAvatarProps = {
	avatarUri: string
	name: string
	size?: number
	secondAvatarUri?: string
	isGroup?: boolean
	style?: StyleProp<any>
	isVerified?: boolean
}

export const RequestAvatar: React.FC<RequestAvatarProps> = ({
	avatarUri,
	name,
	size = 130,
	secondAvatarUri = null,
	isGroup = false,
	style = null,
	isVerified = false,
}) => (
	<View
		style={[
			{ height: size },
			styles.row,
			styles.flex,
			styles.spaceCenter,
			styles.alignItems,
			style,
		]}
	>
		<View style={[styles.flex, styles.end, styles.row, styles.alignItems, styles.spaceCenter]}>
			<Text category='h6' style={[styles.textCenter, styles.fontFamily, styles.textBlack]}>
				{name}
			</Text>
			{isVerified && (
				<Icon
					style={[styles.littleMarginLeft]}
					name='checkmark-circle-2'
					width={20}
					height={20}
					fill={colors.blue}
				/>
			)}
		</View>
		{!isGroup || !secondAvatarUri ? (
			<CircleAvatar
				avatarUri={avatarUri}
				size={size}
				style={[styles.absolute, { top: -size / 2 }]}
			/>
		) : (
			<GroupCircleAvatar firstAvatarUri={avatarUri} secondAvatarUri={secondAvatarUri} />
		)}
	</View>
)

//
// RequestMarkedAsVerified
//

// Styles
const _markAsVerifiedStyles = StyleSheet.create({
	markAsVerified: {
		borderWidth: 2,
	},
	markAsVerifiedText: {
		fontSize: 10,
	},
})

export const MarkAsVerified: React.FC<{}> = () => {
	const [isToggled, setIsToggled] = useState(false)

	const handleToggled = () => setIsToggled(!isToggled)

	return (
		<View
			style={[
				styles.marginTop,
				styles.padding,
				styles.borderRadius,
				_markAsVerifiedStyles.markAsVerified,
				{ borderColor: isToggled ? colors.blue : colors.lightBlueGrey },
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
			<Text
				style={[
					styles.textGrey,
					styles.marginTop,
					styles.textBold,
					_markAsVerifiedStyles.markAsVerifiedText,
				]}
			>
				Compare the fingerprint displayed above with the one on Caterpillar’s phone. If they are
				identical, end-to-end encryption is guaranted on you can mark this contact as verified.
			</Text>
		</View>
	)
}

//
// Request contact => ScanRequest/RequestContact
//

// Types
type RequestComponentProps = {
	user: UserProps
	markAsVerified?: boolean
	buttons?: {
		title: string
		titleColor?: string
		icon: string
		iconColor?: string
		bgColor?: string
	}[]
}

type BodyRequestProps = {
	user: UserProps
	markAsVerified: boolean
	buttons?: {
		title: string
		titleColor?: string
		icon: string
		iconColor?: string
		bgColor?: string
		style?: StyleProp<any>[]
	}[]
}

type BodyRequestContentProps = {
	markAsVerified: boolean
}

const BodyRequestContent: React.FC<BodyRequestContentProps> = ({ markAsVerified }) => (
	<View style={[styles.bigMarginTop]}>
		<FingerprintContent />
		{markAsVerified && <MarkAsVerified />}
	</View>
)

const BodyRequest: React.FC<BodyRequestProps> = ({ user, markAsVerified, buttons = null }) => (
	<View style={[styles.paddingHorizontal, styles.paddingBottom]}>
		<RequestAvatar
			style={styles.alignItems}
			size={100}
			avatarUri={user?.avatarUri}
			name={user?.name}
		/>
		<View style={[styles.paddingRight, styles.paddingLeft]}>
			<TabBar tabType='contact' />
			<BodyRequestContent markAsVerified={markAsVerified} />
		</View>
		<RequestButtons buttons={buttons || []} />
	</View>
)

export const Request: React.FC<RequestComponentProps> = ({
	user,
	markAsVerified = true,
	buttons = null,
}) => (
	<Modal>
		<BodyRequest user={user} markAsVerified={markAsVerified} buttons={buttons || []} />
	</Modal>
)
