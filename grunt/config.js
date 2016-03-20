module.exports = {

	clean: {
        dist: {
            src: ['dist/angular-instagrid.min.js']
        }
	},

    jsbeautifier: {
        files : ['dist/**/*.js'],
        options : {

        }
    },

    less: {
        all: {
            options: {
                compress: true
            },

            files: [
                {
                    expand: true,
                    cwd: 'dist/',
                    src: ['**/*.less'],
                    dest: 'dist/',
                    ext: '.css',
                    extDot: 'first'
                }
            ]
        }
    },

    jshint: {
        options: {
            jshintrc: 'jshint-config.jshintrc',
            ignore: ['bower_components/**']
        },

        pre: ['dist/angular-swaggerific.js'],
        post: ['dist/angular-swaggerific.min.js']
    },

    uglify: {
    	all: {
    		options: {
    			mangle: true,
    			compress: true
    		},

    		files: [
	    		{
	    			expand: true,
                    cwd: 'dist/',
	    			src: ['**/*.js'],
                    dest: 'dist/',
	    			ext: '.min.js',
	    			extDot: 'first'
	    		}
    		]
    	},
    },

    watch: {
        less: {
            files: ['dist/**/*.less'],
            tasks: ['less'],
            options: {
                spawn: false,
                event: ['changed', 'added', 'deleted']
            }
        }
    }

};