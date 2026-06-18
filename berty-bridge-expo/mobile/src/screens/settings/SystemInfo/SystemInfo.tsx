import { Layout, Icon } from '@ui-kitten/components'
import Long from 'long'
import React from 'react'
import {
	View,
	ScrollView,
	ActivityIndicator,
	TouchableOpacity,
	StyleSheet,
	Platform,
} from 'react-native'

import beapi from '@berty/api'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import { bertyMethodsHooks, useMountEffect, useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { accountClient } from '@berty/utils/accounts/accountClient'
import { useTopInset } from '@berty/utils/react-native/useTopInset'

// Render protobuf Long fields as their decimal value instead of {low, high, unsigned}.
const longReplacer = (_key: string, value: unknown) =>
	Long.isLong(value) ? (value as Long).toString() : value

export const SystemInfo: ScreenFC<'Settings.SystemInfo'> = ({ navigation }) => {
	const { padding } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const { reply: systemInfo, done, error, call } = bertyMethodsHooks.useSystemInfo()
	const [networkConfig, setNetworkConfig] = React.useState<beapi.account.INetworkConfig | null>(
		null,
	)
	const topInset = useTopInset()

	useMountEffect(() => {
		const getNetworkConfig = async () => {
			// with an empty accountId the function returns default config
			const defaultConfig = await accountClient.networkConfigGet({ accountId: '' })
			console.log('defaultConfig', defaultConfig.currentConfig)
			if (defaultConfig.currentConfig) {
				setNetworkConfig(defaultConfig?.currentConfig)
			}
		}

		getNetworkConfig()
	})

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
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'], paddingTop: topInset }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={[padding.horizontal.medium, padding.bottom.scale(90)]}
			>
				{done ? (
					error ? (
						<View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
							<UnifiedText style={{ color: colors['warning-asset'] }}>
								{error.toString()}
							</UnifiedText>
						</View>
					) : (
						<UnifiedText selectable={true} style={styles.infoText}>
							{JSON.stringify(systemInfo, longReplacer, 2)}
							{'\n'}
							{JSON.stringify(networkConfig, longReplacer, 2)}
						</UnifiedText>
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

const styles = StyleSheet.create({
	infoText: {
		fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
		fontSize: 13,
		lineHeight: 18,
	},
})
