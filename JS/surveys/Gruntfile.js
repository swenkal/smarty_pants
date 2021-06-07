module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['src/*.js'],
    },
    concat: {
      options: {
        separator: '\n\n/*next file*/\n\n'  //this will be put between conc. files
      },
      dist: {
        src: ['src/disc/surveyData.js', 'src/disc/index.js' ],
        dest: 'dist/disc-survey.js'
      }
    },

    uglify: {
      build: {
        files: {
          'dist/disc-survey.min.js': ['dist/disc-survey.js']
        }
      }
    }
  });

  // Actually running things.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify']);

};
