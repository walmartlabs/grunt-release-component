# grunt-release-component

***
# NOTICE:

## This repository has been archived and is not supported.

[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)
***
NOTICE: SUPPORT FOR THIS PROJECT HAS ENDED 

This projected was owned and maintained by Walmart. This project has reached its end of life and Walmart no longer supports this project.

We will no longer be monitoring the issues for this project or reviewing pull requests. You are free to continue using this project under the license terms or forks of this project at your own risk. This project is no longer subject to Walmart's bug bounty program or other security monitoring.


## Actions you can take

We recommend you take the following action:

  * Review any configuration files used for build automation and make appropriate updates to remove or replace this project
  * Notify other members of your team and/or organization of this change
  * Notify your security team to help you evaluate alternative options

## Forking and transition of ownership

For [security reasons](https://www.theregister.co.uk/2018/11/26/npm_repo_bitcoin_stealer/), Walmart does not transfer the ownership of our primary repos on Github or other platforms to other individuals/organizations. Further, we do not transfer ownership of packages for public package management systems.

If you would like to fork this package and continue development, you should choose a new name for the project and create your own packages, build automation, etc.

Please review the licensing terms of this project, which continue to be in effect even after decommission.
***

Grunt plugin to release the compiled / generated files from a project to a separate repository. For instance the source code for [Thorax](http://thoraxjs.org) lives here:

https://github.com/walmartlabs/thorax

But the bower component lives here:

https://github.com/components/thorax

This grunt task would in this example:

- bump the versions in `package.json` and `bower.json` in `walmartlabs/thorax`
- push a new tag to `walmartlabs/thorax`
- bump the versions in `bower.json` and `component.json` in `components/thorax`
- push a new tag to `components/thorax`

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
