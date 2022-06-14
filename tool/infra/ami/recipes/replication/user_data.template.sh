#!/bin/bash

# Setup logging on Cloudwatch
mkdir /var/log/replication
mkdir -p /etc/amazon
cat <<EOT > /etc/amazon/replication-config.json
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
            "file_path": "/var/log/replication/stdout.log",
            "log_group_name": "replication",
            "log_stream_name": "{hostname}/stdout",
            "retention_in_days": 365
          },
          {
            "file_path": "/var/log/replication/stderr.log",
            "log_group_name": "replication",
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
amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/etc/amazon/replication-config.json
