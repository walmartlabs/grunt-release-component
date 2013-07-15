var async = require('async'),
    spawnCommand = require('./spawn-command.js');

module.exports = function execSeries(args, cb, options) {
  async.eachSeries(
    args,
    function(args, callback) {
      spawnCommand.apply(self, args.concat(options))
          .on('error', function(err) {
            throw err;
          })
          .on('exit', function(code) {
            if (code) {
              throw new Error('Failed executing ' + args);
            } else {
              callback();
            }
          });
    },
    cb);
};