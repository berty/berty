import React, { useState } from 'react'
import { View, TextInput, Vibration } from 'react-native'
import { Text } from '@ui-kitten/components'
import { Translation } from 'react-i18next'
import LottieView from 'lottie-react-native'
import { useNavigation } from '@react-navigation/native'

import { useStyles } from '@berty-tech/styles'
import { useMsgrContext } from '@berty-tech/store/context'
import { useNotificationsInhibitor } from '@berty-tech/store/hooks'
import messengerMethodsHooks from '@berty-tech/store/methods'
import { globals } from '@berty-tech/config'

import SwiperCard from './SwiperCard'
import OnboardingWrapper from './OnboardingWrapper'

const CreateAccountBody = ({ next }) => {
	const ctx = useMsgrContext()
	const [{ text, padding, margin, border }] = useStyles()
	const [name, setName] = React.useState('')
	const [error, setError] = React.useState()
	const [isPressed, setIsPressed] = useState(false)
	const { call: requestContact, err, done } = messengerMethodsHooks.useContactRequest()

	React.useEffect(() => {
		ctx.client
			.getUsername()
			.then(({ username }) => setName(username))
			.catch((err2) => console.warn('Failed to fetch username:', err2))
	}, [ctx.client])

	const onPress = React.useCallback(() => {
		const displayName = name || `anon#${ctx.account.publicKey.substr(0, 4)}`
		ctx.client
			.accountUpdate({ displayName })
			.then(async () => {
				requestContact({
					link: __DEV__
						? globals.berty.contacts['betabot-dev'].link
						: globals.berty.contacts.betabot.link,
				})
			})
			.catch((err2) => setError(err2))
	}, [ctx.client, ctx.account, name, requestContact])

	React.useEffect(() => {
		if (done && !err) {
			setIsPressed(true)
		}
	}, [done, err])

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
								onAnimationFinish={() => {
									Vibration.vibrate(500)
									// @TODO: Error handling
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
							{error && <Text>{error.toString()}</Text>}
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

	return (
		<OnboardingWrapper>
			<CreateAccountBody next={() => navigate('Onboarding.ServicesAuth')} />
		</OnboardingWrapper>
	)
}
