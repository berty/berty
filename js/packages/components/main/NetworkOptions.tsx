import React, { useState } from 'react'
import { View, TouchableOpacity, Image, SafeAreaView } from 'react-native'
import { Text } from '@ui-kitten/components'
import { useStyles } from '@berty-tech/styles'
import { useTranslation } from 'react-i18next'
import { useMsgrContext } from '@berty-tech/store/context'
import { ButtonSetting } from '@berty-tech/components/shared-components/SettingsButtons'
import Button from '@berty-tech/components/onboarding/Button'
import { RouteProp, useNavigation } from '@react-navigation/native'
import { PersistentOptionsKeys } from '@berty-tech/store/context'
import NetworkOptionsBg from '@berty-tech/assets/network_options_bg.png'

enum Modes {
	FullAnon,
	TORCompatible,
}

export const NetworkOptions: React.FC<{ route: RouteProp<any, any> }> = () => {
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
	const buttonCustomProps = {
		iconSize: 35,
		iconColor: '#6E6DFF',
		toggled: true,
		style: [
			{
				backgroundColor: '#393D64',
			},
		],
		textStyle: [text.color.white],
	}

	const parameterList = [
		t('main.network-options.full-anon.no-ip'),
		t('main.network-options.full-anon.no-mc'),
		t('main.network-options.full-anon.tor-only'),
	]
	return (
		<SafeAreaView
			style={{
				backgroundColor: '#1B1D2C',
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
							color: '#C8C9D5',
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
								backgroundColor: 'white',
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
									color: '#4852EB',
								},
							]}
						>
							{mode === Modes.FullAnon
								? t('main.network-options.full-anon.title')
								: t('main.network-options.tor-compatible.title')}
						</Text>
						<Text style={[text.size.small, text.align.center, { color: '#909CB3' }]}>
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
										{ color: '#909CB3' },
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
								style={{
									backgroundColor: '#535BED',
									width: '100%',
								}}
								textStyle={{
									color: 'white',
								}}
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

									goBack()
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

									goBack()
								}}
							>
								<Text style={[text.size.small, text.color.grey, text.align.center]}>
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
