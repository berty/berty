import { useHeaderHeight } from '@react-navigation/elements'
import LottieView from 'lottie-react-native'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {  useWindowDimensions, Vibration } from 'react-native'
import { StatusBar, View } from 'react-native'
import OnboardingWrapper from '@berty/components/onboarding/OnboardingWrapper'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { CreateAccountBox } from '@berty/screens/onboarding/CreateAccount/components/CreateAccountBox'
import { IOSOnlyKeyboardAvoidingView } from '@berty/utils/react-native/keyboardAvoiding'
import * as Device from 'expo-device';


const CreateAccountBody = () => {
	const { height: windowHeight, width: windowWidth } = useWindowDimensions()
	const { padding, margin, border, text } = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const headerHeight = useHeaderHeight()

	const animation = useRef<LottieView>(null);

	return (
		<View style={[{ flex: 1 }]}>
			<View>
				<LottieView
					source={require('@berty/assets/lottie/Berty_onboard_animation_assets2/Startup animation assets/Berty BG.json')}
					autoPlay
					loop
					style={{position: 'absolute',width: windowWidth, height: windowHeight}}
				/>
				<LottieView
					source={require('@berty/assets/lottie/Berty_onboard_animation_assets2/Startup animation assets/Shield appear.json')}
					autoPlay
					loop={false}
					onAnimationFinish={() => Vibration.vibrate(500)}
					style={{position: 'absolute', width: windowWidth, height: 400, marginTop: 80}}
					/>
			</View>

			<IOSOnlyKeyboardAvoidingView
				style={{ flex: 1, justifyContent: 'flex-end' }}
				behavior='padding'
				keyboardVerticalOffset={headerHeight + 40}
			>
				<CreateAccountBox defaultName={Device.deviceName || ''} />
			</IOSOnlyKeyboardAvoidingView>

			<View>
				<View
					style={[
						padding.medium,
						margin.bottom.medium,
						margin.horizontal.medium,
						border.radius.large,
						{ backgroundColor: colors['main-background'] },
					]}
				>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<View style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}>
							<UnifiedText style={[text.bold]}>
								{t('onboarding.create-account.good-to-know.title')}
							</UnifiedText>
							<UnifiedText>{t('onboarding.create-account.good-to-know.first-point')}</UnifiedText>
							<UnifiedText>{t('onboarding.create-account.good-to-know.second-point')}</UnifiedText>
						</View>
					</View>
				</View>
			</View>
		</View>
	)
}

export const CreateAccount = () => {
	// useNotificationsInhibitor(() => true)
	const colors = useThemeColor()

	return (
		<OnboardingWrapper>
			{/* <StatusBar backgroundColor={colors['background-header']} barStyle='light-content' /> */}
			<CreateAccountBody />
		</OnboardingWrapper>
	)
}

export default CreateAccount
