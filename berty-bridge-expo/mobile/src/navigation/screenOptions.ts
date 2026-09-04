import { useStyles } from '@berty/contexts/styles'

// Shared header title styling, previously exported from navigation/stacks.tsx.
export const CustomTitleStyle: () => any = () => {
	const { text } = useStyles()

	return [
		text.size.large,
		{
			headerTitleStyle: {
				...text.bold,
			},
		},
	]
}
