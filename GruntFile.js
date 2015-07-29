module.exports = function(grunt) {

  grunt.initConfig(require('./grunt/config'));
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('buildApp', 
    [
      'clean',
      'less',
      'jsbeautifier',
      'jshint:pre',
      'uglify',
      'watch'
      // 'jshint:post'
    ]
  );

  grunt.registerTask('default', 
    [
      'buildApp'
    ]
  );

};