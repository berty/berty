import React, { useState } from 'react'
import { View, TouchableOpacity, ScrollView, Share } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { TabBar } from '../shared-components/TabBar'
import { RequestAvatar } from '../shared-components/Request'
import { Messenger } from '@berty-tech/store/oldhooks'
import { useNavigation } from '@berty-tech/navigation'
import QRCode from 'react-native-qrcode-svg'
import { FingerprintContent } from '../shared-components/FingerprintContent'
import { SafeAreaView } from 'react-native-safe-area-context'

//
// Settings My Berty ID Vue
//

// Styles

const useStylesBertyId = () => {
	const _iconArrowBackSize = 30
	const _iconIdSize = 45
	const _iconShareSize = 26
	const _titleSize = 26
	const bertyIdContentScaleFactor = 0.66
	const requestAvatarSize = 90

	const [, { fontScale, scaleSize }] = useStyles()
	const _bertyIdButtonSize = 60 * scaleSize
	return {
		bertyIdContentScaleFactor,
		iconShareSize: _iconShareSize * scaleSize,
		iconArrowBackSize: _iconArrowBackSize * scaleSize,
		iconIdSize: _iconIdSize * scaleSize,
		titleSize: _titleSize * fontScale,
		requestAvatarSize,
		styleBertyIdButton: {
			width: _bertyIdButtonSize,
			height: _bertyIdButtonSize,
			borderRadius: _bertyIdButtonSize / 2,
			marginRight: _bertyIdButtonSize,
			bottom: _bertyIdButtonSize / 2,
		},
		styleBertyIdContent: { paddingBottom: _bertyIdButtonSize / 2 + 10 },
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
	const account = Messenger.useAccount()
	const [{ padding }, { windowHeight, windowWidth, isGteIpadSize }] = useStyles()
	const { titleSize, bertyIdContentScaleFactor } = useStylesBertyId()

	if (!account?.link) {
		return <Text>Internal error</Text>
	}

	// Make sure we can always see the whole QR code on the screen, even if need to scroll
	const qrCodeSize = isGteIpadSize
		? Math.min(windowHeight, windowWidth) * 0.5
		: Math.min(windowHeight * bertyIdContentScaleFactor, windowWidth * bertyIdContentScaleFactor) -
		  1.25 * titleSize

	// I would like to use binary mode in QR but the scanner used seems to not support it, extended tests were done
	return (
		<View style={[padding.top.big]}>
			<QRCode size={qrCodeSize} value={account.link} />
		</View>
	)
}

const Fingerprint: React.FC = () => {
	const account = Messenger.useAccount()
	const [{ padding }, { windowHeight, windowWidth, isGteIpadSize }] = useStyles()
	const { bertyIdContentScaleFactor } = useStylesBertyId()

	if (!account) {
		return <Text>Client not initialized</Text>
	}
	return (
		<View
			style={[
				padding.top.big,
				{
					// Make sure we can always see the whole Fingerprint on the screen, even if need to scroll
					width: isGteIpadSize
						? Math.min(windowHeight, windowWidth) * 0.5
						: bertyIdContentScaleFactor * Math.min(windowHeight, windowWidth),
				},
			]}
		>
			<FingerprintContent seed={account.publicKey} />
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
	const account = Messenger.useAccount()

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
			<RequestAvatar {...user} seed={account?.publicKey} size={requestAvatarSize} />
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
	const account = Messenger.useAccount()
	const url = account?.link
	if (!url) {
		return null
	}
	return (
		<TouchableOpacity
			style={[row.item.bottom, background.light.blue, border.shadow.medium, styleBertyIdButton]}
			onPress={async () => {
				try {
					console.log('sharing', url)
					await Share.share({ url })
				} catch (e) {
					console.error(e)
				}
			}}
		>
			<View style={[flex.tiny, { justifyContent: 'center' }]}>
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
	const [{ padding, color, margin }, { windowHeight }] = useStyles()
	const { iconArrowBackSize, titleSize, iconIdSize } = useStylesBertyId()

	return (
		<ScrollView bounces={false} style={[padding.medium]}>
			<View
				style={[
					{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: windowHeight * 0.1,
					},
				]}
			>
				<View
					style={[
						{
							flexDirection: 'row',
							alignItems: 'center',
						},
					]}
				>
					<TouchableOpacity
						onPress={goBack}
						style={{ alignItems: 'center', justifyContent: 'center' }}
					>
						<Icon
							name='arrow-back-outline'
							width={iconArrowBackSize}
							height={iconArrowBackSize}
							fill={color.white}
						/>
					</TouchableOpacity>
					<Text
						style={[
							margin.left.scale(10),
							{
								fontWeight: '700',
								fontSize: titleSize,
								lineHeight: 1.25 * titleSize,
								color: color.white,
							},
						]}
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
