import LottieView, { AnimatedLottieViewProps } from 'lottie-react-native'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState, AppStateStatus, Platform, StatusBar, TouchableOpacity, View } from 'react-native'
import { RESULTS, PermissionStatus, openSettings } from 'react-native-permissions'

import notificationLottie from '@berty/assets/lottie/notification-lottie.json'
import proximityLottie from '@berty/assets/lottie/proximity-lottie.json'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useAppDispatch, useAppSelector } from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import {
	selectEditedNetworkConfig,
	setBlePerm,
	setCurrentNetworkConfig,
} from '@berty/redux/reducers/networkConfig.reducer'
import { useThemeColor } from '@berty/store'
import rnutil from '@berty/utils/react-native'
import {
	PermissionType,
	acquirePermission,
	getPermissions,
} from '@berty/utils/react-native/permissions'

const animations: Record<PermissionType, AnimatedLottieViewProps['source']> = {
	notification: notificationLottie,
	proximity: proximityLottie,
	audio: '',
	camera: '',
	gallery: '',
}

// this component handle only two permissions for the moment (notification and proximity)
export const NotificationAndProximityPermissions: ScreenFC<'Chat.NotificationAndProximityPermissions'> =
	({ route: { params } }) => {
		const { accept, deny, permissionType } = params
		const { text, border } = useStyles()
		const colors = useThemeColor()
		const { t }: { t: any } = useTranslation()
		const { goBack, navigate, setOptions } = useNavigation()
		const dispatch = useAppDispatch()
		const networkConfig = useAppSelector(selectEditedNetworkConfig)

		// we have an issue with the network permission (require to run ipfs node) and the listener handleAppStateChange is triggered when we accept this perm
		// (because during the process of account creation this screen is rendered at the same time of the network permission ask)
		// so we handle this case with this value
		const [listenerAvailable, setListenerAvailable] = React.useState<boolean>(false)

		const appState = React.useRef(AppState.currentState)

		const isProximityPermission = permissionType === PermissionType.proximity
		const isNotificationPermission = permissionType === PermissionType.notification

		// set title related to the permission type
		React.useLayoutEffect(() => {
			setOptions({
				title: t(`permission.${permissionType}.title`),
			})
		})

		const handleRequestPermission = React.useCallback(async () => {
			try {
				// request the permission
				const status = await acquirePermission(permissionType)

				if (isProximityPermission) {
					// set new Ble status for toggle's condition in settings
					dispatch(setBlePerm(status))
				}

				// check status
				switch (status) {
					case 'granted':
						await accept()
						goBack()
						break
					case 'unavailable':
						if (isProximityPermission) {
							// TODO: dig why (on iOS) when i accept the ble request the status is unavailable
							await accept()
							goBack()
						}
						break
				}
			} catch (err) {
				console.warn('handleRequestPermission error:', err)
			}
		}, [accept, dispatch, goBack, isProximityPermission, permissionType])

		// this callback is called in the listener below to handle the change of the app state
		const handleAppStateChange = React.useCallback(
			async (nextAppState: AppStateStatus) => {
				// this condition is valid when the OS settings is open (so permission is BLOCKED)
				// and we return to the app (with or wihtout changes)
				if (
					appState.current.match(/inactive|background/) &&
					nextAppState === 'active' &&
					listenerAvailable
				) {
					let status: PermissionStatus = RESULTS.DENIED

					// get the correspondant permission
					if (isNotificationPermission) {
						status = await rnutil.checkNotificationPermission({
							navigate,
							accept,
							deny,
						})
					} else if (isProximityPermission) {
						status = await rnutil.checkProximityPermission({
							setNetworkConfig: async newConfig => {
								dispatch(setCurrentNetworkConfig(newConfig))
							},
							networkConfig,
							changedKey:
								Platform.OS === 'ios'
									? ['bluetoothLe', 'appleMultipeerConnectivity']
									: ['bluetoothLe', 'androidNearby'],
							navigate,
							accept,
							deny,
						})
					}

					// this is the check of the permission status after having gone to the settings

					if (status === RESULTS.GRANTED) {
						await accept()
					} else {
						await deny()
					}
					goBack()
				}

				appState.current = nextAppState
			},
			[
				accept,
				deny,
				dispatch,
				goBack,
				isNotificationPermission,
				isProximityPermission,
				listenerAvailable,
				navigate,
				networkConfig,
			],
		)

		// listener to handle the change of the app state
		// (the app state change when we go to the OS settings of the app, so when you come back in the app, we can detect it)
		useEffect(() => {
			if (listenerAvailable) {
				AppState.addEventListener('change', handleAppStateChange)
			}
			return () => {
				AppState.removeEventListener('change', handleAppStateChange)
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [listenerAvailable])

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
						{t(`permission.${permissionType}.title`)}
					</UnifiedText>
					<UnifiedText
						style={[
							{
								lineHeight: 25,
								marginTop: 20,
								textAlign: 'center',
							},
						]}
					>
						{isProximityPermission
							? Platform.OS === 'ios'
								? t('permission.proximity.ios-desc')
								: t('permission.proximity.android-desc')
							: t(`permission.${permissionType}.desc`)}
					</UnifiedText>
					<View
						style={{
							width: '100%',
							paddingHorizontal: 20,
						}}
					>
						<TouchableOpacity
							onPress={async () => {
								setListenerAvailable(true)
								const status = (await getPermissions())[permissionType]
								if (status === RESULTS.BLOCKED) {
									await openSettings()
								} else {
									await handleRequestPermission()
								}
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
							<UnifiedText
								style={[text.size.scale(18), text.bold, { color: colors['reverted-main-text'] }]}
							>
								{t('permission.button-labels.allow')}
							</UnifiedText>
						</TouchableOpacity>
					</View>
					<TouchableOpacity
						onPress={async () => {
							await deny()
							goBack()
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
							{t('permission.skip')}
						</UnifiedText>
					</TouchableOpacity>
				</View>
			</View>
		)
	}
