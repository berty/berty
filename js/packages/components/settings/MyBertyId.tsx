import React, { useState } from 'react'
import { View, TouchableOpacity, Share, StatusBar } from 'react-native'
import { Layout, Text, Icon } from '@ui-kitten/components'
import QRCode from 'react-native-qrcode-svg'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { useAccount, useThemeColor } from '@berty-tech/store/hooks'

import { TabBar } from '../shared-components/TabBar'
import { FingerprintContent } from '../shared-components/FingerprintContent'
import logo from '../main/1_berty_picto.png'
import { AccountAvatar } from '../avatars'

//
// Settings My Berty ID Vue
//

// Styles

const useStylesBertyId = () => {
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
	const account = useAccount()
	const [{ padding }, { windowHeight, windowWidth, isGteIpadSize }] = useStyles()
	const colors = useThemeColor()
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
			<QRCode
				logo={logo}
				size={qrCodeSize}
				value={account.link}
				color={colors['background-header']}
				mode='circle'
				backgroundColor={colors['main-background']}
			/>
		</View>
	)
}

const Fingerprint: React.FC = () => {
	const account = useAccount()
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
		case 'qr':
			return <ContactRequestQR />
		case 'fingerprint':
			return <Fingerprint />
		default:
			return <Text>Error: Unknown content name "{contentName}"</Text>
	}
}

const BertIdBody: React.FC<{ user: any }> = ({ user }) => {
	const [{ border, margin, padding, opacity }, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	const { styleBertyIdContent, requestAvatarSize } = useStylesBertyId()
	const [selectedContent, setSelectedContent] = useState('qr')
	const account = useAccount()
	const { t } = useTranslation()

	return (
		<View
			style={[
				border.radius.scale(30),
				margin.horizontal.medium,
				padding.top.large,
				{ backgroundColor: colors['main-background'] },
				styleBertyIdContent,
			]}
		>
			<View
				style={{ flex: 1, alignItems: 'center', justifyContent: 'center', bottom: 40 * scaleSize }}
			>
				<AccountAvatar {...user} seed={account?.publicKey} size={requestAvatarSize} />
			</View>
			<View style={[padding.horizontal.big]}>
				<TabBar
					tabs={[
						{ key: 'qr', name: t('settings.my-berty-ID.qr'), icon: 'qr', iconPack: 'custom' },
						{
							key: 'fingerprint',
							name: t('settings.my-berty-ID.fingerprint'),
							icon: 'fingerprint',
							iconPack: 'custom',
						},
						{
							key: 'devices',
							name: t('settings.my-berty-ID.devices'),
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
	const [{ row, border, flex }] = useStyles()
	const colors = useThemeColor()
	const { styleBertyIdButton, iconShareSize } = useStylesBertyId()
	const account = useAccount()
	const url = account?.link
	if (!url) {
		return null
	}
	return (
		<TouchableOpacity
			style={[
				row.item.bottom,
				border.shadow.medium,
				{ backgroundColor: colors['positive-asset'] },
				styleBertyIdButton,
			]}
			onPress={async () => {
				try {
					console.log('sharing', url)
					await Share.share({ url, message: url })
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
					fill={colors['background-header']}
				/>
			</View>
		</TouchableOpacity>
	)
}

const MyBertyIdComponent: React.FC<{ user: any }> = ({ user }) => {
	const [{ padding }, { windowHeight, scaleSize }] = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[
				padding.medium,
				{ backgroundColor: colors['background-header'], top: (windowHeight / 8) * scaleSize },
			]}
		>
			<BertIdBody user={user} />
			<BertyIdShare />
		</View>
	)
}

export const MyBertyId: React.FC<{ user: any }> = ({ user }) => {
	const colors = useThemeColor()

	return (
		<Layout style={{ backgroundColor: colors['background-header'], flex: 1 }}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<MyBertyIdComponent user={user} />
		</Layout>
	)
}
