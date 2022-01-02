package bertyaccount

import (
	context "context"

	"berty.tech/berty/v2/go/internal/androidnearby"
	"berty.tech/berty/v2/go/internal/initutil"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-driver"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

func (s *service) NetworkConfigGetPreset(ctx context.Context, req *accounttypes.NetworkConfigGetPreset_Request) (*accounttypes.NetworkConfigGetPreset_Reply, error) {
	if req.Preset == messengertypes.NetworkConfig_NetPresetPerformance || req.Preset == messengertypes.NetworkConfig_NetPresetUndefined {
		bluetoothLE := messengertypes.NetworkConfig_Disabled
		if req.HasBluetoothPermission {
			bluetoothLE = messengertypes.NetworkConfig_Enabled
		}

		androidNearby := messengertypes.NetworkConfig_Disabled
		if req.HasBluetoothPermission && androidnearby.Supported {
			androidNearby = messengertypes.NetworkConfig_Enabled
		}

		appleMC := messengertypes.NetworkConfig_Disabled
		if req.HasBluetoothPermission && mc.Supported {
			appleMC = messengertypes.NetworkConfig_Enabled
		}

		return &accounttypes.NetworkConfigGetPreset_Reply{
			Config: &messengertypes.NetworkConfig{
				Bootstrap:                  []string{initutil.KeywordDefault},
				AndroidNearby:              androidNearby,
				DHT:                        messengertypes.NetworkConfig_DHTClient,
				AppleMultipeerConnectivity: appleMC,
				BluetoothLE:                bluetoothLE,
				MDNS:                       messengertypes.NetworkConfig_Enabled,
				Rendezvous:                 []string{initutil.KeywordDefault},
				Tor:                        messengertypes.NetworkConfig_TorOptional,
				StaticRelay:                []string{initutil.KeywordDefault},
				ShowDefaultServices:        messengertypes.NetworkConfig_Enabled,
			},
		}, nil
	}

	return &accounttypes.NetworkConfigGetPreset_Reply{
		Config: &messengertypes.NetworkConfig{
			Bootstrap:                  []string{initutil.KeywordNone},
			AndroidNearby:              messengertypes.NetworkConfig_Disabled,
			DHT:                        messengertypes.NetworkConfig_DHTDisabled,
			AppleMultipeerConnectivity: messengertypes.NetworkConfig_Disabled,
			BluetoothLE:                messengertypes.NetworkConfig_Disabled,
			MDNS:                       messengertypes.NetworkConfig_Disabled,
			Rendezvous:                 []string{initutil.KeywordNone},
			Tor:                        messengertypes.NetworkConfig_TorDisabled,
			StaticRelay:                []string{initutil.KeywordNone},
			ShowDefaultServices:        messengertypes.NetworkConfig_Disabled,
		},
	}, nil
}
