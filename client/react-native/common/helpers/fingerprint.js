import CryptoJS from 'crypto-js'

export const fingerprint = key => CryptoJS.SHA256(key).toString(CryptoJS.enc.Hex)

export const formattedFingerprint = key => (fingerprint(key).match(/.{1,4}/g) || '').join(' ') + ' '
