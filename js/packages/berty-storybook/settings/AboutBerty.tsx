import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { colors, styles } from '../styles'
import { HeaderInfoSettings, HeaderSettings } from '../shared-components/Header'
import {
	ButtonSetting,
	ButtonSettingItem,
	ButtonSettingRow,
} from '../shared-components/SettingsButtons'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'

//
// About Berty
//

// Types
type AboutbertyProps = {
	version: boolean
}

// Styles
const _aboutBertyStyles = StyleSheet.create({
	headerInfosTitleText: {
		paddingLeft: 10,
	},
	headerInfosButtonText: {
		fontSize: 15,
	},
	firstHeaderButtonRow: {
		marginRight: 10,
		minHeight: 108,
	},
	secondHeaderButtonRow: {
		marginLeft: 10,
		minHeight: 108,
	},
	firstButtonRow: {
		marginRight: 10,
	},
	secondButtonRow: {
		marginLeft: 10,
	},
	buttonRowMarginTop: {
		marginTop: 20,
	},
})

const HeaderAboutBerty: React.FC<AboutbertyProps> = ({ version }) => (
	<View>
		{!version ? (
			<HeaderInfoSettings>
				<Text
					category='h6'
					style={[
						styles.textWhite,
						styles.littleMarginBottom,
						styles.textBold,
						_aboutBertyStyles.headerInfosTitleText,
					]}
				>
					The berty app :
				</Text>
				<ButtonSettingItem
					value='Is Decentralised & Distributed (peer to peer)'
					color={colors.white}
					icon='checkmark-circle-2'
					iconSize={12}
					iconColor={colors.lightBlue}
				/>
				<ButtonSettingItem
					value='Works with or without internet access'
					color={colors.white}
					icon='checkmark-circle-2'
					iconSize={12}
					iconColor={colors.lightBlue}
				/>
				<ButtonSettingItem
					value='Is 100% private & secure'
					color={colors.white}
					icon='checkmark-circle-2'
					iconSize={12}
					iconColor={colors.lightBlue}
				/>
				<ButtonSettingItem
					value='Is fully open source'
					color={colors.white}
					icon='checkmark-circle-2'
					iconSize={12}
					iconColor={colors.lightBlue}
				/>
				<TouchableOpacity
					style={[
						styles.bgBlue,
						styles.borderRadius,
						styles.marginTop,
						styles.marginLeft,
						styles.marginRight,
					]}
				>
					<View
						style={[
							styles.littleMarginTop,
							styles.littleMarginBottom,
							styles.row,
							styles.spaceCenter,
							styles.alignItems,
						]}
					>
						<Text
							style={[
								styles.textBold,
								styles.marginRight,
								styles.textWhite,
								styles.littlePaddingLeft,
								_aboutBertyStyles.headerInfosButtonText,
							]}
						>
							Learn more
						</Text>
						<Icon name='arrow-ios-forward' width={30} height={30} fill={colors.white} />
					</View>
				</TouchableOpacity>
			</HeaderInfoSettings>
		) : (
			<View>
				<ButtonSettingRow
					state={[
						{
							name: 'Private & Secure',
							icon: 'lock-outline',
							color: colors.yellow,
							style: _aboutBertyStyles.firstHeaderButtonRow,
						},
						{
							name: 'Peer to peer network',
							icon: 'settings-2-outline',
							color: colors.blue,
							style: _aboutBertyStyles.secondHeaderButtonRow,
						},
					]}
					numberOfLines={2}
					styleText={[styles.textBold]}
				/>
				<ButtonSettingRow
					state={[
						{
							name: 'No internet or data required',
							icon: 'question-mark-circle-outline',
							color: colors.red,
							style: _aboutBertyStyles.firstHeaderButtonRow,
						},
						{
							name: 'No network trust required',
							icon: 'settings-2-outline',
							color: colors.green,
							style: _aboutBertyStyles.secondHeaderButtonRow,
						},
					]}
					numberOfLines={2}
					style={_aboutBertyStyles.buttonRowMarginTop}
					styleText={[styles.textBold]}
				/>
			</View>
		)}
	</View>
)

const BodyAboutBerty: React.FC<AboutbertyProps> = () => (
	<View style={[styles.flex, styles.padding, styles.marginBottom]}>
		<ButtonSetting
			name='Terms of use'
			icon='info-outline'
			iconSize={30}
			iconColor={colors.blue}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Privacy policy'
			icon='book-open-outline'
			iconSize={30}
			iconColor={colors.blue}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Software license'
			icon='award-outline'
			iconSize={30}
			iconColor={colors.blue}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSettingRow
			state={[
				{
					name: 'Contact us',
					icon: 'email-outline',
					color: colors.blue,
					style: _aboutBertyStyles.firstButtonRow,
				},
				{
					name: 'Website',
					icon: 'globe-outline',
					color: colors.blue,
					style: _aboutBertyStyles.secondButtonRow,
				},
			]}
			style={_aboutBertyStyles.buttonRowMarginTop}
			numberOfLines={1}
		/>
	</View>
)

export const AboutBerty: React.FC<ScreenProps.Settings.AboutBerty> = () => {
	const [version, setVersion] = useState(true)
	const { goBack } = useNavigation()
	return (
		<Layout style={[styles.flex, styles.bgWhite]}>
			<ScrollView>
				<HeaderSettings title='About Berty' action={setVersion} actionValue={version} undo={goBack}>
					<HeaderAboutBerty version={version} />
				</HeaderSettings>
				<BodyAboutBerty version={version} />
			</ScrollView>
		</Layout>
	)
}
