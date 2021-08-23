import React from 'react'
import { ImageBackground, ImageSourcePropType, TouchableOpacity, View } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { Icon, Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'

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

const ButtonChoosePreset: React.FC<{
	onPress: () => void
	bgImgSrc: ImageSourcePropType
	title: string
	desc: string
	icon: string
	checkList: { title: string; subTitle?: string }[]
	checkListIcon: string
	checkListIconColor: string
	iconPack?: string
}> = ({
	onPress,
	bgImgSrc,
	title,
	desc,
	icon,
	checkList,
	checkListIcon,
	checkListIconColor,
	iconPack = '',
}) => {
	const [{ text, padding, border, margin, flex }, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	return (
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
				await onPress()
			}}
		>
			<ImageBackground source={bgImgSrc} style={[padding.horizontal.large, flex.tiny]}>
				<View style={[flex.direction.row, flex.align.center, flex.justify.spaceBetween]}>
					<View style={[padding.top.large]}>
						<Text
							style={[text.size.huge, text.bold.medium, { color: colors['reverted-main-text'] }]}
						>
							{title}
						</Text>
						<Text
							style={[
								text.size.medium,
								margin.bottom.large,
								margin.top.tiny,
								{ color: colors['reverted-main-text'] },
							]}
						>
							{desc}
						</Text>
					</View>

					<Icon
						name={icon}
						pack={iconPack}
						height={55 * scaleSize}
						width={55 * scaleSize}
						fill={colors['reverted-main-text']}
					/>
				</View>

				<View style={{ justifyContent: 'center', flex: 1 }}>
					{checkList.map(item => (
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
										name={checkListIcon}
										fill={checkListIconColor}
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
	)
}

export const ChoosePreset = () => {
	const { t }: { t: any } = useTranslation()
	const { selectedAccount, setNetworkConfig } = useMsgrContext()
	const navigation = useNativeNavigation()

	const [{ text, padding, margin, flex }] = useStyles()
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
		<View style={[flex.tiny, padding.big, { backgroundColor: colors['main-background'] }]}>
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
			<ButtonChoosePreset
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
				bgImgSrc={FullAnonBackground}
				title={t('onboarding.select-mode.high-level.title')}
				desc={t('onboarding.select-mode.high-level.desc')}
				icon='privacy'
				iconPack='custom'
				checkList={anonymityCheckList}
				checkListIcon='close'
				checkListIconColor={colors['warning-asset']}
			/>
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
			<ButtonChoosePreset
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
				bgImgSrc={PerformanceBackground}
				title={t('onboarding.select-mode.performance.title')}
				desc={t('onboarding.select-mode.performance.desc')}
				icon='flash-outline'
				checkList={performanceCheckList}
				checkListIcon='checkmark-outline'
				checkListIconColor={colors['background-header']}
			/>
		</View>
	)
}
