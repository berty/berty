import { StyleSheet } from 'react-native'

export const colors = {
  white: '#FFFFFF',
  black: '#2B2E4D',
  blue: '#525BEC',
  red: '#F64278',
}

export const styles = StyleSheet.create({
  textWhite: { color: colors.white },
  textBlack: { color: colors.black },
  textBlue: { color: colors.blue },
  textRed: { color: colors.red },
  bgWhite: { backgroundColor: colors.white },
  bgBlack: { backgroundColor: colors.black },
  bgBlue: { backgroundColor: colors.blue },
  bgRed: { backgroundColor: colors.red },

  flex: { flex: 1 },
  wrap: { flexWrap: 'wrap' },
  nowrap: { flexWrap: 'nowrap' },
  row: { flex: 1, flexDirection: 'row' },
  rowRev: { flex: 1, flexDirection: 'row-reverse' },
  col: { flex: 1, flexDirection: 'column' },
  colRev: { flex: 1, flexDirection: 'column-reverse' },

  center: { alignSelf: 'center' },
  start: { alignSelf: 'flex-start' },
  end: { alignSelf: 'flex-end' },
  stretch: { alignSelf: 'stretch' },

  spaceEvenly: { justifyContent: 'space-evenly' },
  spaceAround: { justifyContent: 'space-around' },

  bottom: { bottom: 0 },
  left: { left: 0 },
  top: { top: 0 },
  right: { right: 0 },

  textCenter: {
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  textLeft: {
    textAlign: 'left',
    textAlignVertical: 'center',
  },
  textRight: {
    textAlign: 'right',
    textAlignVertical: 'center',
  },

  margin: { margin: 16 },
  marginHorizontal: { marginHorizontal: 16 },
  marginVertical: { marginVertical: 16 },
  marginLeft: { marginLeft: 16 },
  marginTop: { marginTop: 16 },
  marginRight: { marginRight: 16 },
  marginBottom: { marginBottom: 16 },
  padding: { padding: 16 },
  paddingHorizontal: { paddingHorizontal: 16 },
  paddingVertical: { paddingVertical: 16 },
  paddingLeft: { paddingLeft: 16 },
  paddingTop: { paddingTop: 16 },
  paddingRight: { paddingRight: 16 },
  paddingBottom: { paddingBottom: 16, bottom: 16 },

  absolute: { position: 'absolute' },
  relative: { position: 'relative' },
})

export default styles
