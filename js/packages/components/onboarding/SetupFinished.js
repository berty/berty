import React, { useState } from 'react'
import { View, Linking, ActivityIndicator as Spinner, Vibration } from 'react-native'
import { Translation, useTranslation } from 'react-i18next'
import LottieView from 'lottie-react-native'
import { useNotificationsInhibitor } from '@berty-tech/store/hooks'
import { MessengerActions, PersistentOptionsKeys, useMsgrContext } from '@berty-tech/store/context'
import SwiperCard from './SwiperCard'
import OnboardingWrapper from './OnboardingWrapper'
import {
	checkBluetoothPermission,
	requestBluetoothPermission,
	permissionExplanation,
} from '../settings/Bluetooth'

const SetupFinishedBody = () => {
	const [isGeneration, setIsGeneration] = useState(1)
	const [isGenerated, setIsGenerated] = useState(false)
	const [isFinished, setIsFinished] = useState(false)
	const [isAccount, setIsAccount] = useState(false)
	const client = {}
	const { setPersistentOption, dispatch } = useMsgrContext()
	const { t } = useTranslation()

	React.useEffect(() => {
		const handlePersistentOptions = async () => {
			const setPermissions = async (state) => {
				console.log('Bluetooth permissions: ' + state)
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
			}
			checkBluetoothPermission()
				.then(async (result) => {
					if (result === 'granted') {
						setPermissions(result)
					} else if (result === 'blocked') {
						permissionExplanation(t, () => {
							Linking.openSettings()
						})
					} else {
						permissionExplanation(t, () => {
							requestBluetoothPermission().then((permission) => {
								setPermissions(permission)
							})
						})
					}
				})
				.catch((err) => {
					console.log('The Bluetooth permission cannot be retrieved:', err)
				})
		}

		return () => {
			handlePersistentOptions().catch((e) => console.warn(e))
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<Translation>
			{(t) =>
				isAccount ? (
					<>
						{isFinished && (
							<LottieView
								source={require('./confetti.json')}
								autoPlay
								loop={false}
								style={{
									position: 'absolute',
									top: 20,
									left: 0,
									transform: [
										{
											scale: 1.4,
										},
									],
									zIndex: 9,
								}}
							/>
						)}
						<View style={{ flex: 1 }}>
							<LottieView
								source={require('./Berty_onboard_animation_assets2/Startup animation assets/Berty BG.json')}
								autoPlay
								loop
								style={{ width: '100%' }}
							/>

							{!isFinished &&
								(!isGenerated ? (
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
									<LottieView
										source={require('./Berty_onboard_animation_assets2/Startup animation assets/Finish appear.json')}
										autoPlay
										loop={false}
									/>
								))}
						</View>
						<View style={{ flex: 1 }}>
							<SwiperCard
								title={t('onboarding.setup-finished.title')}
								description={t('onboarding.setup-finished.desc')}
								button={{
									text: t('onboarding.setup-finished.button'),
									onPress: () => {
										setIsFinished(true)
										Vibration.vibrate([500])
										setTimeout(() => dispatch({ type: MessengerActions.SetStateReady }), 2000)
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
