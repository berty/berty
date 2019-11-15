import React from 'react'
import { View, ScrollView, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native'
import { Layout, Text } from 'react-native-ui-kitten'
import { colors, styles } from '../styles'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { CircleAvatar } from '../shared-components/CircleAvatar'
import HeaderSettings from '../shared-components/Header'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'
import { berty } from '@berty-tech/berty-api'
//
// Home Vue
//

// Type

// Style
const _homeStyles = StyleSheet.create({
	homeAvatarBox: { width: 160, height: 180 },
	homeAvatar: { bottom: 37.5 },
	firstHeaderButton: {
		marginRight: 20,
		height: 90,
	},
	secondHeaderButton: {
		marginRight: 20,
		height: 90,
	},
	thirdHeaderButton: {
		height: 90,
	},
	headerNameText: {
		fontSize: 13,
	},
	scrollViewPadding: {
		paddingBottom: 116,
	},
})

const HomeHeaderGroupButton: React.FC<berty.chatmodel.Account> = () => {
	const { navigate } = useNavigation()
	return (
		<View style={[styles.paddingRight, styles.paddingLeft]}>
			<ButtonSettingRow
				state={[
					{
						name: 'Updates',
						icon: 'arrow-upward-outline',
						color: colors.blue,
						style: _homeStyles.firstHeaderButton,
						onPress: navigate.settings.appUpdates,
					},
					{
						name: 'Help',
						icon: 'question-mark-circle-outline',
						color: colors.red,
						style: _homeStyles.secondHeaderButton,
						onPress: navigate.settings.help,
					},
					{
						name: 'Settings',
						icon: 'settings-2-outline',
						color: colors.blue,
						style: _homeStyles.thirdHeaderButton,
						onPress: navigate.settings.mode,
					},
				]}
			/>
		</View>
	)
}
const HomeHeaderAvatar: React.FC<berty.chatmodel.Account> = ({ contact }) => (
	<View style={[styles.center, styles.marginTop]}>
		<View style={[_homeStyles.homeAvatarBox, styles.bgWhite, styles.borderRadius]}>
			<View style={[_homeStyles.homeAvatar]}>
				<CircleAvatar style={styles.centerItems} avatarUri={contact?.avatarUri || ''} size={75} />
				<View style={[styles.center]}>
					<Text style={[styles.fontFamily, styles.littlePaddingTop, _homeStyles.headerNameText]}>
						{contact?.name || ''}
					</Text>
				</View>
			</View>
		</View>
	</View>
)

const HomeHeader: React.FC = () => (
	<SafeAreaView style={[styles.alignVertical, styles.marginBottom]}>
		<HomeHeaderAvatar />
	</SafeAreaView>
)

const HomeBodySettings: React.FC<{}> = () => {
	const { navigate } = useNavigation()
	return (
		<View style={[styles.flex, styles.paddingLeft, styles.paddingRight, styles.marginTop]}>
			<ButtonSetting
				name='Notifications'
				icon='bell-outline'
				state={{ value: 'Current', color: colors.white, bgColor: colors.blue }}
				onPress={navigate.settings.notifications}
			/>
			<ButtonSetting
				name='Bluetooth'
				icon='bluetooth-outline'
				onPress={navigate.settings.bluetooth}
			/>
			<ButtonSetting name='Dark mode' icon='moon-outline' toggled />
			<ButtonSetting
				name='About Berty'
				icon='info-outline'
				onPress={navigate.settings.aboutBerty}
			/>
			<ButtonSetting
				name='DevTools'
				icon='options-2-outline'
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
	const { navigate } = useNavigation()
	const account = useAccount()
	return (
		<View style={[styles.flex, styles.justifyContent, styles.bgWhite]}>
			{account == null ? (
				<ActivityIndicator size='large' style={[styles.center]} />
			) : (
				<ScrollView contentContainerStyle={[_homeStyles.scrollViewPadding]}>
					<HeaderSettings actionIcon='edit-outline' action={navigate.settings.editProfile}>
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
