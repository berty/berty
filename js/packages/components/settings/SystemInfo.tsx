import React from 'react'
import { View, ScrollView, ActivityIndicator } from 'react-native'
import { Layout, Text } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { HeaderSettings } from '../shared-components/Header'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import messengerMethodsHooks from '@berty-tech/store/methods'
import moment from 'moment'

const SystemInfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => {
	const [{ row, padding }] = useStyles()
	return (
		<View style={[row.left, padding.top.big]}>
			<Text>{label + ': '}</Text>
			<Text>{value}</Text>
		</View>
	)
}

const SystemInfoList: React.FC<{ systemInfo: any }> = ({ systemInfo }) => {
	const [{ padding }] = useStyles()
	return (
		<View style={[padding.large]}>
			{systemInfo &&
				Object.entries(systemInfo).map(([key, value]) => {
					if (key === 'startedAt') {
						return (
							<View key={key}>
								<SystemInfoItem
									label='startedAt'
									value={moment.unix(value).format('MMMM Do YYYY, h:mm:ss a')}
								/>
								<SystemInfoItem label='timeAgo' value={moment.unix(value).from(moment())} />
							</View>
						)
					} else if (key === 'buildTime') {
						return (
							<View key={key}>
								<SystemInfoItem
									label='buildTime'
									value={moment.unix(value[1]).format('MMMM Do YYYY, h:mm:ss a')}
								/>
								<SystemInfoItem label='timeAgo' value={moment.unix(value).from(moment())} />
							</View>
						)
					}
					return <SystemInfoItem label={key} value={value} key={key} />
				})}
		</View>
	)
}

export const SystemInfo: React.FC<ScreenProps.Settings.SystemInfo> = () => {
	const { goBack } = useNavigation()
	const [{ background, flex, color, padding }] = useStyles()
	const { reply: systemInfo, done, error, refresh } = messengerMethodsHooks.useSystemInfo()

	React.useEffect(() => {
		refresh()
	}, [refresh])

	return (
		<Layout style={[background.white, flex.tiny]}>
			<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
				<HeaderSettings
					title='System info'
					bgColor={color.dark.grey}
					undo={goBack}
					actionIcon='refresh-outline'
					action={refresh}
				/>
				{done ? (
					error ? (
						<View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
							<Text style={{ color: 'red' }}>{error.toString()}</Text>
						</View>
					) : (
						<SystemInfoList systemInfo={systemInfo} />
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
