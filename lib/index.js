'use strict';

// Load modules

var Path = require('path');
var HeapDump = require('heapdump');
var Hoek = require('hoek');
var Utils = require('./utils');


// Declare internals

var internals = {
    initialized: false,
    defaults: {
        logPath: Path.join(__dirname, '..', 'poop.log'),
        writeStreamOptions: { flags: 'w' }
    }
};


module.exports.register = function (server, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options || {});

    if (internals.initialized) {
        return next();
    }

    internals.initialized = true;

    process.once('uncaughtException', function (err) {

        HeapDump.writeSnapshot();
        Utils.log(err, {
            logPath: settings.logPath,
            writeStreamOptions: settings.writeStreamOptions
        }, function () {

            process.exit(1);
        });
    });

    process.on('SIGUSR1', function () {

        HeapDump.writeSnapshot();
    });

    return next();
};


module.exports.register.attributes = {
    pkg: require('../package.json')
};
