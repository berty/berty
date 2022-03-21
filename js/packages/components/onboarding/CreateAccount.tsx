import React from 'react'

import { useHeaderHeight } from '@react-navigation/elements'
import LottieView from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import { StatusBar, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ScreenFC } from '@berty-tech/navigation'
import { IOSOnlyKeyboardAvoidingView } from '@berty-tech/rnutil/keyboardAvoiding'
import {
	useMessengerContext,
	useMountEffect,
	useNotificationsInhibitor,
	useThemeColor,
} from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'

import { CreateAccountBox } from './CreateAccountBox'
import OnboardingWrapper from './OnboardingWrapper'

const CreateAccountBody = () => {
	const ctx = useMessengerContext()
	const [{ padding, margin, border }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const [defaultName, setDefaultName] = React.useState('')
	const { t } = useTranslation()
	const headerHeight = useHeaderHeight()
	const insets = useSafeAreaInsets()

	useMountEffect(() => {
		ctx
			.getUsername()
			.then(reply => reply && setDefaultName(reply.username))
			.catch(err2 => console.warn('Failed to fetch username:', err2))
	})

	return (
		<View style={[{ flex: 1 }]}>
			<View>
				<LottieView
					source={require('./Berty_onboard_animation_assets2/Startup animation assets/Berty BG.json')}
					autoPlay
					loop
					style={{ width: '100%', position: 'absolute' }}
				/>
				<LottieView
					source={require('./Berty_onboard_animation_assets2/Startup animation assets/Shield appear.json')}
					autoPlay
					loop={false}
					style={{ position: 'absolute', top: -(25 * scaleSize), width: '100%' }}
				/>
			</View>

			<IOSOnlyKeyboardAvoidingView
				style={{ flex: 1, justifyContent: 'flex-end' }}
				behavior='padding'
				keyboardVerticalOffset={headerHeight + insets.top}
			>
				{!!defaultName && <CreateAccountBox defaultName={defaultName} />}
			</IOSOnlyKeyboardAvoidingView>
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
						<Text style={[{ fontFamily: 'Open Sans', fontWeight: '600' }]}>
							{t('onboarding.create-account.good-to-know.title')}
						</Text>
						<Text style={{ fontFamily: 'Open Sans' }}>
							{t('onboarding.create-account.good-to-know.first-point')}
						</Text>
						<Text style={{ fontFamily: 'Open Sans' }}>
							{t('onboarding.create-account.good-to-know.second-point')}
						</Text>
					</View>
				</View>
			</View>
		</View>
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
