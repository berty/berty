import React, { useState } from 'react'
import { View, TouchableOpacity, Share, StatusBar } from 'react-native'
import { Layout, Text, Icon } from '@ui-kitten/components'
import QRCode from 'react-native-qrcode-svg'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { useAccount, useStylesBertyId, useThemeColor } from '@berty-tech/store'
import { ScreenFC } from '@berty-tech/navigation'

import { TabBar } from '../shared-components/TabBar'
import { FingerprintContent } from '../shared-components/FingerprintContent'
import logo from '../main/1_berty_picto.png'
import { AccountAvatar } from '../avatars'

//
// Settings My Berty ID Vue
//

const styleBertyIdOptions = {
	iconIdSize: 45,
	iconShareSize: 26,
	titleSize: 26,
	contentScaleFactor: 0.66,
	avatarSize: 90,
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
	const [{ padding }] = useStyles()
	const colors = useThemeColor()
	const { qrCodeSize } = useStylesBertyId(styleBertyIdOptions)

	if (!account?.link) {
		return <Text>Internal error</Text>
	}
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
	const { bertyIdContentScaleFactor } = useStylesBertyId(styleBertyIdOptions)

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

const BertIdBody: React.FC = () => {
	const [{ border, margin, padding }, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	const { styleBertyIdContent, requestAvatarSize } = useStylesBertyId(styleBertyIdOptions)
	const [selectedContent, setSelectedContent] = useState('qr')
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
				style={{ flex: 1, alignItems: 'center', justifyContent: 'center', bottom: 80 * scaleSize }}
			>
				<AccountAvatar size={requestAvatarSize} />
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

const BertyIdShare: React.FC = () => {
	const [{ row, border, flex }] = useStyles()
	const colors = useThemeColor()
	const { styleBertyIdButton, iconShareSize } = useStylesBertyId(styleBertyIdOptions)
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
				{ backgroundColor: colors['positive-asset'], shadowColor: colors.shadow },
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

const MyBertyIdComponent: React.FC = () => {
	const [{ padding }, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[
				padding.medium,
				{ backgroundColor: colors['background-header'], top: 55 * scaleSize },
			]}
		>
			<BertIdBody />
			<BertyIdShare />
		</View>
	)
}

export const MyBertyId: ScreenFC<'Settings.MyBertyId'> = () => {
	const colors = useThemeColor()

	return (
		<Layout style={{ backgroundColor: colors['background-header'], flex: 1 }}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<MyBertyIdComponent />
		</Layout>
	)
}
