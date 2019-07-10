import pbjs from 'protobufjs/light'
import jsonDescriptor from './message.pb.json'

const root = pbjs.Root.fromJSON(jsonDescriptor)
export const Message = root.lookup('berty.entity.Message')
export default Message
