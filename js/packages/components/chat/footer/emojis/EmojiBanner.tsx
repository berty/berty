import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, Animated, LayoutChangeEvent } from 'react-native'
import { TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler'
import { useTranslation } from 'react-i18next'

import { Divider, Icon } from '@ui-kitten/components'
import { useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { selectChatInputText, setChatInputText } from '@berty/redux/reducers/chatInputs.reducer'
import { useAppDispatch, useAppSelector } from '@berty/hooks'
import { emojis, getEmojiByName } from '@berty/components/utils'
import {
	selectChatInputIsFocused,
	selectChatInputSelection,
} from '@berty/redux/reducers/chatInputsVolatile.reducer'
import { UnifiedText } from '../../../shared-components/UnifiedText'
import { Emoji } from '@berty/contexts/styles/types'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

type Word = {
	word: string
	start: number | null
	end: number | null
}

export const EmojiBanner: FC<{
	convPk: string
	activationNumber?: number
	emojisToDisplay?: number
}> = ({ convPk, activationNumber = 2, emojisToDisplay = 5 }) => {
	const { t } = useTranslation()
	const colors = useThemeColor()
	const { padding, border, text: textStyle } = useStyles()
	const { scaleSize } = useAppDimensions()
	const slideAnim = useRef(new Animated.Value(1000)).current // 1000 in order to make the modal not visible before the first render
	const collapseAnim = useRef(new Animated.Value(0)).current
	const selection = useAppSelector(state => selectChatInputSelection(state, convPk))
	const text = useAppSelector(state => selectChatInputText(state, convPk))
	const isFocused = useAppSelector(state => selectChatInputIsFocused(state, convPk))
	const [closedAtWordIndex, setClosedAtWordIndex] = useState<number | null>(null)
	const regex = useMemo(() => new RegExp(`^:[a-z0-9+]{${activationNumber},}$`), [activationNumber])
	const dispatch = useAppDispatch()

	const [modalHeight, setModalHeight] = useState<number>(0)
	const [isOpened, setIsOpened] = useState<boolean>(false)
	const [currentWord, setCurrentWord] = useState<Word>({ word: '', start: null, end: null })
	const [currentEmojis, setCurrentEmojis] = useState<Emoji[]>([])

	// javascript string manipulation functions doesn't work well with emojis
	const removeEmojis = (str: string) => {
		const emojiRE = new RegExp('[\u1000-\uFFFF]+', 'g')
		return str.replace(emojiRE, '��')
	}

	const getCurrentWord = useCallback((): Word => {
		if (!selection || !isFocused || selection?.start !== selection?.end) {
			return { word: '', start: null, end: null }
		}
		const isSpace = (c: string) => /\s/.exec(c)
		const parsedText = removeEmojis(text)
		let start = selection.start - 1
		let end = selection.start

		while (start >= 0 && !isSpace(parsedText[start])) {
			start -= 1
		}
		start = Math.max(0, start + 1)
		while (end < parsedText.length && !isSpace(parsedText[end])) {
			end += 1
		}
		end = Math.max(start, end)

		return { word: parsedText.substring(start, end), start, end }
	}, [isFocused, selection, text])

	const setOpen = useCallback(
		(open: boolean) => {
			Animated.spring(slideAnim, {
				toValue: open ? 0 : modalHeight + emojisToDisplay * 50 * scaleSize + 50 * scaleSize, // + 50 for hiding modal shadows
				velocity: 3,
				tension: 2,
				friction: 8,
				useNativeDriver: true,
			}).start()
		},
		[emojisToDisplay, modalHeight, scaleSize, slideAnim],
	)

	useEffect(() => {
		if (!isOpened) {
			return
		}
		Animated.spring(collapseAnim, {
			toValue:
				(emojisToDisplay < currentEmojis.length ? emojisToDisplay : currentEmojis.length) *
				50 *
				scaleSize,
			velocity: 3,
			tension: 2,
			friction: 8,
			useNativeDriver: false,
		}).start()
	}, [collapseAnim, currentEmojis.length, emojisToDisplay, isOpened, scaleSize])

	useEffect(() => {
		setIsOpened(false)
	}, [isFocused])

	useEffect(() => {
		setOpen(isOpened)
		if (!isOpened) {
			setCurrentEmojis([])
		}
	}, [isOpened, setOpen])

	useEffect(() => {
		setIsOpened(false)
	}, [modalHeight])

	useEffect(() => {
		const tmpCurrentWord = getCurrentWord()
		setCurrentWord(tmpCurrentWord)
		if (
			tmpCurrentWord.word.startsWith(':') &&
			tmpCurrentWord.word.endsWith(':') &&
			emojis.length > 2
		) {
			const emoji = getEmojiByName(tmpCurrentWord.word)
			if (!emoji) {
				return
			}
			dispatch(
				setChatInputText({
					convPK: convPk,
					text: `${text.slice(0, tmpCurrentWord.start!)}${emoji}${text.slice(tmpCurrentWord.end!)}`,
				}),
			)
		}
		setIsOpened(regex.test(tmpCurrentWord.word) && closedAtWordIndex !== tmpCurrentWord.start)
	}, [
		closedAtWordIndex,
		convPk,
		currentEmojis,
		currentWord.end,
		currentWord.start,
		dispatch,
		getCurrentWord,
		regex,
		text,
	])

	useEffect(() => {
		if (!isFocused || !selection || !currentWord.word.length) {
			setClosedAtWordIndex(null)
		}
	}, [currentWord.word.length, isFocused, selection])

	useEffect(() => {
		if (isOpened) {
			setCurrentEmojis(
				emojis.filter(({ short_name }) => short_name.startsWith(currentWord.word.substring(1))),
			)
		}
	}, [text, selection, isOpened, currentWord.word])

	const handleCloseModal = () => {
		setIsOpened(false)
		setClosedAtWordIndex(currentWord.start)
	}

	return (
		<Animated.View style={{ position: 'relative', transform: [{ translateY: slideAnim }] }}>
			<View
				style={[
					border.radius.top.large,
					border.shadow.big,
					padding.top.medium,
					{
						position: 'absolute',
						backgroundColor: colors['main-background'],
						left: 0,
						right: 0,
						bottom: 0,
						shadowColor: colors.shadow,
						elevation: 20,
					},
				]}
			>
				<View
					onLayout={({ nativeEvent: { layout } }: LayoutChangeEvent) => {
						if (modalHeight === 0) {
							setModalHeight(layout.height)
						}
					}}
				>
					<View
						style={[
							padding.horizontal.medium,
							{
								height: 40 * scaleSize,
								backgroundColor: colors['main-background'],
								flexDirection: 'row',
								alignItems: 'flex-start',
							},
						]}
					>
						<View style={{ flex: 1 }}>
							<UnifiedText style={[textStyle.bold]}>
								{`${t('chat.emojis.matching')}: ${currentWord.word.substring(1)}`}
							</UnifiedText>
						</View>
						<View
							style={[
								padding.tiny,
								border.radius.medium,
								{ backgroundColor: colors['background-header'] },
							]}
						>
							<TouchableOpacity onPress={handleCloseModal}>
								<Icon
									name='close'
									width={15 * scaleSize}
									height={15 * scaleSize}
									fill={colors['main-background']}
								/>
							</TouchableOpacity>
						</View>
					</View>
					<Divider style={{ backgroundColor: `${colors['background-header']}30` }} />
				</View>
				<Animated.FlatList
					data={currentEmojis}
					removeClippedSubviews
					style={{
						height: collapseAnim,
					}}
					nestedScrollEnabled
					keyExtractor={({ short_name }) => short_name}
					persistentScrollbar
					keyboardShouldPersistTaps='always'
					renderItem={({ item: { short_name } }) => (
						<TouchableHighlight
							underlayColor={`${colors['secondary-text']}80`}
							onPress={() => {
								dispatch(
									setChatInputText({
										convPK: convPk,
										text: `${text.slice(0, currentWord.start!)}:${short_name}:${text.slice(
											currentWord.end!,
										)}`,
									}),
								)
							}}
						>
							<View>
								<View
									style={{
										height: 50 * scaleSize,
										justifyContent: 'center',
										backgroundColor: colors['main-background'],
									}}
								>
									<UnifiedText style={[padding.left.medium]}>{`${getEmojiByName(
										short_name,
									)} :${short_name}:`}</UnifiedText>
								</View>
								<Divider style={{ backgroundColor: `${colors['background-header']}30` }} />
							</View>
						</TouchableHighlight>
					)}
				/>
			</View>
		</Animated.View>
	)
}
