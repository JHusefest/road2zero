'use strict';

import React, { Component } from 'react';
var Database = require('./realm.js');
var MapView = require('react-native-maps');

import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableHighlight,
  Image,
} from 'react-native';

class ListCoords extends Component {
  constructor(props) {
    super(props);
    this.state = {
    togkoords: [],
    togdist: 0,
    startmarker: {latitude: 59.6821500282, longitude: 10.7929526278},
    endmarker: {latitude: 59.6631500111, longitude: 10.7929526111},
    region: {
      latitude: 59.6621500282,
      longitude: 10.7929526278,
      latitudeDelta: 0.099,
      longitudeDelta: 0.421,
    }
  };
}

onRegionChange(region) {
  this.setState({ region });
}

componentDidMount() {
  let toglist = this.state.togkoords;
  try {
    let Tog = Database.retrieveobjects(1);
    let coordslist = Tog[0].coordslist;

    let startmarker = coordslist[0];
    let length = coordslist.length;
    let endmarker = coordslist[length - 1];

    function logArrayElements(element, index, array) {
        toglist.push(element);
      }

    coordslist.forEach(logArrayElements);

    this.setState({
      togdist: Tog[0].dist,
      startmarker: {latitude: startmarker.latitude, longitude: startmarker.longitude},
      endmarker: {latitude: endmarker.latitude, longitude: endmarker.longitude},
      region: {
        latitude: startmarker.latitude,
        longitude: startmarker.longitude,
        latitudeDelta: 0.099,
        longitudeDelta: 0.0421,
      }
    });
  }
  catch(e) {
    alert('Du har ikke tracks enda!');
  }
}

render() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapType='standard'
        showsUserLocation={true}
        zoomEnabled={true}
        region={this.state.region}
        initialregion={this.state.region}>

        <MapView.Polyline
            coordinates={this.state.togkoords}
            strokeColor="#00FF00"
            strokeWidth={4}/>

        <MapView.Marker
            coordinate={this.state.startmarker}
            title="Start!"
          />

          <MapView.Marker
              coordinate={this.state.endmarker}
              title="Slutt!"
              description={((this.state.togdist).toFixed(2)).toString()}
            />
      </MapView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomBarGroup}>
          <Text style={styles.bottomBarContent}>DISTANCE {this.state.togdist.toFixed(2)} KG C02</Text>
        </View>
      </View>

    </View>
    )
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    },
    map: {
      flex: 4,
    },
    bottomBarGroup: {
      flex: 2,
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    bottomBarContent: {
      color: '#00FF00',
      fontWeight: "500",
      fontSize: 14,
      marginTop: 10,
      marginBottom: 10,
      textAlign: 'center'
    },
})

module.exports = ListCoords;
