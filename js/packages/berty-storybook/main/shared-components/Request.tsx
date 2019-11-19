import React, { useState } from 'react'
import { View, SafeAreaView, StyleSheet, StyleProp, TouchableOpacity } from 'react-native'
import { Layout, Text, Icon, Toggle } from 'react-native-ui-kitten'
import { styles, colors, requestStyles } from '../../styles'
import { UserProps, RequestProps } from '../../shared-props/User'
import { TabBar } from '../../shared-components/TabBar'
import { FingerprintContent } from '../../shared-components/FingerprintContent'
import { Modal } from '../../shared-components/Modal'
import { CircleAvatar, GroupCircleAvatar } from '../../shared-components/CircleAvatar'
//
// RequestButtons
//

// Types
type RequestButtonItemProps = {
	// icon
	icon: string
	iconSize?: number
	iconColor?: string
	text: string
	textColor?: string
	style?: StyleProp<any>
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
		style={[styles.row, styles.flex, styles.spaceCenter, styles.centerItems, style]}
	>
		<Icon name={icon} width={iconSize} height={iconSize} fill={iconColor} />
		<Text style={[styles.fontFamily, styles.textBold, { color: textColor }]}>{text}</Text>
	</TouchableOpacity>
)

export const RequestButtons: React.FC<{}> = () => (
	<View style={[styles.row, styles.bigMarginTop]}>
		<RequestButtonItem
			style={_requestButtonsStyles.requestButtonRefuse}
			icon='close-outline'
			iconColor={colors.grey}
			text='REFUSE'
			textColor={colors.grey}
		/>
		<RequestButtonItem
			style={_requestButtonsStyles.requestButtonAccept}
			icon='checkmark-outline'
			text='ACCEPT'
		/>
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
}

export const RequestAvatar: React.FC<RequestAvatarProps> = ({
	avatarUri,
	name,
	size = 130,
	secondAvatarUri = null,
	isGroup = false,
	style = null,
}) => (
	<View style={[style]}>
		{!isGroup || !secondAvatarUri ? (
			<CircleAvatar avatarUri={avatarUri} size={size} />
		) : (
			<GroupCircleAvatar firstAvatarUri={avatarUri} secondAvatarUri={secondAvatarUri} />
		)}
		<Text
			category='h6'
			style={[styles.center, styles.fontFamily, styles.textBlack, styles.paddingTop]}
		>
			{name}
		</Text>
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

const BodyRequestContent: React.FC<{}> = () => (
	<View style={[styles.bigMarginTop]}>
		<FingerprintContent />
		<MarkAsVerified />
	</View>
)

const BodyRequest: React.FC<RequestProps> = ({ user }) => (
	<View style={[styles.bigPadding]}>
		<View style={[requestStyles.bodyRequestContent]}>
			<RequestAvatar style={styles.center} {...user} />
			<TabBar tabType='contact' />
			<BodyRequestContent />
			<RequestButtons />
		</View>
	</View>
)

export const Request: React.FC<RequestProps> = ({ user }) => (
	<Modal diffHeight={60}>
		<BodyRequest user={user} />
	</Modal>
)
