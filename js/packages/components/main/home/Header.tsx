import React, { useEffect, useRef, useState } from 'react'
import { Platform, ScrollView, TextInput, TouchableOpacity, View, ViewProps } from 'react-native'
import { useStyles } from '@berty-tech/styles'
import { useNavigation as useNativeNavigation } from '@react-navigation/core'
import { Translation } from 'react-i18next'
import LottieView from 'lottie-react-native'
import { Icon } from '@ui-kitten/components'
import { AccountAvatar } from '@berty-tech/components/avatars'

export const HomeHeader: React.FC<
	ViewProps & {
		hasRequests: boolean
		scrollRef: React.RefObject<ScrollView>
		isOnTop: boolean
		value: string
		onChange: any
		refresh: boolean
		setRefresh: any
		onLongPress: React.Dispatch<React.SetStateAction<boolean>>
		isMultiAccount: boolean
	}
> = ({
	hasRequests,
	scrollRef,
	onLayout,
	isOnTop,
	value,
	onChange,
	refresh,
	setRefresh,
	onLongPress,
	isMultiAccount,
}) => {
	const [
		{ border, width, height, padding, text, background, margin, row },
		{ scaleHeight },
	] = useStyles()
	const { navigate } = useNativeNavigation()
	const [focus, setFocus] = useState<any>(null)
	const animate = useRef<any>(null)

	let paddingTop: any
	if (!value?.length) {
		if (!hasRequests) {
			paddingTop = 40
		} else {
			if (isOnTop) {
				paddingTop = 40
			} else {
				paddingTop = 20
			}
		}
	} else {
		paddingTop = 40
	}

	useEffect(() => {
		if (refresh) {
			setRefresh(false)
			animate.current.play()
		}
	}, [refresh, setRefresh, animate])

	return (
		<View onLayout={onLayout}>
			<Translation>
				{(t: any): React.ReactNode => (
					<View>
						<View
							style={[
								background.white,
								border.radius.top.big,
								padding.horizontal.scale(27),
								{
									alignItems: 'center',
									paddingTop: paddingTop * scaleHeight,
								},
							]}
						>
							{hasRequests && !isOnTop && !value?.length && (
								<View style={[width(42), height(4), { backgroundColor: '#F1F4F6' }]} />
							)}
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									paddingVertical: 15,
								}}
							>
								<View
									style={{
										flex: 1,
										alignItems: 'flex-end',
										marginLeft: 5,
									}}
								>
									<TouchableOpacity
										activeOpacity={1}
										onPress={() => {
											animate.current.play()
											scrollRef.current?.scrollTo({ y: 0, animated: true })
										}}
									>
										<LottieView
											ref={animate}
											style={{ width: 40 }}
											source={require('../berty_logo_animated.json')}
											loop={false}
										/>
									</TouchableOpacity>
								</View>
								<TouchableOpacity
									style={[
										{
											flex: 12,
											flexDirection: 'row',
											justifyContent: 'flex-start',
											alignItems: 'center',
											backgroundColor: value?.length ? '#FFF0D5' : '#F1F4F6',
										},
										padding.vertical.scale(Platform.OS === 'android' ? 0 : 12),
										padding.left.medium,
										margin.left.small,
										margin.right.scale(25),
										border.radius.medium,
									]}
									activeOpacity={1}
									onPress={() => focus?.focus()}
								>
									<View style={[row.center]}>
										<Icon
											name='search-outline'
											fill={value?.length ? '#FFAE3A' : '#8F9BB3'}
											width={20}
											height={20}
										/>
									</View>

									<View
										style={[
											!value?.length && margin.left.medium,
											{
												flex: 6,
												flexDirection: 'row',
												alignItems: 'flex-start',
											},
										]}
									>
										<TextInput
											ref={(ref) => setFocus(ref)}
											placeholder={t('main.home.input-placeholder')}
											placeholderTextColor='#D3D9E1'
											autoCorrect={false}
											autoCapitalize='none'
											value={value}
											onChangeText={(s: string) => onChange(s)}
											style={[
												{ fontFamily: 'Open Sans', color: '#FFAE3A' },
												value?.length ? padding.right.scale(25) : padding.right.medium,
												text.size.medium,
											]}
										/>
									</View>
									{value?.length ? (
										<TouchableOpacity
											style={{
												justifyContent: 'center',
												flex: 1,
												flexDirection: 'row',
											}}
											onPress={() => onChange('')}
										>
											<Icon name='close-circle-outline' fill='#FFAE3A' width={20} height={20} />
										</TouchableOpacity>
									) : null}
								</TouchableOpacity>
								<TouchableOpacity
									style={{
										flex: 1,
										flexDirection: 'row',
										justifyContent: 'center',
										alignItems: 'center',
									}}
									onPress={() => {
										if (isMultiAccount) {
											onLongPress(false)
										} else {
											navigate('Settings.Home')
										}
									}}
									delayLongPress={1000}
									onLongPress={() => {
										onLongPress(true)
									}}
								>
									<AccountAvatar size={40} />
								</TouchableOpacity>
							</View>
						</View>
					</View>
				)}
			</Translation>
		</View>
	)
}
