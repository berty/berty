import React from 'react'
import { ActivityIndicator, View, Platform, StyleSheet } from 'react-native'
import * as Progress from 'react-native-progress'
import { useSelector } from 'react-redux'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { selectStreamProgress } from '@berty/redux/reducers/ui.reducer'

import { StreamProgressProps } from './interfaces'

const messages = [
	'Hang tight!\nBerty is retrieving the latest data from the local database.',
	'Just a moment longer!\nBerty is accessing the local records to provide you with up-to-date information.',
	'Berty is working on fetching the data from the local database. Thank you for your patience.',
	'Sit tight!\nBerty is accessing the local database to bring you the requested data.',
	'Fetching data from the local storage. We appreciate your patience while loading the information.',
]

export const StreamProgressPriv: React.FC<StreamProgressProps> = props => {
	const { text } = useStyles()
	const colors = useThemeColor()
	const stream = useSelector(selectStreamProgress)
	const [extraLabel, setExtraLabel] = React.useState<string | undefined>(undefined)

	React.useEffect(() => {
		if (stream) {
			setInterval(() => {
				setExtraLabel(messages[Math.floor(Math.random() * messages.length)])
			}, 10000)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<View style={{ backgroundColor: colors['main-background'], flex: 1 }} testID={props.testID}>
			<UnifiedText style={[text.align.center, styles.title]}>
				{stream?.stream || 'Test'}
			</UnifiedText>
			<View style={styles.content}>
				<UnifiedText style={[text.align.center, styles.waiting]}>{extraLabel}</UnifiedText>
				<UnifiedText style={[text.align.center]}>{stream?.msg.doing || 'Doing'}</UnifiedText>
				<UnifiedText style={[text.align.center]}>
					{stream?.msg.completed || '0'} / {stream?.msg.total || '6'}
				</UnifiedText>
				{Platform.OS === 'web' ? (
					<ActivityIndicator size='large' />
				) : (
					<Progress.Bar progress={stream?.msg.progress || 0} width={200} color='#3946E1' />
				)}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	title: {
		position: 'absolute',
		top: 60,
		left: 0,
		right: 0,
	},
	content: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	waiting: {
		margin: 8,
		padding: 8,
		height: 100,
	},
})
