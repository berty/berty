import React from 'react'
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'
import HeaderSettings from '../shared-components/Header'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'
import { Chat } from '@berty-tech/hooks'
import { SafeAreaView } from 'react-native-safe-area-context'

//
// Home Vue
//

// Type

// Style
const useStylesHome = () => {
	const [{ height, margin, padding, text }] = useStyles()
	return {
		firstHeaderButton: [margin.right.scale(20), height(90)],
		secondHeaderButton: [margin.right.scale(20), height(90)],
		thirdHeaderButton: height(90),
		headerNameText: text.size.scale(13),
		scrollViewPadding: padding.bottom.scale(116),
	}
}

const HomeHeaderGroupButton: React.FC = () => {
	const _styles = useStylesHome()
	const [{ padding, color }] = useStyles()
	const { navigate } = useNavigation()
	return (
		<View style={[padding.horizontal.medium]}>
			<ButtonSettingRow
				state={[
					{
						name: 'Updates',
						icon: 'arrow-upward-outline',
						color: color.blue,
						style: _styles.firstHeaderButton,
						onPress: navigate.settings.appUpdates,
					},
					{
						name: 'Help',
						icon: 'question-mark-circle-outline',
						color: color.red,
						style: _styles.secondHeaderButton,
						onPress: navigate.settings.help,
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
	const [{ row, margin, background, border, color }] = useStyles()
	const client = Chat.useClient()
	const account = Chat.useAccount()
	const navigation = useNavigation()
	return (
		<View style={[row.center, margin.top.scale(50)]}>
			<TouchableOpacity
				style={[background.white, border.radius.medium, { padding: 20 }, { paddingTop: 40 }]}
				onPress={() => navigation.navigate.settings.myBertyId()}
			>
				<View style={[{ alignItems: 'center' }]}>
					<View style={{ position: 'absolute', top: -80 }}>
						<ProceduralCircleAvatar style={[border.shadow.large]} seed={client?.accountPk} size={80} diffSize={25} />
					</View>
					<Text style={[_styles.headerNameText]}>{account?.name || ''}</Text>
					<View style={{ paddingLeft: 12, paddingTop: 20 }}>
						<Icon name='qr' pack='custom' width={140} height={140} fill={color.blue} />
					</View>
				</View>
			</TouchableOpacity>
		</View>
	)
}

const HomeHeader: React.FC = () => {
	const [{ margin }] = useStyles()
	return (
		<SafeAreaView style={[margin.bottom.medium]}>
			<HomeHeaderAvatar />
		</SafeAreaView>
	)
}

const HomeBodySettings: React.FC<{}> = () => {
	const [{ flex, color, padding, margin }] = useStyles()
	const { navigate } = useNavigation()
	return (
		<View style={[flex.tiny, padding.horizontal.medium, margin.top.medium]}>
			<ButtonSetting
				name='Notifications'
				icon='bell-outline'
				iconColor={color.blue}
				state={{ value: 'Current', color: color.white, bgColor: color.blue }}
				onPress={navigate.settings.notifications}
			/>
			<ButtonSetting
				name='Bluetooth'
				icon='bluetooth-outline'
				iconColor={color.blue}
				onPress={navigate.settings.bluetooth}
			/>
			<ButtonSetting name='Dark mode' icon='moon-outline' iconColor={color.blue} toggled disabled />
			<ButtonSetting
				name='About Berty'
				icon='info-outline'
				iconColor={color.blue}
				onPress={navigate.settings.aboutBerty}
			/>
			<ButtonSetting
				name='DevTools'
				icon='options-2-outline'
				iconColor={color.blue}
				onPress={navigate.settings.devTools}
			/>
		</View>
	)
}

export const Home: React.FC<ScreenProps.Settings.Home> = () => {
	const account = Chat.useAccount()
	const _styles = useStylesHome()
	const [{ flex, background, row }] = useStyles()
	return (
		<View style={[flex.tiny, background.white]}>
			{account == null ? (
				<ActivityIndicator size='large' style={[row.center]} />
			) : (
				<ScrollView bounces={false} contentContainerStyle={[_styles.scrollViewPadding]}>
					<HeaderSettings>
						<View>
							<HomeHeader />
							<HomeHeaderGroupButton />
						</View>
					</HeaderSettings>
					<HomeBodySettings />
				</ScrollView>
			)}
		</View>
	)
}
