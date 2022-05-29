import LottieView from 'lottie-react-native'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, TouchableOpacity, View, ViewProps } from 'react-native'

import { MediumInput } from '@berty/components'
import { AccountAvatar } from '@berty/components/avatars'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import { useNavigation } from '@berty/navigation'
import { useProfileNotification, useThemeColor } from '@berty/store'

import { UnreadCount } from './UnreadCount'

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
	isOnTop,
	value,
	onChange,
	refresh,
	setRefresh,
	onLongPress,
	isMultiAccount,
}) => {
	const { border, width, height, padding, margin } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const { navigate } = useNavigation()
	const notifs = useProfileNotification()
	const { t }: any = useTranslation()
	const animate = useRef<any>(null)

	useEffect(() => {
		if (refresh) {
			setRefresh(false)
			animate.current.play()
		}
	}, [refresh, setRefresh, animate])

	return (
		<View>
			<View>
				<View
					style={[
						!isOnTop && border.radius.top.big,
						padding.horizontal.scale(27),
						{
							backgroundColor: colors['main-background'],
							alignItems: 'center',
						},
					]}
				>
					{hasRequests && !isOnTop && !value?.length && (
						<View style={[width(42), height(4), { backgroundColor: colors['main-background'] }]} />
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
									source={require('@berty/assets/lottie/berty_logo_animated.json')}
									loop={false}
								/>
							</TouchableOpacity>
						</View>
						<View style={[{ flex: 12 }, margin.left.small, margin.right.scale(25)]}>
							<MediumInput
								autoCorrect={false}
								autoCapitalize='none'
								value={value}
								onChangeText={onChange}
								placeholder={t('main.home.input-placeholder')}
								iconName='search-outline'
							/>
						</View>
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
							onLongPress={() => {
								onLongPress(true)
							}}
						>
							<AccountAvatar size={35} />
							{notifs > 0 && (
								<View
									style={{
										position: 'absolute',
										left: 15 * scaleSize,
										top: -(3 * scaleSize),
									}}
								>
									<UnreadCount value={notifs} />
								</View>
							)}
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</View>
	)
}
