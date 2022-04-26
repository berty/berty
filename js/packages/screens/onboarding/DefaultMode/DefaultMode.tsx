import LottieView from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { ActivityIndicator, StatusBar, View } from 'react-native'

import { ScreenFC, useNavigation } from '@berty/navigation'
import { accountService, useNotificationsInhibitor, useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'

import OnboardingWrapper from '@berty/components/onboarding/OnboardingWrapper'
import { Icon } from '@ui-kitten/components'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useCreateNewAccount } from '@berty/hooks'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

const DefaultModeBody: React.FC = () => {
	const { goBack } = useNavigation()
	const colors = useThemeColor()
	const { padding, border, margin, text } = useStyles()
	const { scaleSize } = useAppDimensions()
	const [isPressed, setIsPressed] = React.useState<boolean>(false)
	const { t }: { t: any } = useTranslation()
	const createNewAccount = useCreateNewAccount()

	const onPress = React.useCallback(async () => {
		// with an empty accountId the function returns default config
		const defaultConfig = await accountService.networkConfigGet({ accountId: '' })
		if (defaultConfig.currentConfig) {
			setIsPressed(true)
			await createNewAccount(defaultConfig.currentConfig)
		}
	}, [createNewAccount])

	return (
		<View style={[{ flex: 1 }]}>
			<LottieView
				source={require('@berty/assets/lottie/Berty_onboard_animation_assets2/Startup animation assets/Berty BG.json')}
				autoPlay
				loop
				style={{ width: '100%', position: 'absolute' }}
			/>
			{isPressed ? (
				<LottieView
					source={require('@berty/assets/lottie/Berty_onboard_animation_assets2/Startup animation assets/Shield dissapear.json')}
					autoPlay
					loop={false}
					style={{ position: 'absolute', top: -20, width: '100%' }}
				/>
			) : (
				<LottieView
					source={require('@berty/assets/lottie/Berty_onboard_animation_assets2/Startup animation assets/Shield appear.json')}
					autoPlay
					loop={false}
					style={{ position: 'absolute', top: -20, width: '100%' }}
				/>
			)}
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
							{t('onboarding.default-mode.summary.title')}
						</UnifiedText>
					</View>
					<View style={[margin.top.medium]}>
						<UnifiedText style={[text.bold, { textAlign: 'center' }]}>
							{t('onboarding.default-mode.summary.subtitle')}
						</UnifiedText>
					</View>
					<View style={[margin.top.medium]}>
						<UnifiedText style={{ textAlign: 'center' }}>
							{t('onboarding.default-mode.summary.first-point')}
						</UnifiedText>
					</View>
					<View style={[margin.top.medium]}>
						<UnifiedText style={{ textAlign: 'center' }}>
							{t('onboarding.default-mode.summary.second-point')}
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
							{t('onboarding.default-mode.summary.back-button')}
						</UnifiedText>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							padding.medium,
							border.radius.medium,
							{ width: 170 * scaleSize, backgroundColor: '#3744DD' },
						]}
						onPress={async () => await onPress()}
					>
						{isPressed ? (
							<ActivityIndicator color={colors['reverted-main-text']} />
						) : (
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
								{t('onboarding.default-mode.summary.accept-button')}
							</UnifiedText>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}

export const DefaultMode: ScreenFC<'Onboarding.DefaultMode'> = () => {
	useNotificationsInhibitor(() => true)
	const colors = useThemeColor()

	return (
		<OnboardingWrapper>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<DefaultModeBody />
		</OnboardingWrapper>
	)
}
