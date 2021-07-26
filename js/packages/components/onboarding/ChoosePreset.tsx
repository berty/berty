import React from 'react'
import { ImageBackground, Linking, StatusBar, TouchableOpacity, View } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { Icon, Text } from '@ui-kitten/components'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useNavigation as useNativeNavigation } from '@react-navigation/core'

import { useStyles } from '@berty-tech/styles'
import { PersistentOptionsKeys, useMsgrContext } from '@berty-tech/store/context'
import FullAnonBackground from '@berty-tech/assets/full_anon_bg.png'
import PerformanceBackground from '@berty-tech/assets/performance_bg.png'

import {
	checkBluetoothPermission,
	permissionExplanation,
	requestBluetoothPermission,
} from '../settings/Bluetooth'
import { NeedRestart } from '../modals/NeedRestart'

export const ChoosePreset = () => {
	const { t }: { t: any } = useTranslation()
	const ctx = useMsgrContext()
	const insets = useSafeAreaInsets()
	const navigation = useNativeNavigation()
	const [isChange, setIsChange] = React.useState<boolean>(false)

	const [{ text, padding, border, margin, flex, color, background }, { scaleSize }] = useStyles()
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

	const handlePersistentOptions = React.useCallback(
		async (opt: 'performance' | 'fullAnonymity') => {
			const setPermissions = async (
				state: 'unavailable' | 'blocked' | 'denied' | 'granted' | 'limited',
			) => {
				console.log('Bluetooth permissions: ' + state)
				await ctx.setPersistentOption({
					type: PersistentOptionsKeys.BLE,
					payload: {
						enable: state === 'granted' ? true : false,
					},
				})
				await ctx.setPersistentOption({
					type: PersistentOptionsKeys.MC,
					payload: {
						enable: state === 'granted' ? true : false,
					},
				})
				await ctx.setPersistentOption({
					type: PersistentOptionsKeys.Nearby,
					payload: {
						enable: state === 'granted' ? true : false,
					},
				})
			}
			checkBluetoothPermission()
				.then(async (result) => {
					if (opt === 'performance') {
						if (result === 'granted') {
							await setPermissions(result)
						} else if (result === 'blocked') {
							await permissionExplanation(t, () => {
								Linking.openSettings()
							})
						} else if (result !== 'unavailable') {
							await permissionExplanation(t, () => {})
							const permission = await requestBluetoothPermission()
							await setPermissions(permission)
						}
					} else {
						await setPermissions('blocked')
					}
					setIsChange(true)
				})
				.catch((err) => {
					console.log('The Bluetooth permission cannot be retrieved:', err)
				})
		},
		[ctx, t],
	)

	return (
		<View style={[flex.tiny, padding.big, margin.top.scale(insets.top), background.white]}>
			<StatusBar backgroundColor={color.white} barStyle='dark-content' />
			<Text style={[text.align.center, text.size.huge, text.bold.medium, margin.bottom.huge]}>
				{t('onboarding.select-mode.title')}
			</Text>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={async () => {
					if (await AsyncStorage.getItem('isNewAccount')) {
						await AsyncStorage.setItem('preset', 'performance')
						navigation.navigate('Onboarding.CreateAccount', {})
					} else {
						await ctx.setPersistentOption({
							type: PersistentOptionsKeys.Preset,
							payload: {
								value: 'performance',
							},
						})
						await handlePersistentOptions('performance')
					}
				}}
				style={[
					border.radius.medium,
					flex.tiny,
					{
						backgroundColor: '#5A64EC',
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
							<Text style={[text.color.white, text.size.huge, text.bold.medium]}>
								{t('onboarding.select-mode.performance.title')}
							</Text>
							<Text
								style={[text.color.white, text.size.medium, margin.bottom.large, margin.top.tiny]}
							>
								{t('onboarding.select-mode.performance.desc')}
							</Text>
						</View>

						<Icon
							name='flash-outline'
							height={45 * scaleSize}
							width={45 * scaleSize}
							fill='white'
						/>
					</View>

					<View style={{ justifyContent: 'center', flex: 1 }}>
						{performanceCheckList.map((item) => (
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
									fill='white'
									height={16 * scaleSize}
									width={16 * scaleSize}
									style={[margin.right.small]}
								/>
								<Text style={[text.color.white, text.size.medium]}>{item.title}</Text>
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
						<View
							style={[
								border.radius.small,
								flex.justify.center,
								{
									backgroundColor: '#4B54E9',
								},
							]}
						>
							<Icon
								name='chevron-right'
								fill='white'
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
					if (await AsyncStorage.getItem('isNewAccount')) {
						await AsyncStorage.setItem('preset', 'fullAnonymity')
						navigation.navigate('Onboarding.CreateAccount', {})
					} else {
						await ctx.setPersistentOption({
							type: PersistentOptionsKeys.Preset,
							payload: {
								value: 'fullAnonymity',
							},
						})
						await handlePersistentOptions('fullAnonymity')
					}
				}}
			>
				<ImageBackground source={FullAnonBackground} style={[padding.horizontal.large, flex.tiny]}>
					<View style={[flex.direction.row, flex.align.center, flex.justify.spaceBetween]}>
						<View style={[padding.top.large]}>
							<Text style={[text.color.white, text.size.huge, text.bold.medium]}>
								{t('onboarding.select-mode.high-level.title')}
							</Text>
							<Text
								style={[text.color.white, text.size.medium, margin.bottom.large, margin.top.tiny]}
							>
								{t('onboarding.select-mode.high-level.desc')}
							</Text>
						</View>

						<Icon
							name='privacy'
							pack='custom'
							height={60 * scaleSize}
							width={60 * scaleSize}
							fill='white'
						/>
					</View>

					<View style={{ justifyContent: 'center', flex: 1 }}>
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
												height: 16 * scaleSize,
												width: 16 * scaleSize,
												backgroundColor: color.white,
											},
										]}
									>
										<Icon name='close' fill='red' height={12 * scaleSize} width={12 * scaleSize} />
									</View>
									<Text style={[text.color.white, text.size.medium]}>{item.title}</Text>
								</View>
								<Text
									style={[
										text.color.white,
										text.size.small,
										{
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
						<View
							style={[
								border.radius.small,
								flex.justify.center,
								{
									backgroundColor: '#34354A',
								},
							]}
						>
							<Icon
								name='chevron-right'
								fill='white'
								height={40 * scaleSize}
								width={40 * scaleSize}
							/>
						</View>
					</View>
				</ImageBackground>
			</TouchableOpacity>
			{isChange && (
				<NeedRestart
					closeModal={() => {
						setIsChange(false)
						navigation.goBack()
					}}
				/>
			)}
		</View>
	)
}
