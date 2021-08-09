import React, { useEffect, useRef } from 'react'
import { Text, TouchableOpacity, Platform, View, AppState, StatusBar } from 'react-native'
import LottieView from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import {
	requestNotifications,
	request,
	PERMISSIONS,
	RESULTS,
	openSettings,
} from 'react-native-permissions'

import { useStyles } from '@berty-tech/styles'
import { accountService, PersistentOptionsKeys, useMsgrContext } from '@berty-tech/store/context'
import { useThemeColor } from '@berty-tech/store/hooks'

import audioLottie from '@berty-tech/assets/audio-lottie.json'
import cameraLottie from '@berty-tech/assets/camera-lottie.json'
import notificationLottie from '@berty-tech/assets/notification-lottie.json'
import p2pLottie from '@berty-tech/assets/p2p-lottie.json'
import { checkPermissions } from '../utils'
import beapi from '@berty-tech/api'

const animations = {
	audio: audioLottie,
	camera: cameraLottie,
	notification: notificationLottie,
	p2p: p2pLottie,
}

export const Permissions: React.FC<{}> = (props) => {
	const appState = useRef(AppState.currentState)
	const [{ text, border }] = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()
	const { persistentOptions, setPersistentOption, createNewAccount, selectedAccount } =
		useMsgrContext()
	const {
		permissionType,
		permissionStatus,
		navigateNext,
		createNewAccount: isToCreateNewAccount,
	} = props?.route?.params

	const handleOnComplete = async () => {
		if (isToCreateNewAccount) {
			await createNewAccount()
		}
		if (navigateNext) {
			props.navigation.navigate(navigateNext, {})
		} else {
			props.navigation.goBack()
		}
	}

	const handleAppStateChange = async (nextAppState: string) => {
		if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
			const status = await checkPermissions(permissionType, {
				isToNavigate: false,
			})

			if (status === RESULTS.GRANTED) {
				handleOnComplete()
			}
		}
	}

	useEffect(() => {
		AppState.addEventListener('change', handleAppStateChange)
		return () => {
			AppState.removeEventListener('change', handleAppStateChange)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const requestPermission = async () => {
		try {
			if (permissionStatus === RESULTS.BLOCKED) {
				return openSettings()
			}
			if (permissionType === 'notification') {
				try {
					const { status } = await requestNotifications(['alert', 'sound'])
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
					console.log(status)
					//
				} catch (err) {
					console.log('request notification permisison err:', err)
				}
			} else if (permissionType === 'p2p') {
				const status = await request(
					Platform.OS === 'ios'
						? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
						: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
				)

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
			} else if (permissionType === 'camera') {
				await request(
					Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA,
				)
			} else if (permissionType === 'audio') {
				await request(
					Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO,
				)
			}
		} catch (err) {
			console.log('request permission err:', err)
		}
		handleOnComplete()
	}

	return (
		<View style={{ flex: 1, backgroundColor: colors['background-header'] }}>
			<StatusBar backgroundColor={colors['background-header']} />
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
					{t(`permission.${permissionType}.title`)}
				</Text>
				<Text
					style={[
						text.size.scale(16),
						{
							lineHeight: 25,
							marginTop: 20,
							color: colors['main-text'],
						},
					]}
				>
					{t(`permission.${permissionType}.desc`)}
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
						onPress={requestPermission}
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
							{t(
								`permission.button-labels.${
									permissionStatus === RESULTS.BLOCKED ? 'settings' : 'allow'
								}`,
							)}
						</Text>
					</TouchableOpacity>
				</View>
				<Text
					style={{
						marginTop: 16,
						color: colors['secondary-text'],
						textTransform: 'uppercase',
						textAlign: 'center',
					}}
				>
					{t('permission.what-happening')}
				</Text>
			</View>
		</View>
	)
}
