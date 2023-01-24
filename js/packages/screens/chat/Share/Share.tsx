import { useFocusEffect } from '@react-navigation/core'
import { Layout } from '@ui-kitten/components'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { Camera } from 'expo-camera'
import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Vibration, StatusBar, ScrollView, TextInput, TouchableOpacity } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import logo from '@berty/assets/images/1_berty_picto.png'
import ScanTarget from '@berty/assets/logo/scan_target.svg'
import { FloatingMenuItem } from '@berty/components'
import { AccountAvatar } from '@berty/components/avatars'
import { LoaderDots } from '@berty/components/LoaderDots'
import { ButtonSettingRow } from '@berty/components/shared-components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import { useAccount, useMessengerClient, useThemeColor } from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import { checkPermission } from '@berty/utils/permissions/checkPermissions'
import { PermissionType } from '@berty/utils/permissions/permissions'
import { shareBertyID } from '@berty/utils/react-native/share'

const QrCode: FC<{ size: number }> = ({ size }) => {
	const client = useMessengerClient()
	const colors = useThemeColor()
	const account = useAccount()
	const [link, setLink] = useState<string>('')

	const getAccountLink = useCallback(async () => {
		if (account.displayName) {
			const ret = await client?.instanceShareableBertyID({
				reset: false,
				displayName: account.displayName,
			})
			if (ret?.internalUrl) {
				setLink(ret?.internalUrl)
			}
		}
	}, [account.displayName, client])

	useEffect(() => {
		getAccountLink()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return link ? (
		<QRCode
			size={size}
			value={link}
			logo={logo}
			color={colors['background-header']}
			mode='circle'
			backgroundColor={colors['main-background']}
		/>
	) : (
		<View style={{ width: size, height: size, justifyContent: 'center' }}>
			<LoaderDots />
		</View>
	)
}

const ScanBody: FC<{ visible: boolean }> = ({ visible = true }) => {
	const navigation = useNavigation()
	const { background, margin, flex, column, border } = useStyles()
	const { windowHeight, windowWidth, isGteIpadSize, fontScale } = useAppDimensions()

	const qrScanSize = isGteIpadSize
		? Math.min(windowHeight, windowWidth) * 0.5
		: Math.min(windowHeight * 0.8, windowWidth * 0.8) - 1.25 * (26 * fontScale)

	return (
		<View
			style={[
				background.black,
				margin.horizontal.small,
				column.item.center,
				flex.align.center,
				flex.justify.center,
				border.radius.medium,
				{
					overflow: 'hidden',
					height: qrScanSize,
					aspectRatio: 1,
					position: 'relative',
				},
			]}
		>
			{visible && (
				<Camera
					onBarCodeScanned={({ data, type }) => {
						if (type === BarCodeScanner.Constants.BarCodeType.qr) {
							// I would like to use binary mode in QR but this scanner seems to not support it, extended tests were done
							navigation.navigate('Chat.ManageDeepLink', { type: 'qr', value: data })
							Vibration.vibrate(1000)
						}
					}}
					barCodeScannerSettings={{
						barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
					}}
					style={{
						height: '100%',
						width: '100%',
					}}
				/>
			)}

			<ScanTarget height='75%' width='75%' style={{ position: 'absolute' }} />
		</View>
	)
}

const ShareQr: FC = () => {
	const { margin } = useStyles()
	const { windowWidth, windowHeight, scaleSize } = useAppDimensions()
	const account = useAccount()
	const qrCodeSize = Math.min(windowHeight, windowWidth) * 0.45

	return (
		<View>
			<View
				style={[
					margin.top.big,
					margin.bottom.small,
					{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
				]}
			>
				<View style={[margin.right.small]}>
					<AccountAvatar size={24 * scaleSize} />
				</View>
				<UnifiedText>{account.displayName || ''}</UnifiedText>
			</View>
			<QrCode size={qrCodeSize} />
		</View>
	)
}

const ShareContainer: FC<{ element: ReactNode }> = ({ element, children }) => {
	const colors = useThemeColor()
	const { padding, border, margin } = useStyles()
	const { windowWidth, windowHeight, isGteIpadSize, fontScale } = useAppDimensions()

	const containerSize = isGteIpadSize
		? Math.min(windowHeight, windowWidth) * 0.5
		: Math.min(windowHeight * 0.8, windowWidth * 0.8) - 1.25 * (26 * fontScale)

	return (
		<View
			style={[
				border.radius.bottom.huge,
				padding.bottom.huge,
				padding.top.medium,
				{
					backgroundColor: colors['background-header'],
				},
			]}
		>
			<View
				style={[
					border.radius.medium,
					margin.bottom.big,
					{
						alignSelf: 'center',
						backgroundColor: colors['main-background'],
						alignItems: 'center',
						width: containerSize,
						height: containerSize,
					},
				]}
			>
				{element}
			</View>
			{children}
		</View>
	)
}

export const ShareModal: ScreenFC<'Chat.Share'> = () => {
	const { flex, margin, height, width } = useStyles()
	const colors = useThemeColor()
	const [isScannerVisible, setIsScannerVisible] = useState<boolean>(true)
	const [isScannerSelected, setIsScannerSelected] = useState<boolean>(false)
	const { navigate } = useNavigation()
	const { t } = useTranslation()
	const account = useAccount()
	const url = account.link

	useFocusEffect(
		useCallback(() => {
			setIsScannerVisible(true)
			return () => {
				setIsScannerVisible(false)
			}
		}, []),
	)

	const toggleScanner = useCallback(async () => {
		await checkPermission({
			permissionType: PermissionType.camera,
			navigate,
			deny: () => {},
			accept: () => {
				setIsScannerSelected(!isScannerSelected ? true : false)
			},
		})
	}, [isScannerSelected, navigate])

	return (
		<Layout style={[flex.tiny, { backgroundColor: colors['main-background'] }]}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<ScrollView style={[margin.bottom.medium, { backgroundColor: colors['main-background'] }]}>
				<ShareContainer
					element={isScannerSelected ? <ScanBody visible={isScannerVisible} /> : <ShareQr />}
				>
					<ButtonSettingRow
						state={[
							{
								displayComponent: isScannerSelected && <QrCode size={80} />,
								name: t('settings.share.tap-to-scan'),
								icon: 'camera-outline',
								color: colors['background-header'],
								style: [margin.right.scale(20), height(120), width(120)],
								onPress: toggleScanner,
							},
							{
								name: t('settings.share.invite'),
								icon: 'link-outline',
								color: colors['background-header'],
								style: [height(120), width(120)],
								onPress: async () => {
									await shareBertyID(url, t)
								},
							},
						]}
					/>
				</ShareContainer>
				<View style={[margin.horizontal.medium]}>
					<FloatingMenuItem
						testID={t('settings.share.create-group')}
						onPress={() => navigate('Chat.CreateGroupAddMembers')}
					>
						{t('settings.share.create-group')}
					</FloatingMenuItem>
					{__DEV__ && <DevLinkInput />}
				</View>
			</ScrollView>
		</Layout>
	)
}

const DevLinkInput = () => {
	const [link, setLink] = useState('')
	const { navigate } = useNavigation()
	return (
		<View style={{ flexDirection: 'row' }}>
			<TextInput style={{ flex: 1 }} onChangeText={setLink} placeholder='Paste link here' />
			<TouchableOpacity
				disabled={!link}
				onPress={() => navigate('Chat.ManageDeepLink', { type: 'link', value: link })}
			>
				<UnifiedText>Confirm</UnifiedText>
			</TouchableOpacity>
		</View>
	)
}
