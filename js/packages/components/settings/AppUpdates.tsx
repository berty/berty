import React from 'react'
import { View, ScrollView, StatusBar } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { Translation } from 'react-i18next'

import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'
import messengerMethodsHooks from '@berty-tech/store/methods'
import { useThemeColor } from '@berty-tech/store/hooks'

import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting } from '../shared-components/SettingsButtons'

//
// App Updates
//

const BodyUpdates: React.FC<{}> = () => {
	const [{ flex, padding }] = useStyles()
	const colors = useThemeColor()
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
								color: colors['reverted-main-text'],
								bgColor: colors['background-header'],
								icon: 'pricetags-outline',
								iconColor: colors['secondary-background-header'],
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
	const { goBack } = useNavigation()
	const colors = useThemeColor()

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<Layout style={{ backgroundColor: colors['main-background'], flex: 1 }}>
					<StatusBar backgroundColor={colors['background-header']} barStyle={'light-content'} />
					<ScrollView bounces={false}>
						<HeaderSettings title={t('settings.updates.title')} desc={null} undo={goBack} />
						<BodyUpdates />
					</ScrollView>
				</Layout>
			)}
		</Translation>
	)
}
