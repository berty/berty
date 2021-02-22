import React, { useState } from 'react'
import { ScrollView, View, TouchableOpacity, Image } from 'react-native'
import { Text } from '@ui-kitten/components'
import { useStyles } from '@berty-tech/styles'
import { useTranslation } from 'react-i18next'
import { useMsgrContext } from '@berty-tech/store/context'
import { ButtonSetting } from '@berty-tech/components/shared-components/SettingsButtons'
import Button from '@berty-tech/components/onboarding/Button'
import { RouteProp, useNavigation } from '@react-navigation/native'
import { PersistentOptionsKeys } from '@berty-tech/store/context'
import NetworkOptionsBg from '@berty-tech/assets/network_options_bg.png'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

enum Modes {
	FullAnon,
	TORCompatible,
}

export const NetworkOptions: React.FC<{ route: RouteProp<any, any> }> = () => {
	const { t }: { t: any } = useTranslation()
	const { setPersistentOption, persistentOptions } = useMsgrContext()
	const { goBack } = useNavigation()
	const insets = useSafeAreaInsets()

	const [mode, setMode] = useState(Modes.FullAnon)
	const [toggleValues, setToggleValues] = useState({
		fullAnonMode: true,
		simpleTor: false,
		allowExpertMode: true,
	})

	const [{ text, padding, border, margin, flex }, { windowWidth }] = useStyles()

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
		<View
			style={{
				backgroundColor: '#1B1D2C',
				flex: 1,
			}}
		>
			<ScrollView
				contentContainerStyle={[
					padding.big,
					{
						position: 'relative',
						marginTop: insets.top,
					},
				]}
			>
				<Image
					source={NetworkOptionsBg}
					resizeMode='cover'
					style={{
						position: 'absolute',
						top: 0,
						right: 0,
						left: 0,
						width: windowWidth,
						height: windowWidth * 1.28,
					}}
				/>
				<Text
					style={[
						text.align.center,
						text.size.large,
						margin.bottom.huge,
						{
							color: '#C8C9D5',
						},
					]}
				>
					{t('main.network-options.welcome-title')}
				</Text>

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

				<View
					style={[
						padding.huge,
						padding.bottom.large,
						border.radius.medium,
						margin.top.large,
						flex.align.center,
						{
							backgroundColor: 'white',
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
						style={[margin.top.medium, padding.small]}
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
			</ScrollView>
		</View>
	)
}
