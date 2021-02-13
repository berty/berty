import React, { useState } from 'react'
import { View, StyleProp, TouchableOpacity, ViewStyle } from 'react-native'
import { Text, Icon, Toggle } from '@ui-kitten/components'
import { useStyles, ColorsTypes } from '@berty-tech/styles'
import { TabBar } from './TabBar'
import { FingerprintContent } from './FingerprintContent'
import { Modal } from './Modal'
import { ProceduralCircleAvatar } from './ProceduralCircleAvatar'
import { useContact } from '@berty-tech/store/hooks'

//
// RequestButtons
//

// Types

type Buttons = {
	title: string
	icon: string
	action?: any
	disabled?: boolean
	titleColor?: ColorsTypes
	iconColor?: ColorsTypes
	iconSize?: number
	bgColor?: ColorsTypes
	style?: StyleProp<any>[]
}

type RequestButtonItemProps = Buttons

type RequestButtonsProps = {
	buttons?: Buttons[]
}

const RequestButtonItem: React.FC<RequestButtonItemProps> = ({
	icon,
	title,
	action = null,
	iconSize = 25,
	iconColor = 'blue',
	titleColor = 'blue',
	style = null,
	disabled = false,
}) => {
	const [{ row, flex, text, opacity }] = useStyles()
	return (
		<TouchableOpacity
			activeOpacity={disabled ? 0.5 : 0.2}
			style={[flex.tiny, row.center, style, disabled ? opacity(0.5) : null]}
			onPress={() => action && action()}
		>
			<Icon
				name={icon}
				width={iconSize}
				height={iconSize}
				fill={iconColor}
				style={[row.item.justify]}
			/>
			<Text style={[text.bold.medium, text.size.medium, row.item.justify, { color: titleColor }]}>
				{title}
			</Text>
		</TouchableOpacity>
	)
}

export const RequestButtons: React.FC<RequestButtonsProps> = ({ buttons = null }) => {
	const [{ row, padding, margin }] = useStyles()
	return (
		<View style={[row.left, padding.medium, margin.top.medium]}>
			{buttons && buttons.map((obj: any, i: number) => <RequestButtonItem key={i} {...obj} />)}
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
	name,
	style = null,
	isVerified = false,
}) => {
	const [{ row, flex, text, margin, color }] = useStyles()
	return (
		<View style={[row.left, flex.tiny, { justifyContent: 'center' }, style]}>
			<View style={[flex.tiny, row.item.bottom, row.center]}>
				<Text category='h6' style={[text.align.center, text.color.black]} numberOfLines={1}>
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
					<Text style={[padding.left.small, column.item.center]}>Mark as verified</Text>
				</View>
				<View style={column.item.center}>
					<Toggle status='primary' checked={isToggled} onChange={handleToggled} />
				</View>
			</View>
			<Text
				style={[text.color.grey, margin.top.medium, text.bold.medium, _styles.markAsVerifiedText]}
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
	contactPublicKey: string
	markAsVerified?: boolean
	buttons?: Buttons[]
	blurAmount?: number
	blurColor?: ViewStyle['backgroundColor']
	blurColorOpacity?: number
}

type BodyRequestProps = {
	markAsVerified: boolean
	contactPublicKey: string
	buttons?: Buttons[]
}

const BodyRequestContent: React.FC<{}> = ({ children }) => {
	const [{ margin }] = useStyles()
	return (
		<View style={[margin.top.big]}>
			<View>{children}</View>
		</View>
	)
}

const SelectedContent = ({
	contentName,
	markAsVerified,
	publicKey,
}: {
	contentName: string
	markAsVerified: boolean
	publicKey: string
}) => {
	switch (contentName) {
		case 'fingerprint':
			return (
				<View>
					<FingerprintContent seed={publicKey} isEncrypted={false} />
					{markAsVerified && <MarkAsVerified />}
				</View>
			)
		default:
			return <Text>Error: Unknown content name "{contentName}"</Text>
	}
}

const BodyRequest: React.FC<BodyRequestProps> = ({
	contactPublicKey,
	markAsVerified,
	buttons = null,
}) => {
	const [{ padding, absolute, row, text, border }] = useStyles()
	const [selectedContent, setSelectedContent] = useState('fingerprint')
	const contact = useContact(contactPublicKey)
	return (
		<View style={[padding.horizontal.medium, padding.bottom.medium]}>
			<View style={[absolute.scale({ top: -70 }), row.item.justify, border.shadow.medium]}>
				<ProceduralCircleAvatar seed={contactPublicKey} size={140} diffSize={40} />
			</View>
			<View style={[padding.horizontal.medium, padding.top.scale(75)]}>
				<Text style={[padding.vertical.tiny, text.align.center, text.size.big]}>
					{contact?.displayName || ''}
				</Text>
				<TabBar
					tabs={[
						{ key: 'fingerprint', name: 'Fingerprint', icon: 'fingerprint', iconPack: 'custom' },
						{ key: 'info', name: 'Infos', icon: 'info-outline', buttonDisabled: true },
						{
							key: 'devices',
							name: 'Devices',
							icon: 'smartphone',
							iconPack: 'feather',
							iconTransform: [{ rotate: '22.5deg' }, { scale: 0.8 }],
							buttonDisabled: true,
						},
					]}
					onTabChange={setSelectedContent}
				/>
				<BodyRequestContent>
					<SelectedContent
						contentName={selectedContent}
						markAsVerified={markAsVerified}
						publicKey={contactPublicKey}
					/>
				</BodyRequestContent>
			</View>
			<RequestButtons buttons={buttons || []} />
		</View>
	)
}

export const Request: React.FC<RequestComponentProps> = ({
	contactPublicKey,
	markAsVerified = true,
	buttons = null,
	blurColor,
	blurAmount,
	blurColorOpacity,
}) => (
	<Modal blurColor={blurColor} blurAmount={blurAmount} blurColorOpacity={blurColorOpacity}>
		<BodyRequest
			contactPublicKey={contactPublicKey}
			markAsVerified={markAsVerified}
			buttons={buttons || []}
		/>
	</Modal>
)
