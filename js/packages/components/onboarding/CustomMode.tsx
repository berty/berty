import LottieView from 'lottie-react-native'
import React from 'react'
import { StatusBar, Text, View } from 'react-native'

import { ScreenFC, useNavigation } from '@berty-tech/navigation'
import { useNotificationsInhibitor, useThemeColor } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'

import OnboardingWrapper from './OnboardingWrapper'
import { Icon } from '@ui-kitten/components'
import { TouchableOpacity } from 'react-native-gesture-handler'

const CustomModeBody: React.FC = () => {
	const { goBack } = useNavigation()
	const colors = useThemeColor()
	const [{ padding, border, margin, text }, { scaleSize }] = useStyles()
	const { navigate } = useNavigation()

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
						<Text
							style={[
								{
									fontFamily: 'Open Sans',
									fontWeight: '700',
									color: colors['background-header'],
									fontSize: 24 * scaleSize,
								},
							]}
						>
							Custom Mode
						</Text>
					</View>
					<View style={[margin.top.medium]}>
						<Text
							style={[
								text.size.medium,
								{
									textAlign: 'center',
									fontFamily: 'Open Sans',
									fontWeight: '600',
									color: colors['main-text'],
								},
							]}
						>
							Custom Privacy Experience
						</Text>
					</View>
					<View style={[margin.top.medium]}>
						<Text
							style={[
								text.size.medium,
								{ fontFamily: 'Open Sans', textAlign: 'center', color: colors['main-text'] },
							]}
						>
							By using Custom Configuration, you'll be able to manage your own settings and setup a
							custom privacy experience.
						</Text>
					</View>
					<View style={[margin.top.medium]}>
						<Text
							style={[
								text.size.medium,
								{ fontFamily: 'Open Sans', textAlign: 'center', color: colors['main-text'] },
							]}
						>
							For a more easy ride, use Default Mode.
						</Text>
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
						<Text
							style={[
								text.size.medium,
								{
									textTransform: 'uppercase',
									color: colors['background-header'],
									fontFamily: 'Open Sans',
									fontWeight: '700',
									textAlign: 'center',
								},
							]}
						>
							back
						</Text>
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
						<Text
							style={[
								text.size.medium,
								{
									textTransform: 'uppercase',
									color: colors['reverted-main-text'],
									fontFamily: 'Open Sans',
									fontWeight: '700',
									textAlign: 'center',
								},
							]}
						>
							accept
						</Text>
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
