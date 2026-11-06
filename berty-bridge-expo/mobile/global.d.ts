declare module "*.svg" {
	import React from "react";
	import { SvgProps } from "react-native-svg";
	const content: React.FC<SvgProps>;
	export default content;
}
declare module "*.ttf";

// eslint-disable-next-line no-var -- ambient globals must be declared with var
declare var __DEV__: boolean | undefined;

declare module "google-palette" {
	const content: (type: string, count: number) => string[];
	export default content;
}

declare module "*.png";

declare module "*.gif";

declare module "*.json";
