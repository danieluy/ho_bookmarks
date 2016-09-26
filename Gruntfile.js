module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        // beautify: true,
        // compress: false,
        // mangle: false,
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      my_target: {
        files: {
          'unpacked/popup.min.js': ['src/popup.js']
        }
      }
    },
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'unpacked/popup.min.css': ['src/popup.css']
        }
      }
    },
    watch: {
      scripts: {
        files: ['src/*.js', 'src/*.css'],
        tasks: ['uglify', 'cssmin'],
        options: {
          debounceDelay: 250,
        },
      },
    },
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  // Default task(s).
  grunt.registerTask('default', ['uglify', 'cssmin']);

};
