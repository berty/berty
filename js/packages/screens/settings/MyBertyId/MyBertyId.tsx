import Clipboard from '@react-native-clipboard/clipboard'
import { Layout, Icon } from '@ui-kitten/components'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, TouchableOpacity, Share, StatusBar, Platform } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import logo from '@berty/assets/images/1_berty_picto.png'
import { TabBar } from '@berty/components'
import { AccountAvatar } from '@berty/components/avatars'
import { FingerprintContent } from '@berty/components/shared-components/FingerprintContent'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import { useAccount } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { useStylesBertyId, useThemeColor } from '@berty/store'

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
	const { column } = useStyles()

	return (
		<View>
			<View style={[column.item.center]}>{children}</View>
		</View>
	)
}

const ContactRequestQR = () => {
	const account = useAccount()
	const { padding } = useStyles()
	const colors = useThemeColor()
	const { qrCodeSize } = useStylesBertyId(styleBertyIdOptions)

	if (!account.link) {
		return <UnifiedText>Internal error</UnifiedText>
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
	const { padding } = useStyles()
	const { windowHeight, windowWidth, isGteIpadSize } = useAppDimensions()
	const { bertyIdContentScaleFactor } = useStylesBertyId(styleBertyIdOptions)

	if (!account) {
		return <UnifiedText>Client not initialized</UnifiedText>
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
			return <UnifiedText>Error: Unknown content name "{contentName}"</UnifiedText>
	}
}

const BertIdBody: React.FC = () => {
	const { border, margin, padding } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()

	const { styleBertyIdContent, requestAvatarSize } = useStylesBertyId(styleBertyIdOptions)
	const [selectedContent, setSelectedContent] = useState('qr')
	const { t } = useTranslation()

	return (
		<>
			<View style={{ alignItems: 'center', top: 35 * scaleSize, zIndex: 10 }}>
				<AccountAvatar size={requestAvatarSize} />
			</View>
			<View
				style={[
					border.radius.scale(30),
					margin.horizontal.medium,
					padding.top.large,
					{ backgroundColor: colors['main-background'] },
					styleBertyIdContent,
				]}
			>
				<View style={[padding.horizontal.big]}>
					<TabBar
						tabs={[{ name: t('tabs.qr') }, { name: t('tabs.fingerprint') }]}
						onTabChange={setSelectedContent}
					/>
					<BertyIdContent>
						<SelectedContent contentName={selectedContent} />
					</BertyIdContent>
				</View>
			</View>
		</>
	)
}

const BertyIdShare: React.FC = () => {
	const { row, border, flex } = useStyles()
	const colors = useThemeColor()
	const { styleBertyIdButton, iconShareSize } = useStylesBertyId(styleBertyIdOptions)
	const account = useAccount()
	const url = account.link
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
					if (Platform.OS === 'web') {
						Clipboard.setString(url)
					} else {
						await Share.share({ url, message: url })
					}
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
	const { padding } = useStyles()
	const colors = useThemeColor()

	return (
		<View style={[padding.medium, { backgroundColor: colors['background-header'] }]}>
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
