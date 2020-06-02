# Protocol Documentation
<a name="top"></a>

## Table of Contents

- [bertymessenger.proto](#bertymessenger.proto)
    - [DevShareInstanceBertyID](#berty.messenger.DevShareInstanceBertyID)
    - [DevShareInstanceBertyID.Reply](#berty.messenger.DevShareInstanceBertyID.Reply)
    - [DevShareInstanceBertyID.Request](#berty.messenger.DevShareInstanceBertyID.Request)
    - [InstanceShareableBertyID](#berty.messenger.InstanceShareableBertyID)
    - [InstanceShareableBertyID.Reply](#berty.messenger.InstanceShareableBertyID.Reply)
    - [InstanceShareableBertyID.Request](#berty.messenger.InstanceShareableBertyID.Request)
  
    - [MessengerService](#berty.messenger.MessengerService)
  
- [Scalar Value Types](#scalar-value-types)

<a name="bertymessenger.proto"></a>
<p align="right"><a href="#top">Top</a></p>

## bertymessenger.proto

<a name="berty.messenger.DevShareInstanceBertyID"></a>

### DevShareInstanceBertyID

<a name="berty.messenger.DevShareInstanceBertyID.Reply"></a>

### DevShareInstanceBertyID.Reply

<a name="berty.messenger.DevShareInstanceBertyID.Request"></a>

### DevShareInstanceBertyID.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| reset | [bool](#bool) |  | reset will regenerate a new link |
| display_name | [string](#string) |  |  |

<a name="berty.messenger.InstanceShareableBertyID"></a>

### InstanceShareableBertyID

<a name="berty.messenger.InstanceShareableBertyID.Reply"></a>

### InstanceShareableBertyID.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| berty_id | [string](#string) |  |  |
| deep_link | [string](#string) |  |  |
| html_url | [string](#string) |  |  |
| display_name | [string](#string) |  |  |

<a name="berty.messenger.InstanceShareableBertyID.Request"></a>

### InstanceShareableBertyID.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| reset | [bool](#bool) |  | reset will regenerate a new link |
| display_name | [string](#string) |  |  |

 

 

 

<a name="berty.messenger.MessengerService"></a>

### MessengerService
MessengerService is the top-level API that uses the Berty Protocol to implement the Berty Messenger specific logic.
Today, most of the Berty Messenger logic is implemented directly in the application (see the /js folder of this repo).

| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| InstanceShareableBertyID | [InstanceShareableBertyID.Request](#berty.messenger.InstanceShareableBertyID.Request) | [InstanceShareableBertyID.Reply](#berty.messenger.InstanceShareableBertyID.Reply) | InstanceShareableBertyID returns a Berty ID that can be shared as a string, QR code or deep link. |
| DevShareInstanceBertyID | [DevShareInstanceBertyID.Request](#berty.messenger.DevShareInstanceBertyID.Request) | [DevShareInstanceBertyID.Reply](#berty.messenger.DevShareInstanceBertyID.Reply) | DevShareInstanceBertyID shares your Berty ID on a dev channel. TODO: remove for public. |

 

## Scalar Value Types

| .proto Type | Notes | C++ | Java | Python | Go | C# | PHP | Ruby |
| ----------- | ----- | --- | ---- | ------ | -- | -- | --- | ---- |
| <a name="double" /> double |  | double | double | float | float64 | double | float | Float |
| <a name="float" /> float |  | float | float | float | float32 | float | float | Float |
| <a name="int32" /> int32 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint32 instead. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="int64" /> int64 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint64 instead. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="uint32" /> uint32 | Uses variable-length encoding. | uint32 | int | int/long | uint32 | uint | integer | Bignum or Fixnum (as required) |
| <a name="uint64" /> uint64 | Uses variable-length encoding. | uint64 | long | int/long | uint64 | ulong | integer/string | Bignum or Fixnum (as required) |
| <a name="sint32" /> sint32 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int32s. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="sint64" /> sint64 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int64s. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="fixed32" /> fixed32 | Always four bytes. More efficient than uint32 if values are often greater than 2^28. | uint32 | int | int | uint32 | uint | integer | Bignum or Fixnum (as required) |
| <a name="fixed64" /> fixed64 | Always eight bytes. More efficient than uint64 if values are often greater than 2^56. | uint64 | long | int/long | uint64 | ulong | integer/string | Bignum |
| <a name="sfixed32" /> sfixed32 | Always four bytes. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="sfixed64" /> sfixed64 | Always eight bytes. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="bool" /> bool |  | bool | boolean | boolean | bool | bool | boolean | TrueClass/FalseClass |
| <a name="string" /> string | A string must always contain UTF-8 encoded or 7-bit ASCII text. | string | String | str/unicode | string | string | string | String (UTF-8) |
| <a name="bytes" /> bytes | May contain any arbitrary sequence of bytes. | string | ByteString | str | []byte | ByteString | string | String (ASCII-8BIT) |

