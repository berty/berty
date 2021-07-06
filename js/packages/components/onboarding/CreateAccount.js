import React, { useState } from 'react'
import { View, TextInput, Vibration, StatusBar, Linking } from 'react-native'
import { Translation, useTranslation } from 'react-i18next'
import LottieView from 'lottie-react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-community/async-storage'

import { useStyles } from '@berty-tech/styles'
import { PersistentOptionsKeys, useMsgrContext } from '@berty-tech/store/context'
import { useNotificationsInhibitor } from '@berty-tech/store/hooks'

import SwiperCard from './SwiperCard'
import OnboardingWrapper from './OnboardingWrapper'
import { openDocumentPicker } from '../helpers'
import {
	checkBluetoothPermission,
	permissionExplanation,
	requestBluetoothPermission,
} from '../settings/Bluetooth'

const CreateAccountBody = ({ next }) => {
	const ctx = useMsgrContext()
	const { t } = useTranslation()
	const [{ text, padding, margin, border }] = useStyles()
	const [name, setName] = React.useState('')
	const [isPressed, setIsPressed] = useState(false)

	React.useEffect(() => {
		ctx
			.getUsername()
			.then(({ username }) => setName(username))
			.catch((err2) => console.warn('Failed to fetch username:', err2))
	}, [ctx])

	const handlePersistentOptions = React.useCallback(async () => {
		const setPermissions = async (state) => {
			console.log('Bluetooth permissions: ' + state)
			await ctx.setPersistentOption({
				type: PersistentOptionsKeys.BLE,
				payload: {
					enable: state === 'granted' ? true : false,
				},
			})
			await ctx.setPersistentOption({
				type: PersistentOptionsKeys.MC,
				payload: {
					enable: state === 'granted' ? true : false,
				},
			})
			await ctx.setPersistentOption({
				type: PersistentOptionsKeys.Nearby,
				payload: {
					enable: state === 'granted' ? true : false,
				},
			})
		}
		checkBluetoothPermission()
			.then(async (result) => {
				if (result === 'granted') {
					await setPermissions(result)
				} else if (result === 'blocked') {
					await permissionExplanation(t, () => {
						Linking.openSettings()
					})
				} else if (result !== 'unavailable') {
					await permissionExplanation(t, () => {})
					const permission = await requestBluetoothPermission()
					await setPermissions(permission)
				}
				await ctx.createNewAccount()
				setIsPressed(true)
			})
			.catch((err) => {
				console.log('The Bluetooth permission cannot be retrieved:', err)
			})
	}, [ctx, t])

	const onPress = React.useCallback(async () => {
		const displayName = name || `anon#${ctx.account.publicKey.substr(0, 4)}`
		await AsyncStorage.setItem('displayName', displayName)
		handlePersistentOptions()
			.then(() => {})
			.catch((err) => {
				console.log(err)
			})
	}, [ctx, name, handlePersistentOptions])

	return (
		<Translation>
			{(t) => (
				<>
					<View style={{ flex: 1 }}>
						<LottieView
							source={require('./Berty_onboard_animation_assets2/Startup animation assets/Berty BG.json')}
							autoPlay
							loop
							style={{ width: '100%' }}
						/>
						{!isPressed ? (
							<LottieView
								source={require('./Berty_onboard_animation_assets2/Startup animation assets/Shield appear.json')}
								autoPlay
								loop={false}
							/>
						) : (
							<LottieView
								source={require('./Berty_onboard_animation_assets2/Startup animation assets/Shield dissapear.json')}
								autoPlay
								loop={false}
								onAnimationFinish={async () => {
									Vibration.vibrate(500)
									next()
								}}
							/>
						)}
					</View>
					<View style={{ flex: 1 }}>
						<SwiperCard
							label={t('onboarding.create-account.required')}
							title={t('onboarding.create-account.title')}
							description={t('onboarding.create-account.desc')}
							button={{
								text: t('onboarding.create-account.button'),
								onPress,
							}}
							secondButton={{
								text: t('onboarding.create-account.import-account'),
								onPress: () => openDocumentPicker(ctx),
							}}
						>
							<TextInput
								autoCapitalize='none'
								autoCorrect={false}
								value={name}
								onChangeText={setName}
								placeholder={t('onboarding.create-account.placeholder')}
								style={[
									margin.top.medium,
									padding.medium,
									text.size.large,
									border.radius.small,
									text.color.black,
									text.bold.small,
									{ backgroundColor: '#F7F8FF', fontFamily: 'Open Sans' },
								]}
							/>
						</SwiperCard>
					</View>
				</>
			)}
		</Translation>
	)
}

export const CreateAccount = () => {
	useNotificationsInhibitor(() => true)
	const { navigate } = useNavigation()
	const [{ color }] = useStyles()

	return (
		<OnboardingWrapper>
			<StatusBar backgroundColor={color.blue} barStyle='light-content' />
			<CreateAccountBody next={() => navigate('Onboarding.SetupFinished')} />
		</OnboardingWrapper>
	)
}
