import { Icon } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

import { SendButton } from '../../ChatFooterButtons'
import { RecordingState } from '../constant'
import { AudioPreviewWrapperProps } from './interfaces'

export const AudioPreviewWrapper: React.FC<AudioPreviewWrapperProps> = props => {
	const { padding, margin } = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()

	const onPress = () => {
		if (props.clearRecordingInterval) {
			clearInterval(props.clearRecordingInterval)
		}
		props.setHelpMessageValue({
			message: t('audio.record.tooltip.not-sent'),
		})
		props.setRecordingState(RecordingState.PENDING_CANCEL)
	}

	return (
		<View style={[styles.container, margin.horizontal.medium]}>
			<TouchableOpacity
				style={[
					padding.horizontal.small,
					margin.right.small,
					styles.deleteButton,
					{
						backgroundColor: colors['secondary-background-header'],
					},
				]}
				onPress={onPress}
			>
				<Icon name='trash-outline' height={20} width={20} fill={colors['reverted-main-text']} />
			</TouchableOpacity>
			{props.children}
			<SendButton onPress={() => props.setRecordingState(RecordingState.COMPLETE)} />
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	deleteButton: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 36,
		height: 36,
		borderRadius: 18,
	},
})
