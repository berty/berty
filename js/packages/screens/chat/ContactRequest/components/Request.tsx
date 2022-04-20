import React, { useState } from 'react'
import { View, StyleProp, TouchableOpacity, ViewStyle } from 'react-native'
import { Icon } from '@ui-kitten/components'

import { useThemeColor } from '@berty/store/hooks'
import { useStyles, ColorsTypes } from '@berty/contexts/styles'
import { Toggle } from '@berty/components/shared-components/Toggle'
import { useContact } from '@berty/hooks'

import { TabBar } from '@berty/components/shared-components/TabBar'
import { FingerprintContent } from '@berty/components/shared-components/FingerprintContent'
import { Modal } from '@berty/components/shared-components/Modal'
import { ContactAvatar } from '@berty/components/avatars'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'

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
	iconColor,
	titleColor,
	style = null,
	disabled = false,
}) => {
	const { row, flex, text, opacity } = useStyles()
	const colors = useThemeColor()

	if (!iconColor) {
		iconColor = colors['background-header']
	}
	if (!titleColor) {
		titleColor = colors['background-header']
	}
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
			<UnifiedText style={[text.bold, row.item.justify, { color: titleColor }]}>
				{title}
			</UnifiedText>
		</TouchableOpacity>
	)
}

const RequestButtons: React.FC<RequestButtonsProps> = ({ buttons = null }) => {
	const { row, padding, margin } = useStyles()
	return (
		<View style={[row.left, padding.medium, margin.top.medium]}>
			{buttons && buttons.map((obj: any, i: number) => <RequestButtonItem key={i} {...obj} />)}
		</View>
	)
}

const MarkAsVerified: React.FC<{}> = () => {
	const [isToggled, setIsToggled] = useState(false)

	const handleToggled = () => setIsToggled(!isToggled)
	const { margin, padding, border, row, column, text } = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[
				margin.top.medium,
				padding.medium,
				border.radius.medium,
				border.big,
				{ borderColor: isToggled ? colors['background-header'] : colors['input-background'] },
			]}
		>
			<View style={[row.fill]}>
				<View style={[row.fill, column.item.center]}>
					<Icon
						name='checkmark-circle-2'
						width={30}
						height={30}
						fill={isToggled ? colors['background-header'] : colors['input-background']}
						style={[column.item.center]}
					/>
					<UnifiedText style={[padding.left.small, column.item.center]}>
						Mark as verified
					</UnifiedText>
				</View>
				<View style={column.item.center}>
					<Toggle status='primary' checked={isToggled} onChange={handleToggled} />
				</View>
			</View>
			<UnifiedText
				style={[margin.top.medium, text.bold, text.size.tiny, { color: colors['secondary-text'] }]}
			>
				Compare the fingerprint displayed above with the one on Caterpillar’s phone. If they are
				identical, end-to-end encryption is guaranted on you can mark this contact as verified.
			</UnifiedText>
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
	const { margin } = useStyles()
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
			return <UnifiedText>Error: Unknown content name "{contentName}"</UnifiedText>
	}
}

const BodyRequest: React.FC<BodyRequestProps> = ({
	contactPublicKey,
	markAsVerified,
	buttons = null,
}) => {
	const { padding, absolute, row, text, border } = useStyles()
	const [selectedContent, setSelectedContent] = useState('fingerprint')
	const contact = useContact(contactPublicKey)
	const colors = useThemeColor()
	return (
		<View style={[padding.horizontal.medium, padding.bottom.medium]}>
			<View
				style={[
					absolute.scale({ top: -70 }),
					row.item.justify,
					border.shadow.medium,
					{ shadowColor: colors.shadow },
				]}
			>
				<ContactAvatar publicKey={contactPublicKey} size={140} />
			</View>
			<View style={[padding.horizontal.medium, padding.top.scale(75)]}>
				<UnifiedText style={[padding.vertical.tiny, text.align.center, text.size.big]}>
					{contact?.displayName || ''}
				</UnifiedText>
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
