'use strict';

import React, { Component } from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

const Realm = require('realm');
// Define your models and their properties

const CoordsSchema = {
  name: 'Coords',
  properties: {
    latitude:  'double',
    longitude: 'double',
  }
};

const TogSchema = {
  name: 'Tog',
  primaryKey: 'id',
  properties: {
    id: 'int', //Primary Key
    name:     'string',
    dist: 'float',
    coordslist: {type: 'list', objectType: 'Coords'}
  }
};

// Initialize a Realm with Car and Person models
let realm = new Realm({schema: [CoordsSchema, TogSchema]});

exports.makeSchemaTog = function(koordTog, dist, id) {

if (koordTog.length < 10) {
    console.log('denne turen er for kort!');
  } else {
    realm.write(() => {
      let person = realm.create('Tog', {
        id: id,
        name: 'Joakim',
        dist: dist,
        coordslist: [],
      }, true);
    });

  let personlist = realm.objects('Tog');
  let query = personlist.filtered('id='+id.toString());
  let coordslist = query[0].coordslist;

  realm.write(() => {
    for (let value of koordTog) {
      coordslist.push(value);
      }
    });
  }
}


exports.retrieveobjects = function(id) {
  let toglist = realm.objects('Tog');
  let query = toglist.filtered('id='+id.toString());
  return query;
}
