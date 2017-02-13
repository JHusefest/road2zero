'use strict';

import React, { Component } from 'react';

import {
  StyleSheet,
  View,
  Text,
  Dimensions,
} from 'react-native';

// External module imports
var haversine = require('haversine');
var pick = require('lodash/pick');
// Internal module imports
var MapView = require('react-native-maps');
var Database = require('./realm.js');
var help_functions = require('./help_functions.js');

class Distance extends Component {
  /*
  The dexription of Distance goes here!
  */
  constructor(props) {
    super(props);
    watchID: (null: ?number);
    this.state = {
      koordTog: [],
      distanseTog: 0,
      prevLatLng: {},
      // Distance to nearest public transit stations
      avstandStasj: 0,
      // Distance to nearest train/t-bane line
      avstandLinje: 0,
      // X coord bus
      bussX1: 0,
      // Y coord bus
      bussY1: 0,
      // Sjekkliste for True/False for tog
      fetchlinje: [],
      //Navnet på busstoppet. Fordi det er kult.
      description: "Null",
      //Sjekker om brukeren er innenfor 15m fra stasjon (15m buffer)
      onstasj: false,
      //Sjekker om brukeren er innenfor 15m fra stasjon (15m buffer)
      onlinje: false,
      // Type of transit station
      typetog: "Null",
      //Antall turer. Ikke totalt, men hver gang.
      ant_turer: 1,
      //Antall forskjellige bustops
      ant_bustops: 0,
      //Liste over bustops
      list_bustops: [],
      //Hvilket busstopp for å finne ut antall busstopp
      hvilket_busstopp: 0,
      // Inital coords of user
      lat: 60.29282829229,
      lon: 10.38282871717,
      initialtime: 0,
      lasttime: 0,
      timdiff: 5,
      dist: 0,
      distance: 0,
      speed: 0,
      // Initial map renderer
      region: {
        latitude: 59.7194,
        longitude: 10.8356,
        latitudeDelta: 0.0099,
        longitudeDelta: 0.0421,
      }
    };
  }


  componentDidMount() {

    this.watchID = navigator.geolocation.watchPosition((position) => {
      var lon = position.coords.longitude;
      var lat = position.coords.latitude;
      var lasttime = position.timestamp;
      var timediff = (lasttime - this.state.initialtime)/1000;

      this.setState({
        lat: lat,
        lon: lon,
        initialtime: lasttime,
        timdiff: timediff,
        region: {
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.004,
          longitudeDelta: 0.006
        }
      });
      this.fetchDataLinje(lon, lat);
      this.fetchDataStasjon(lon, lat);
      this.fetchDatabuss(lon, lat);
    },
  (error) => alert(error.message),
  {distanceFilter: 2},
{enableHighAccuracy: true})
}

  fetchDataStasjon(lon, lat) {
    var URL = 'http:188.166.168.99/buss/?lon='+lon+'&lat='+lat;
    fetch(URL)
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({
          avstandStasj: parseFloat(responseData[0]),
          onstasj: JSON.stringify(responseData[2]),
          hvilket_busstopp: responseData[1],
        });
      })
      .catch((error) => {console.log(error)})
      .done();
  }


  fetchDataLinje(lon, lat) {
    var URL = 'http:188.166.168.99/tog/?lon='+lon+'&lat='+lat;
    fetch(URL)
    .then((response) => response.json())
    .then((responseData) => {
      this.setState({
        avstandLinje: responseData[0],
        onlinje: JSON.stringify(responseData[1]),
        typetog: responseData[2],
      });
    })
    .catch((error) => {console.log(error)})
    .done();

    var fetchlinje = this.state.fetchlinje;
    var last = fetchlinje.slice(Math.max(fetchlinje.length - 5));
    const unwanted = ["false", "false", "false", "false", "false"];
    if ((unwanted.toString() == last.toString()) && (fetchlinje.length > 10)) {
      var ant_turer = this.state.ant_turer;
      Database.makeSchemaTog(this.state.koordTog, this.state.distanseTog, this.state.ant_turer);
      this.setState({
        koordTog: [],
        distanseTog: 0,
        prevLatLng: {},
        fetchlinje: [],
        ant_turer: ant_turer + 1,
      });
  } else {
  const { koordTog, distanseTog, fetchlinje } = this.state
  const newLatLngs = {latitude: this.state.lat, longitude: this.state.lon}
  const positionLatLngs = {latitude: this.state.lat, longitude: this.state.lon}
  const truefalse = {state: this.state.onlinje}
  const dist = this.calcDistance(newLatLngs)
  this.setState({
    koordTog: koordTog.concat(positionLatLngs),
    distanseTog: distanseTog + dist,
    dist: dist*1000,
    speed: (dist*1000/(this.state.timdiff)),
    prevLatLng: newLatLngs,
    fetchlinje: fetchlinje.concat(truefalse.state),
    });
  }
}

  fetchDatabuss(lon, lat) {
    var URL = 'http:188.166.168.99/scoords/?lon='+lon+'&lat='+lat;
    fetch(URL)
    .then((response) => response.json())
    .then((responseData) => {
      this.setState({
        bussX1: responseData[0][0],
        bussY1: responseData[0][1],
        description: responseData[0][2],
      });
    })
    .catch((error) => {console.log(error)})
    .done();
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  calcDistance(newLatLng) {
    const { prevLatLng } = this.state
    return (haversine(prevLatLng, newLatLng) || 0)
  }

  onRegionChange(region) {
    this.setState({ region });
}

  render() {

    var busstopp =
      {
        latitude: this.state.bussY1,
        longitude: this.state.bussX1,
      }

    var latlng =
    {
      latitude: this.state.lat,
      longitude: this.state.lon,
    }

    return (
      <View style={styles.container}>
      <MapView
        style={styles.map}
        mapType='standard'
        showsUserLocation={true}
        followsUserLocation={true}
        zoomEnabled={true}
        showsBuildings={true}
        region={this.state.region}
        initialregion = {this.state.region}
        onRegionChange={this.onRegionChange.bind(this)}
        >

        <MapView.Marker
            coordinate={busstopp}
            title={this.state.description}/>

        <MapView.Polyline
            coordinates={this.state.koordTog}
            strokeColor="#00FF00"
            strokeWidth={4}/>
        </MapView>

        <View style={styles.bottomBar}>
          <View style={styles.bottomBarGroup}>
            <Text style={styles.bottomBarContent}> Distance: {parseFloat(this.state.distanseTog).toFixed(2)} km</Text>
            <Text style={styles.bottomBarContent}> På toglinje? {this.state.onlinje}</Text>
            <Text style={styles.bottomBarContent}> På stasjon? {this.state.onstasj}</Text>
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
    fontWeight: "300",
    fontSize: 14,
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'center'
  },
})

module.exports = Distance;
