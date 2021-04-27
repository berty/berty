import React from 'react'
import Markdown, { MarkdownIt, tokensToAST, stringToTokens } from 'react-native-markdown-display'

const useStylesMarkdown = (msgBackgroundColor: string, msgTextColor: string) => {
	return {
		paragraph: {
			marginTop: 0,
			marginBottom: 0,
			flexWrap: 'wrap',
			flexDirection: 'row',
			alignItems: 'flex-start',
			justifyContent: 'flex-start',
		},
		blockquote: {
			backgroundColor: '#F5F5F5',
			borderColor: '#CCC',
			borderLeftWidth: 4,
			marginLeft: 5,
			paddingHorizontal: 5,
		},

		text: {
			color: msgTextColor,
			fontWeight: '600',
			fontSize: 12,
			fontFamily: 'Open Sans',
		},
		link: {
			textDecorationLine: 'underline',
		},
	}
}

const md = MarkdownIt({
	typographer: true,
	linkify: true,
}).disable([
	'image',
	'link', // Avoid [https://test.com](https://olol.com)
])

const BertyMarkdown: React.FC<{
	msgBackgroundColor: string
	msgTextColor: string
	message: string | null | undefined
}> = ({ msgBackgroundColor, msgTextColor, message }) => {
	const styles: any = useStylesMarkdown(msgBackgroundColor, msgTextColor)

	return (
		<Markdown style={styles} markdownit={md}>
			{message && tokensToAST(stringToTokens(message, md))}
		</Markdown>
	)
}

export default BertyMarkdown
