# grunt-release-component

Grunt plugin to release the compiled / generated files from a project to a separate repository. For instance the source code for [Thorax](http://thoraxjs.org) lives here:

https://github.com/walmartlabs/thorax

But the bower component lives here:

https://github.com/components/thorax

This plugin is designed to be run after something like [grunt-release](https://github.com/geddski/grunt-release
).

## Usage

The copy command will copy the generated files into the component repo.

    grunt.initConfig({
      'release-component': {
        options: {
          componentRepo: 'git@github.com:components/thorax.git',
          copy: {
            'build/release/thorax.js': 'thorax.js',
            'build/release/thorax-mobile.js': 'thorax-mobile.js'
          }
        }
      }
    });



