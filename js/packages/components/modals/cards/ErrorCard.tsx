import { Icon } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { ErrorButtonIconLeft, TertiaryButtonIconLeft, HorizontalDuoSmall } from '@berty/components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'

import { ModalCardProps } from '../interfaces'
import { CardBodyPriv } from './CardBody.priv'
import { CardWrapperPriv } from './CardWrapper.priv'
import { HeaderPictoWrapperPriv } from './HeaderPictoWrapper.priv'

export const ErrorCard: React.FC<ModalCardProps> = props => {
	const { text, margin, padding, row } = useStyles()
	const { t } = useTranslation()

	return (
		<CardWrapperPriv>
			<HeaderPictoWrapperPriv>
				<Icon
					name='alert-circle-outline'
					width={80}
					height={80}
					fill='#E35179'
					style={[row.item.justify]}
				/>
			</HeaderPictoWrapperPriv>
			<CardBodyPriv>
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
					<HorizontalDuoSmall>
						<TertiaryButtonIconLeft name='arrow-back-outline' onPress={props.onClose}>
							{t('settings.delete-account.cancel-button')}
						</TertiaryButtonIconLeft>
						<ErrorButtonIconLeft name='close' onPress={props.onConfirm}>
							{t('settings.delete-account.delete-button')}
						</ErrorButtonIconLeft>
					</HorizontalDuoSmall>
				</View>
			</CardBodyPriv>
		</CardWrapperPriv>
	)
}

const styles = StyleSheet.create({
	errorColor: {
		color: '#E35179',
	},
})
