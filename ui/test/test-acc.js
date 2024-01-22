#! /usr/bin/env node
const karate = require('@karatelabs/karate');
karate.config.dir = 'test';
karate.exec("test/acc/ys-e2e2.feature");