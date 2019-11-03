export default class ObjExtend{
    static init(){
          /***********************原型方法扩展**************************/
        String.prototype.replaceAll = function (s1, s2) {
            return this.replace(new RegExp(s1, "gm"), s2);
        };
        
        String.prototype.toDecimal2 = function () {
            return this.replace(/[^\d{1,}\.\d{1,}|\d{1,}]/g, '').replace(".", "$#$").replace(/\./g, "").replace("$#$", ".").replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
        }
        
        String.prototype.toIdcard = function () {
            return this.replace(/[^xX0-9_]/g, '');
        }
        
        String.prototype.toNum = function () {
            return this.replace(/[^\d]/g, '')
        }
        
        String.prototype.upperCaseFirst = function () {
            var reg = /\b(\w)|\s(\w)/g;
            return this.replace(reg, function (m) {
                return m.toUpperCase()
            });
        };
        
        String.prototype.toStarEncrypt = function () {
            var reg = /^(\d{3})\d{4}(\d{4})$/;
            return this.replace(reg, "$1****$2")
        }
        
        Date.prototype.format = function (fmt) {
            var o = {
                "M+": this.getMonth() + 1,
                "d+": this.getDate(),
                "h+": this.getHours(),
                "m+": this.getMinutes(),
                "s+": this.getSeconds(),
                "q+": Math.floor((this.getMonth() + 3) / 3),
                "S": this.getMilliseconds()
            };
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            }
            return fmt;
        };
        
        /***********************原型方法扩展**************************/
    }
}