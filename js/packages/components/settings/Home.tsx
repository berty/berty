import React from 'react'
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'
import QRCode from 'react-native-qrcode-svg'

import { useStyles } from '@berty-tech/styles'

import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'
import HeaderSettings from '../shared-components/Header'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { useAccount } from '@berty-tech/store/hooks'

const useStylesHome = () => {
	const [{ height, margin, padding, text }] = useStyles()
	return {
		firstHeaderButton: [margin.right.scale(20), height(90)],
		secondHeaderButton: [margin.right.scale(20), height(90)],
		thirdHeaderButton: height(90),
		headerNameText: text.size.scale(13),
		scrollViewPadding: padding.bottom.scale(50),
	}
}

const HomeHeaderGroupButton: React.FC = () => {
	const _styles = useStylesHome()
	const [{ padding, color }] = useStyles()
	const { navigate } = useNavigation()
	return (
		<View style={[padding.horizontal.medium, padding.top.small]}>
			<ButtonSettingRow
				state={[
					{
						name: 'Help',
						icon: 'question-mark-circle-outline',
						color: color.red,
						style: _styles.firstHeaderButton,
						onPress: navigate.settings.help,
					},
					{
						name: 'Devtools',
						icon: 'options-2-outline',
						color: color.dark.grey,
						style: _styles.secondHeaderButton,
						onPress: navigate.settings.devTools,
					},
					{
						name: 'Settings',
						icon: 'settings-2-outline',
						color: color.blue,
						style: _styles.thirdHeaderButton,
						onPress: navigate.settings.mode,
					},
				]}
			/>
		</View>
	)
}

const HomeHeaderAvatar: React.FC = () => {
	const _styles = useStylesHome()
	const [
		{ row, margin, background, border, padding },
		{ windowWidth, windowHeight, scaleHeight },
	] = useStyles()
	const account = useAccount()
	const navigation = useNavigation()
	const qrCodeSize = Math.min(windowHeight, windowWidth) * 0.3

	return (
		<View style={[row.center, margin.top.scale(30)]}>
			<TouchableOpacity
				style={[background.white, border.radius.medium, padding.scale(20), padding.top.scale(40)]}
				onPress={() => navigation.navigate.settings.myBertyId()}
			>
				<View style={[{ alignItems: 'center' }]}>
					<View style={{ position: 'absolute', top: -75 }}>
						<ProceduralCircleAvatar
							seed={account?.publicKey}
							size={70}
							diffSize={25}
							style={[border.shadow.big]}
						/>
					</View>
					<Text style={[_styles.headerNameText]}>{account?.displayName || ''}</Text>
					<View style={[padding.top.scale(20 * scaleHeight)]}>
						<QRCode size={qrCodeSize} value={account.link} />
					</View>
				</View>
			</TouchableOpacity>
		</View>
	)
}

const HomeHeader: React.FC = () => {
	const navigation = useNativeNavigation()
	const [{ color }] = useStyles()
	return (
		<View>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Icon name='arrow-back-outline' width={25} height={25} fill={color.white} />
				</TouchableOpacity>
				<View />
			</View>
			<HomeHeaderAvatar />
		</View>
	)
}

const HomeBodySettings: React.FC<{}> = () => {
	const [{ flex, color, padding, margin }] = useStyles()
	const navigation = useNativeNavigation()

	return (
		<View style={[flex.tiny, padding.horizontal.medium, margin.top.medium]}>
			<ButtonSetting
				name='Network List'
				icon='earth'
				iconPack='custom'
				iconColor={color.blue}
				onPress={() => navigation.navigate('Settings.NetworkMap')}
			/>
		</View>
	)
}

export const Home: React.FC<ScreenProps.Settings.Home> = () => {
	const account = useAccount()
	const [{ flex, background, row }] = useStyles()
	const navigation = useNativeNavigation()

	return (
		<>
			<View style={[flex.tiny, background.white]}>
				<SwipeNavRecognizer
					onSwipeUp={() => navigation.goBack()}
					onSwipeLeft={() => navigation.goBack()}
					onSwipeRight={() => navigation.goBack()}
					onSwipeDown={() => navigation.goBack()}
				>
					{account == null ? (
						<ActivityIndicator size='large' style={[row.center]} />
					) : (
						<ScrollView bounces={false}>
							<HeaderSettings>
								<View>
									<HomeHeader />
									<HomeHeaderGroupButton />
								</View>
							</HeaderSettings>
							<HomeBodySettings />
						</ScrollView>
					)}
				</SwipeNavRecognizer>
			</View>
		</>
	)
}
