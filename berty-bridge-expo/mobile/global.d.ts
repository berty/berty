declare module "*.svg" {
	import React from "react";
	import { SvgProps } from "react-native-svg";
	const content: React.FC<SvgProps>;
	export default content;
}
declare module "*.ttf";

declare var __DEV__: boolean | undefined;

declare module "google-palette" {
	const content: (type: string, count: number) => string[];
	export default content;
}

declare module "*.png";

declare module "*.gif";

declare module "*.json";
