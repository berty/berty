import IconAwesome from 'react-native-vector-icons/Fonts/FontAwesome.ttf'
import IconFeather from 'react-native-vector-icons/Fonts/Feather.ttf'
import IconMatCom from 'react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'
import IconBerty from './packages/common/static/svg/fontello.ttf'
import(process.env.REACT_APP_ENTRYPOINT)

/** ***** Fonts ***********/

// Generate required css
const iconFontStyles = `
@font-face {
  src: url(${IconAwesome});
  font-family: FontAwesome;
}
@font-face {
  src: url(${IconFeather});
  font-family: Feather;
}
@font-face {
  src: url(${IconMatCom});
  font-family: MaterialCommunityIcons;
}
@font-face {
  src: url(${IconBerty});
  font-family: fontello;
}
`

// Create stylesheet
const style = document.createElement('style')
style.type = 'text/css'
if (style.styleSheet) {
  style.styleSheet.cssText = iconFontStyles
} else {
  style.appendChild(document.createTextNode(iconFontStyles))
}

// Inject stylesheet
document.head.appendChild(style)

/** ********** End fonts **********/
