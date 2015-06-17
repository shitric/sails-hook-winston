'use strict';

var winston = require('winston');
require('winston-mail').Mail;
var path = require('path');
var mkdirp = require('mkdirp');
var captain = require(path.resolve('node_modules/sails/node_modules/captains-log'));
var buildShipFn = require(path.resolve('node_modules/sails/lib/hooks/logger/ship'));

module.exports = function(sails) {
  return {
    ready: false,
    initialize: function(done){
      var log, logger, consoleOptions;

      consoleOptions = {
        level: sails.config.log.level,
        formatter: function(options) {
          var message;
          if (sails.config.log.timestamp){
            message = Date();
            message += ' ';
          } else  {
            message = '';
          }
          message += (undefined !== options.message ? options.message : '');
          message += (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
          return message;
        }
      };

      if(sails.config.log.transports == undefined) return done();
      if(sails.config.log.transports.constructor !== Array) return done();
      var transports = [];

      if(_.findWhere(sails.config.log.transports, {name: "console"}) == undefined){
        transports.push(new winston.transports.Console(consoleOptions));
      }

      sails.config.log.transports.forEach(function(transport){
        transports.push(transport);
      })

      logger = new winston.Logger({transports: transports});



      sails.config.log.custom = logger;

      log = captain(sails.config.log);
      log.ship = buildShipFn(sails.version ?('v' + sails.version) :'', log.info );
      sails.log = log;
      return done();
    }
  };
};
