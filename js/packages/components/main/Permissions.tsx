import React, { useEffect, useRef } from 'react'
import { Text, TouchableOpacity, Platform, View, AppState } from 'react-native'
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
import { PersistentOptionsKeys, useMsgrContext } from '@berty-tech/store/context'

import audioLottie from '@berty-tech/assets/audio-lottie.json'
import cameraLottie from '@berty-tech/assets/camera-lottie.json'
import notificationLottie from '@berty-tech/assets/notification-lottie.json'
import p2pLottie from '@berty-tech/assets/p2p-lottie.json'
import { checkPermissions } from '../utils'

const animations = {
	audio: audioLottie,
	camera: cameraLottie,
	notification: notificationLottie,
	p2p: p2pLottie,
}

export const Permissions: React.FC<{}> = (props) => {
	const appState = useRef(AppState.currentState)
	const [{ text, border, background }] = useStyles()
	const { t }: { t: any } = useTranslation()
	const { persistentOptions, setPersistentOption, createNewAccount } = useMsgrContext()
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

				const state = status === RESULTS.GRANTED ? true : false
				await setPersistentOption({
					type: PersistentOptionsKeys.BLE,
					payload: {
						enable: state,
					},
				})
				await setPersistentOption({
					type: PersistentOptionsKeys.MC,
					payload: {
						enable: state,
					},
				})
				await setPersistentOption({
					type: PersistentOptionsKeys.Nearby,
					payload: {
						enable: state,
					},
				})
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
		<View
			style={[
				background.blue,
				{
					flex: 1,
				},
			]}
		>
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<LottieView
					source={animations[permissionType]}
					autoPlay
					style={{
						width: '70%',
					}}
				/>
			</View>
			<View
				style={[
					background.white,
					border.radius.top.large,
					{
						paddingVertical: 24,
						paddingHorizontal: 32,
					},
				]}
			>
				<Text
					style={[
						text.size.scale(28),
						text.bold.medium,

						{
							color: '#433DE5',
							textAlign: 'center',
						},
					]}
				>
					{t(`permission.${permissionType}.title`)}
				</Text>
				<Text
					style={[
						text.size.scale(17),
						{
							lineHeight: 25,
							marginTop: 20,
							color: '#3D3A3D',
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
								color: '#3D3A3D',
							},
						]}
					>
						{t(`permission.settings-text`, { title: t(`permission.${permissionType}.title`) })}
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
							backgroundColor: '#5552E9',
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
								text.color.white,
								text.size.scale(18),
								{
									fontWeight: '700',
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
						color: '#D7DBE2',
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
