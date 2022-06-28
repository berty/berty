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

import { AvatarWrapperPriv } from './AvatarWrapper.priv'
import { CardContainerPriv } from './CardContainer.priv'
import { CardContentPriv } from './CardContent.priv'

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
		<CardContainerPriv>
			<AvatarWrapperPriv>
				<Icon
					name='alert-circle-outline'
					width={80}
					height={80}
					fill='#E35179'
					style={[row.item.justify]}
				/>
			</AvatarWrapperPriv>
			<CardContentPriv>
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
			</CardContentPriv>
		</CardContainerPriv>
	)
}

const styles = StyleSheet.create({
	errorColor: {
		color: '#E35179',
	},
})
