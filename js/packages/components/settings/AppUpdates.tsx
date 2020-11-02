import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity } from 'react-native'
import { Layout, Text, Icon } from '@ui-kitten/components'
import { Translation } from 'react-i18next'
import { useStyles } from '@berty-tech/styles'
import { HeaderInfoSettings, HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingItem } from '../shared-components/SettingsButtons'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'

//
// App Updates
//

// Types
type HeaderAppUpdatesProps = {
	update: boolean
}

// Styles
const useStylesAppUpdate = () => {
	const [{ text }] = useStyles()

	return {
		newAppVersionText: text.size.small,
	}
}

const HeaderAppUpdates: React.FC<HeaderAppUpdatesProps> = ({ update }) => {
	const _styles = useStylesAppUpdate()
	const [{ color, text, row, margin, padding, background, border }] = useStyles()

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View>
					{update ? (
						<HeaderInfoSettings bgColor={color.light.blue}>
							<Text style={[text.color.white, row.center]} category='h5'>
								A new version is available
							</Text>
							<Text
								style={[
									text.color.white,
									row.center,
									margin.bottom.medium,
									_styles.newAppVersionText,
								]}
							>
								New app version: 2.42.1.4
							</Text>
							<ButtonSettingItem value='Multiple bug fixes, improved reliability' />
							<ButtonSettingItem value='Multiple bug fixes, improved reliability' />
							<TouchableOpacity
								style={[
									padding.vertical.medium,
									padding.horizontal.medium,
									background.blue,
									row.center,
									margin.top.medium,
									border.radius.medium,
								]}
							>
								<Icon name='download-outline' width={30} height={30} fill={color.white} />
								<Text
									style={[text.color.white, margin.left.medium, padding.right.small]}
									category='s'
								>
									Download latest version on app
								</Text>
							</TouchableOpacity>
						</HeaderInfoSettings>
					) : (
						<View>
							<ButtonSetting
								name={`${t('settings.updates.version')} 2.42.1.3`}
								icon='pricetags-outline'
								state={{
									value: t('settings.updates.current-tag'),
									color: color.white,
									bgColor: color.blue,
								}}
								actionIcon='arrow-ios-upward'
								disabled={true}
							>
								<View style={[padding.top.small]}>
									<ButtonSettingItem
										value='Multiple bug fixes'
										color='rgba(43,46,77,0.8)'
										iconColor={color.blue}
									/>
									<ButtonSettingItem
										value='More customization options for groups'
										color='rgba(43,46,77,0.8)'
										iconColor={color.blue}
									/>
									<ButtonSettingItem
										value='Improve connection issues in 4G'
										color='rgba(43,46,77,0.8)'
										iconColor={color.blue}
									/>
								</View>
							</ButtonSetting>
						</View>
					)}
				</View>
			)}
		</Translation>
	)
}

const BodyUpdates: React.FC<{ update: boolean }> = ({ update }) => {
	const [{ flex, padding, color }] = useStyles()

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View style={[flex.tiny, padding.medium]}>
					{update && (
						<ButtonSetting
							name={`${t('settings.updates.version')} 2.42.1.3`}
							icon='pricetags-outline'
							state={{
								value: t('settings.updates.current-tag'),
								color: color.white,
								bgColor: color.blue,
								icon: 'pricetags-outline',
								iconColor: color.red,
								iconSize: 30,
							}}
							actionIcon='arrow-ios-downward'
							disabled={true}
						/>
					)}
					<ButtonSetting
						name={`${t('settings.updates.version')} 2.42.1.2`}
						icon='pricetags-outline'
						state={{
							value: t('settings.updates.installed-tag'),
							color: color.green,
							bgColor: color.light.green,
						}}
						actionIcon='arrow-ios-downward'
						disabled={true}
					/>
					<ButtonSetting
						name={`${t('settings.updates.version')} 2.42.1.1`}
						icon='pricetags-outline'
						state={{
							value: t('settings.updates.not-installed-tag'),
							color: color.red,
							bgColor: color.light.red,
						}}
						actionIcon='arrow-ios-downward'
						disabled={true}
					/>
					<ButtonSetting
						name={`${t('settings.updates.version')} 2.41.9`}
						icon='pricetags-outline'
						state={{
							value: t('settings.updates.installed-tag'),
							color: color.green,
							bgColor: color.light.green,
						}}
						actionIcon='arrow-ios-downward'
						disabled={true}
					/>
					<ButtonSetting
						name={`${t('settings.updates.version')} 2.41.8`}
						icon='pricetags-outline'
						state={{
							value: t('settings.updates.installed-tag'),
							color: color.green,
							bgColor: color.light.green,
						}}
						actionIcon='arrow-ios-downward'
						disabled={true}
					/>
					<ButtonSetting
						name={`${t('settings.updates.version')} 2.41.7`}
						icon='pricetags-outline'
						state={{
							value: t('settings.updates.initial-tag'),
							color: color.blue,
							bgColor: color.light.blue,
						}}
						actionIcon='arrow-ios-downward'
						disabled={true}
					/>
				</View>
			)}
		</Translation>
	)
}

export const AppUpdates: React.FC<ScreenProps.Settings.AppUpdates> = () => {
	const [update] = useState(false)
	const { goBack } = useNavigation()
	const [{ flex, background, padding }] = useStyles()

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<Layout style={[flex.tiny, background.white]}>
					<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
						<HeaderSettings
							title={t('settings.updates.title')}
							desc={!update ? t('settings.updates.up-to-date-desc') : null}
							undo={goBack}
						>
							<HeaderAppUpdates update={update} />
						</HeaderSettings>
						<BodyUpdates update={update} />
					</ScrollView>
				</Layout>
			)}
		</Translation>
	)
}
