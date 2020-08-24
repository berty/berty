import React, { useState, useEffect } from 'react'
import { View, ScrollView, ActivityIndicator } from 'react-native'
import { Layout, Text } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { HeaderSettings } from '../shared-components/Header'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { Settings } from '@berty-tech/store/oldhooks'
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

const SystemInfoList: React.FC<{}> = () => {
	const settings = Settings.useSettings()
	const [{ padding }] = useStyles()
	return (
		<View style={[padding.large]}>
			{settings?.systemInfo &&
				Object.entries(settings?.systemInfo).map((value: any, key) => {
					if (value[0] === 'startedAt') {
						return (
							<View>
								<SystemInfoItem
									label='startedAt'
									value={moment.unix(value[1]).format('MMMM Do YYYY, h:mm:ss a')}
								/>
								<SystemInfoItem label='timeAgo' value={moment.unix(value[1]).from(moment())} />
							</View>
						)
					} else if (value[0] === 'buildTime') {
						return (
							<View>
								<SystemInfoItem
									label='buildTime'
									value={moment.unix(value[1]).format('MMMM Do YYYY, h:mm:ss a')}
								/>
								<SystemInfoItem label='timeAgo' value={moment.unix(value[1]).from(moment())} />
							</View>
						)
					}
					return <SystemInfoItem label={value[0]} value={value[1]} key={key} />
				})}
		</View>
	)
}

export const SystemInfo: React.FC<ScreenProps.Settings.SystemInfo> = () => {
	const { goBack } = useNavigation()
	const [{ background, flex, color, padding }] = useStyles()
	const systemInfo = Settings.useSystemInfo()
	const [startRefresh, setStartRefresh] = useState(false)

	useEffect(() => {
		if (startRefresh) {
			systemInfo()
			setStartRefresh(false)
		}
	}, [startRefresh, systemInfo])

	return (
		<Layout style={[background.white, flex.tiny]}>
			<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
				<HeaderSettings
					title='System info'
					bgColor={color.dark.grey}
					undo={goBack}
					actionIcon='refresh-outline'
					action={() => setStartRefresh(true)}
				/>
				{startRefresh ? (
					<View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
						<ActivityIndicator size='large' />
					</View>
				) : (
					<SystemInfoList />
				)}
			</ScrollView>
		</Layout>
	)
}
