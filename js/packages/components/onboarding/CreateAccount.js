import React, { useState } from 'react'
import { View, TextInput, Vibration, StatusBar, Platform, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
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
			Platform.OS === 'android' ? getPath(res[0].uri) : res[0].uri.replace(/^file:\/\//, '')
		await ctx.importAccount(replaced)
	} catch (err) {
		if (DocumentPicker.isCancel(err)) {
			// ignore
		} else {
			console.error(err)
		}
	}
}

const CreateAccountBody = () => {
	const ctx = useMsgrContext()
	const [{ text, padding, margin, border }] = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const [name, setName] = React.useState('')
	const [isPressed, setIsPressed] = useState(false)
	const [isFinished, setIsFinished] = useState(false)
	const { navigate } = useNavigation()

	React.useEffect(() => {
		ctx
			.getUsername()
			.then(({ username }) => setName(username))
			.catch(err2 => console.warn('Failed to fetch username:', err2))
		// eslint-disable-next-line
	}, [])

	const handlePersistentOptions = React.useCallback(async () => {
		const preset = await AsyncStorage.getItem(GlobalPersistentOptionsKeys.Preset)

		if (preset === 'performance') {
			const status = await checkPermissions('p2p', navigate, {
				isToNavigate: false,
			})
			if (status === RESULTS.GRANTED || status === RESULTS.UNAVAILABLE) {
				setIsPressed(true)
				await ctx.createNewAccount()
			} else {
				await checkPermissions('p2p', navigate, {
					navigateNext: 'Onboarding.SetupFinished',
					createNewAccount: true,
					isToNavigate: true,
				})
			}
		} else {
			setIsPressed(true)
			await ctx.createNewAccount()
		}
		setIsFinished(true)
	}, [ctx, navigate])

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
		<>
			<View style={{ flex: 1 }}>
				<LottieView
					source={require('./Berty_onboard_animation_assets2/Startup animation assets/Berty BG.json')}
					autoPlay
					loop
					style={{ width: '100%' }}
				/>
				{!isFinished ? (
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
							await checkPermissions('p2p', navigate, {
								isToNavigate: false,
							})
						}}
					/>
				)}
			</View>
			<View style={{ flex: 1 }}>
				{!isPressed ? (
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
				) : (
					<SwiperCard
						label={t('onboarding.create-account.required')}
						title='Creating...'
						description='Your account is creating...'
					>
						<ActivityIndicator size='large' style={[margin.top.medium]} />
					</SwiperCard>
				)}
			</View>
		</>
	)
}

export const CreateAccount = () => {
	useNotificationsInhibitor(() => true)
	const colors = useThemeColor()

	return (
		<OnboardingWrapper>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<CreateAccountBody />
		</OnboardingWrapper>
	)
}
