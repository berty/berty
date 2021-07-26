import React from 'react'
import { useTranslation } from 'react-i18next'
import { Layout } from '@ui-kitten/components'
import { Platform, ScrollView, StatusBar, View } from 'react-native'
import RNFetchBlob from 'rn-fetch-blob'
import RNFS from 'react-native-fs'
import Share from 'react-native-share'
import getPath from '@flyerhq/react-native-android-uri-path'
import { withInAppNotification } from 'react-native-in-app-notification'
import DocumentPicker from 'react-native-document-picker'

import { useNavigation } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'
import {
	defaultThemeColor,
	PersistentOptionsKeys,
	useMsgrContext,
	CurrentGeneratedTheme,
} from '@berty-tech/store/context'
import { createAndSaveFile } from '@berty-tech/store/services'
import { useThemeColor } from '@berty-tech/store/hooks'

import { randomizeThemeColor } from '../helpers'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { ButtonSetting } from '../shared-components'
import { HeaderSettings } from '../shared-components/Header'
import { DropDownPicker } from '../shared-components/DropDownPicker'
import ThemeColorName from '../modals/ThemeColorName'

const openThemeColorFile = async () => {
	const document = await DocumentPicker.pick({
		// @ts-ignore
		type: Platform.OS === 'android' ? ['*/*'] : ['public.item'],
	})
	return document
}

const importColorThemeFileToStorage = async (uri: string) => {
	const file = Platform.OS === 'android' ? getPath(uri) : uri.replace(/^file:\/\//, '')
	const theme = await RNFetchBlob.fs.readFile(file, 'utf8')
	return theme
}

const shareColorTheme = async (fileName: string) => {
	const outFile = RNFS.TemporaryDirectoryPath + `/${fileName}` + '.json'
	await Share.open({
		url: `file://${outFile}`,
		type: '*/*',
	})
}

const exportColorThemeToFile = async (themeColor: any, fileName: string) => {
	const outFile = RNFS.TemporaryDirectoryPath + `/${fileName}` + '.json'
	await RNFetchBlob.fs.writeFile(outFile, themeColor, 'utf8')
	Platform.OS === 'android'
		? await createAndSaveFile(outFile, fileName, 'json')
		: await shareColorTheme(fileName)
}

const BodyFileThemeEditor: React.FC<{}> = withInAppNotification(({ showNotification }: any) => {
	const ctx = useMsgrContext()
	const colors = useThemeColor()
	const { t } = useTranslation()

	return (
		<View>
			<ButtonSetting
				name={t('settings.theme-editor.import')}
				icon='color-palette-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon={null}
				onPress={async () => {
					const document = await openThemeColorFile()
					const themeColors = await importColorThemeFileToStorage(document.uri)
					const themeName = document.name.split('.')[0]
					await ctx.setPersistentOption({
						type: PersistentOptionsKeys.ThemeColor,
						payload: {
							selected: themeName,
							collection: {
								...ctx.persistentOptions.themeColor.collection,
								[themeName]: {
									colors: JSON.parse(themeColors),
								},
							},
						},
					})
				}}
			/>
			<ButtonSetting
				name={
					Platform.OS === 'android'
						? t('settings.theme-editor.export')
						: t('settings.theme-editor.share')
				}
				icon='color-palette-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon={null}
				onPress={async () => {
					await exportColorThemeToFile(
						JSON.stringify(colors),
						ctx.persistentOptions?.themeColor.selected,
					)
					if (Platform.OS === 'android') {
						showNotification({
							title: t('settings.mode.notification-file-saved.title'),
							message: t('settings.mode.notification-file-saved.desc'),
							additionalProps: { type: 'message' },
						})
					}
				}}
			/>
			{Platform.OS === 'android' ? (
				<ButtonSetting
					name={t('settings.theme-editor.share')}
					icon='color-palette-outline'
					iconSize={30}
					iconColor={colors['alt-secondary-background-header']}
					actionIcon={null}
					onPress={async () => {
						await shareColorTheme(ctx.persistentOptions?.themeColor.selected)
					}}
				/>
			) : null}
			<ButtonSetting
				name={'Delete all not default themes'}
				icon='color-palette-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon={null}
				onPress={async () => {
					await ctx.setPersistentOption({
						type: PersistentOptionsKeys.ThemeColor,
						payload: defaultThemeColor(),
					})
				}}
			/>
		</View>
	)
})

const BodyThemeEditor: React.FC<{ openModal: () => void }> = ({ openModal }) => {
	const ctx = useMsgrContext()
	const colors = useThemeColor()
	const [{ padding }] = useStyles()
	const { t } = useTranslation()

	const items: any = Object.entries(ctx.persistentOptions.themeColor.collection).map((value, _) => {
		return {
			label: value[0],
			value: value[1],
		}
	})
	return (
		<View style={[padding.medium, { flex: 1 }]}>
			<ButtonSetting
				name={t('settings.theme-editor.randomize')}
				icon='color-palette-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon={null}
				onPress={async () => {
					const themeColor = randomizeThemeColor()
					await ctx.setPersistentOption({
						type: PersistentOptionsKeys.ThemeColor,
						payload: {
							selected: CurrentGeneratedTheme,
							collection: {
								...ctx.persistentOptions.themeColor.collection,
								[CurrentGeneratedTheme]: {
									colors: themeColor,
								},
							},
						},
					})
				}}
			/>
			<ButtonSetting
				name={t('settings.theme-editor.save')}
				icon='color-palette-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon={null}
				onPress={() => openModal()}
			/>
			<DropDownPicker
				items={items}
				mode={'themeCollection'}
				defaultValue={ctx.persistentOptions?.themeColor.selected}
				onChangeItem={async (item: any) => {
					await ctx.setPersistentOption({
						type: PersistentOptionsKeys.ThemeColor,
						payload: {
							selected: item.label,
							collection: {
								...ctx.persistentOptions.themeColor.collection,
								[item.label]: item.value,
							},
						},
					})
				}}
			/>
			<BodyFileThemeEditor />
		</View>
	)
}

export const ThemeEditor: React.FC<{}> = () => {
	const [isModal, setIsModal] = React.useState<boolean>(false)

	const { goBack } = useNavigation()
	const colors = useThemeColor()
	const { t } = useTranslation()

	return (
		<Layout style={{ backgroundColor: colors['main-background'], flex: 1 }}>
			<StatusBar
				backgroundColor={colors['alt-secondary-background-header']}
				barStyle='light-content'
			/>
			<SwipeNavRecognizer>
				<ScrollView bounces={false}>
					<HeaderSettings
						title={t('settings.theme-editor.title')}
						bgColor={colors['alt-secondary-background-header']}
						undo={goBack}
					/>
					<BodyThemeEditor openModal={() => setIsModal(true)} />
				</ScrollView>
				{isModal && <ThemeColorName closeModal={() => setIsModal(false)} />}
			</SwipeNavRecognizer>
		</Layout>
	)
}
