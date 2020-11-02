import React from 'react'
import { View, ScrollView, ActivityIndicator } from 'react-native'
import { Layout, Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import { useStyles } from '@berty-tech/styles'
import { HeaderSettings } from '../shared-components/Header'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import messengerMethodsHooks from '@berty-tech/store/methods'

export const SystemInfo: React.FC<ScreenProps.Settings.SystemInfo> = () => {
	const { goBack } = useNavigation()
	const [{ background, flex, color, padding }] = useStyles()
	const { reply: systemInfo, done, error, call } = messengerMethodsHooks.useSystemInfo()
	const { t } = useTranslation()

	React.useEffect(() => {
		call()
	}, [call])

	return (
		<Layout style={[background.white, flex.tiny]}>
			<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
				<HeaderSettings
					title={t('settings.system-info.title')}
					bgColor={color.dark.grey}
					undo={goBack}
					actionIcon='refresh-outline'
					action={call}
				/>
				{done ? (
					error ? (
						<View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
							<Text style={{ color: 'red' }}>{error.toString()}</Text>
						</View>
					) : (
						<Text selectable={true} style={{ height: '95%' }}>
							{JSON.stringify(systemInfo, null, 2)}
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
