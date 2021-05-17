package composeTerraform

//package main
//
//import (
//	"github.com/gruntwork-io/terratest/modules/composeTerraform"
//	"log"
//	"os"
//	"testing"
//	"composeTerraform/components/ec2"
//	"composeTerraform/components/networking"
//)
//
//func main() {
//
//	// Virtual Private Cloud
//	vpc := networking.NewVpc()
//	vpc.CidrBlock = "10.0.1.0/24"
//
//	// Internet Gateway
//	ig := networking.NewInternetGateway()
//	ig.Vpc = &vpc
//
//	// Route Table
//	rt := networking.NewDefaultRouteTable()
//	rt.Vpc = &vpc
//	rt.InternetGateway = &ig
//
//	// Subnet
//	subnet := networking.NewSubnet()
//	subnet.CidrBlock = "10.0.1.0/24"
//	subnet.Vpc = &vpc
//
//	// Security Group
//	sg := networking.NewSecurityGroup()
//	sg.Vpc = &vpc
//
//	ni := networking.NewNetworkInterface()
//	ni.SecurityGroups = []*networking.SecurityGroup{
//		&sg,
//	}
//	ni.Subnet = &subnet
//
//	// Instance
//	instance := ec2.NewInstance()
//
//	instance.RootBlockDevice = ec2.RootBlockDevice{
//		VolumeType: "gp2",
//		VolumeSize: 8,
//	}
//	instance.NetworkInterfaces = []*networking.NetworkInterface{
//		&ni,
//	}
//
//	//	instance.UserData = `#!/bin/bash
//	//echo 'IP="test123"' >> /etc/environment
//	//echo 'PORT="test1234"' >> /etc/environment`
//
//	//var components = []HCLComponent{&vpc, &ig, &rt, &subnet, &sg, &instance}
//	var components = []HCLComponent{&vpc, &ig, &rt, &subnet, &sg, &ni, &instance}
//
//	f, err := os.Create("main.tf")
//	if err != nil {
//		log.Println(err)
//	}
//	defer f.Close()
//
//	var start = `provider "aws" {
//  region = "eu-central-1"
//}
//`
//	_, err = f.WriteString(start)
//	if err != nil {
//		panic(err)
//	}
//
//	for _, item := range components {
//		s, err := ToHCL(item)
//		if err != nil {
//			panic(err)
//		}
//
//		_, err = f.WriteString(s)
//		if err != nil {
//			log.Println(err)
//		}
//	}
//
//	// terratest
//	t := &testing.T{}
//
//	terraformOptions := composeTerraform.WithDefaultRetryableErrors(t, &composeTerraform.Options{})
//
//	// validate
//	_, err = composeTerraform.ValidateE(t, terraformOptions)
//	if err != nil {
//		panic(err)
//	}
//
//	_, err = composeTerraform.PlanE(t, terraformOptions)
//	if err != nil {
//		panic(err)
//	}
//}
