import LottieView from 'lottie-react-native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator as Spinner, StatusBar, Vibration, View } from 'react-native'

import OnboardingWrapper from '@berty/components/onboarding/OnboardingWrapper'
import SwiperCard from '@berty/components/onboarding/SwiperCard'
import { useNotificationsInhibitor, useThemeColor } from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'

/**
 * FIXME: rewrite this component, the client ternaries always go through the first path
 * so only the first animation is played and the variables are oddly named
 */

const SetupFinishedBody = () => {
	const { t } = useTranslation()
	const colors = useThemeColor()
	const [isGeneration, setIsGeneration] = useState(1)
	const [isGenerated, setIsGenerated] = useState(false)
	const [isFinished, setIsFinished] = useState(false)
	const [isAccount, setIsAccount] = useState(false)
	const client = {}
	const { reset } = useNavigation()

	return isAccount ? (
		<>
			{isFinished && (
				<LottieView
					source={require('@berty/assets/lottie/confetti-lottie.json')}
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
			<View style={{ flex: 4 }}>
				<LottieView
					source={require('@berty/assets/lottie/Berty_onboard_animation_assets2/Startup animation assets/Berty BG.json')}
					autoPlay
					loop
					style={{ width: '100%' }}
				/>

				{!isFinished &&
					(!isGenerated ? (
						<>
							<LottieView
								source={require('@berty/assets/lottie/Berty_onboard_animation_assets2/Startup animation assets/Circle spin.json')}
								autoPlay
								loop={false}
							/>
							<LottieView
								source={require('@berty/assets/lottie/Berty_onboard_animation_assets2/Startup animation assets/Code Generated.json')}
								autoPlay
								loop={false}
								onAnimationFinish={() => {
									setIsGenerated(true)
								}}
							/>
						</>
					) : (
						<LottieView
							source={require('@berty/assets/lottie/Berty_onboard_animation_assets2/Startup animation assets/Finish appear.json')}
							autoPlay
							loop={false}
						/>
					))}
			</View>
			<View style={{ flex: 3 }}>
				<SwiperCard
					title={t('onboarding.setup-finished.title')}
					desc={t('onboarding.setup-finished.desc')}
					button={{
						text: t('onboarding.setup-finished.button'),
						accessibilityLabel: t('onboarding.setup-finished.button'),
						onPress: () => {
							setIsFinished(true)
							Vibration.vibrate([500])
							setTimeout(
								() =>
									reset({
										routes: [
											{
												name: 'Chat.Home',
											},
										],
									}),
								1500,
							)
						},
					}}
				/>
			</View>
		</>
	) : (
		<>
			<View style={{ flex: 4 }}>
				<LottieView
					source={require('@berty/assets/lottie/Berty_onboard_animation_assets2/Startup animation assets/Berty BG.json')}
					autoPlay
					loop
					style={{ width: '100%' }}
				/>
				{isGeneration === 1 && (
					<LottieView
						source={require('@berty/assets/lottie/Berty_onboard_animation_assets2/Startup animation assets/Code generation row 1.json')}
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
						source={require('@berty/assets/lottie/Berty_onboard_animation_assets2/Startup animation assets/Code generation row 2.json')}
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
						source={require('@berty/assets/lottie/Berty_onboard_animation_assets2/Startup animation assets/Code generation row 3.json')}
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
						source={require('@berty/assets/lottie/Berty_onboard_animation_assets2/Startup animation assets/Code generation row 4.json')}
						autoPlay
						loop={false}
						speed={2}
						onAnimationFinish={() => {
							client ? setIsAccount(true) : setIsGeneration(1)
						}}
					/>
				)}
			</View>
			<View style={{ flex: 3 }}>
				<SwiperCard
					title={t('onboarding.generate-key.title')}
					desc={t('onboarding.generate-key.desc')}
				>
					<Spinner size='large' color={colors['secondary-text']} />
				</SwiperCard>
			</View>
		</>
	)
}

export const SetupFinished: ScreenFC<'Onboarding.SetupFinished'> = () => {
	useNotificationsInhibitor(() => true)
	const colors = useThemeColor()

	return (
		<OnboardingWrapper>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<SetupFinishedBody />
		</OnboardingWrapper>
	)
}
