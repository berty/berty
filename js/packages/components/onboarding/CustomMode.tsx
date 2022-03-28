import LottieView from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { StatusBar, View } from 'react-native'

import { ScreenFC, useNavigation } from '@berty/navigation'
import { useNotificationsInhibitor, useThemeColor } from '@berty/store'
import { useStyles } from '@berty/styles'

import OnboardingWrapper from './OnboardingWrapper'
import { Icon } from '@ui-kitten/components'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { BText } from '../shared-components/BText'

const CustomModeBody: React.FC = () => {
	const { goBack } = useNavigation()
	const colors = useThemeColor()
	const [{ padding, border, margin }, { scaleSize }] = useStyles()
	const { navigate } = useNavigation()
	const { t }: { t: any } = useTranslation()

	return (
		<View style={[{ flex: 1 }]}>
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
						<BText
							style={[
								{
									fontWeight: '700',
									color: colors['background-header'],
									fontSize: 24 * scaleSize,
								},
							]}
						>
							{t('onboarding.custom-mode.summary.title')}
						</BText>
					</View>
					<View style={[margin.top.medium]}>
						<BText style={{ textAlign: 'center', fontWeight: '600' }}>
							{t('onboarding.custom-mode.summary.subtitle')}
						</BText>
					</View>
					<View style={[margin.top.medium]}>
						<BText style={{ textAlign: 'center' }}>
							{t('onboarding.custom-mode.summary.first-point')}
						</BText>
					</View>
					<View style={[margin.top.medium]}>
						<BText style={[{ textAlign: 'center' }]}>
							{t('onboarding.custom-mode.summary.second-point')}
						</BText>
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
						<BText
							style={{
								textTransform: 'uppercase',
								color: colors['background-header'],
								fontWeight: '700',
								textAlign: 'center',
							}}
						>
							{t('onboarding.custom-mode.summary.back-button')}
						</BText>
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
						<BText
							style={{
								textTransform: 'uppercase',
								color: colors['reverted-main-text'],
								fontWeight: '700',
								textAlign: 'center',
							}}
						>
							{t('onboarding.custom-mode.summary.accept-button')}
						</BText>
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
