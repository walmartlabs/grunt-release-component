# grunt-release-component

Grunt plugin to release the compiled / generated files from a project to a separate repository. For instance the source code for [Thorax](http://thoraxjs.org) lives here:

https://github.com/walmartlabs/thorax

But the bower component lives here:

https://github.com/components/thorax

## Config

The copy command will copy any generated files into the component repo.

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

## Usage

The command may be run with any of the predefined version incriments:

- `patch` (0.0.x)
- `minor` (0.x.0)
- `major` (x.0.0)

Which would look like:

    grunt release-component:patch
    grunt release-component:minor
    grunt release-component:major

Or with an arbitrary version argument to force a particular version:

    grunt release-component:2.0.0-rc11

The argument should always be a number.
