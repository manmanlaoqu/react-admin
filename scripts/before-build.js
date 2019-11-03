var fs = require('fs');
var path = require("path")
var filePath = path.resolve('./');
var sd = require('silly-datetime');

var time = sd.format(new Date(), 'YYYY-MM-DD HH:mm');
// console.log(time);


var args = process.argv.splice(2)
console.log(args)

// var version = args[0]||'unknown';
var version=(' '+time);
console.log('build version ' + version);
var configFile = '/config/config.js';
if (args[0] === 'test') {
    configFile = '/config/config.test.js';
} else if (args[0] === 'pro') { 
    configFile = '/config/config.pro.js';
}
var outputConfig = function () {
    fs.readFile(filePath + configFile, 'utf-8', function (err, data) {
        if (err) {
            console.log('读取失败！')
            console.log(err)
        } else {
            data = data.replace('replace-version',version)
            fs.writeFile(filePath + '/src/lib/version.js', data, 'utf-8', function (_err) {
                if (_err) {
                    console.log(_err)
                } else {
                    console.log("config modify succeed!")
                }
            });
        }
    })
}

outputConfig();