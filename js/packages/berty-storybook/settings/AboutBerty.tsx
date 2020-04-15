import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
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
const useStylesAboutBerty = () => {
	const [{ padding, text, margin, minHeight }] = useStyles()
	return {
		headerInfosTitleText: padding.left.scale(10),
		headerInfosButtonText: text.size.scale(15),
		firstHeaderButtonRow: [margin.right.small, minHeight(108)],
		secondHeaderButtonRow: [margin.right.scale(10), minHeight(108)],
		firstButtonRow: margin.right.scale(10),
		secondButtonRow: margin.left.scale(10),
		buttonRowMarginTop: margin.top.scale(20),
	}
}

const HeaderAboutBerty: React.FC<AboutbertyProps> = ({ version }) => {
	const _styles = useStylesAboutBerty()
	const [{ text, margin, color, border, background, row, padding }] = useStyles()

	return (
		<View>
			{!version ? (
				<HeaderInfoSettings>
					<Text
						category='h6'
						style={[
							text.color.white,
							text.bold.medium,
							margin.bottom.small,
							_styles.headerInfosTitleText,
						]}
					>
						The berty app :
					</Text>
					<ButtonSettingItem
						value='Is Decentralised & Distributed (peer to peer)'
						color={color.white}
						icon='checkmark-circle-2'
						iconSize={12}
						iconColor={color.light.blue}
					/>
					<ButtonSettingItem
						value='Works with or without internet access'
						color={color.white}
						icon='checkmark-circle-2'
						iconSize={12}
						iconColor={color.light.blue}
					/>
					<ButtonSettingItem
						value='Is 100% private & secure'
						color={color.white}
						icon='checkmark-circle-2'
						iconSize={12}
						iconColor={color.light.blue}
					/>
					<ButtonSettingItem
						value='Is fully open source'
						color={color.white}
						icon='checkmark-circle-2'
						iconSize={12}
						iconColor={color.light.blue}
					/>
					<TouchableOpacity
						style={[
							background.blue,
							border.radius.medium,
							margin.horizontal.medium,
							margin.top.medium,
						]}
					>
						<View style={[margin.vertical.small, row.center]}>
							<Text
								style={[
									text.color.white,
									text.bold.medium,
									margin.right.medium,
									padding.left.small,
									_styles.headerInfosButtonText,
								]}
							>
								Learn more
							</Text>
							<Icon name='arrow-ios-forward' width={30} height={30} fill={color.white} />
						</View>
					</TouchableOpacity>
				</HeaderInfoSettings>
			) : (
				<View style={padding.top.medium}>
					<ButtonSettingRow
						state={[
							{
								name: 'Private & Secure',
								icon: 'lock-outline',
								color: color.yellow,
								style: _styles.firstHeaderButtonRow,
								disabled: true,
							},
							{
								name: 'Peer to peer network',
								icon: 'settings-2-outline',
								color: color.blue,
								style: _styles.secondHeaderButtonRow,
								disabled: true,
							},
						]}
						styleText={text.bold.medium}
					/>
					<ButtonSettingRow
						state={[
							{
								name: 'No internet or data required',
								icon: 'question-mark-circle-outline',
								color: color.red,
								style: _styles.firstHeaderButtonRow,
								disabled: true,
							},
							{
								name: 'No network trust required',
								icon: 'settings-2-outline',
								color: color.green,
								style: _styles.secondHeaderButtonRow,
								disabled: true,
							},
						]}
						style={_styles.buttonRowMarginTop}
						styleText={text.bold.medium}
					/>
				</View>
			)}
		</View>
	)
}

const BodyAboutBerty: React.FC<AboutbertyProps> = () => {
	const _styles = useStylesAboutBerty()
	const navigation = useNavigation()
	const [{ flex, margin, padding, color }] = useStyles()

	return (
		<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
			<ButtonSetting
				name='Terms of use'
				icon='info-outline'
				iconSize={30}
				iconColor={color.blue}
				actionIcon='arrow-ios-forward'
				onPress={navigation.navigate.settings.termsOfUse}
			/>
			<ButtonSetting
				name='Privacy policy'
				icon='book-open-outline'
				iconSize={30}
				iconColor={color.blue}
				actionIcon='arrow-ios-forward'
				disabled
			/>
			<ButtonSetting
				name='Software license'
				icon='award-outline'
				iconSize={30}
				iconColor={color.blue}
				actionIcon='arrow-ios-forward'
				disabled
			/>
			<ButtonSettingRow
				state={[
					{
						onPress: () => Linking.openURL('mailto:hello@berty.tech'),
						name: 'Contact us',
						icon: 'email-outline',
						color: color.blue,
						style: _styles.firstButtonRow,
					},
					{
						onPress: () => Linking.openURL('https://berty.tech'),
						name: 'Website',
						icon: 'globe-outline',
						color: color.blue,
						style: _styles.secondButtonRow,
					},
				]}
				style={_styles.buttonRowMarginTop}
			/>
		</View>
	)
}

export const AboutBerty: React.FC<ScreenProps.Settings.AboutBerty> = () => {
	const [version, setVersion] = useState(true)
	const { goBack } = useNavigation()
	const [{ flex, background }] = useStyles()

	return (
		<Layout style={[flex.tiny, background.white]}>
			<ScrollView>
				<HeaderSettings title='About Berty' undo={goBack}>
					<HeaderAboutBerty version={version} />
				</HeaderSettings>
				<BodyAboutBerty version={version} />
			</ScrollView>
		</Layout>
	)
}
