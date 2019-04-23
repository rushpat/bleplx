/**
 * @format
 * @flow
 */

import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import { Alert, Platform, TouchableHighlight } from 'react-native';


export default class App extends Component {
  constructor() {
    //variable cha is an empty variable that will later accept the proper Characteristic object
    var cha;
    super();

    //creates a manager for all BLE devices, services, and characteristics
    this.manager = new BleManager();
  }
  _onPressButton() {
    Alert.alert('Buzz');
    this.writeSth("QQ==");
  }

  //checks whether the Bluetooth state of the phone is on or off and prints accordingly
  componentWillMount() {
    const subscription = this.manager.onStateChange(state => {
      if (state === "PoweredOn") {
        this.scanAndConnect();
        console.log("Bluetooth state of phone: ON");
      } else {
        console.log("Bluetooth state of phone: OFF");
      }
    }, true);
  }

  //scans for devices
  scanAndConnect() {
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        // Handle error (scanning will be stopped automatically)
        return;
      }

      //logs the name, ID, and connectivity of each detected device
      console.log(
        "Device name: " +
        device.name +
        "| Device ID: " +
        device.id +
        "| isConnectable: " +
        device.isConnectable
      );

      //stops scanning for more devices is the SH-08 is detected and connects to it
      if (
        device.name === "SH-HC-08" ||
        device.id === "5AFA4A05-59F5-8390-03CA-E7F6FE531E2D"
      ) {
        this.manager.stopDeviceScan();
        device
          .connect()
          .then(device => {
            console.log("This phone has been connected to the HC-08 module.");
            //returns device after confirming that it has discoverable services and characteristics
            return device.discoverAllServicesAndCharacteristics();
          })
          .then(device => {
            this.findServicesAndCharacteristics(device);
          })
          .catch(error => {
            console.log("error");
          });
      }
    });
  }

  //prints all possible services and characteristics of the device and saves the one of use to us in var cha
  findServicesAndCharacteristics(device) {
    device.services().then(services => {
      services.forEach((service, i) => {
        console.log("Service UUID: " + service.uuid);
        service.characteristics().then(characteristics => {
          characteristics.forEach((c, i) => {
            console.log(
              "Characteristic for this Service: " +
              c.uuid +
              "| isReadable: " +
              c.isReadable +
              "| isWritableWithResponse: " +
              c.isWritableWithResponse +
              "| isWritableWithoutResponse: " +
              c.isWritableWithoutResponse
            );

            if (c.isWritableWithoutResponse) {
              this.cha = c;
            }
          });
        });
      });
    });
  }

  //writes a value in Base64 format to the arduino
  writeSth(val) {
    console.log(val);
    this.cha.writeWithoutResponse(val).catch(err => {
      console.log("Error in writing value to Arduino");
    });
  }

  //use the following function to write something to the arduino: this.writeSth("QQ==");

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Hello</Text>
        <TouchableHighlight onPress={() => this._onPressButton()} underlayColor="white">
          <View style={styles.button}>
            <Text style={styles.buttonText}>Buzz</Text>
          </View>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  container: {
    paddingTop: 60,
    alignItems: 'center'
  },
  button: {
    marginBottom: 30,
    width: 260,
    alignItems: 'center',
    backgroundColor: '#2196F3'
  },
  buttonText: {
    padding: 20,
    color: 'white'
  }
});

