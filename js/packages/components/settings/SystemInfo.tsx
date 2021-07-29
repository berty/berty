import React from 'react'
import { View, ScrollView, ActivityIndicator } from 'react-native'
import { Layout, Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import messengerMethodsHooks from '@berty-tech/store/methods'
import { useThemeColor } from '@berty-tech/store/hooks'

import { HeaderSettings } from '../shared-components/Header'
import { useMsgrContext } from '@berty-tech/store/context'

export const SystemInfo: React.FC<ScreenProps.Settings.SystemInfo> = () => {
	const { goBack } = useNavigation()
	const [{ padding }] = useStyles()
	const colors = useThemeColor()
	const { reply: systemInfo, done, error, call } = messengerMethodsHooks.useSystemInfo()
	const { t } = useTranslation()
	const { networkConfig } = useMsgrContext()

	React.useEffect(() => {
		call()
	}, [call])

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
				<HeaderSettings
					title={t('settings.system-info.title')}
					bgColor={colors['alt-secondary-background-header']}
					undo={goBack}
					actionIcon='refresh-outline'
					action={call}
				/>
				{done ? (
					error ? (
						<View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
							<Text style={{ color: colors['warning-asset'] }}>{error.toString()}</Text>
						</View>
					) : (
						<Text selectable={true} style={{ height: '95%' }}>
							{JSON.stringify(systemInfo, null, 2)}
							{'\n'}
							{JSON.stringify(networkConfig, null, 2)}
						</Text>
					)
				) : (
					<View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
						<ActivityIndicator size='large' />
					</View>
				)}
			</ScrollView>
		</Layout>
	)
}
