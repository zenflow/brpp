var test = require('tape');
var brpp = require('../lib');
var concat = require('concat-stream');

test('basic', getTest(__filename, {}, {
    "require('rpp')(__dirname)('./dummy/**/**')":
        "(new (require('rpp/lib/Collection'))({" +
            "'./dummy/a.js': require('./dummy/a.js'), " +
            "'./dummy/b.json': require('./dummy/b.json'), " +
            "'./dummy/c.txt': require('fs').readFileSync(require('path').join(__dirname, './dummy/c.txt'), 'utf8')" +
        "}))"
}));

function getTest(filename, options, test_cases){
    return function(t){
        var plan = 0;
        for (var source in test_cases){
            if (test_cases.hasOwnProperty(source)){
                plan++;
                doTestCase(source, test_cases[source]);
            }
        }
        t.plan(plan);

        function doTestCase(source, expected){
            expected = expected || source;
            concat(source)
                .pipe(brpp(filename, options))
                .pipe(concat(function(data){
                    t.equal(data.toString('utf8'), expected);
                }));
        }
    };
}