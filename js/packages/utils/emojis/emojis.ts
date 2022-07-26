import emojiSource from 'emoji-datasource'

type Emoji = {
	short_name: string
	unified: string
	short_names: string[]
	sheet_x: number
	sheet_y: number
	skin_variations?: { [key: string]: Emoji }
	category: string
	char: string
	image_url: string
	image: string
}

const emojis: Emoji[] = emojiSource

const toEmoji = (code: any) => {
	return String.fromCodePoint(...code.split('-').map((u: string) => '0x' + u))
}

export const getEmojiByName = (name: string) => {
	const requiredSource = emojis.find((item: Emoji) => item.short_name === name.replaceAll(':', ''))
	if (!requiredSource) {
		return
	}
	return toEmoji(requiredSource?.unified)
}
