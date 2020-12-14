import React, { useState } from 'react'
import { View, ActivityIndicator as Spinner, Vibration } from 'react-native'
import { Translation } from 'react-i18next'
import LottieView from 'lottie-react-native'
import { useNotificationsInhibitor } from '@berty-tech/store/hooks'
import { MessengerActions, PersistentOptionsKeys, useMsgrContext } from '@berty-tech/store/context'
import SwiperCard from './SwiperCard'
import OnboardingWrapper from './OnboardingWrapper'

const SetupFinishedBody = () => {
	const [isGeneration, setIsGeneration] = useState(1)
	const [isGenerated, setIsGenerated] = useState(false)
	const [isFinished, setIsFinished] = useState(false)
	const [isAccount, setIsAccount] = useState(false)
	const client = {}
	const { setPersistentOption, contacts, persistentOptions, dispatch } = useMsgrContext()

	React.useEffect(() => {
		const handlePersistentOptions = async () => {
			await setPersistentOption({
				type: PersistentOptionsKeys.BetaBot,
				payload: {
					added: false,
					convPk: Object.values(contacts)[0].publicKey,
				},
			})
			await setPersistentOption({
				type: PersistentOptionsKeys.I18N,
				payload: {
					language: 'enUS',
				},
			})
			await setPersistentOption({
				type: PersistentOptionsKeys.Notifications,
				payload: {
					enable: true,
				},
			})
			await setPersistentOption({
				type: PersistentOptionsKeys.BLE,
				payload: {
					enable: true,
				},
			})
			await setPersistentOption({
				type: PersistentOptionsKeys.MC,
				payload: {
					enable: true,
				},
			})
			await setPersistentOption({
				type: PersistentOptionsKeys.Debug,
				payload: {
					enable: false,
				},
			})
			await setPersistentOption({
				type: PersistentOptionsKeys.Tor,
				payload: {
					flag: 'disabled',
				},
			})
		}

		return () => {
			handlePersistentOptions().catch((e) => console.warn(e))
		}
	}, [persistentOptions, contacts, setPersistentOption])

	return (
		<Translation>
			{(t) =>
				isAccount ? (
					<>
						<View style={{ flex: 1 }}>
							<LottieView
								source={require('./Berty_onboard_animation_assets2/Startup animation assets/Berty BG.json')}
								autoPlay
								loop
								style={{ width: '100%' }}
							/>
							{!isGenerated ? (
								<>
									<LottieView
										source={require('./Berty_onboard_animation_assets2/Startup animation assets/Circle spin.json')}
										autoPlay
										loop={false}
									/>
									<LottieView
										source={require('./Berty_onboard_animation_assets2/Startup animation assets/Code Generated.json')}
										autoPlay
										loop={false}
										onAnimationFinish={() => {
											setIsGenerated(true)
										}}
									/>
								</>
							) : (
								<>
									{!isFinished ? (
										<LottieView
											source={require('./Berty_onboard_animation_assets2/Startup animation assets/Finish appear.json')}
											autoPlay
											loop={false}
											onAnimationFinish={() => {
												setIsFinished(true)
											}}
										/>
									) : (
										<LottieView
											source={require('./Berty_onboard_animation_assets2/Startup animation assets/Finish loop.json')}
											autoPlay
											loop
										/>
									)}
								</>
							)}
						</View>
						<View style={{ flex: 1 }}>
							<SwiperCard
								title={t('onboarding.setup-finished.title')}
								description={t('onboarding.setup-finished.desc')}
								button={{
									text: t('onboarding.setup-finished.button'),
									onPress: () => {
										Vibration.vibrate([500])
										dispatch({ type: MessengerActions.SetStateReady })
									},
								}}
							/>
						</View>
					</>
				) : (
					<>
						<View style={{ flex: 1 }}>
							<LottieView
								source={require('./Berty_onboard_animation_assets2/Startup animation assets/Berty BG.json')}
								autoPlay
								loop
								style={{ width: '100%' }}
							/>
							{isGeneration === 1 && (
								<LottieView
									source={require('./Berty_onboard_animation_assets2/Startup animation assets/Code generation row 1.json')}
									autoPlay
									loop={false}
									speed={2}
									onAnimationFinish={() => {
										client ? setIsAccount(true) : setIsGeneration(2)
									}}
								/>
							)}
							{isGeneration === 2 && (
								<LottieView
									source={require('./Berty_onboard_animation_assets2/Startup animation assets/Code generation row 2.json')}
									autoPlay
									loop={false}
									speed={2}
									onAnimationFinish={() => {
										client ? setIsAccount(true) : setIsGeneration(3)
									}}
								/>
							)}
							{isGeneration === 3 && (
								<LottieView
									source={require('./Berty_onboard_animation_assets2/Startup animation assets/Code generation row 3.json')}
									autoPlay
									loop={false}
									speed={2}
									onAnimationFinish={() => {
										client ? setIsAccount(true) : setIsGeneration(4)
									}}
								/>
							)}
							{isGeneration === 4 && (
								<LottieView
									source={require('./Berty_onboard_animation_assets2/Startup animation assets/Code generation row 4.json')}
									autoPlay
									loop={false}
									speed={2}
									onAnimationFinish={() => {
										client ? setIsAccount(true) : setIsGeneration(1)
									}}
								/>
							)}
						</View>
						<View style={{ flex: 1 }}>
							<SwiperCard
								title={t('onboarding.generate-key.title')}
								description={t('onboarding.generate-key.desc')}
							>
								<Spinner size='large' />
							</SwiperCard>
						</View>
					</>
				)
			}
		</Translation>
	)
}

export const SetupFinished = () => {
	useNotificationsInhibitor(() => true)
	return (
		<OnboardingWrapper>
			<SetupFinishedBody />
		</OnboardingWrapper>
	)
}

export default SetupFinished
