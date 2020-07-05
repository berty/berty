export type ColorsTypes = string
export type Colors<T> = {
	white: T
	black: T
	blue: T
	red: T
	yellow: T
	green: T
	grey: T
}

export type ColorsBrightness<T> = {
	default: Colors<T>
	light: Colors<T>
	dark: Colors<T>
}

export type ColorsDeclaration = ColorsBrightness<string>
export type ColorsStyles<T> = Colors<T> &
	ColorsBrightness<T> & {
		transparent: Colors<T> & ColorsBrightness<T>
		blur: Colors<T> & ColorsBrightness<T>
		opaque: Colors<T> & ColorsBrightness<T>
	}

export type SidesTypes = 'top' | 'left' | 'right' | 'bottom' | 'vertical' | 'horizontal'
export type Sides<T> = {
	top: T
	left: T
	right: T
	bottom: T
	vertical: T
	horizontal: T
}

export type SizesTypes = 'tiny' | 'small' | 'medium' | 'large' | 'big' | 'huge' | 'scale'
export type SizesDeclaration<T> = {
	tiny: T
	small: T
	medium: T
	large: T
	big: T
	huge: T
}
export type Sizes<T> = SizesDeclaration<T> & {
	scale: (size: number) => T
}

export type AlignHorizontalTypes = 'left' | 'right' | 'center' | 'fill'
export type AlignHorizontal<T> = {
	left: T
	right: T
	center: T
	fill: T
}

export type AlignVerticalTypes = 'top' | 'bottom' | 'justify' | 'fill' | 'center'
export type AlignVertical<T> = {
	top: T
	bottom: T
	justify: T
	fill: T
	center?: T
}

export type AlignTypes = [AlignHorizontalTypes, AlignVerticalTypes]
export type Align<T> = AlignHorizontal<T> & AlignVertical<T>

export type BoldDeclarationTypes =
	| 'normal'
	| 'bold'
	| '100'
	| '200'
	| '300'
	| '400'
	| '500'
	| '600'
	| '700'
	| '800'
	| '900'
export type BoldDeclaration<T> = {
	small: T
	medium: T
	huge: T
}

export type Text = {
	color: Colors<{}> & ColorsBrightness<{}>
	size: Sizes<{}>
	family: { use: (fontFamily: string) => {} }
	bold: BoldDeclaration<{ fontWeight: BoldDeclarationTypes }>
	italic: {}
	align: Align<{}>
}

export type BorderRadiusscale<T> = (size: number) => T
export type BorderRadius<T> = Sizes<T> &
	Sides<Sizes<{}>> & {
		scale: BorderRadiusscale<T>
	} & Sides<{
		scale: BorderRadiusscale<T>
	}>

export type BorderShadow<T> = Sizes<T>

export type Border<T> = Sizes<T> &
	Sides<Sizes<T>> & {
		radius: BorderRadius<T>
		shadow: BorderShadow<T>
		color: Colors<T> & ColorsBrightness<T>
	}

export type FlexJustifyTypes =
	| 'center'
	| 'flex-end'
	| 'flex-start'
	| 'space-around'
	| 'space-between'
	| 'space-evenly'
export type FlexJustifyType = { justifyContent: FlexJustifyTypes }
export type FlexJustify<FlexJustifyType> = {
	center: FlexJustifyType
	end: FlexJustifyType
	spaceAround: FlexJustifyType
	spaceBetween: FlexJustifyType
	spaceEvenly: FlexJustifyType
	start: FlexJustifyType
}

export type FlexAlignTypes = 'stretch' | 'center' | 'flex-start' | 'flex-end' | 'baseline'
export type FlexAlignType = { alignItems: FlexAlignTypes }
export type FlexAlign<FlexAlignType> = {
	baseline: FlexAlignType
	center: FlexAlignType
	end: FlexAlignType
	start: FlexAlignType
	stretch: FlexAlignType
}

export type FlexDirectionTypes = 'row' | 'column'
export type FlexDirectionType = { flexDirection: FlexDirectionTypes }
export type FlexDirection<FlexDirectionType> = {
	row: FlexDirectionType
	column: FlexDirectionType
}

export type Declaration = {
	colors: ColorsDeclaration
	sides: SizesDeclaration<number>
	text: {
		family: {}
		sizes: SizesDeclaration<number>
	}
}

export type Styles = {
	color: ColorsStyles<string>
	background: ColorsStyles<{}>
	padding: Sizes<{}> & Sides<Sizes<{}>>
	margin: Sizes<{}> & Sides<Sizes<{}>>
	border: Border<{}>
	text: Text
	absolute: Align<{}> & {
		scale: (values: { top?: number; left?: number; right?: number; bottom?: number }) => {}
	}
	column: AlignVertical<{}> & {
		item: AlignHorizontal<{}>
	}
	row: AlignHorizontal<{}> & {
		item: AlignVertical<{}>
	}
	flex: Sizes<{}> & {
		align: FlexAlign<FlexAlignType>
		justify: FlexJustify<FlexJustifyType>
		direction: FlexDirection<FlexDirectionType>
	}
	width: (width: number) => {}
	height: (height: number) => {}
	maxWidth: (maxWidth: number) => {}
	maxHeight: (maxHeight: number) => {}
	opacity: (opacity: number) => {}
	minWidth: (minWidth: number) => {}
	minHeight: (minHeight: number) => {}
	overflow: {}
}
