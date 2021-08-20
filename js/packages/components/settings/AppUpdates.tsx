import React from 'react'
import { View, ScrollView, StatusBar } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { ScreenProps } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'
import messengerMethodsHooks from '@berty-tech/store/methods'
import { useThemeColor } from '@berty-tech/store/hooks'

import { ButtonSetting } from '../shared-components/SettingsButtons'

//
// App Updates
//

const BodyUpdates: React.FC<{}> = () => {
	const [{ flex, padding }] = useStyles()
	const colors = useThemeColor()
	const { t }: any = useTranslation()
	const { reply: systemInfo, done, error, call } = messengerMethodsHooks.useSystemInfo()

	React.useEffect(() => {
		call()
	}, [call])

	return (
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
	)
}

export const AppUpdates: React.FC<ScreenProps.Settings.AppUpdates> = () => {
	const colors = useThemeColor()

	return (
		<Layout style={{ backgroundColor: colors['main-background'], flex: 1 }}>
			<StatusBar backgroundColor={colors['background-header']} barStyle={'light-content'} />
			<ScrollView bounces={false}>
				<BodyUpdates />
			</ScrollView>
		</Layout>
	)
}
