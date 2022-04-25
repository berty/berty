import LottieView from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { StatusBar, View } from 'react-native'

import { ScreenFC, useNavigation } from '@berty/navigation'
import { useNotificationsInhibitor, useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'

import OnboardingWrapper from '@berty/components/onboarding/OnboardingWrapper'
import { Icon } from '@ui-kitten/components'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

const CustomModeBody: React.FC = () => {
	const { goBack } = useNavigation()
	const colors = useThemeColor()
	const { padding, border, margin, text } = useStyles()
	const { scaleSize } = useAppDimensions()
	const { navigate } = useNavigation()
	const { t }: { t: any } = useTranslation()

	return (
		<View style={[{ flex: 1 }]}>
			<LottieView
				source={require('@berty/assets/lottie/Berty_onboard_animation_assets2/Startup animation assets/Berty BG.json')}
				autoPlay
				loop
				style={{ width: '100%', position: 'absolute' }}
			/>
			<LottieView
				source={require('@berty/assets/lottie/Berty_onboard_animation_assets2/Startup animation assets/Shield appear.json')}
				autoPlay
				loop={false}
				style={{ position: 'absolute', top: -20, width: '100%' }}
			/>
			<View
				style={[
					padding.horizontal.medium,
					{ flex: 1, top: -(30 * scaleSize), justifyContent: 'flex-end' },
				]}
			>
				<View
					style={[
						border.shadow.large,
						padding.medium,
						border.radius.medium,
						{ backgroundColor: colors['main-background'], shadowColor: colors.shadow },
					]}
				>
					<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
						<Icon
							style={[margin.right.small]}
							name='info'
							pack='feather'
							width={23}
							fill={colors['background-header']}
						/>
						<UnifiedText
							style={[
								text.bold,
								{
									color: colors['background-header'],
									fontSize: 24 * scaleSize,
								},
							]}
						>
							{t('onboarding.custom-mode.summary.title')}
						</UnifiedText>
					</View>
					<View style={[margin.top.medium]}>
						<UnifiedText style={[text.bold, { textAlign: 'center' }]}>
							{t('onboarding.custom-mode.summary.subtitle')}
						</UnifiedText>
					</View>
					<View style={[margin.top.medium]}>
						<UnifiedText style={{ textAlign: 'center' }}>
							{t('onboarding.custom-mode.summary.first-point')}
						</UnifiedText>
					</View>
					<View style={[margin.top.medium]}>
						<UnifiedText style={[{ textAlign: 'center' }]}>
							{t('onboarding.custom-mode.summary.second-point')}
						</UnifiedText>
					</View>
				</View>
				<View
					style={[
						margin.top.small,
						margin.bottom.medium,
						{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-between',
						},
					]}
				>
					<TouchableOpacity
						style={[
							padding.medium,
							border.radius.medium,
							{ width: 170 * scaleSize, backgroundColor: '#EBECFF' },
						]}
						onPress={() => goBack()}
					>
						<UnifiedText
							style={[
								text.bold,
								{
									textTransform: 'uppercase',
									color: colors['background-header'],
									textAlign: 'center',
								},
							]}
						>
							{t('onboarding.custom-mode.summary.back-button')}
						</UnifiedText>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							padding.medium,
							border.radius.medium,
							{ width: 170 * scaleSize, backgroundColor: '#3744DD' },
						]}
						onPress={() => {
							navigate('Onboarding.CustomModeSettings')
						}}
					>
						<UnifiedText
							style={[
								text.bold,
								{
									textTransform: 'uppercase',
									color: colors['reverted-main-text'],
									textAlign: 'center',
								},
							]}
						>
							{t('onboarding.custom-mode.summary.accept-button')}
						</UnifiedText>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}

export const CustomMode: ScreenFC<'Onboarding.CustomMode'> = () => {
	useNotificationsInhibitor(() => true)
	const colors = useThemeColor()

	return (
		<OnboardingWrapper>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<CustomModeBody />
		</OnboardingWrapper>
	)
}
