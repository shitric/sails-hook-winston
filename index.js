'use strict';

var winston = require('winston');
var Mail = require('winston-mail').Mail;
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

      var transports = [ new winston.transports.Console(consoleOptions)]

      sails.config.log.transports.forEach(function(transport){
        transports.push(transport);
      })



      // Console Transport
      logger = new winston.Logger({transports: transports});

      if(sails.config.log.mail){
        logger.add(Mail, {
          host: sails.config.log.mail.host,
          port: sails.config.log.mail.port,
          ssl: sails.config.log.mail.ssl || true,
          username: sails.config.log.mail.username, // GMAIL ACCOUNT HERE
          password: sails.config.log.mail.password,
          subject: sails.config.log.mail.subject || '', // EX: 'Hi i'm a bot!'
          from: sails.config.log.mail.from, // EX: 'I'M A BOT <bot@test.com>'
          to: sails.config.log.mail.to, // EX: 'BOT1 <bot1@test.com>, BOT2 <bot2@test.com>, BOT3 <bot3@test.com>'
          level: sails.config.log.mail.level || 'error'
        });
      }

      // DailyRotateFile Transport
      if (sails.config.log.dailyRotate) {
        mkdirp.sync(sails.config.log.dailyRotate.dirname);
        logger.add(winston.transports.DailyRotateFile, (sails.config.log.dailyRotate));
      }

      // MongoDB Transport
      if (sails.config.log.mongoDB) {
        logger.add(require('winston-mongodb').MongoDB, sails.config.log.mongoDB);
      }



      sails.config.log.custom = logger;

      log = captain(sails.config.log);
      log.ship = buildShipFn(sails.version ?('v' + sails.version) :'', log.info );
      sails.log = log;
      return done();
    }
  };
};
