import LottieView from 'lottie-react-native'
import React from 'react'
import { Platform, Vibration } from 'react-native'
import { useTranslation } from 'react-i18next'
import { StatusBar, Text, View } from 'react-native'
import { useHeaderHeight } from '@react-navigation/elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ScreenFC } from '@berty-tech/navigation'
import {
	useMessengerContext,
	useMountEffect,
	useNotificationsInhibitor,
	useThemeColor,
} from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import { IOSOnlyKeyboardAvoidingView } from '@berty-tech/rnutil/keyboardAvoiding'

import { CreateAccountBox } from './CreateAccountBox'
import OnboardingWrapper from './OnboardingWrapper'
import rnutil from '@berty-tech/rnutil'

const CreateAccountBody = () => {
	const ctx = useMessengerContext()
	const [{ padding, margin, border }] = useStyles()
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
					onAnimationFinish={async () => {
						Vibration.vibrate(500)
						if (Platform.OS !== 'web') {
							await rnutil.checkPermissions('proximity')
						}
					}}
					style={{ position: 'absolute', width: '100%' }}
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