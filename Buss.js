import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
} from 'react-native';

import MapView from 'react-native-maps';

var haversine = require('haversine');
var pick = require('lodash/pick');
// Internal module imports
var Database = require('./realm.js');
var help_functions = require('./help_functions.js');

class Buss extends React.Component {
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
      //Liste over bustops
      list_bustops: [],
      //Ant forskjellige busstopp
      ant_bustops: 0,
      //Hvilket busstopp for å finne ut antall busstopp
      hvilket_busstopp: 0,
      // Inital coords of user
      lat: 60.29282829229,
      lon: 10.38282871717,
      ave_speed: 0,
      initialtime: 0,
      lasttime: 0,
      timetravel: [],
      timediff: 5,
      ave_speed: 0,
      dist: 0,
      markers: [],
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
        timediff: timediff,
        region: {
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.004,
          longitudeDelta: 0.006
        }
      });
      //this.fetchDataLinje(lon, lat);
      this.fetchDataStasjon(lon, lat);
      this.fetchDatabuss(lon, lat);
    },
  (error) => alert(error.message),
  {distanceFilter: 3},
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

    if ((this.state.onstasj == "true") && (this.state.speed < 41)) {
      //Database.makeSchema(this.state.koordTog, this.state.distanseTog, this.state.ant_turer);
      const is_bus = {state: this.state.hvilket_busstopp, time: this.state.initialtime};
      this.setState({
        timetravel: [],
        list_bustops: this.state.list_bustops.concat(is_bus.state),
        ant_bustops: help_functions.removeDuplicates(this.state.list_bustops),
        markers: this.state.markers.concat({latitude: this.state.bussX1, longitude: this.state.bussY1})
      });

  }
  else {
    const { koordTog, distanseTog, fetchlinje } = this.state
    const newLatLngs = {latitude: this.state.lat, longitude: this.state.lon}
    const positionLatLngs = {latitude: this.state.lat, longitude: this.state.lon}
    const dist = this.calcDistance(newLatLngs);
    this.setState({
      koordTog: koordTog.concat(positionLatLngs),
      distanseTog: distanseTog + dist,
      dist: dist*1000,
      speed: (dist*1000/(this.state.timediff))*3.6,
      prevLatLng: newLatLngs,
    });
  }
}

componentWillUnmount() {
  navigator.geolocation.clearWatch(this.watchID);
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
      showsUserLocation={true}
      followsUserLocation={true}
      zoomEnabled={true}
      showsBuildings={true}
      region={this.state.region}
      initialregion = {this.state.region}
      onRegionChange={this.onRegionChange.bind(this)}
      />

      <View style={styles.bottomBar}>
        <View style={styles.bottomBarGroup}>
          <Text style={styles.bottomBarContent}> På stasjon? {this.state.onstasj}</Text>
          <Text style={styles.bottomBarContent}> Antall Busstops? {this.state.ant_bustops} </Text>
          <Text style={styles.bottomBarContent}> Speed?: {this.state.speed} </Text>
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

module.exports = Buss;
