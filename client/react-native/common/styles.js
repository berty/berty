import { Platform } from 'react-native'
import { colors } from './constants'

const styles = {
  padding: {
    padding: 16,
  },
  paddingLeft: { paddingLeft: 16 },
  paddingTop: { paddingTop: 16 },
  paddingRight: { paddingRight: 16 },
  paddingBottom: { paddingBottom: 16 },
  paddingHorizontal: { paddingLeft: 16, paddingRight: 16 },
  paddingVertical: { paddingTop: 16, paddingBottom: 16 },
  margin: {
    margin: 16,
  },
  marginTop: {
    marginTop: 16,
  },
  marginBottom: {
    marginBottom: 16,
  },
  marginLeft: {
    marginLeft: 16,
  },
  marginTopLeft: {
    marginTop: 16,
    marginLeft: 16,
  },
  marginTopRight: {
    marginTop: 16,
    marginRight: 16,
  },
  marginHorizontal: {
    marginLeft: 16,
    marginRight: 16,
  },
  marginVertical: {
    marginTop: 16,
    marginBottom: 16,
  },
  title: {
    lineHeight: 21,
    fontSize: 17,
    marginTop: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: colors.primary,
  },
  tinyText: {
    lineHeight: 14,
    fontSize: 10,
    textAlign: 'center',
    color: colors.textGrey,
  },
  smallText: {
    lineHeight: 20,
    fontSize: 14,
    color: colors.textGrey,
  },
  mediumText: {
    lineHeight: 20,
    fontSize: 16,
    textAlign: 'center',
    color: colors.textGrey,
  },
  bigText: {
    lineHeight: 30,
    fontSize: 25,
    textAlign: 'center',
    color: colors.textGrey,
  },
  largeText: {
    lineHeight: 23,
    fontSize: 18,
    textAlign: 'center',
    color: colors.textGrey,
  },
  textGrey: {
    color: colors.textGrey,
  },
  textLeft: {
    textAlign: 'left',
  },
  textRight: {
    textAlign: 'right',
  },
  textCenter: {
    textAlign: 'center',
  },
  textTop: {
    textAlignVertical: 'top',
  },
  textBottom: {
    textAlignVertical: 'bottom',
  },
  textAlignMiddle: {
    textAlignVertical: 'center',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rounded: {
    borderRadius: 4,
  },
  button: {
    borderRadius: 4,
  },
  buttonBottom: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  shadow: {
    shadowColor: colors.shadowGrey,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    ...(Platform.OS === 'android' ? { elevation: 2 } : {}),
  },
  bold: {
    fontWeight: 'bold',
  },
  border: {
    borderWidth: 0.5,
    borderColor: colors.borderGrey,
  },
  borderLeft: {
    borderLeftWidth: 0.5,
    borderColor: colors.borderGrey,
  },
  borderTop: {
    borderTopWidth: 0.5,
    borderColor: colors.borderGrey,
  },
  borderRight: {
    borderRightWidth: 0.5,
    borderColor: colors.borderGrey,
  },
  borderBottom: {
    borderBottomWidth: 0.5,
    borderColor: colors.borderGrey,
  },
}

export const {
  padding,
  paddingTop,
  paddingLeft,
  paddingBottom,
  paddingRight,
  paddingHorizontal,
  paddingVertical,
  margin,
  marginTop,
  marginBottom,
  marginLeft,
  marginTopLeft,
  marginTopRight,
  marginHorizontal,
  marginVertical,
  title,
  bigText,
  largeText,
  mediumText,
  smallText,
  tinyText,
  textGrey,
  textLeft,
  textRight,
  textCenter,
  row,
  col,
  rounded,
  button,
  buttonBottom,
  shadow,
  bold,
  border,
  borderLeft,
  borderTop,
  borderRight,
  borderBottom,
} = styles

export default styles
