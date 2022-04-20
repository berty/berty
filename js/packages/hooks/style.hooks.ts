import { useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'

export const useStylesDefaultModal = () => {
	const { width, border, padding, margin } = useStyles()
	const colors = useThemeColor()

	return {
		skipButton: [
			border.scale(2),
			border.radius.small,
			margin.top.scale(15),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
			width(120),
			{ borderColor: colors['negative-asset'] },
		],
		addButton: [
			border.scale(2),
			border.radius.small,
			margin.top.scale(15),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
			width(120),
			{ borderColor: colors['positive-asset'] },
		],
	}
}
