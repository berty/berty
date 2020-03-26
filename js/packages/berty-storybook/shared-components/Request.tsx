import React, { useState, useEffect } from 'react'
import { View, StyleProp, TouchableOpacity } from 'react-native'
import { Text, Icon, Toggle } from 'react-native-ui-kitten'
import { UserProps } from '../shared-props/User'
import { useStyles, ColorsTypes } from '@berty-tech/styles'
import { TabBar } from './TabBar'
import { FingerprintContent } from './FingerprintContent'
import { Modal } from './Modal'
import { GroupCircleAvatar } from './CircleAvatar'
import { ProceduralCircleAvatar } from './ProceduralCircleAvatar'

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
	iconColor?: ColorsTypes
	textProps: string
	textColor?: ColorsTypes
	style?: StyleProp<any>
}

type RequestButtonsProps = {
	buttons?: {
		title: string
		titleColor?: ColorsTypes
		icon: string
		iconColor?: ColorsTypes
		bgColor?: ColorsTypes
		style?: StyleProp<any>[]
	}[]
}

// Styles
const useStylesRequestButtons = () => {
	const [{ border, opacity, padding, margin, background }] = useStyles()
	return {
		requestButtonRefuse: [
			border.color.grey,
			border.big,
			opacity(0.5),
			border.radius.scale(6),
			padding.vertical.scale(7),
			margin.right.scale(10),
		],
		requestButtonAccept: [
			border.radius.scale(6),
			padding.vertical.scale(7),
			margin.left.scale(10),
			background.light.blue,
		],
	}
}

const RequestButtonItem: React.FC<RequestButtonItemProps> = ({
	icon,
	iconSize = 30,
	iconColor = 'blue',
	textProps,
	textColor = 'blue',
	style = null,
}) => {
	const [{ row, flex, text, column }] = useStyles()
	return (
		<TouchableOpacity style={[flex.tiny, row.center, style]}>
			<Icon
				name={icon}
				width={iconSize}
				height={iconSize}
				fill={iconColor}
				style={column.item.center}
			/>
			<Text
				style={[
					text.bold,
					text.family,
					text.align.center,
					column.item.center,
					{ color: textColor },
				]}
			>
				{textProps}
			</Text>
		</TouchableOpacity>
	)
}

export const RequestButtons: React.FC<RequestButtonsProps> = ({ buttons = null }) => {
	const [arr, setArr] = useState()
	const _styles = useStylesRequestButtons()
	const [{ row, padding, margin, color }] = useStyles()
	useEffect(() => {
		if (!arr) {
			if (!buttons) {
				setArr([
					{
						style: _styles.requestButtonRefuse,
						title: 'REFUSE',
						titleColor: color.grey,
						icon: 'close-outline',
						iconColor: color.grey,
					},
					{
						style: _styles.requestButtonAccept,
						title: 'ACCEPT',
						titleColor: color.blue,
						icon: 'checkmark-outline',
						iconColor: color.blue,
					},
				])
			} else {
				setArr(buttons)
			}
		}
	}, [
		arr,
		buttons,
		_styles.requestButtonRefuse,
		_styles.requestButtonAccept,
		color.grey,
		color.blue,
	])
	return (
		<View style={[row.left, padding.medium, margin.top.medium]}>
			{arr &&
				arr.map((obj: any) => (
					<RequestButtonItem
						style={obj.style}
						icon={obj.icon}
						iconColor={obj.iconColor}
						textProps={obj.title}
						textColor={obj.titleColor}
					/>
				))}
		</View>
	)
}

//
// RequestAvatar => (Group and contact)
//

// Types
type RequestAvatarProps = {
	seed?: string
	name: string
	size?: number
	secondAvatarUri?: string
	isGroup?: boolean
	style?: StyleProp<any>
	isVerified?: boolean
}

export const RequestAvatar: React.FC<RequestAvatarProps> = ({
	seed,
	name,
	size = 130,
	secondAvatarUri = null,
	isGroup = false,
	style = null,
	isVerified = false,
}) => {
	const [{ height, row, flex, text, margin, color, absolute }] = useStyles()
	return (
		<View style={[height(size), row.left, flex.tiny, { justifyContent: 'center' }, style]}>
			<View style={[flex.tiny, row.item.bottom, row.center]}>
				<Text category='h6' style={[text.align.center, text.family, text.color.black]}>
					{name}
				</Text>
				{isVerified && (
					<Icon
						style={[margin.left.small]}
						name='checkmark-circle-2'
						width={20}
						height={20}
						fill={color.blue}
					/>
				)}
			</View>
			{/*!isGroup || !secondAvatarUri ? (
				<ProceduralCircleAvatar
					seed={seed}
					size={size}
					diffSize={20}
					style={[absolute.scale({ top: -size / 2 })]}
				/>
			) : (
				<GroupCircleAvatar firstAvatarUri={avatarUri} secondAvatarUri={secondAvatarUri} />
			)*/}
		</View>
	)
}

//
// RequestMarkedAsVerified
//

// Styles
const useStylesMarkAsVerified = () => {
	const [{ border, text }] = useStyles()
	return {
		markAsVerified: border.big,
		markAsVerifiedText: text.size.tiny,
	}
}

export const MarkAsVerified: React.FC<{}> = () => {
	const [isToggled, setIsToggled] = useState(false)

	const handleToggled = () => setIsToggled(!isToggled)
	const _styles = useStylesMarkAsVerified()
	const [{ margin, padding, border, color, row, column, text }] = useStyles()

	return (
		<View
			style={[
				margin.top.medium,
				padding.medium,
				border.radius.medium,
				_styles.markAsVerified,
				{ borderColor: isToggled ? color.blue : '#E8E9FC' },
			]}
		>
			<View style={[row.fill]}>
				<View style={[row.fill, column.item.center]}>
					<Icon
						name='checkmark-circle-2'
						width={30}
						height={30}
						fill={isToggled ? color.blue : '#E8E9FC'}
						style={[column.item.center]}
					/>
					<Text style={[text.family, padding.left.small, column.item.center]}>
						Mark as verified
					</Text>
				</View>
				<View style={column.item.center}>
					<Toggle status='primary' checked={isToggled} onChange={handleToggled} />
				</View>
			</View>
			<Text style={[text.color.grey, margin.top.medium, text.bold, _styles.markAsVerifiedText]}>
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

const BodyRequestContent: React.FC<BodyRequestContentProps> = ({ markAsVerified }) => {
	const [{ margin }] = useStyles()
	return (
		<View style={[margin.top.big]}>
			<FingerprintContent />
			{markAsVerified && <MarkAsVerified />}
		</View>
	)
}

const BodyRequest: React.FC<BodyRequestProps> = ({ user, markAsVerified, buttons = null }) => {
	const [{ padding, row, column }] = useStyles()
	return (
		<View style={[padding.horizontal.medium, padding.bottom.medium]}>
			<RequestAvatar size={100} avatarUri={user?.avatarUri} name={user?.name} />
			<View style={padding.horizontal.medium}>
				<TabBar tabType='contact' />
				<BodyRequestContent markAsVerified={markAsVerified} />
			</View>
			<RequestButtons buttons={buttons || []} />
		</View>
	)
}

export const Request: React.FC<RequestComponentProps> = ({
	user,
	markAsVerified = true,
	buttons = null,
}) => (
	<Modal>
		<BodyRequest user={user} markAsVerified={markAsVerified} buttons={buttons || []} />
	</Modal>
)
