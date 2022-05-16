import React from 'react'
import { View } from 'react-native'

import { SecondaryButtonIconRight, SecondaryButton } from '@berty/components'
import { useStyles } from '@berty/contexts/styles'

type FooterCreateGroupProps = {
	title: string
	// titleStyle?: TextStyle | TextStyle[]
	icon?: string
	action: () => void
	loading?: boolean
}

// const useStylesCreateGroup = () => {
// 	const { border, text } = useStyles()
// 	return {
// 		footerCreateGroupButton: border.radius.small,
// 		footerCreateGroupText: text.size.medium,
// 	}
// }

export const FooterCreateGroup = ({ title, icon, action, loading }: FooterCreateGroupProps) => {
	const { padding } = useStyles()

	return (
		<View style={[padding.horizontal.huge, padding.vertical.large]}>
			{icon ? (
				<SecondaryButtonIconRight loading={loading} name={icon} onPress={action}>
					{title}
				</SecondaryButtonIconRight>
			) : (
				<SecondaryButton loading={loading} onPress={action}>
					{title}
				</SecondaryButton>
			)}
		</View>
	)

	// return (
	// 	<View style={[padding.horizontal.huge, padding.vertical.large]}>
	// 		<TouchableOpacity
	// 			onPress={() => {
	// 				if (typeof action !== 'function') {
	// 					console.warn('action is not a function:', action)
	// 					return
	// 				}
	// 				action()
	// 			}}
	// 			style={[
	// 				padding.horizontal.medium,
	// 				padding.vertical.small,
	// 				{
	// 					flexDirection: 'row',
	// 					justifyContent: 'center',
	// 					backgroundColor: colors['positive-asset'],
	// 				},
	// 				_styles.footerCreateGroupButton,
	// 			]}
	// 		>
	// 			<View style={[row.item.justify, { flex: 1 }]}>
	// 				{loading ? (
	// 					<ActivityIndicator color={colors['background-header']} />
	// 				) : (
	// 					<UnifiedText
	// 						style={[
	// 							text.bold,
	// 							text.align.center,
	// 							_styles.footerCreateGroupText,
	// 							{ color: colors['background-header'] },
	// 							titleStyle,
	// 						]}
	// 					>
	// 						{title}
	// 					</UnifiedText>
	// 				)}
	// 			</View>
	// 			{icon && !loading && (
	// 				<View style={[row.item.justify, { position: 'absolute', right: 70 * scaleSize }]}>
	// 					<Icon
	// 						name='arrow-forward-outline'
	// 						width={25 * scaleSize}
	// 						height={25 * scaleSize}
	// 						fill={colors['background-header']}
	// 					/>
	// 				</View>
	// 			)}
	// 		</TouchableOpacity>
	// 	</View>
	// )
}
