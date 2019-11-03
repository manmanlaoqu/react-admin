var fs = require('fs');
var path = require("path")
const compressing = require('compressing');


var filePath = path.resolve('./');
var args = process.argv.splice(2)
const sourceMapPath = `${filePath}/source-map`
var env = args[0] || 'pro';
console.log('build env ' + env + ';');
var outputHtml = function () {
    new Promise((resolve, reject) => {
        fs.readFile(filePath + '/build/index.html', 'utf-8', function (err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    }).then(data => {
        fs.writeFileSync(filePath + '/build/index.html', data, 'utf-8', function (_err) {
            if (_err) {
                throw _err
            }
        });
        return
    }).then(() => {
        //generateSourceMap()
        return
    }).then(() => {
        console.log("set API succeed!")
       // handlerBuild()
       handlerBuildnew()        
    }).catch(err => {
        console.log('读取失败！')
        console.log(err)
    })

}

var generateSourceMap = function () {
    let files
    if (fs.existsSync(sourceMapPath)) {
        files = fs.readdirSync(sourceMapPath);
        files.forEach((file, index) => {
            let curPath = sourceMapPath + "/" + file;
            fs.unlinkSync(curPath); //删除文件
        });
    } else {
        fs.mkdirSync(sourceMapPath);
    }
    files = fs.readdirSync(`${filePath}/build/static/js`)
    files.map(url => {
        if (url.endsWith('.map')) {
            fs.renameSync(`${filePath}/build/static/js/${url}`, `${filePath}/source-map/${url}`);
        }
    })
}


var handlerBuild = function () {
    console.log("-----------handlerBuild----------------")
    compressing.zip.compressDir(filePath + '/build', filePath + `/biz-web.zip`)
        .then(() => {
            console.log('success');
        })
        .catch(err => {
            console.error(err);
        });
    compressing.zip.compressDir(sourceMapPath, filePath + `/source-map.zip`)
        .then(() => {
            console.log('success');
        })
        .catch(err => {
            console.error(err);
        });
}

var handlerBuildnew = function () {
    console.log("-----------mv file ----------------")
    fs.rename(filePath + '/build', filePath + '/dist', function () { 
        console.log('success');
    });
}

outputHtml();
