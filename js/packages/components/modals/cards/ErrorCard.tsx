import { Icon } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import {
	ErrorButtonIconLeft,
	TertiaryButtonIconLeft,
	TwoHorizontalButtonsSmallMargin,
} from '@berty/components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'

interface ErrorCardProps {
	onClose: () => void
	onConfirm: () => void
	title: string
	description: string
}

export const ErrorCard: React.FC<ErrorCardProps> = props => {
	const { text, margin, padding, row } = useStyles()
	const { t } = useTranslation()

	return (
		<View style={[styles.container, margin.big]}>
			<View style={styles.avatar}>
				<Icon
					name='alert-circle-outline'
					width={80}
					height={80}
					fill='#E35179'
					style={[row.item.justify]}
				/>
			</View>
			<View style={[padding.horizontal.large, padding.bottom.medium, styles.content]}>
				<View style={[margin.top.scale(70)]}>
					<UnifiedText
						style={[
							text.align.center,
							padding.top.small,
							text.size.big,
							text.bold,
							styles.errorColor,
						]}
					>
						{props.title}
					</UnifiedText>
					<View style={[padding.top.scale(20), { flexDirection: 'column' }]}>
						<UnifiedText style={[text.align.center, styles.errorColor]}>
							{props.description}
						</UnifiedText>
					</View>

					<View style={[margin.top.medium]}>{props.children}</View>
				</View>

				<View style={[margin.top.medium, margin.bottom.small]}>
					<TwoHorizontalButtonsSmallMargin>
						<TertiaryButtonIconLeft name='arrow-back-outline' onPress={props.onClose}>
							{t('settings.delete-account.cancel-button')}
						</TertiaryButtonIconLeft>
						<ErrorButtonIconLeft name='close' onPress={props.onConfirm}>
							{t('settings.delete-account.delete-button')}
						</ErrorButtonIconLeft>
					</TwoHorizontalButtonsSmallMargin>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		alignItems: 'center',
		height: 250,
		top: '25%',
	},
	avatar: {
		width: 98,
		height: 98,
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
		top: 50,
		zIndex: 1,
		elevation: 7,
		shadowOpacity: 0.1,
		shadowRadius: 40,
		shadowColor: 'black',
		shadowOffset: { width: 0, height: 10 },
		borderRadius: 100,
	},
	content: {
		backgroundColor: 'white',
		elevation: 7,
		shadowOpacity: 0.1,
		shadowRadius: 40,
		shadowColor: 'black',
		shadowOffset: { width: 0, height: 10 },
		borderRadius: 20,
	},
	errorColor: {
		color: '#E35179',
	},
})
