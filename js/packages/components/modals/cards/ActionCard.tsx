import { Icon } from '@ui-kitten/components'
import React from 'react'
import { View } from 'react-native'

import Avatar from '@berty/assets/logo/buck_berty_icon_card.svg'
import {
	SecondaryButtonIconLeft,
	TertiaryButtonIconLeft,
	TwoHorizontalButtonsSmallMargin,
} from '@berty/components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'

import { AvatarWrapperPriv } from './AvatarWrapper.priv'
import { CardContainerPriv } from './CardContainer.priv'
import { CardContentPriv } from './CardContent.priv'

interface ActionCardProps {
	onClose: () => void
	onConfirm: () => void
	title: string
	description: string
	confirmText: string
	cancelText: string
	withAvatar?: boolean
}

export const ActionCard: React.FC<ActionCardProps> = props => {
	const { text, margin, padding, row } = useStyles()
	const colors = useThemeColor()

	return (
		<CardContainerPriv>
			{props.withAvatar && (
				<AvatarWrapperPriv>
					<Avatar width={96} height={96} />
				</AvatarWrapperPriv>
			)}
			<CardContentPriv>
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
							{props.cancelText}
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
			</CardContentPriv>
		</CardContainerPriv>
	)
}
