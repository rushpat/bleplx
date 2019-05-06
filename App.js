/**
 * @format
 * @flow
 */

import React, { Component } from "react";
import { Platform, StyleSheet, Text, View, Button, Alert, TouchableOpacity } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

type Props = {};

export default class App extends Component<Props> {
  constructor() {
    //variable cha is an empty variable that will later accept the proper Characteristic object
    var cha;
    super();

    //creates a manager for all BLE devices, services, and characteristics
    this.manager = new BleManager();
    this.state={
          
      SampleText : ""
      
  };
  var connected = false;
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
            this.connected = true;
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
    this.cha.writeWithoutResponse(val).catch(err => {
      console.log("Error in writing valye to Arduino");
    });
  }

  //use the following function to write something to the arduino: this.writeSth("QQ==");

  // function to find coordinates
  findCoordinates() {
    if (connected){
        navigator.geolocation.getCurrentPosition(
            position => {
                //var location = JSON.stringify(position);
            var location = "Latitude: " + position.coords.latitude +
                            "\nLongitude: " + position.coords.longitude;
            this.setState({SampleText: location });
            console.log(this.location);
            console.log(position);
                                                 });
        }
    else {
            Alert.alert('Bluetooth disconnected');
        }

  }

  render() {
    return (
      <View style={styles.container}>
      <Text style={styles.welcome}>Hello, press a button!</Text>
      <View style={styles.button}>
        <Button
          title="Left Buzzer"
          onPress={() => writeSth("QQ==")}
          color="#33FFF3"
        />
      </View>
      <View style={styles.button}>
        <Button
          title="Right Buzzer"
          onPress={() => writeSth("QQ==")}
          color="#33FFF3"
        />
      </View>
      <View style={styles.button}>
        <Button
          title ="Send Text Message"
          color="#33FFF3"
        />
      </View>
        <TouchableOpacity onPress={() => this.findCoordinates()}>
        <Text style ={styles.welcome}>Location: {this.state.SampleText} </Text>
        </TouchableOpacity>
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
  }
});
