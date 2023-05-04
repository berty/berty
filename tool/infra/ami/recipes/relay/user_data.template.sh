#!/bin/bash

# Create relay installation directories
mkdir /etc/relay
mkdir {{ RELAY_LOG_DIR }}

# Install relay run script
cat <<EOT > /etc/relay/run.sh
#!/bin/bash
set -e

ulimit -n 65536
exec /usr/local/bin/libp2p-relay-daemon -id /etc/relay/identity -config /etc/relay/config.json >> {{ RELAY_LOG_DIR }}/stdout.log 2>> {{ RELAY_LOG_DIR }}/stderr.log
EOT
chmod +x /etc/relay/run.sh

# Install relay config
cat <<EOT > /etc/relay/config.json
 {
  "Network": {
    "ListenAddrs": [
      "/ip4/0.0.0.0/udp/4001/quic",
      "/ip6/::/udp/4001/quic",
      "/ip4/0.0.0.0/tcp/4001",
      "/ip6/::/tcp/4001"
    ],
    "AnnounceAddrs": null
  },
  "ConnMgr": {
    "ConnMgrLo": 512,
    "ConnMgrHi": 768,
    "ConnMgrGrace": 120000000000
  },
  "RelayV1": {
    "Enabled": false,
    "Resources": {
      "MaxCircuits": 1024,
      "MaxCircuitsPerPeer": 64,
      "BufferSize": 4096
    }
  },
  "RelayV2": {
    "Enabled": true,
    "Resources": {
      "Limit": { "Duration": 120000000000, "Data": 131072 },
      "ReservationTTL": 3600000000000,
      "MaxReservations": 128,
      "MaxCircuits": 16,
      "BufferSize": 2048,
      "MaxReservationsPerPeer": 4,
      "MaxReservationsPerIP": 8,
      "MaxReservationsPerASN": 32
    }
  },
  "ACL": { "AllowPeers": null, "AllowSubnets": null },
  "Daemon": { "PprofPort": 6060 }
}
EOT

# TODO : find the best way to add a fixed identity

# Install relay systemd service
cat <<EOT > /etc/systemd/system/libp2p-relay-daemon.service
[Unit]
Description=Libp2p relay daemon (p2p-circuit)
After=network.target

[Service]
ExecStart=/etc/relay/run.sh
PIDFile=/var/run/libp2p-relay-daemon.pid
Restart=always
RestartSec=5s
EOT
systemctl enable libp2p-relay-daemon.service

# Install logrotate config for relay logs
cat <<EOT > /etc/logrotate.d/relay.conf
{{ RELAY_LOG_DIR }}/* {
    weekly
    rotate 3
    size 10M
    compress
    delaycompress
}
EOT

# Install Cloudwatch config
mkdir -p /etc/amazon
cat <<EOT > /etc/amazon/relay-config.json
{
  "agent": {
    "metrics_collection_interval": 10,
    "run_as_user": "cwagent"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "{{ RELAY_LOG_DIR }}/stdout.log",
            "log_group_name": "libp2p-relay",
            "log_stream_name": "{hostname}/stdout",
            "retention_in_days": 365
          },
          {
            "file_path": "{{ RELAY_LOG_DIR }}/stderr.log",
            "log_group_name": "libp2p-relay",
            "log_stream_name": "{hostname}/stderr",
            "retention_in_days": 365
          }
        ]
      }
    }
  },
  "metrics": {
    "aggregation_dimensions": [["InstanceId"]],
    "append_dimensions": {
      "AutoScalingGroupName": "${aws:AutoScalingGroupName}",
      "ImageId": "${aws:ImageId}",
      "InstanceId": "${aws:InstanceId}",
      "InstanceType": "${aws:InstanceType}"
    },
    "metrics_collected": {
      "cpu": {
        "measurement": [
          "cpu_usage_idle",
          "cpu_usage_iowait",
          "cpu_usage_user",
          "cpu_usage_system"
        ],
        "metrics_collection_interval": 10,
        "resources": ["*"],
        "totalcpu": false
      },
      "disk": {
        "measurement": ["used_percent", "inodes_free"],
        "metrics_collection_interval": 10,
        "resources": ["*"]
      },
      "diskio": {
        "measurement": ["io_time"],
        "metrics_collection_interval": 10,
        "resources": ["*"]
      },
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 10
      },
      "swap": {
        "measurement": ["swap_used_percent"],
        "metrics_collection_interval": 10
      }
    }
  }
}
EOT
amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/etc/amazon/relay-config.json
