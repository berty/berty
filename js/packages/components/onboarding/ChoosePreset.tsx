import React from 'react'
import { ScrollView, ImageBackground, View, TouchableOpacity } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { useStyles } from '@berty-tech/styles'
import { useTranslation } from 'react-i18next'
import { MessengerActions, PersistentOptionsKeys, useMsgrContext } from '@berty-tech/store/context'
import FullAnonBackground from '@berty-tech/assets/full_anon_bg.png'
import PerformanceBackground from '@berty-tech/assets/performance_bg.png'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const ChoosePreset = () => {
	const { t }: { t: any } = useTranslation()
	const { dispatch, setPersistentOption } = useMsgrContext()
	const insets = useSafeAreaInsets()

	const [{ text, padding, border, margin, flex, color }] = useStyles()
	const performanceCheckList = [
		{ title: t('onboarding.select-mode.performance.push-notif') },
		{ title: t('onboarding.select-mode.performance.offline-message') },
		{ title: t('onboarding.select-mode.performance.add-contact') },
		{ title: t('onboarding.select-mode.performance.fast-message') },
	]

	const anonymityCheckList = [
		{ title: t('onboarding.select-mode.high-level.disable-push-notif') },
		{
			title: t('onboarding.select-mode.high-level.disable-local-peer-discovery'),
			subTitle: t('onboarding.select-mode.high-level.disable-local-peer-discovery-desc'),
		},
		{ title: t('onboarding.select-mode.high-level.on-same-network') },
	]
	return (
		<View
			style={{
				backgroundColor: 'white',
				flex: 1,
			}}
		>
			<ScrollView
				contentContainerStyle={[
					padding.big,
					{
						marginTop: insets.top,
					},
				]}
			>
				<Text style={[text.align.center, text.size.huge, margin.bottom.huge, text.bold.medium]}>
					{t('onboarding.select-mode.title')}
				</Text>
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={async () => {
						dispatch({ type: MessengerActions.SetStateOnBoarding })
						await setPersistentOption({
							type: PersistentOptionsKeys.Preset,
							payload: {
								value: 'performance',
							},
						})
					}}
					style={[
						border.radius.medium,

						{
							backgroundColor: '#5A64EC',
							position: 'relative',
							overflow: 'hidden',
						},
					]}
				>
					<ImageBackground source={PerformanceBackground} style={[padding.large]}>
						<View style={[flex.direction.row, flex.align.end, flex.justify.spaceBetween]}>
							<Text style={[text.color.white, text.size.huge, text.bold.medium]}>
								{t('onboarding.select-mode.performance.title')}
							</Text>
							<Icon name='flash-outline' height={60} width={60} fill='white' />
						</View>
						<Text
							style={[text.color.white, text.size.medium, margin.top.small, margin.bottom.large]}
						>
							{t('onboarding.select-mode.performance.desc')}
						</Text>
						{performanceCheckList.map((item) => (
							<View
								key={item.title}
								style={[
									flex.direction.row,
									flex.align.center,
									margin.bottom.small,
									{
										paddingRight: 70,
									},
								]}
							>
								<Icon
									name='checkmark-circle-2'
									fill='white'
									height={16}
									width={16}
									style={[margin.right.small]}
								/>
								<Text style={[text.color.white]}>{item.title}</Text>
							</View>
						))}

						<View
							style={[
								{
									position: 'absolute',
									right: 10,
									top: 0,
									bottom: 0,
									alignItems: 'center',
									justifyContent: 'center',
								},
							]}
						>
							<View
								style={[
									border.radius.small,
									flex.justify.center,
									{
										backgroundColor: '#4B54E9',
									},
								]}
							>
								<Icon name='chevron-right' fill='white' height={50} width={50} />
							</View>
						</View>
					</ImageBackground>
				</TouchableOpacity>
				<Text
					style={[
						text.align.center,
						margin.vertical.medium,
						{ fontStyle: 'italic', color: '#A5A7C5' },
					]}
				>
					{t('onboarding.select-mode.change-later')}
				</Text>
				<TouchableOpacity
					style={[
						border.radius.medium,
						{
							flex: 1,
							backgroundColor: '#202240',
							position: 'relative',
							overflow: 'hidden',
						},
					]}
					activeOpacity={0.7}
					onPress={async () => {
						dispatch({ type: MessengerActions.SetStateOnBoarding })
						await setPersistentOption({
							type: PersistentOptionsKeys.Preset,
							payload: {
								value: 'full-anonymity',
							},
						})
					}}
				>
					<ImageBackground source={FullAnonBackground} style={[padding.large]}>
						<View style={[flex.direction.row, flex.align.center, flex.justify.spaceBetween]}>
							<Text style={[text.color.white, text.size.huge, text.bold.medium]}>
								{t('onboarding.select-mode.high-level.title')}
							</Text>
							<Icon name='privacy' pack='custom' height={70} width={70} fill='white' />
						</View>

						<Text
							style={[text.color.white, text.size.medium, margin.top.small, margin.bottom.large]}
						>
							{t('onboarding.select-mode.high-level.desc')}
						</Text>
						{anonymityCheckList.map((item) => (
							<View key={item.title} style={[margin.bottom.small]}>
								<View style={[flex.direction.row, flex.align.center]}>
									<View
										style={[
											border.radius.large,
											flex.align.center,
											flex.justify.center,
											margin.right.small,
											{
												height: 16,
												width: 16,
												backgroundColor: color.white,
											},
										]}
									>
										<Icon name='close' fill='red' height={12} width={12} />
									</View>
									<Text style={[text.color.white]}>{item.title}</Text>
								</View>
								<Text
									style={[
										text.color.white,
										text.size.small,
										{
											marginLeft: 25,
										},
									]}
								>
									{item.subTitle}
								</Text>
							</View>
						))}

						<View
							style={[
								{
									position: 'absolute',
									right: 10,
									top: 0,
									bottom: 0,
									alignItems: 'center',
									justifyContent: 'center',
								},
							]}
						>
							<View
								style={[
									border.radius.small,
									flex.justify.center,
									{
										backgroundColor: '#34354A',
									},
								]}
							>
								<Icon name='chevron-right' fill='white' height={50} width={50} />
							</View>
						</View>
					</ImageBackground>
				</TouchableOpacity>
			</ScrollView>
		</View>
	)
}
