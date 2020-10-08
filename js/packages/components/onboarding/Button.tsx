import React from 'react'
import { ActivityIndicator as Spinner, Text, TouchableHighlight, ViewStyle } from 'react-native'

import { useStyles } from '@berty-tech/styles'

const Button: React.FC<{
	children: string
	onPress: () => Promise<void> | void
	style?: ViewStyle
}> = ({ children, onPress, style = null }) => {
	const [{ margin, padding, background, color, text, border }] = useStyles()
	const [loading, setLoading] = React.useState(false)
	const cancelRef = React.useRef(false)
	React.useEffect(() => {
		return () => {
			cancelRef.current = true
		}
	}, [])
	return (
		<TouchableHighlight
			style={[
				padding.horizontal.big,
				margin.top.medium,
				padding.medium,
				loading ? background.light.blue : background.blue,
				border.radius.small,
				style,
			]}
			underlayColor={color.light.blue}
			onPress={async () => {
				try {
					setLoading(true)
					await onPress()
				} finally {
					if (cancelRef.current) {
						return
					}
					setLoading(false)
				}
			}}
		>
			{loading ? (
				<Spinner style={[text.size.medium]} color={color.white} />
			) : (
				<Text style={[text.size.medium, text.color.white, text.align.center, text.bold.medium]}>
					{children}
				</Text>
			)}
		</TouchableHighlight>
	)
}

export default Button
