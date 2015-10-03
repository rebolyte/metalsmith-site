var Metalsmith 	= require('metalsmith');
var collections	= require('metalsmith-collections');
var permalinks	= require('metalsmith-permalinks');
var	markdown 	= require('metalsmith-markdown');
var excerpts 	= require('metalsmith-excerpts');
var templates 	= require('metalsmith-templates');
var Handlebars  = require('handlebars');
var stylus 		= require('metalsmith-stylus');
var metadata	= require('metalsmith-metadata');
var branch 		= require('metalsmith-branch');
var moment 		= require('moment');
var jeet		= require('jeet');
var axis 		= require('axis');
var rupture		= require('rupture');


Handlebars.registerHelper('formatDate', function(date) {
	return moment(date).format('D-MMM-YYYY');
});

var autoTemplate = function(config) {
    var pattern = new RegExp(config.pattern);

    return function(files, metalsmith, done) {
        for (var file in files) {
            if (pattern.test(file)) {
                var _f = files[file];
                if (!_f.template) {
                    _f.template = config.templateName;
                }
            }
        }
        done();
    };
};

var inCollection = function(collection) {
	return function (filename, props, i) {
		return (props.collection && (props.collection[0] === collection));
	};
};
var anyCollections = function (collections) {
	return function (filename, props, i) {
		var out = false;
		collections.forEach(function (coll) {
			if (inCollection(coll)(filename, props, i)) {
				out =  true;
			}
		});
		return out;
	};
};

Metalsmith(__dirname)
	.source('./src')
	.destination('./build')
	.use(metadata({
		file: 'meta.json',
	}))
	.use(function (files, metalsmith, done) {
		// This is my own "plugin" to load the metadata and register the Handlebars helper
		var metadata = metalsmith.metadata().file;
		Handlebars.registerHelper('link', function(path) {
			return metadata.baseUrl + '/' + path;
		});
		done();
	})
	.use(markdown({
	  smartypants: true,
	  gfm: true,
	  tables: true
	}))
	.use(excerpts())
	.use(collections({
		pages: {
			pattern: 'pages/*.html'
		},
		posts: {
			pattern: 'blog/posts/*.html',
			sortBy: 'date',
			reverse: true
		},
		academics: {
			pattern: 'academics/*.html'
		},
		writing:  {
			pattern: 'writing/*.html'
		}
	}))
	.use(function (files, metalsmith, done) {
		// console.log(files);
		done();
	})
	.use(autoTemplate({
		// Automatically supply the "post.hbt" template for everything in the posts
		// collection.
		pattern: 'blog/posts',
		templateName: 'post.hbt'
	}))
	.use(branch('blog/posts/**.html')
		.use(permalinks({
			pattern: 'blog/:title'
		}))
	)
	.use(branch('pages/*.html')
		.use(permalinks({
			pattern: ':url'
		}))
	)
	.use(branch(anyCollections(['academics', 'writing']))
		.use(permalinks({
			pattern: ':collection/:url'
		}))
	)
	// .use(branch('academics/*.html')
	// 	// .use(ignore(['academics/index.html']))
	// 	.use(permalinks({
	// 		pattern: 'academics/:url'
	// 	}))
	// )
	// .use(branch('pages/**/*.html')
	// 	.use(function (files, metalsmith, done) {
	// 		// console.log(files);
	// 		done();
	// 	})
	// 	.use(copy({
	// 		pattern: 'pages/**',
	// 		transform: function (file) {
	// 			var filename = file.slice(6, -5);
	// 			console.log(filename);
	// 			return filename + '/index.html';
	// 		}
	// 	}))
	// )
	.use(templates({
		engine: 'handlebars',
		directory: 'templates',
		partials: {
			header: 'partials/header',
			nav: 	'partials/nav',
			footer: 'partials/footer'
		}
	}))
	.use(stylus({ use: [ jeet(), axis(), rupture() ] }))
	// .use(stylus({ use: axis() }))
	.build(function(err){
		if (err) throw err;
	});