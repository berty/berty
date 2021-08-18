import React, { useState } from 'react'
import { View, TextInput, Vibration, StatusBar, Platform } from 'react-native'
import { Translation } from 'react-i18next'
import LottieView from 'lottie-react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-community/async-storage'
import { RESULTS } from 'react-native-permissions'
import DocumentPicker from 'react-native-document-picker'
import getPath from '@flyerhq/react-native-android-uri-path'

import { useStyles } from '@berty-tech/styles'
import { useNotificationsInhibitor, useThemeColor } from '@berty-tech/store/hooks'
import { GlobalPersistentOptionsKeys, useMsgrContext } from '@berty-tech/store/context'

import SwiperCard from './SwiperCard'
import OnboardingWrapper from './OnboardingWrapper'
import { checkPermissions } from '../utils'

const openDocumentPicker = async ctx => {
	try {
		const res = await DocumentPicker.pick({
			// @ts-ignore
			type: Platform.OS === 'android' ? ['application/x-tar'] : ['public.tar-archive'],
		})
		const replaced =
			Platform.OS === 'android' ? getPath(res.uri) : res.uri.replace(/^file:\/\//, '')
		await ctx.importAccount(replaced)
	} catch (err) {
		if (DocumentPicker.isCancel(err)) {
			// ignore
		} else {
			console.error(err)
		}
	}
}

const CreateAccountBody = ({ next }) => {
	const ctx = useMsgrContext()
	const [{ text, padding, margin, border }] = useStyles()
	const colors = useThemeColor()
	const [name, setName] = React.useState('')
	const [isPressed, setIsPressed] = useState(false)

	React.useEffect(() => {
		ctx
			.getUsername()
			.then(({ username }) => setName(username))
			.catch(err2 => console.warn('Failed to fetch username:', err2))
	}, [ctx])

	const handlePersistentOptions = React.useCallback(async () => {
		const preset = await AsyncStorage.getItem(GlobalPersistentOptionsKeys.Preset)

		if (preset === 'performance') {
			const status = await checkPermissions('p2p', {
				isToNavigate: false,
			})
			if (status === RESULTS.GRANTED || status === RESULTS.UNAVAILABLE) {
				await ctx.createNewAccount()
			} else {
				await checkPermissions('p2p', {
					navigateNext: 'Onboarding.SetupFinished',
					createNewAccount: true,
					isToNavigate: true,
				})
			}
		} else {
			await ctx.createNewAccount()
		}

		setIsPressed(true)
	}, [ctx])

	const onPress = React.useCallback(async () => {
		const displayName = name || `anon#${ctx.account.publicKey.substr(0, 4)}`
		await AsyncStorage.setItem(GlobalPersistentOptionsKeys.DisplayName, displayName)

		handlePersistentOptions()
			.then(() => {})
			.catch(err => {
				console.log(err)
			})
	}, [ctx, name, handlePersistentOptions])

	return (
		<Translation>
			{t => (
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
									const status = await checkPermissions('p2p', {
										isToNavigate: false,
									})
									if (status === RESULTS.GRANTED || status === RESULTS.UNAVAILABLE) {
										next()
									}
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
									text.bold.small,
									{
										backgroundColor: colors['input-background'],
										fontFamily: 'Open Sans',
										color: colors['main-text'],
									},
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
	const colors = useThemeColor()

	return (
		<OnboardingWrapper>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<CreateAccountBody next={() => navigate('Onboarding.SetupFinished')} />
		</OnboardingWrapper>
	)
}
