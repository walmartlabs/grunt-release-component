var fs = require('fs'),
    async = require('async'),
    childProcess = require('child_process'),
    path = require('path'),
    semver = require('semver'),
    execSeries = require('../lib/exec-series.js'),
    spawnCommand = require('../lib/spawn-command.js');

module.exports = function(grunt) {
  grunt.registerTask('release-component', function(type) {
    var complete = this.async();

    this.requiresConfig('release-component.options.copy');
    this.requiresConfig('release-component.options.componentRepo');

    var options = this.options();

    var filesToCopy = options.copy;
    var componentRepo = options.componentRepo;
    var doNpmPublish = typeof options.npmPublish === 'undefined' ? true : options.npmPublish;

    // Grunt is kind enough to change cwd to the directory the Gruntfile is in
    // but double check just in case
    var repoRoot = process.cwd(),
        tmpRepoRoot = path.join(repoRoot, 'tmp-component-repo');

    if (!fs.existsSync(path.join(repoRoot, 'bower.json'))) {
      throw new Error('bower.json not found (execute command in root of repo');
    }

    var oldVersion,
        newVersion;

    async.series([
      // Ensure git repo is actually ready to release
      ensureClean,
      ensureFetched,

      // Bump versions
      function(next) {
        modifyJSONSync(path.join(repoRoot, 'bower.json'), function(bowerJSON) {
          oldVersion = bowerJSON.version;
          if (!type) {
            type = 'patch';
          }
          if (['major', 'minor', 'patch'].indexOf(type) === -1) {
            newVersion = type;
          } else {
            newVersion = semver.inc(bowerJSON.version, type || 'patch');
          }
          console.log('version changed from ' + oldVersion + ' to ' + newVersion);
          bowerJSON.version = newVersion;
        });
        modifyJSONSync(path.join(repoRoot, 'package.json'), function(packageJSON) {
          packageJSON.version = newVersion;
        });
        next();
      },

      // Add and commit
      function(next) {
        execSeries([
          ['git', ['add', path.join(repoRoot, 'bower.json')]],
          ['git', ['add', path.join(repoRoot, 'package.json')]],
          ['git', ['commit', '-m', '"release ' + newVersion + '"']]
        ], next);
      },

      // Tag
      function(next) {
        tag('v' + newVersion, next);
      },

      // Push
      function(next) {
        execSeries([
          ['git', ['push']],
          ['git', ['push', '--tags']]
        ], next);
      },

      function(next) {
        var commands = [];
        if (doNpmPublish) {
          commands.push(['npm', ['publish']]);
        }
        execSeries(commands, next);
      },

      // Clone components repo into tmp and copy built files into it
      function(next) {
        var commands = [
          ['git', ['clone', componentRepo, tmpRepoRoot]]
        ];
        for(var source in filesToCopy) {
          var target = filesToCopy[source];
          commands.push(['cp', [path.join(repoRoot, source), path.join(tmpRepoRoot, target)]]);
        }
        execSeries(commands, next);
      },

      // Bump versions in component repo
      function(next) {
        var bowerJSONPath = path.join(tmpRepoRoot, 'bower.json');
        if (fs.existsSync(bowerJSONPath)) {
          modifyJSONSync(bowerJSONPath, function(bowerJSON) {
            bowerJSON.version = newVersion;
          });
        }
        var componentJSONPath = path.join(tmpRepoRoot, 'component.json');
        if (fs.existsSync(componentJSONPath)) {
          modifyJSONSync(componentJSONPath, function(componentJSON) {
            componentJSON.version = newVersion;
          });
        }
        next();
      },

      // Add and commit in component repo
      function(next) {
        var commands = [];
        for(var source in filesToCopy) {
          var target = filesToCopy[source];
          commands.push(['git', ['add', path.join(tmpRepoRoot, target)]]);
        }
        var bowerJSONPath = path.join(tmpRepoRoot, 'bower.json');
        if (fs.existsSync(bowerJSONPath)) {
          commands.push(['git', ['add', bowerJSONPath]]);
        }
        var componentJSONPath = path.join(tmpRepoRoot, 'component.json');
        if (fs.existsSync(componentJSONPath)) {
          commands.push(['git', ['add', componentJSONPath]]);
        }
        commands.push(['git', ['commit', '-m', '"release ' + newVersion + '"']]);
        execSeries(commands, next, {
          cwd: tmpRepoRoot
        });
      },

      // Tag in component repo
      function(next) {
        tag('v' + newVersion, next, {
          cwd: tmpRepoRoot
        });
      },

      // Push in component repo
      function(next) {
        execSeries([
          ['git', ['push']],
          ['git', ['push', '--tags']]
        ], next, {
          cwd: tmpRepoRoot
        });
      },

      // Delete component repo
      function(next) {
        execSeries([
          ['rm', ['-rf', tmpRepoRoot]]
        ], next);
      }

    ], complete);
  });
};

function ensureClean(callback) {
  childProcess.exec('git diff-index --name-only HEAD --', function(err, stdout, stderr) {
    if (err) {
      throw err;
    }

    if (stdout.length) {
      throw new Error('Git repository must be clean');
    } else {
      callback();
    }
  });
}

function tag(name, callback, options) {
  spawnCommand('git', ['tag', '-a', '--message=' + name, name], options)
      .on('error', function(err) {
        throw err;
      })
      .on('exit', function(code) {
        if (code) {
          throw new Error('Failed tagging ' + name + ' code: ' + code);
        } else {
          callback();
        }
      });
}

function ensureFetched(callback) {
  childProcess.exec('git fetch', function(err, stdout, stderr) {
    if (err) {
      throw err;
    }

    childProcess.exec('git branch -v --no-color | grep -e "^\\*"', function(err, stdout, stderr) {
      if (err) {
        throw err;
      }

      if (/\[behind (.*)\]/.test(stdout)) {
        throw new Error('Your repo is behind by ' + RegExp.$1 + ' commits');
      }

      callback();
    });
  });
}

function modifyJSONSync(JSONPath, callback) {
  var json = JSON.parse(fs.readFileSync(JSONPath).toString());
  callback(json);
  fs.writeFileSync(JSONPath, JSON.stringify(json, null, 2));
}
