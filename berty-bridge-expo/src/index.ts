// Reexport the native module. On web, it will be resolved to BertyBridgeExpoModule.web.ts
// and on native platforms to BertyBridgeExpoModule.ts
export { default } from './BertyBridgeExpoModule';
export { default as BertyBridgeExpoView } from './BertyBridgeExpoView';
export * from  './BertyBridgeExpo.types';

export * from './GoBridge'
