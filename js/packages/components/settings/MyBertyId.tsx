import React, { useState } from 'react'
import { View, TouchableOpacity, StyleSheet, ScrollView, Share } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { TabBar } from '../shared-components/TabBar'
import { RequestAvatar } from '../shared-components/Request'
import { Messenger } from '@berty-tech/hooks'
import { useNavigation } from '@berty-tech/navigation'
import QRCode from 'react-native-qrcode-svg'
import { FingerprintContent } from '../shared-components/FingerprintContent'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDimensions } from '@react-native-community/hooks'
import { scaleSize } from '@berty-tech/styles/constant'
//
// Settings My Berty ID Vue
//

// Styles

const useStylesBertyId = () => {
	const { height: windowHeight, width: windowWidth } = useDimensions().window
	const iPadShortEdge = 768
	const iPadLongEdge = 1024
	const bertyIdButtonSize = 60
	const bertyIdContentScaleFactor = 0.66
	const iconShareSize = 26
	const iconArrowBackSize = 30
	const iconIdSize = 45
	const titleSize = 26
	const requestAvatarSize = 90
	return {
		windowHeight,
		windowWidth,
		isLandscape: windowHeight < windowWidth,
		isGteIpadSize:
			Math.min(windowHeight, windowWidth) >= iPadShortEdge &&
			Math.max(windowHeight, windowWidth) >= iPadLongEdge,
		bertyIdButtonSize,
		bertyIdContentScaleFactor,
		iconShareSize,
		iconArrowBackSize,
		iconIdSize,
		titleSize,
		requestAvatarSize,
		styleBertyIdButton: {
			width: bertyIdButtonSize,
			height: bertyIdButtonSize,
			borderRadius: bertyIdButtonSize / 2,
			marginRight: bertyIdButtonSize,
			bottom: bertyIdButtonSize / 2,
		},
		styleBertyIdContent: { paddingBottom: bertyIdButtonSize / 2 + 10 },
	}
}

const BertyIdContent: React.FC<{}> = ({ children }) => {
	const [{ column }] = useStyles()

	return (
		<View>
			<View style={[column.item.center]}>{children}</View>
		</View>
	)
}

const ContactRequestQR = () => {
	const client = Messenger.useClient()
	const [{ padding }] = useStyles()
	const {
		isGteIpadSize,
		windowHeight,
		windowWidth,
		titleSize,
		bertyIdContentScaleFactor,
	} = useStylesBertyId()
	const qrCodeSize = isGteIpadSize
		? Math.min(windowHeight, windowWidth) * 0.5
		: Math.min(windowHeight * bertyIdContentScaleFactor, windowWidth * bertyIdContentScaleFactor) -
		  1.25 * titleSize

	if (!client?.deepLink) {
		return <Text>Internal error</Text>
	}

	// I would like to use binary mode in QR but the scanner used seems to not support it, extended tests were done
	return (
		<View style={[padding.top.big]}>
			<QRCode size={qrCodeSize} value={client.deepLink} />
		</View>
	)
}

const Fingerprint: React.FC = () => {
	const client = Messenger.useClient()
	const [{ padding }] = useStyles()
	const { bertyIdContentScaleFactor, windowHeight, windowWidth } = useStylesBertyId()

	if (!client) {
		return <Text>Client not initialized</Text>
	}
	return (
		<View
			style={[
				padding.top.big,
				{ width: bertyIdContentScaleFactor * Math.min(windowHeight, windowWidth) },
			]}
		>
			<FingerprintContent seed={client.accountPk} />
		</View>
	)
}

const SelectedContent: React.FC<{ contentName: string }> = ({ contentName }) => {
	switch (contentName) {
		case 'QR':
			return <ContactRequestQR />
		case 'Fingerprint':
			return <Fingerprint />
		default:
			return <Text>Error: Unknown content name "{contentName}"</Text>
	}
}

const BertIdBody: React.FC<{ user: any }> = ({ user }) => {
	const [{ background, border, margin, padding, opacity }] = useStyles()
	const { styleBertyIdContent, requestAvatarSize } = useStylesBertyId()
	const [selectedContent, setSelectedContent] = useState('QR')
	const client = Messenger.useClient()

	return (
		<View
			style={[
				background.white,
				border.radius.scale(30),
				margin.horizontal.medium,
				padding.top.large,
				styleBertyIdContent,
			]}
		>
			<RequestAvatar {...user} seed={client?.accountPk} size={requestAvatarSize} />
			<View style={[padding.horizontal.big]}>
				<TabBar
					tabs={[
						{ name: 'QR', icon: 'qr', iconPack: 'custom' },
						{ name: 'Fingerprint', icon: 'fingerprint', iconPack: 'custom' },
						{
							name: 'Devices',
							icon: 'smartphone',
							iconPack: 'feather',
							iconTransform: [{ rotate: '22.5deg' }, { scale: 0.8 }],
							buttonDisabled: true,
							style: opacity(0.3),
						},
					]}
					onTabChange={setSelectedContent}
				/>
				<BertyIdContent>
					<SelectedContent contentName={selectedContent} />
				</BertyIdContent>
			</View>
		</View>
	)
}

const BertyIdShare: React.FC<{}> = () => {
	const [{ row, border, background, flex, color }] = useStyles()
	const { styleBertyIdButton, iconShareSize } = useStylesBertyId()
	const client = Messenger.useClient()
	const url = client?.deepLink
	if (!url) {
		return null
	}
	return (
		<TouchableOpacity
			style={[row.item.bottom, background.light.blue, border.shadow.medium, styleBertyIdButton]}
			onPress={async () => {
				try {
					await Share.share({ url })
				} catch (e) {
					console.error(e)
				}
			}}
		>
			<View style={[flex.tiny, flex.justify.center]}>
				<Icon
					style={row.item.justify}
					name='share'
					pack='custom'
					width={iconShareSize}
					height={iconShareSize}
					fill={color.blue}
				/>
			</View>
		</TouchableOpacity>
	)
}

const MyBertyIdComponent: React.FC<{ user: any }> = ({ user }) => {
	const { goBack } = useNavigation()
	const [{ flex, padding, color }] = useStyles()
	const { iconArrowBackSize, titleSize, iconIdSize, iconShareSize } = useStylesBertyId()
	const { height } = useDimensions().window

	return (
		<ScrollView bounces={false} style={[padding.medium]}>
			<View
				style={[
					flex.direction.row,
					flex.justify.spaceBetween,
					flex.align.center,
					{ marginBottom: height * 0.1 },
				]}
			>
				<View style={[flex.direction.row, flex.align.center]}>
					<TouchableOpacity onPress={goBack} style={[flex.align.center, flex.justify.center]}>
						<Icon
							name='arrow-back-outline'
							width={iconArrowBackSize}
							height={iconArrowBackSize}
							fill={color.white}
						/>
					</TouchableOpacity>
					<Text
						style={{
							fontWeight: '700',
							fontSize: titleSize,
							lineHeight: 1.25 * titleSize,
							marginLeft: 10,
							color: color.white,
						}}
					>
						My Berty ID
					</Text>
				</View>
				<Icon name='id' pack='custom' width={iconIdSize} height={iconIdSize} fill={color.white} />
			</View>
			<BertIdBody user={user} />
			<BertyIdShare />
		</ScrollView>
	)
}

export const MyBertyId: React.FC<{ user: any }> = ({ user }) => {
	const [{ flex, background }] = useStyles()
	return (
		<Layout style={[flex.tiny]}>
			<SafeAreaView style={[flex.tiny, background.blue]}>
				<MyBertyIdComponent user={user} />
			</SafeAreaView>
		</Layout>
	)
}
