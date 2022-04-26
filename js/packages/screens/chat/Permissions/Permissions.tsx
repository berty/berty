import React, { useCallback, useEffect, useRef } from 'react'
import { TouchableOpacity, Platform, View, AppState, StatusBar } from 'react-native'
import LottieView, { AnimatedLottieViewProps } from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import { RESULTS, openSettings, PermissionStatus } from 'react-native-permissions'
import { useSelector } from 'react-redux'

import { useStyles } from '@berty/contexts/styles'
import { accountService, useThemeColor } from '@berty/store'
import audioLottie from '@berty/assets/lottie/audio-lottie.json'
import cameraLottie from '@berty/assets/lottie/camera-lottie.json'
import notificationLottie from '@berty/assets/lottie/notification-lottie.json'
import proximityLottie from '@berty/assets/lottie/proximity-lottie.json'
import beapi from '@berty/api'
import { ScreenFC } from '@berty/navigation'
import rnutil from '@berty/rnutil'
import { selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import { PermissionType, requestPermission } from '@berty/rnutil/checkPermissions'
import {
	PersistentOptionsKeys,
	selectPersistentOptions,
	setPersistentOption,
} from '@berty/redux/reducers/persistentOptions.reducer'
import { useAppDispatch } from '@berty/hooks'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'

const animations: Record<PermissionType, AnimatedLottieViewProps['source']> = {
	audio: audioLottie,
	camera: cameraLottie,
	notification: notificationLottie,
	proximity: proximityLottie,
	gallery: cameraLottie, // get a lottie file for gallery
}

export const Permissions: ScreenFC<'Chat.Permissions'> = ({ route: { params }, navigation }) => {
	const appState = useRef(AppState.currentState)
	const { text, border } = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()
	const persistentOptions = useSelector(selectPersistentOptions)
	const dispatch = useAppDispatch()
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
			if (permissionType === PermissionType.notification) {
				try {
					dispatch(
						setPersistentOption({
							type: PersistentOptionsKeys.Configurations,
							payload: {
								...persistentOptions.configurations,
								notification: {
									...persistentOptions.configurations.notification,
									state: status === RESULTS.GRANTED ? 'added' : 'skipped',
								},
							},
						}),
					)
				} catch (err) {
					console.warn('request notification permission err:', err)
				}
			} else if (permissionType === PermissionType.proximity) {
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
		dispatch,
		handleOnComplete,
		permissionStatus,
		permissionType,
		persistentOptions.configurations,
		selectedAccount,
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
				<UnifiedText
					style={[
						text.size.huge,
						text.bold,
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
				</UnifiedText>
				<UnifiedText style={{ lineHeight: 25, marginTop: 20 }}>
					{/* Ignore check for i18n missing keys
						permission.notification.desc
						permission.camera.desc
						permission.audio.desc
						permission.gallery.desc
					*/}
					{permissionType === PermissionType.proximity
						? Platform.OS === 'ios'
							? t('permission.proximity.ios-desc')
							: t('permission.proximity.android-desc')
						: t(`permission.${permissionType}.desc`)}
				</UnifiedText>
				{permissionStatus === RESULTS.BLOCKED && (
					<UnifiedText
						style={[
							text.size.scale(17),
							{
								lineHeight: 25,
								marginTop: 10,
							},
						]}
					>
						{t('permission.settings-text', { title: t(`permission.${permissionType}.title`) })}
					</UnifiedText>
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
						<UnifiedText
							style={[text.size.scale(18), text.bold, { color: colors['reverted-main-text'] }]}
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
						</UnifiedText>
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
					<UnifiedText
						style={{
							marginTop: 16,
							color: colors['secondary-text'],
							textTransform: 'uppercase',
							textAlign: 'center',
						}}
					>
						{permissionType === PermissionType.notification && !selectedAccount
							? t('permission.skip')
							: t('permission.cancel')}
					</UnifiedText>
				</TouchableOpacity>
			</View>
		</View>
	)
}
