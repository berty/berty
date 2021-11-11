import React, { useState } from 'react'
import { View, TextInput, Vibration, StatusBar, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import LottieView from 'lottie-react-native'
import { useNavigation } from '@react-navigation/native'

import { useStyles } from '@berty-tech/styles'
import {
	GlobalPersistentOptionsKeys,
	storageSet,
	useMessengerContext,
	useMountEffect,
	useNotificationsInhibitor,
	useThemeColor,
} from '@berty-tech/store'
import rnutil from '@berty-tech/rnutil'

import SwiperCard from './SwiperCard'
import OnboardingWrapper from './OnboardingWrapper'
import { ScreenFC } from '@berty-tech/navigation'
import { importAccountFromDocumentPicker } from '../pickerUtils'

const CreateAccountBody = () => {
	const ctx = useMessengerContext()
	const [{ text, padding, margin, border }] = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const [name, setName] = React.useState('')
	const [isPressed, setIsPressed] = useState(false)
	const [isFinished, setIsFinished] = useState(false)
	const { navigate } = useNavigation()

	useMountEffect(() => {
		ctx
			.getUsername()
			.then(reply => reply && setName(reply.username))
			.catch(err2 => console.warn('Failed to fetch username:', err2))
	})

	const handlePersistentOptions = React.useCallback(async () => {
		setIsPressed(true)
		await ctx.createNewAccount()
		setIsFinished(true)
	}, [ctx])

	const onPress = React.useCallback(async () => {
		const displayName = name || `anon#${ctx?.account?.publicKey?.substr(0, 4)}`
		await storageSet(GlobalPersistentOptionsKeys.DisplayName, displayName)

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
							await rnutil.checkPermissions('p2p', navigate, {
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
							onPress: () => importAccountFromDocumentPicker(ctx),
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
						<ActivityIndicator
							size='large'
							style={[margin.top.medium]}
							color={colors['secondary-text']}
						/>
					</SwiperCard>
				)}
			</View>
		</>
	)
}

export const CreateAccount: ScreenFC<'Onboarding.CreateAccount'> = () => {
	useNotificationsInhibitor(() => true)
	const colors = useThemeColor()

	return (
		<OnboardingWrapper>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<CreateAccountBody />
		</OnboardingWrapper>
	)
}
