import { Icon } from '@ui-kitten/components'
import React from 'react'
import { View } from 'react-native'

import Logo from '@berty/assets/logo/buck_berty_icon_card.svg'
import {
	SecondaryButtonIconLeft,
	TertiaryButtonIconLeft,
	HorizontalDuoSmall,
} from '@berty/components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

import { ActionButtonsProps, ModalCardProps } from '../interfaces'
import { CardBodyPriv } from './CardBody.priv'
import { CardWrapperPriv } from './CardWrapper.priv'
import { HeaderPictoWrapperPriv } from './HeaderPictoWrapper.priv'

interface ActionCardProps extends ModalCardProps, ActionButtonsProps {
	withLogo?: boolean
}

export const ActionCard: React.FC<ActionCardProps> = props => {
	const { text, margin, padding, row } = useStyles()
	const colors = useThemeColor()

	return (
		<CardWrapperPriv>
			{props.withLogo && (
				<HeaderPictoWrapperPriv>
					<Logo width={96} height={96} />
				</HeaderPictoWrapperPriv>
			)}
			<CardBodyPriv>
				{!props.withLogo && (
					<Icon
						name='info-outline'
						fill={colors['background-header']}
						width={60}
						height={60}
						style={[row.item.justify, margin.top.huge, margin.bottom.small]}
					/>
				)}
				<View style={props.withLogo ? [margin.top.scale(70)] : []}>
					<UnifiedText style={[text.align.center, padding.top.small, text.size.big, text.bold]}>
						{props.title}
					</UnifiedText>
					<View style={[padding.top.scale(20), { flexDirection: 'column' }]}>
						<UnifiedText style={[text.align.center]}>{props.description}</UnifiedText>
					</View>

					<View style={[margin.top.medium]}>{props.children}</View>
				</View>

				<View style={[margin.top.medium, margin.bottom.small]}>
					<HorizontalDuoSmall>
						<TertiaryButtonIconLeft name='close' onPress={props.onClose} testID={props.cancelText}>
							{props.cancelText}
						</TertiaryButtonIconLeft>
						<SecondaryButtonIconLeft
							onPress={() => {
								props.onClose()
								props.onConfirm()
							}}
							testID={props.confirmText}
						>
							{props.confirmText}
						</SecondaryButtonIconLeft>
					</HorizontalDuoSmall>
				</View>
			</CardBodyPriv>
		</CardWrapperPriv>
	)
}
