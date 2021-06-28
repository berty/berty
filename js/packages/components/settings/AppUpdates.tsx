import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity } from 'react-native'
import { Layout, Text, Icon } from '@ui-kitten/components'
import { Translation } from 'react-i18next'

import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'
import messengerMethodsHooks from '@berty-tech/store/methods'

import { HeaderInfoSettings, HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingItem } from '../shared-components/SettingsButtons'

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
		<View>
			{update ? (
				<HeaderInfoSettings bgColor={color.light.blue}>
					<Text style={[text.color.white, row.center]} category='h5'>
						A new version is available
					</Text>
					<Text
						style={[text.color.white, row.center, margin.bottom.medium, _styles.newAppVersionText]}
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
						<Text style={[text.color.white, margin.left.medium, padding.right.small]} category='s'>
							Download latest version on app
						</Text>
					</TouchableOpacity>
				</HeaderInfoSettings>
			) : null}
		</View>
	)
}

const BodyUpdates: React.FC<{}> = () => {
	const [{ flex, padding, color }] = useStyles()
	const { reply: systemInfo, done, error, call } = messengerMethodsHooks.useSystemInfo()

	React.useEffect(() => {
		call()
	}, [call])

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View style={[flex.tiny, padding.medium]}>
					{done && !error && systemInfo?.protocol?.process?.version && (
						<ButtonSetting
							name={`${systemInfo?.protocol.process.version.split('-')[0]}`}
							icon='pricetags-outline'
							state={{
								value: t('settings.updates.current-tag'),
								color: color.white,
								bgColor: color.blue,
								icon: 'pricetags-outline',
								iconColor: color.red,
								iconSize: 30,
							}}
							actionIcon={null}
						/>
					)}
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
						<HeaderSettings title={t('settings.updates.title')} desc={null} undo={goBack}>
							<HeaderAppUpdates update={update} />
						</HeaderSettings>
						<BodyUpdates />
					</ScrollView>
				</Layout>
			)}
		</Translation>
	)
}
