import React from 'react'
import {
	View,
	ScrollView,
	StyleSheet,
	ActivityIndicator,
	SafeAreaView,
	Dimensions,
	TouchableOpacity,
} from 'react-native'
import { Text } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'
import HeaderSettings from '../shared-components/Header'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'
import { berty } from '@berty-tech/api'
import { Chat } from '@berty-tech/hooks'
import QRCode from 'react-native-qrcode-svg'

//
// Home Vue
//

// Type

// Style
const useStylesHome = () => {
	const [{ width, height, margin, padding, text }] = useStyles()
	return {
		homeAvatarBox: [width(140), height(180)],
		firstHeaderButton: [margin.right.scale(20), height(90)],
		secondHeaderButton: [margin.right.scale(20), height(90)],
		thirdHeaderButton: height(90),
		headerNameText: text.size.scale(13),
		scrollViewPadding: padding.bottom.scale(116),
	}
}
const _homeStyles = StyleSheet.create({
	homeAvatar: { bottom: 37.5 },
})

const HomeHeaderGroupButton: React.FC<berty.chatmodel.Account> = () => {
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
const HomeHeaderAvatar: React.FC<{}> = () => {
	const _styles = useStylesHome()
	const [{ row, margin, background, border, padding }] = useStyles()
	const client = Chat.useClient()
	const account = Chat.useAccount()
	const contactRequestReference = Chat.useContactRequestReference()
	const { navigate } = useNavigation()
	return (
		<TouchableOpacity
			style={[row.center, margin.top.scale(50)]}
			onPress={() => navigate.settings.myBertyId()}
		>
			<View style={[_styles.homeAvatarBox, background.white, border.radius.medium]}>
				<View style={[_homeStyles.homeAvatar]}>
					<ProceduralCircleAvatar
						style={[row.center, border.shadow.big]}
						seed={client?.accountPk}
						size={75}
						diffSize={25}
					/>
					<View style={[row.center]}>
						<Text style={[padding.top.small, _styles.headerNameText]}>{account?.name || ''}</Text>
					</View>
					<View style={[padding.top.small, row.item.justify]}>
						<QRCode size={Dimensions.get('window').width * 0.2} value={contactRequestReference} />
					</View>
				</View>
			</View>
		</TouchableOpacity>
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

export const useAccount = () => {
	const [accountGet, accountGetError] = Store.useAccountGet({ id: 0 })
	const [contactGet, contactGetError] = Store.useContactGet({
		id: accountGet?.account?.contactId || -1,
	})
	if (accountGetError || accountGet == null || accountGet?.account == null) {
		accountGetError && console.error(accountGetError)
		return null
	}
	if (contactGetError || contactGet?.contact == null) {
		contactGetError && console.error(contactGetError)
		return null
	}
	return {
		...accountGet.account,
		contact: {
			...contactGet.contact,
		},
	}
}

export const Home: React.FC<ScreenProps.Settings.Home> = () => {
	const account = { ...Chat.useAccount(), ...useAccount() }
	const _styles = useStylesHome()
	const [{ flex, background, row }] = useStyles()
	return (
		<View style={[flex.tiny, background.white]}>
			{account == null ? (
				<ActivityIndicator size='large' style={[row.center]} />
			) : (
				<ScrollView contentContainerStyle={[_styles.scrollViewPadding]}>
					<HeaderSettings>
						<View>
							<HomeHeader {...account} />
							<HomeHeaderGroupButton {...account} />
						</View>
					</HeaderSettings>
					<HomeBodySettings />
				</ScrollView>
			)}
		</View>
	)
}
