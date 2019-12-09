import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { colors, styles } from '../styles'
import { HeaderInfoSettings, HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingItem } from '../shared-components/SettingsButtons'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'

//
// App Updates
//

// Types
type HeaderAppUpdatesProps = {
	update: boolean
}

// Styles
const _appUpdatesStyles = StyleSheet.create({
	newAppVersionText: {
		fontSize: 12,
	},
})

const HeaderAppUpdates: React.FC<HeaderAppUpdatesProps> = ({ update }) => (
	<View>
		{update ? (
			<HeaderInfoSettings bgColor={colors.lightBlue}>
				<Text style={[styles.textWhite, styles.fontFamily, styles.center]} category='h5'>
					A new version is available
				</Text>
				<Text
					style={[
						styles.textWhite,
						styles.center,
						styles.marginBottom,
						_appUpdatesStyles.newAppVersionText,
					]}
				>
					New app version: 2.42.1.4
				</Text>
				<ButtonSettingItem value='Multiple bug fixes, improved reliability' />
				<ButtonSettingItem value='Multiple bug fixes, improved reliability' />
				<TouchableOpacity
					style={[
						styles.littlePaddingTop,
						styles.littlePaddingBottom,
						styles.paddingLeft,
						styles.paddingRight,
						styles.bgBlue,
						styles.row,
						styles.alignItems,
						styles.justifyContent,
						styles.marginTop,
						styles.borderRadius,
					]}
				>
					<Icon name='download-outline' width={30} height={30} fill={colors.white} />
					<Text
						style={[styles.textWhite, styles.marginLeft, styles.littlePaddingRight]}
						category='s'
					>
						Download latest version on app
					</Text>
				</TouchableOpacity>
			</HeaderInfoSettings>
		) : (
			<View>
				<ButtonSetting
					name='Version 2.42.1.3'
					icon='pricetags-outline'
					state={{
						value: 'Current',
						color: colors.white,
						bgColor: colors.blue,
					}}
					actionIcon='arrow-ios-upward'
				>
					<View style={[styles.littlePaddingTop]}>
						<ButtonSettingItem
							value='Multiple bug fixes'
							color='rgba(43,46,77,0.8)'
							iconColor={colors.blue}
						/>
						<ButtonSettingItem
							value='More customization options for groups'
							color='rgba(43,46,77,0.8)'
							iconColor={colors.blue}
						/>
						<ButtonSettingItem
							value='Improve connection issues in 4G'
							color='rgba(43,46,77,0.8)'
							iconColor={colors.blue}
						/>
					</View>
				</ButtonSetting>
			</View>
		)}
	</View>
)

const BodyUpdates: React.FC<{ update: boolean }> = ({ update }) => (
	<View style={[styles.flex, styles.padding]}>
		{update && (
			<ButtonSetting
				name='Version 2.42.1.3'
				icon='pricetags-outline'
				state={{
					value: 'Current',
					color: colors.white,
					bgColor: colors.blue,
					icon: 'pricetags-outline',
					iconColor: colors.red,
					iconSize: 30,
				}}
				actionIcon='arrow-ios-downward'
			/>
		)}
		<ButtonSetting
			name='Version 2.42.1.2'
			icon='pricetags-outline'
			state={{
				value: 'Installed',
				color: colors.green,
				bgColor: colors.lightGreen,
			}}
			actionIcon='arrow-ios-downward'
		/>
		<ButtonSetting
			name='Version 2.42.1.1'
			icon='pricetags-outline'
			state={{
				value: 'Not installed',
				color: colors.red,
				bgColor: colors.lightRed,
			}}
			actionIcon='arrow-ios-downward'
		/>
		<ButtonSetting
			name='Version 2.41.9'
			icon='pricetags-outline'
			state={{
				value: 'Installed',
				color: colors.green,
				bgColor: colors.lightGreen,
			}}
			actionIcon='arrow-ios-downward'
		/>
		<ButtonSetting
			name='Version 2.41.8'
			icon='pricetags-outline'
			state={{
				value: 'Installed',
				color: colors.green,
				bgColor: colors.lightGreen,
			}}
			actionIcon='arrow-ios-downward'
		/>
		<ButtonSetting
			name='Version 2.41.7'
			icon='pricetags-outline'
			state={{
				value: 'Not installed',
				color: colors.red,
				bgColor: colors.lightRed,
			}}
			actionIcon='arrow-ios-downward'
		/>
		<ButtonSetting
			name='Version 2.41.6'
			icon='pricetags-outline'
			state={{
				value: 'Initial install',
				color: colors.blue,
				bgColor: colors.lightBlue,
			}}
			actionIcon='arrow-ios-downward'
		/>
	</View>
)

export const AppUpdates: React.FC<ScreenProps.Settings.AppUpdates> = () => {
	const [update, setUpdate] = useState(false)
	const { goBack } = useNavigation()

	return (
		<Layout style={[styles.flex, styles.bgWhite]}>
			<ScrollView>
				<HeaderSettings
					title='App updates'
					action={setUpdate}
					actionValue={update}
					desc={!update ? 'Your app is up to date' : null}
					undo={goBack}
				>
					<HeaderAppUpdates update={update} />
				</HeaderSettings>
				<BodyUpdates update={update} />
			</ScrollView>
		</Layout>
	)
}
