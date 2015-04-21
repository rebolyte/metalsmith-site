var Metalsmith 	= require('metalsmith');
var collections	= require('metalsmith-collections');
var permalinks	= require('metalsmith-permalinks');
var	markdown 	= require('metalsmith-markdown');
var templates 	= require('metalsmith-templates');
var Handlebars  = require('handlebars');
var stylus 		= require('metalsmith-stylus');
var metadata	= require('metalsmith-metadata');

var meta = null;

Handlebars.registerHelper('link', function(path) {
    return metadata.baseUrl + '/' + path;
});

// var plugin = function (files, metalsmith, done) {
// 	console.log(files);
// 	done();
// };

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

Metalsmith(__dirname)
	.use(collections({
		pages: {
			pattern: 'content/pages/*.md'
		},
		posts: {
			pattern: 'content/posts/*.md',
			sortBy: 'date',
			reverse: true
		}
	}))
	.use(metadata({
		meta: 'meta.json',
	}))
	.use(function (files, metalsmith, done) {
		meta = metalsmith.metadata();
		console.log('done');
		done();
	})
	.use(autoTemplate({
		pattern: 'posts',
		templateName: 'post.hbt'
	}))
	.use(markdown({
	  smartypants: true,
	  gfm: true,
	  tables: true
	}))
	.use(permalinks({
		pattern: ':collection/:title'
	}))
	.use(templates({
		engine: 'handlebars',
		directory: 'templates',
		partials: {
			header: 'partials/header',
			footer: 'partials/footer'
		}
	}))
	.use(stylus())
	// .use(plugin)
	.build(function(err){
		if (err) throw err;
	});