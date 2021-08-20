import React from 'react'
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { Layout, Text, Icon } from '@ui-kitten/components'
import { useNavigation } from '@react-navigation/native'

import { useStyles } from '@berty-tech/styles'
import { ScreenProps } from '@berty-tech/navigation'
import messengerMethodsHooks from '@berty-tech/store/methods'
import { useThemeColor } from '@berty-tech/store/hooks'

import { useMsgrContext } from '@berty-tech/store/context'

export const SystemInfo: React.FC<ScreenProps.Settings.SystemInfo> = () => {
	const navigation = useNavigation()
	const [{ padding }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { reply: systemInfo, done, error, call } = messengerMethodsHooks.useSystemInfo()
	const { networkConfig } = useMsgrContext()

	React.useEffect(() => {
		call()
	}, [call])

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity onPress={() => call()}>
					<Icon
						name='refresh-outline'
						width={30 * scaleSize}
						height={30 * scaleSize}
						fill={colors['reverted-main-text']}
					/>
				</TouchableOpacity>
			),
		})
	})

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
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
