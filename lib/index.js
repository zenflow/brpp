var path = require('path');
var stream = require('readable-stream');
var concat = require('concat-stream');
var staticModule = require('static-module');
var duplexer = require('duplexer2');

var rpp_resolve = require('rpp/lib/resolve');
var rpp_isModule = require('rpp/lib/isModule');

var brpp = function(filename, options){
    if (typeof filename == 'object'){
        options = filename;
        filename = null;
    }
    filename = filename || path.join(process.cwd(), 'brpp-void.js');
    options = options || {};

    if (/\.json$/.test(filename)) {
        return new stream.PassThrough;
    }

    var dirname = path.dirname(filename);

    var transforms = [
        concat({
            transform: function(src){
                return src.toString('utf8').replace(/require\('rpp'\)\(__dirname\)/g, "require('rpp')");
            }
        }),
        staticModule({
            rpp: function(pattern){
                var filenames = rpp_resolve(dirname, pattern);
                return "(new (require('rpp/lib/Collection'))({" + Object.keys(filenames).map(function(filename){
                        return "'" + filename + "': " + (
                            rpp_isModule(filenames[filename])
                                ? "require('" + filename + "')"
                                : "require('fs').readFileSync(__dirname + '" + filename + "', 'utf8')"
                        );
                    }).join(', ') + "}))";

            }
        })

    ];

    var writable = new stream.PassThrough;
    var readable = transforms.reduce(function(up, down){
        return up.pipe(down);
    }, writable);
    return duplexer(writable, readable);
};

module.exports = brpp;
