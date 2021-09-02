import React, { useState } from 'react'
import { View, ActivityIndicator as Spinner, Vibration, StatusBar } from 'react-native'
import { useTranslation } from 'react-i18next'
import LottieView from 'lottie-react-native'
import { CommonActions } from '@react-navigation/native'

import { useNotificationsInhibitor, useThemeColor } from '@berty-tech/store/hooks'
import { PersistentOptionsKeys, useMsgrContext } from '@berty-tech/store/context'
import { Routes } from '@berty-tech/navigation'
import { dispatch as navDispatch } from '@berty-tech/navigation/rootRef'

import SwiperCard from './SwiperCard'
import OnboardingWrapper from './OnboardingWrapper'

const SetupFinishedBody = () => {
	const { t }: any = useTranslation()
	const colors = useThemeColor()
	const [isGeneration, setIsGeneration] = useState(1)
	const [isGenerated, setIsGenerated] = useState(false)
	const [isFinished, setIsFinished] = useState(false)
	const [isAccount, setIsAccount] = useState(false)
	const client = {}
	const { setPersistentOption } = useMsgrContext()

	return isAccount ? (
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
						onPress: async () => {
							await setPersistentOption({
								type: PersistentOptionsKeys.OnBoardingFinished,
								payload: {
									isFinished: true,
								},
							})
							setIsFinished(true)
							Vibration.vibrate([500])
							setTimeout(
								() =>
									navDispatch(
										CommonActions.reset({
											routes: [{ name: Routes.Main.Home }],
										}),
									),
								1500,
							)
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
					<Spinner size='large' color={colors['secondary-text']} />
				</SwiperCard>
			</View>
		</>
	)
}

export const SetupFinished = () => {
	useNotificationsInhibitor(() => true)
	const colors = useThemeColor()

	return (
		<OnboardingWrapper>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<SetupFinishedBody />
		</OnboardingWrapper>
	)
}

export default SetupFinished
