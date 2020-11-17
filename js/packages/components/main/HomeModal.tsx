import React from 'react'
import {
	View,
	TouchableOpacity,
	StyleSheet,
	TouchableWithoutFeedback,
	Text as TextNative,
} from 'react-native'
import { Icon } from '@ui-kitten/components'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'
import { Translation } from 'react-i18next'
import LinearGradient from 'react-native-linear-gradient'
import { PanGestureHandler, State } from 'react-native-gesture-handler'

import { useStyles } from '@berty-tech/styles'

const HomeModalButton: React.FC<{
	value?: string
	bgColor?: string
	icon?: string
	iconSize?: number
	iconPack?: string
	left?: boolean
	right?: boolean
	onPress: any
	children?: any
	hasMarginBottom?: boolean
}> = ({
	value,
	bgColor,
	icon,
	iconSize = 60,
	iconPack,
	onPress,
	children = null,
	hasMarginBottom,
}) => {
	const [{ border, padding, color, text, margin }] = useStyles()

	return (
		<TouchableOpacity
			style={[
				{
					flexDirection: 'column',
					justifyContent: 'center',
					width: '100%',
				},
				border.radius.medium,
				hasMarginBottom && margin.bottom.large,
			]}
			onPress={onPress}
		>
			{children ? (
				children
			) : (
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<View
						style={[
							{
								backgroundColor: bgColor,
								shadowColor: '#000',
								shadowOffset: {
									width: 0,
									height: 4,
								},
								shadowOpacity: 0.4,
								shadowRadius: 4,

								elevation: 16,
							},
							border.radius.large,
							padding.vertical.large,
							padding.horizontal.medium,
							margin.right.large,
						]}
					>
						<Icon
							name={icon}
							pack={iconPack}
							fill={color.white}
							width={iconSize}
							height={iconSize}
						/>
					</View>
					<TextNative
						numberOfLines={1}
						style={[
							text.color.black,
							text.bold.medium,
							text.size.scale(18),
							{ fontFamily: 'Open Sans' },
						]}
					>
						{value}
					</TextNative>
				</View>
			)}
		</TouchableOpacity>
	)
}

export const HomeModal: React.FC<{}> = () => {
	const navigation = useNativeNavigation()
	const [{ absolute, color, margin, text, border, padding }] = useStyles()

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View>
					<LinearGradient
						style={[
							absolute.bottom,
							{
								alignItems: 'center',
								justifyContent: 'center',
								height: '100%',
								width: '100%',
								opacity: 0.6,
							},
						]}
						colors={['white', 'black']}
					/>
					<TouchableWithoutFeedback style={[StyleSheet.absoluteFill]} onPress={navigation.goBack}>
						<View style={{ width: '100%', height: '100%' }} />
					</TouchableWithoutFeedback>
					<View
						style={[
							absolute.bottom,
							margin.bottom.scale(95),
							{
								width: '100%',
							},
						]}
					>
						<View
							style={[
								{
									backgroundColor: 'white',
									flex: 1,
									shadowColor: '#000',
									shadowOffset: {
										width: 0,
										height: 9,
									},
									shadowOpacity: 0.48,
									shadowRadius: 11.95,
									elevation: 18,
								},
								border.radius.medium,
								padding.large,
								padding.top.medium,
							]}
						>
							<View
								style={[
									{
										backgroundColor: '#EDEFF3',
										height: 5,
										width: 70,
										alignSelf: 'center',
									},
									border.radius.small,
									margin.bottom.medium,
								]}
							></View>
							<HomeModalButton
								bgColor='#527FEC'
								onPress={() => navigation.navigate('Main.CreateGroupAddMembers')}
								hasMarginBottom
							>
								<View style={{ flexDirection: 'row', alignItems: 'center' }}>
									<View
										style={[
											{
												backgroundColor: '#527FEC',
											},
											border.radius.large,
											padding.vertical.large,
											padding.horizontal.medium,
											margin.right.large,
										]}
									>
										<Icon
											name='plus'
											pack='custom'
											fill={color.white}
											width={15}
											height={15}
											style={{ top: 30, left: -7 }}
										/>
										<Icon name='users' pack='custom' fill={color.white} width={60} height={60} />
									</View>
									<TextNative
										numberOfLines={1}
										style={[
											text.color.black,
											text.bold.medium,
											text.size.scale(18),
											{ fontFamily: 'Open Sans' },
										]}
									>
										{t('main.home-modal.top-button')}
									</TextNative>
								</View>
							</HomeModalButton>
							<HomeModalButton
								value={t('main.home-modal.bottom-button')}
								bgColor={color.red}
								icon='qr'
								iconPack='custom'
								onPress={() => navigation.navigate('Main.Scan')}
							/>
						</View>
					</View>
				</View>
			)}
		</Translation>
	)
}
