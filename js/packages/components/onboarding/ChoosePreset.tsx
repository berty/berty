import React from 'react'
import { ImageBackground, StatusBar, TouchableOpacity, View } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { Icon, Text } from '@ui-kitten/components'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useNavigation as useNativeNavigation } from '@react-navigation/core'

import { useStyles } from '@berty-tech/styles'
import { useThemeColor } from '@berty-tech/store/hooks'
import {
	accountService,
	GlobalPersistentOptionsKeys,
	useMsgrContext,
} from '@berty-tech/store/context'

import FullAnonBackground from '@berty-tech/assets/full_anon_bg.png'
import PerformanceBackground from '@berty-tech/assets/performance_bg.png'
import beapi from '@berty-tech/api'
import { getNetworkConfigurationFromPreset } from '@berty-tech/store/effectableCallbacks'

export const ChoosePreset = () => {
	const { t }: { t: any } = useTranslation()
	const { selectedAccount, setNetworkConfig } = useMsgrContext()
	const insets = useSafeAreaInsets()
	const navigation = useNativeNavigation()

	const [{ text, padding, border, margin, flex }, { scaleSize }] = useStyles()
	const colors = useThemeColor()

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
			style={[
				flex.tiny,
				padding.big,
				margin.top.scale(insets.top),
				{ backgroundColor: colors['main-background'] },
			]}
		>
			<StatusBar backgroundColor={colors['main-background']} barStyle='dark-content' />
			<Text
				style={[
					text.align.center,
					text.size.huge,
					text.bold.medium,
					margin.bottom.huge,
					{ color: colors['main-text'] },
				]}
			>
				{t('onboarding.select-mode.title')}
			</Text>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={async () => {
					if (await AsyncStorage.getItem(GlobalPersistentOptionsKeys.IsNewAccount)) {
						await AsyncStorage.setItem(
							GlobalPersistentOptionsKeys.Preset,
							String(beapi.account.NetworkConfigPreset.Performance),
						)
						navigation.navigate('Onboarding.CreateAccount', {})
					} else {
						const netConf: beapi.account.INetworkConfig = await getNetworkConfigurationFromPreset(
							beapi.account.NetworkConfigPreset.Performance,
						)

						await accountService.networkConfigSet({
							accountId: selectedAccount,
							config: netConf,
						})
						setNetworkConfig(netConf)
						navigation.goBack()
					}
				}}
				style={[
					border.radius.medium,
					flex.tiny,
					{
						backgroundColor: colors['background-header'],
						position: 'relative',
						overflow: 'hidden',
					},
				]}
			>
				<ImageBackground
					source={PerformanceBackground}
					style={[padding.horizontal.large, padding.bottom.medium, flex.tiny]}
				>
					<View style={[flex.direction.row, flex.align.center, flex.justify.spaceBetween]}>
						<View style={[padding.top.large]}>
							<Text
								style={[text.size.huge, text.bold.medium, { color: colors['reverted-main-text'] }]}
							>
								{t('onboarding.select-mode.performance.title')}
							</Text>
							<Text
								style={[
									text.size.medium,
									margin.bottom.large,
									margin.top.tiny,
									{ color: colors['reverted-main-text'] },
								]}
							>
								{t('onboarding.select-mode.performance.desc')}
							</Text>
						</View>

						<Icon
							name='flash-outline'
							height={45 * scaleSize}
							width={45 * scaleSize}
							fill={colors['reverted-main-text']}
						/>
					</View>

					<View style={{ justifyContent: 'center', flex: 1 }}>
						{performanceCheckList.map(item => (
							<View
								key={item.title}
								style={[
									flex.direction.row,
									flex.align.center,
									margin.bottom.small,
									padding.right.scale(70),
								]}
							>
								<Icon
									name='checkmark-circle-2'
									fill={colors['reverted-main-text']}
									height={16 * scaleSize}
									width={16 * scaleSize}
									style={[margin.right.small]}
								/>
								<Text style={[text.size.medium, { color: colors['reverted-main-text'] }]}>
									{item.title}
								</Text>
							</View>
						))}
					</View>

					<View
						style={[
							{
								position: 'absolute',
								right: 10 * scaleSize,
								top: 0,
								bottom: 0,
								alignItems: 'center',
								justifyContent: 'center',
							},
						]}
					>
						<View style={[border.radius.small, flex.justify.center]}>
							<Icon
								name='chevron-right'
								fill={colors['reverted-main-text']}
								height={40 * scaleSize}
								width={40 * scaleSize}
							/>
						</View>
					</View>
				</ImageBackground>
			</TouchableOpacity>
			<Text
				style={[
					text.align.center,
					margin.vertical.medium,
					text.size.medium,
					{ fontStyle: 'italic', color: colors['secondary-text'] },
				]}
			>
				{t('onboarding.select-mode.change-later')}
			</Text>
			<TouchableOpacity
				style={[
					border.radius.medium,
					{
						flex: 1,
						backgroundColor: colors['alt-secondary-background-header'],
						position: 'relative',
						overflow: 'hidden',
					},
				]}
				activeOpacity={0.7}
				onPress={async () => {
					if (await AsyncStorage.getItem(GlobalPersistentOptionsKeys.IsNewAccount)) {
						await AsyncStorage.setItem(
							GlobalPersistentOptionsKeys.Preset,
							String(beapi.account.NetworkConfigPreset.FullAnonymity),
						)
						navigation.navigate('Onboarding.CreateAccount', {})
					} else {
						const netConf: beapi.account.INetworkConfig = await getNetworkConfigurationFromPreset(
							beapi.account.NetworkConfigPreset.FullAnonymity,
						)

						await accountService.networkConfigSet({
							accountId: selectedAccount,
							config: netConf,
						})
						setNetworkConfig(netConf)
						navigation.goBack()
					}
				}}
			>
				<ImageBackground source={FullAnonBackground} style={[padding.horizontal.large, flex.tiny]}>
					<View style={[flex.direction.row, flex.align.center, flex.justify.spaceBetween]}>
						<View style={[padding.top.large]}>
							<Text
								style={[text.size.huge, text.bold.medium, { color: colors['reverted-main-text'] }]}
							>
								{t('onboarding.select-mode.high-level.title')}
							</Text>
							<Text
								style={[
									text.size.medium,
									margin.bottom.large,
									margin.top.tiny,
									{ color: colors['reverted-main-text'] },
								]}
							>
								{t('onboarding.select-mode.high-level.desc')}
							</Text>
						</View>

						<Icon
							name='privacy'
							pack='custom'
							height={60 * scaleSize}
							width={60 * scaleSize}
							fill={colors['reverted-main-text']}
						/>
					</View>

					<View style={{ justifyContent: 'center', flex: 1 }}>
						{anonymityCheckList.map(item => (
							<View key={item.title} style={[margin.bottom.small]}>
								<View style={[flex.direction.row, flex.align.center]}>
									<View
										style={[
											border.radius.large,
											flex.align.center,
											flex.justify.center,
											margin.right.small,
											{
												height: 16 * scaleSize,
												width: 16 * scaleSize,
												backgroundColor: colors['reverted-main-text'],
											},
										]}
									>
										<Icon
											name='close'
											fill={colors['warning-asset']}
											height={12 * scaleSize}
											width={12 * scaleSize}
										/>
									</View>
									<Text style={[text.size.medium, { color: colors['reverted-main-text'] }]}>
										{item.title}
									</Text>
								</View>
								<Text
									style={[
										text.size.small,
										{
											color: colors['reverted-main-text'],
											marginLeft: 25 * scaleSize,
										},
									]}
								>
									{item.subTitle}
								</Text>
							</View>
						))}
					</View>

					<View
						style={[
							{
								position: 'absolute',
								right: 10 * scaleSize,
								top: 0,
								bottom: 0,
								alignItems: 'center',
								justifyContent: 'center',
							},
						]}
					>
						<View style={[border.radius.small, flex.justify.center]}>
							<Icon
								name='chevron-right'
								fill={colors['reverted-main-text']}
								height={40 * scaleSize}
								width={40 * scaleSize}
							/>
						</View>
					</View>
				</ImageBackground>
			</TouchableOpacity>
		</View>
	)
}
