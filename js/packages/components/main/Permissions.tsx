import React, { useCallback, useEffect, useRef } from 'react'
import { Text, TouchableOpacity, Platform, View, AppState, StatusBar } from 'react-native'
import LottieView, { AnimatedLottieViewProps } from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import {
	RESULTS,
	openSettings,
	PermissionStatus,
	request,
	PERMISSIONS,
} from 'react-native-permissions'

import { useStyles } from '@berty-tech/styles'
import {
	accountService,
	PersistentOptionsKeys,
	useMessengerContext,
	useThemeColor,
} from '@berty-tech/store'
import audioLottie from '@berty-tech/assets/audio-lottie.json'
import cameraLottie from '@berty-tech/assets/camera-lottie.json'
import notificationLottie from '@berty-tech/assets/notification-lottie.json'
import proximityLottie from '@berty-tech/assets/proximity-lottie.json'
import beapi from '@berty-tech/api'
import { ScreenFC, useNavigation } from '@berty-tech/navigation'
import rnutil from '@berty-tech/rnutil'
import { useSelector } from 'react-redux'
import { selectSelectedAccount } from '@berty-tech/redux/reducers/ui.reducer'
import { PermissionType, requestPermission } from '@berty-tech/rnutil/checkPermissions'

const animations: Record<PermissionType, AnimatedLottieViewProps['source']> = {
	audio: audioLottie,
	camera: cameraLottie,
	notification: notificationLottie,
	proximity: proximityLottie,
	gallery: cameraLottie, // get a lottie file for gallery
}

