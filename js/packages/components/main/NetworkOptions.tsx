import React, { useState } from 'react'
import { View, TouchableOpacity, Image, SafeAreaView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { RESULTS } from 'react-native-permissions'
import { Text } from '@ui-kitten/components'
import { RouteProp, useNavigation } from '@react-navigation/native'

import { useStyles } from '@berty-tech/styles'
import { useThemeColor, useMsgrContext } from '@berty-tech/store/hooks'
import { PersistentOptionsKeys } from '@berty-tech/store/context'
import NetworkOptionsBg from '@berty-tech/assets/network_options_bg.png'

import { checkPermissions } from '../utils'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import Button from '../onboarding/Button'

enum Modes {
	FullAnon,
	TORCompatible,
}

export const NetworkOptions: React.FC<{ route: RouteProp<any, any> }> = ({ route }) => {
	const checkNotificationPermission = route?.params?.checkNotificationPermission
	const { t }: { t: any } = useTranslation()
	const { setPersistentOption, persistentOptions } = useMsgrContext()
	const { goBack } = useNavigation()

	const [mode, setMode] = useState(Modes.FullAnon)
	const [toggleValues, setToggleValues] = useState({
		fullAnonMode: true,
		simpleTor: false,
		allowExpertMode: true,
	})

	const [{ text, padding, border, margin, flex }, { windowWidth, scaleSize }] = useStyles()
	const colors = useThemeColor()

	const buttonCustomProps = {
		iconSize: 35,
		iconColor: colors['background-header'],
		toggled: true,
		style: [
			{
				backgroundColor: colors['alt-secondary-background-header'],
			},
		],
		textStyle: [{ color: colors['reverted-main-text'] }],
	}

	const parameterList = [
		t('main.network-options.full-anon.no-ip'),
		t('main.network-options.full-anon.no-mc'),
		t('main.network-options.full-anon.tor-only'),
	]

	const handleComplete = async () => {
		goBack()

		if (checkNotificationPermission) {
			const notificationStatus = await checkPermissions('notification', {
				isToNavigate: false,
			})
			if (notificationStatus === RESULTS.GRANTED) {
				await setPersistentOption({
					type: PersistentOptionsKeys.Configurations,
					payload: {
						...persistentOptions.configurations,
						notification: {
							...persistentOptions.configurations.notification,
							state: 'added',
						},
					},
				})
			} else {
				checkPermissions('notification')
			}
		}
	}
	return (
		<SafeAreaView
			style={{
				backgroundColor: colors['alt-secondary-background-header'],
				flex: 1,
			}}
		>
			<Image
				source={NetworkOptionsBg}
				resizeMode='cover'
				style={{
					position: 'absolute',
					top: 30 * scaleSize,
					right: 0,
					left: 0,
					width: windowWidth,
					height: windowWidth * 1.28,
				}}
			/>
			<View style={[padding.big, flex.tiny]}>
				<Text
					style={[
						text.align.center,
						text.size.large,
						margin.bottom.medium,
						{
							color: colors['negative-asset'],
						},
					]}
				>
					{t('main.network-options.welcome-title')}
				</Text>
				<View style={{ flex: 10 }}>
					<View style={[margin.bottom.scale(18), flex.tiny]}>
						<ButtonSetting
							name={t('main.network-options.full-anon-mode')}
							icon='privacy'
							iconPack='custom'
							varToggle={toggleValues.fullAnonMode}
							actionToggle={() => {
								setMode(toggleValues.fullAnonMode ? Modes.TORCompatible : Modes.FullAnon)
								setToggleValues((prev) => ({
									...prev,
									fullAnonMode: !prev.fullAnonMode,
									simpleTor: prev.fullAnonMode,
								}))
							}}
							{...buttonCustomProps}
						/>
					</View>
					<View style={[margin.bottom.scale(18), flex.tiny]}>
						<ButtonSetting
							name={t('main.network-options.simple-tor-compatible')}
							icon='layers-outline'
							varToggle={toggleValues.simpleTor}
							actionToggle={() => {
								setMode(toggleValues.fullAnonMode ? Modes.TORCompatible : Modes.FullAnon)
								setToggleValues((prev) => ({
									...prev,
									simpleTor: !prev.simpleTor,
									fullAnonMode: prev.simpleTor,
								}))
							}}
							{...buttonCustomProps}
						/>
					</View>
					<View style={[margin.bottom.scale(36), flex.tiny]}>
						<ButtonSetting
							name={t('main.network-options.allow-expert-mode')}
							icon='cog-chip'
							iconPack='custom'
							varToggle={toggleValues.allowExpertMode}
							actionToggle={() => {
								setToggleValues((prev) => ({
									...prev,
									allowExpertMode: !prev.allowExpertMode,
								}))
							}}
							{...buttonCustomProps}
						/>
					</View>

					<View
						style={[
							margin.top.large,
							padding.horizontal.huge,
							padding.vertical.large,
							border.radius.medium,
							flex.align.center,
							{
								backgroundColor: colors['main-background'],
								flex: 5,
							},
						]}
					>
						<Text
							style={[
								text.size.huge,
								text.bold.medium,
								margin.bottom.medium,
								{
									color: colors['background-header'],
								},
							]}
						>
							{mode === Modes.FullAnon
								? t('main.network-options.full-anon.title')
								: t('main.network-options.tor-compatible.title')}
						</Text>
						<Text style={[text.size.small, text.align.center, { color: colors['secondary-text'] }]}>
							{mode === Modes.FullAnon
								? t('main.network-options.full-anon.desc')
								: t('main.network-options.tor-compatible.desc')}
						</Text>
						{mode === Modes.FullAnon &&
							parameterList.map((item) => (
								<Text
									style={[
										margin.top.small,
										text.size.small,
										text.bold.medium,
										text.align.center,
										{ color: colors['secondary-text'] },
									]}
									key={item}
								>
									{item}
								</Text>
							))}
						<View
							style={{
								width: '100%',
								justifyContent: 'flex-end',
								flex: 1,
							}}
						>
							<Button
								style={{ backgroundColor: colors['background-header'], width: '100%' }}
								textStyle={{ color: colors['reverted-main-text'] }}
								onPress={async () => {
									await setPersistentOption({
										type: PersistentOptionsKeys.Configurations,
										payload: {
											...persistentOptions.configurations,
											network: {
												...persistentOptions.configurations.network,
												state: 'added',
											},
										},
									})
									await setPersistentOption({
										type: PersistentOptionsKeys.Tor,
										payload: {
											flag: toggleValues.fullAnonMode ? 'required' : 'optional',
										},
									})

									if (toggleValues.allowExpertMode) {
										await setPersistentOption({
											type: PersistentOptionsKeys.Debug,
											payload: {
												enable: true,
											},
										})
									}
									handleComplete()
								}}
							>
								{t('main.network-options.save')}
							</Button>

							<TouchableOpacity
								style={[margin.top.small, padding.small]}
								onPress={async () => {
									await setPersistentOption({
										type: PersistentOptionsKeys.Configurations,
										payload: {
											...persistentOptions.configurations,
											network: {
												...persistentOptions.configurations.network,
												state: 'skipped',
											},
										},
									})
									handleComplete()
								}}
							>
								<Text
									style={[text.size.small, text.align.center, { color: colors['secondary-text'] }]}
								>
									{t('main.network-options.skip')}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</View>
		</SafeAreaView>
	)
}
