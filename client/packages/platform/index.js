import 'node-libs-react-native/globals'
import '@berty/common/helpers/crash-handler.js'
import '@berty/common/helpers/patch-web.js'
import '@berty/common/helpers/patch-electron.js'
import(process.env.REACT_APP_ENTRYPOINT)
