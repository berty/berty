import type { StyleProp, ViewStyle } from 'react-native';

export type OnLoadEventPayload = {
  url: string;
};

export type BertyBridgeExpoModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
  onPushReceived: (params: PushReceivedEventPayload) => void;
};

export type PushReceivedEventPayload = string;

export type ChangeEventPayload = {
  value: string;
};

export type BertyBridgeExpoViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
