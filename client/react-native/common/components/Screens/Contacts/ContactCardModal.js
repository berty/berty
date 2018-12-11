import React from 'react'
import ContactIdentity, { QrCode } from '../../Library/ContactIdentity'
import ModalScreen from '../../Library/ModalScreen'
import { withNavigation } from 'react-navigation'
import { View, Text, TouchableOpacity, Clipboard, Alert } from 'react-native'
import Button from '../../Library/Button'
import colors from '../../../constants/colors'
import { extractPublicKeyFromId, shareLinkOther, shareLinkSelf, makeShareableUrl } from '../../../helpers/contacts'
import { Icon } from '../../Library'
import saveViewToCamera from '../../Library/SaveViewToCamera'

const modalWidth = 320

const QRCodeExport = ({ data }) => <>
  <Text>{data.displayName} is on Berty</Text>
  <QrCode data={data} />
</>

const ActionButton = ({ icon, title, onPress }) => <TouchableOpacity style={{ flex: 1 }} onPress={onPress}>
  <Button rounded={'circle'} background={colors.blue} color={colors.white}
    icon={<Icon name={icon} color={colors.white} />} />
  <Text style={{ color: colors.white }}>{title}</Text>
</TouchableOpacity>

const ContactCardModal = ({ navigation }) => {
  const data = navigation.getParam('data')
  const self = navigation.getParam('self')

  const id = extractPublicKeyFromId(data.id)
  const displayName = data.displayName

  return <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <ModalScreen showDismiss width={modalWidth} footer={
      <View style={{ width: modalWidth, flexDirection: 'row', marginTop: 12 }}>
        <ActionButton icon={'share'} title={'Share'}
          onPress={() =>
            self
              ? shareLinkSelf({ id, displayName })
              : shareLinkOther({ id, displayName })
          }
        />
        <ActionButton icon={'image'} title={'Save QR code'}
          onPress={async () => {
            try {
              await saveViewToCamera({ view: <QRCodeExport data={data} />, navigation })
              Alert.alert('The QR Code has been added to your Camera Roll', '', [
                { text: 'OK', onPress: () => {} },
              ])
            } catch (e) {
              Alert.alert('Oops!', String(e), [
                { text: 'OK', onPress: () => {} },
              ])
            }
          }} />
        <ActionButton icon={'link'} title={'Copy link'}
          onPress={() => Clipboard.setString(makeShareableUrl({ id, displayName }))} />
        <ActionButton icon={'copy'} title={'Copy public key'} onPress={() => Clipboard.setString(id)} />
      </View>
    }>
      <ContactIdentity data={data} />
    </ModalScreen>
  </View>
}

export default withNavigation(ContactCardModal)