export const Permissions: ScreenFC<'Main.Permissions'> = ({ route: { params }, navigation }) => {
	const appState = useRef(AppState.currentState)
	const [{ text, border }] = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()
	const { persistentOptions, setPersistentOption } = useMessengerContext()
	const selectedAccount = useSelector(selectSelectedAccount)
	const { permissionType, permissionStatus, navigateNext, onComplete } = params

	const handleOnComplete = useCallback(
		async (status: PermissionStatus | undefined) => {
			if (status !== RESULTS.GRANTED) {
				navigation.goBack()
				return
			}
			if (navigateNext) {
				navigation.navigate(navigateNext)
			} else {
				navigation.goBack()
			}

			if (typeof onComplete === 'function') {
				await onComplete()
			}
		},
		[navigateNext, navigation, onComplete],
	)

	const handleRequestPermission = useCallback(async () => {
		const status = await requestPermission(permissionType)
		try {
			if (permissionStatus === RESULTS.BLOCKED) {
				return openSettings()
			}
			if (permissionType === 'notification') {
				try {
					await setPersistentOption({
						type: PersistentOptionsKeys.Configurations,
						payload: {
							...persistentOptions.configurations,
							notification: {
								...persistentOptions.configurations.notification,
								state: status === RESULTS.GRANTED ? 'added' : 'skipped',
							},
						},
					})
				} catch (err) {
					console.warn('request notification permisison err:', err)
				}
			} else if (permissionType === 'proximity') {
				if (selectedAccount) {
					const currentConfig = await accountService.networkConfigGet({
						accountId: selectedAccount,
					})

					let newConfig = {
						...currentConfig.currentConfig,
						bluetoothLe:
							status === RESULTS.GRANTED
								? beapi.account.NetworkConfig.Flag.Enabled
								: beapi.account.NetworkConfig.Flag.Disabled,
						appleMultipeerConnectivity:
							status === RESULTS.GRANTED
								? beapi.account.NetworkConfig.Flag.Enabled
								: beapi.account.NetworkConfig.Flag.Disabled,
						androidNearby:
							status === RESULTS.GRANTED
								? beapi.account.NetworkConfig.Flag.Enabled
								: beapi.account.NetworkConfig.Flag.Disabled,
					}

					await accountService.networkConfigSet({
						accountId: selectedAccount,
						config: newConfig,
					})
				}
			}
		} catch (err) {
			console.warn('request permission err:', err)
		}
		await handleOnComplete(status)
	}, [
		handleOnComplete,
		permissionStatus,
		permissionType,
		persistentOptions.configurations,
		selectedAccount,
		setPersistentOption,
	])

	const handleAppStateChange = useCallback(
		async (nextAppState: string) => {
			if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
				const status = await rnutil.checkPermissions(permissionType, {
					navigate: navigation.navigate,
					navigateToPermScreenOnProblem: false,
				})

				if (status === RESULTS.GRANTED) {
					await handleOnComplete(status)
				}
			}
		},
		[handleOnComplete, navigation.navigate, permissionType],
	)

	useEffect(() => {
		AppState.addEventListener('change', handleAppStateChange)
		return () => {
			AppState.removeEventListener('change', handleAppStateChange)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<View style={{ flex: 1, backgroundColor: colors['background-header'] }}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<LottieView
					source={animations[permissionType]}
					autoPlay
					style={{
						marginVertical: 10,
					}}
				/>
			</View>
			<View
				style={[
					border.radius.top.large,
					{
						paddingVertical: 24,
						paddingHorizontal: 32,
						backgroundColor: colors['main-background'],
					},
				]}
			>
				<Text
					style={[
						text.size.huge,
						text.bold.medium,
						{
							color: colors['background-header'],
							textAlign: 'center',
						},
					]}
				>
					{/* Ignore check for i18n missing keys
						permission.notification.title
						permission.proximity.title
						permission.camera.title
						permission.audio.title
						permission.gallery.title
					*/}
					{t(`permission.${permissionType}.title`)}
				</Text>
				<Text
					style={[
						text.size.medium,
						{
							lineHeight: 25,
							marginTop: 20,
							color: colors['main-text'],
						},
					]}
				>
					{/* Ignore check for i18n missing keys
						permission.notification.desc
						permission.camera.desc
						permission.audio.desc
						permission.gallery.desc
					*/}
					{permissionType === 'proximity'
						? Platform.OS === 'ios'
							? t('permission.proximity.ios-desc')
							: t('permission.proximity.android-desc')
						: t(`permission.${permissionType}.desc`)}
				</Text>
				{permissionStatus === RESULTS.BLOCKED && (
					<Text
						style={[
							text.size.scale(17),
							{
								lineHeight: 25,
								marginTop: 10,
								color: colors['main-text'],
							},
						]}
					>
						{t('permission.settings-text', { title: t(`permission.${permissionType}.title`) })}
					</Text>
				)}
				<View
					style={{
						width: '100%',
						paddingHorizontal: 20,
					}}
				>
					<TouchableOpacity
						onPress={() => handleRequestPermission()}
						style={{
							backgroundColor: colors['background-header'],
							paddingVertical: 16,
							alignItems: 'center',
							borderRadius: 12,
							marginTop: 20,
							width: '100%',
						}}
						activeOpacity={0.9}
					>
						<Text
							style={[
								text.size.scale(18),
								{
									fontWeight: '700',
									color: colors['reverted-main-text'],
								},
							]}
						>
							{/* Ignore check for i18n missing keys
								permission.button-labels.settings
								permission.button-labels.allow
							*/}
							{t(
								`permission.button-labels.${
									permissionStatus === RESULTS.BLOCKED ? 'settings' : 'allow'
								}`,
							)}
						</Text>
					</TouchableOpacity>
				</View>
				<TouchableOpacity
					onPress={async () => {
						navigation.goBack()

						// TODO: ??
						if (typeof onComplete === 'function') {
							await onComplete()
						}
					}}
				>
					<Text
						style={{
							marginTop: 16,
							color: colors['secondary-text'],
							textTransform: 'uppercase',
							textAlign: 'center',
						}}
					>
						{permissionType === 'notification' && !selectedAccount
							? t('permission.skip')
							: t('permission.cancel')}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}

export const BlePermission: ScreenFC<'Main.BlePermission'> = ({ route: { params } }) => {
	const { accept, deny } = params
	const [{ text, border }] = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()
	const { goBack } = useNavigation()

	const handleRequestPermission = React.useCallback(async () => {
		try {
			// request the permission
			const status = await request(
				Platform.OS === 'ios'
					? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
					: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
			)
			console.log('Status post request:', status)
			// check status
			switch (status) {
				case 'granted':
					await accept()
					break
				case 'unavailable':
					// TODO: dig why (on iOS) when i accept the request the status is unavailable
					await accept()
					break
				case 'blocked':
					await deny()
					break
			}
			goBack()
		} catch (err) {
			console.warn('handleRequestPermission error:', err)
		}
	}, [accept, deny, goBack])

	return (
		<View style={{ flex: 1, backgroundColor: colors['background-header'] }}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<LottieView
					source={animations.proximity}
					autoPlay
					style={{
						marginVertical: 10,
					}}
				/>
			</View>
			<View
				style={[
					border.radius.top.large,
					{
						paddingVertical: 24,
						paddingHorizontal: 32,
						backgroundColor: colors['main-background'],
					},
				]}
			>
				<Text
					style={[
						text.size.huge,
						text.bold.medium,
						{
							color: colors['background-header'],
							textAlign: 'center',
						},
					]}
				>
					{t('permission.proximity.title')}
				</Text>
				<Text
					style={[
						text.size.medium,
						{
							lineHeight: 25,
							marginTop: 20,
							color: colors['main-text'],
							textAlign: 'center',
						},
					]}
				>
					{Platform.OS === 'ios'
						? t('permission.proximity.ios-desc')
						: t('permission.proximity.android-desc')}
				</Text>
				<View
					style={{
						width: '100%',
						paddingHorizontal: 20,
					}}
				>
					<TouchableOpacity
						onPress={async () => {
							await handleRequestPermission()
						}}
						style={{
							backgroundColor: colors['background-header'],
							paddingVertical: 16,
							alignItems: 'center',
							borderRadius: 12,
							marginTop: 20,
							width: '100%',
						}}
						activeOpacity={0.9}
					>
						<Text
							style={[
								text.size.scale(18),
								{
									fontWeight: '700',
									color: colors['reverted-main-text'],
								},
							]}
						>
							{t('permission.button-labels.allow')}
						</Text>
					</TouchableOpacity>
				</View>
				<TouchableOpacity
					onPress={async () => {
						await deny()
						goBack()
					}}
				>
					<Text
						style={{
							marginTop: 16,
							color: colors['secondary-text'],
							textTransform: 'uppercase',
							textAlign: 'center',
						}}
					>
						{t('permission.skip')}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}
