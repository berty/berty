export const base64ToURLBase64 = (str: string) =>
	str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '')
