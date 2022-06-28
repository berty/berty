import { Icon } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import Avatar from '@berty/assets/logo/buck_berty_icon_card.svg'
import {
	SecondaryButtonIconLeft,
	TertiaryButtonIconLeft,
	TwoHorizontalButtonsSmallMargin,
} from '@berty/components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'

interface ActionCardProps {
	onClose: () => void
	onConfirm: () => void
	title: string
	description: string
	confirmText: string
	cancelText?: string
	withAvatar?: boolean
}

export const ActionCard: React.FC<ActionCardProps> = props => {
	const { text, margin, padding, row } = useStyles()
	const { t } = useTranslation()
	const colors = useThemeColor()

	return (
		<View style={[styles.container, margin.big]}>
			{props.withAvatar && (
				<View style={styles.avatar}>
					<Avatar width={96} height={96} />
				</View>
			)}
			<View style={[padding.horizontal.large, padding.bottom.medium, styles.content]}>
				{!props.withAvatar && (
					<Icon
						name='info-outline'
						fill={colors['background-header']}
						width={60}
						height={60}
						style={[row.item.justify, margin.top.huge, margin.bottom.small]}
					/>
				)}
				<View style={props.withAvatar ? [margin.top.scale(70)] : []}>
					<UnifiedText style={[text.align.center, padding.top.small, text.size.big, text.bold]}>
						{props.title}
					</UnifiedText>
					<View style={[padding.top.scale(20), { flexDirection: 'column' }]}>
						<UnifiedText style={[text.align.center]}>{props.description}</UnifiedText>
					</View>

					<View style={[margin.top.medium]}>{props.children}</View>
				</View>

				<View style={[margin.top.medium, margin.bottom.small]}>
					<TwoHorizontalButtonsSmallMargin>
						<TertiaryButtonIconLeft name='close' onPress={props.onClose}>
							{props.cancelText ? props.cancelText : t('modals.save-theme.cancel')}
						</TertiaryButtonIconLeft>
						<SecondaryButtonIconLeft
							onPress={() => {
								props.onClose()
								props.onConfirm()
							}}
						>
							{props.confirmText}
						</SecondaryButtonIconLeft>
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
})
