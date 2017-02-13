'use strict';

import React, {
  Component
} from 'react';

var Distance = require('./DistanceTog');
var ScrollableTabView = require('react-native-scrollable-tab-view');
var ListCoords = require('./ListCoords_tog');
var Buss = require('./Buss');

import {
  AppRegistry,
} from 'react-native';

var road2zero  = React.createClass({
  render() {
    return (
      <ScrollableTabView>
        <Distance tabLabel="Tog"/>
        <ListCoords tabLabel="Se togtur"/>
        <Buss tabLabel="Buss"/>
        <ListCoords tabLabel="Se busstur"/>
      </ScrollableTabView>
    );
  }
});

AppRegistry.registerComponent('road2zero', () => road2zero);
