// file generated. see /config.
package config

import "encoding/json"

var Config BertyConfig

// FIXME: make it more nicely
func init() {
	input := `
{
  "berty": {
    "contacts": {
      "testbot": {
        "link": "https://berty.tech/id#contact/oZBLExQaU8TTubcawgfs8AVcH9FbFV5J1kdEVqgueBaFCMWsADV341pCv26zcHMv3GaTL6UHPzVoHzLoereFQLmBGAh2QKb/name=TestBot",
        "name": "TestBot",
        "description": "Official TestBot",
        "kind": "Bot",
        "suggestion": false,
        "icon": ""
      },
      "testbot-dev": {
        "link": "https://berty.tech/id#contact/oZBLFRW7b1CthoZojwAJTSv27Pg7XAeqHKTDnpCkhz8wx2vGNxef4L6X1Eyh2jB9QdhWFtC6WNpEq6S4nGhZMCfFYEacZPS/name=TestBot-Dev",
        "name": "TestBot Dev",
        "description": "TestBot-Dev",
        "kind": "Bot",
        "suggestion": false,
        "icon": ""
      },
      "welcomebot": {
        "link": "https://berty.tech/id#contact/oZBLFukkeefDcXibkvxHyd1kZpqUUm4mKsE3tgcDakWx6Pa5Ak3VghVyxLZ8vns71EDLWkLbCZ5QcGADnehvxyq3B7LFh14/name=WelcomeBot",
        "name": "Welcome Bot",
        "description": "Official Welcome Bot",
        "kind": "Bot",
        "suggestion": true,
        "icon": "berty_bot_pink_bg"
      },
      "welcomebot-dev": {
        "link": "https://berty.tech/id#contact/oZBLFQQTqmZ25yvcRRUVgzzZCpDY7YAVXDEz3g8kmwcSPCmnQrqiMbLrfSp1GRLaNBX6ZRarid8jkSUX4yQYL4oBZcLDtFY/name=WelcomeBot-Dev",
        "name": "Welcome Dev",
        "description": "Welcome Bot - Dev",
        "kind": "Bot",
        "suggestion": false,
        "icon": "berty_dev_green_bg"
      }
    },
    "conversations": {
      "dev-test": {
        "link": "https://berty.tech/id#group/5QdUv6Fn3uvi3AchNcqFECaZvngDzWGUJV4wntYCWuYyjXrNi4ykvnP2ZCeWA1YLTmCSFbZaimXzp8rZtkKqby8nGv7S2AXyJPggo3aMghJS3rpeuDx6pbbNqEoNXJK67pWVpcLB6VrXM54zRNbi4zhEsLdATGzguWoruShcRHzFpuP75nyvRnXnfRaHPjdbyC/name=Dev+Test",
        "name": "Dev Test",
        "description": "Simple Conversation with Replication",
        "suggestion": false
      },
      "dev-test-2": {
        "link": "https://berty.tech/id#group/5QdUv6Fn3uwSPQZpLUXcNpQ24bR9y1TUK6xJfE9khJo4jrP8jF4QfdgpTT73Us58y6XZhtvJHLDCouXfgsKDxXqZAsfLDhUZLb48PDcBYYVUk7nzxh1MKh5a6Ug1bP4KpdrVDYQx1gCZA4HZavEUgUBbC1pYBZ2DaY27sCMfqxpt79RjZCBwmVqW1DbbuYCUoc/name=Dev+Test+2",
        "name": "Dev Test 2",
        "description": "Simple Conversation with Replication",
        "suggestion": false
      },
      "group-with-passphrase": {
        "link": "https://berty.tech/id#enc/3KE388cyt693i3Y8FUK1HMwr6BQGuckRx8ypxdtmrFrmMvgb8JNeu8L8BSkL6MbNjyFR4jSgEDmerbmGSXPsoVrbmrprcKX3PG3a2EY4jF2D7BUUdg1kDpxewAcHMyVRW66yMTe29G6sjuJ8C2MjEUWMWT7oX3jv94aCvWQbomePYL6ff9Bm8Msbe3UXBgqN6Wff9QqEScsMG9WnKUQQLtKxSqwN59etjrz/name=group-with-passphrase",
        "name": "Group with passphrase (test)",
        "description": "A demo group with a passphrase",
        "suggestion": false
      }
    }
  },
  "p2p": {
    "rdvp": [
      {
        "maddr": "/ip4/52.47.79.109/udp/4040/quic/p2p/12D3KooWKhUMFeJdRD4WuXE3f6boYPvxfgZJhRR4naxswdKpKFwG"
      }
    ],
    "static-relays": [
      "/ip4/51.159.21.214/udp/6363/quic/p2p/12D3KooWBoShE6E6uXveQWVunK7AJk6UReDBmiui5qFYWbug1Nf9",
      "/ip6/2001:bc8:2610:4200::/udp/6363/quic/p2p/12D3KooWBoShE6E6uXveQWVunK7AJk6UReDBmiui5qFYWbug1Nf9",
      "/ip4/51.15.25.224/udp/6363/quic/p2p/12D3KooWAHcEz4K5XAgRDav9fLuhiRY2wuXip385EmT5RoRkCmjr"
    ]
  }
}`
	err := json.Unmarshal([]byte(input), &Config)
	if err != nil {
		panic(err)
	}
}
