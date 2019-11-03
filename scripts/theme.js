/**
 * antd less与自定义css混合编译
 * 安装lessc 全局 2.x版本 
 * npm install less@2.7.3 -g
 */

var exec = require('child_process').exec;

exec('lessc .\\src\\style\\theme.less .\\src\\style\\index.css', function(error, stdout, stderr) {
    if(error){
        console.log(error);
    }
});