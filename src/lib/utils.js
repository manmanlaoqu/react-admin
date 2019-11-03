import React from 'react';
import Md5Lib from "js-md5";
import CONSTANT from './constant';
import { Modal as AntModal, message, notification } from 'antd';
import * as CryptoJS from 'crypto-js';
//ModalInfo
import extendjs from './extend'
import axios from 'axios'
import LevenshteinDistance from './levenshtein';

extendjs.init()

message.config({
	maxCount: 3,
	duration: 5,
});
notification.config({
	placement: 'topRight',
	top: 50,
	duration: 3,
	maxCount: 3,
})


axios.interceptors.request.use(function (config) {
	return config;
}, function (ex) {
	console.error(ex)
	if (Config.onerror) {
		return;
	}
	Config.onerror = true;
	Config.error({
		title: '提示',
		content: '系统异常,请稍后再试！',
		okText: "知道了",
		onOk() {
			Config.onerror = false;
		},
		onCancel(){
			Config.onerror = false;
		}
	})
});

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
	return response;
}, function (ex) {
	console.error(ex)
	if (Config.onerror) {
		return;
	}
	Config.onerror = true;
	Config.error({
		title: '提示',
		content: '系统异常,请稍后再试！',
		okText: "知道了",
		onOk: function () {
			Config.onerror = false;
		},
		onCancel(){
			Config.onerror = false;
		}
	})
});

export default class Config extends CONSTANT {

	static toGetParam(obj) {
		let str = '';
		for (let key in obj) {
			str += (key + '=' + obj[key] + '&')
		}
		return str;
	}

	static confirm = AntModal.confirm;
	static info = AntModal.info;
	static error = AntModal.error;
	static AntModal = AntModal;
	static map = {};

	/**
	 * 
	 * @param {*} api 接口地址
	 * @param {*} options 
	 *	options:{
	 * 		params:post参数
	 * 		beforeRequest:请求前事件
	 * 		afterRequest：请求完成事件
	 * 		error:function(data){} 业务逻辑错误回调
	 * 		onError:请求错误事件（网络错误、超时等）
	 * }
	 * @param {*} callback 业务逻辑成功回调
	 */
	static request(options) {
		let that = this;
		if (!options.api) {
			that.error({
				title: '提示',
				content: <pre>{'抱歉，您没有此项操作的权限，请联系管理员！'}</pre>,
				okText: "知道了",
				onOk: function () {
					that.onerror = false;
				},
				onCancel(){
					that.onerror = false;
				}
			})
			return;
		}
		options.params = this.trimParam(options.params)
		if (options.api == '/api/web/me/login') {
			options.params.userPhone = options.params.phone;
		}
		if (options.download) {
			if (options.beforeRequest && typeof options.beforeRequest === 'function') {
				options.beforeRequest();
			}
			return axios({
				url: this.API + options.api,
				data: this.getParam(options.params),
				method: "POST",
				// credentials: 'include',
				timeout:30*1000,
				responseType: 'blob',
				headers: {
					'charset': 'UTF-8',
					'Content-Type': 'text/plain',
					'tokenId': Config.getCookie('tokenId')
				},
			}).then(function (response) {
				if (options.afterRequest && typeof options.afterRequest === 'function') {
					options.afterRequest();
				}
				Config.downUtil(response.data, options.fileName)
			})
		} else {
			if (options.beforeRequest && typeof options.beforeRequest === 'function') {
				options.beforeRequest();
			}
			let now = Date.now()
			return axios({
				url: this.API + options.api + (options.api == '/api/web/me/login' ? '?' + this.toGetParam(options.params) : ''),
				data: options.api == '/api/web/me/login' ? options.params : this.getParam(options.params),
				method: "POST",
				headers: {
					'charset': 'UTF-8',
					'Content-Type': 'text/plain',
					'tokenId': Config.getCookie('tokenId')
				},
				pre: options.beforeRequest,
				end: options.afterRequest
			}).then(function (response) {
				if (options.afterRequest && typeof options.afterRequest === 'function') {
					options.afterRequest();
				}
				if (!response) {
					return;
				}
	
				now = Date.now()
				if (response.status != 200) {
					that.error({
						title: '错误',
						content: <div dangerouslySetInnerHTML={{ __html: response.statusText }} />,
						okText: "知道了",
						width: 500,
						onOk: function () {
							that.onerror = false;
						},
						onCancel(){
							that.onerror = false;
						}
					})
					return;
				}
				if (response.data.head.status == '0' || response.data.head.status == '3') {
					if (typeof options.success === 'function') {
						options.success(response.data.body)
						if (response.data.head.status == '3') { 
							that.error({
								title: '提示',
								content: <div dangerouslySetInnerHTML={{ __html: response.data.head.errorMessage }} />,
								okText: "知道了",
								width: 500,
								onOk: function () {
									that.onerror = false;
								},
								onCancel(){
									that.onerror = false;
								}
							})
						}
					}
				} else if (response.data.head.status == '403' && options.api !== '/api/web/me/login') {
					Config.logout();
				} else {
					if (that.onerror) {
						return;
					}
					if (options.handleError) {
						options.handleError(response.data)
					} else {
						that.onerror = true;
						that.error({
							title: '提示',
							content: <div dangerouslySetInnerHTML={{ __html: response.data.head.errorMessage.replaceAll('\n', '<br/>') }} />,
							okText: "知道了",
							width: 500,
							onOk: function () {
								that.onerror = false;
							},
							onCancel(){
								that.onerror = false;
							}
						})
					}
				}
			}).catch(ex => {
				console.error(ex);
				console.error('error on request ' + options.api)
				if (options.afterRequest && typeof options.afterRequest === 'function') {
					options.afterRequest();
				}
				if (options.onError && typeof options.onError === 'function') {
					//异常回调
					options.onError(ex);
				} else {
					if (that.onerror) {
						return;
					}
					that.onerror = true;
					that.error({
						title: '提示',
						content: '系统异常,请稍后再试！',
						okText: "知道了",
						onOk: function () {
							that.onerror = false;
						},
						onCancel(){
							that.onerror = false;
						}
					})
				}
			})
			// return window.fetch(this.API + options.api + (options.api == '/api/web/me/login' ? '?' + this.toGetParam(options.params) : ''), {
			// 	method: "POST",
			// 	credentials: 'include',
			// 	headers: {
			// 		'charset': 'UTF-8',
			// 		'Content-Type': 'text/plain',
			// 		'tokenId': Config.getCookie('tokenId')
			// 	},
			// 	body: options.api == '/api/web/me/login' ? JSON.stringify(options.params) : this.getParam(options.params)
			// }).then(function (response) {
			// 	return response.json();
			// }).then(function (result) {
			// 	if (options.afterRequest && typeof options.afterRequest === 'function') {
			// 		//请求后回调
			// 		options.afterRequest();
			// 	}
			// 	if (result.head.status == '0') {
			// 		if (typeof options.success === 'function') {
			// 			options.success(result.body)
			// 		}
			// 	} else if (result.head.status == '403' && options.api !== '/api/web/me/login') {
			// 		Config.logout();
			// 	} else {
			// 		if (that.onerror) {
			// 			return;
			// 		}
			// 		if (options.handleError) {
			// 			options.handleError(result)
			// 		} else {
			// 			that.onerror = true;
			// 			that.error({
			// 				title: '提示',
			// 				content: <div dangerouslySetInnerHTML={{ __html: result.head.errorMessage.replaceAll('\n', '<br/>') }} />,
			// 				okText: "知道了",
			// 				width: 500,
			// 				onOk: function () {
			// 					that.onerror = false;
			// 				}
			// 			})
			// 		}
			// 	}
			// }).catch(function (ex) {
			// 	console.error(ex);
			// 	console.error('error on fetch ' + options.api)
			// 	if (options.afterRequest && typeof options.afterRequest === 'function') {
			// 		options.afterRequest();
			// 	}
			// 	if (options.onError && typeof options.onError === 'function') {
			// 		//异常回调
			// 		options.onError(ex);
			// 	} else {
			// 		if (that.onerror) {
			// 			return;
			// 		}
			// 		that.onerror = true;
			// 		that.error({
			// 			title: '提示',
			// 			content: '系统异常,请稍后再试！',
			// 			okText: "知道了",
			// 			onOk: function () {
			// 				that.onerror = false;
			// 			}
			// 		})
			// 	}
			// })
		}
	}

	static getCookie(name) {
		var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
		if (arr = document.cookie.match(reg))
			return unescape(arr[2]);
		else
			return null;
	}

	static setCookie(name, value) {
		var Days = 30;
		var exp = new Date();
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
	}

	static downUtil(blob, filename) {
		let b = Config.getBrowser();
		switch (b) {
			case "ie":
				navigator.msSaveBlob(blob, filename);
				break;
			case "edge":
				navigator.msSaveBlob(blob, filename);
				break;
			case "opera":
				Config.fetchDown(blob, filename);
				break;
			case "maxthon win":
				Config.fetchDown(blob, filename);
				break;
			// case "maxthon":
			// 	call(url);
			// 	break;
			case "firefox":
				Config.fetchClickDown(blob, filename);
				break;
			// case "safari":
			// 	call(url);
			// 	break;
			case "chrome":
				Config.fetchDown(blob, filename);
				break;
			default:
				try {
					Config.fetchDown(blob, filename);
				} catch (e) {
					alert(e);
					//TODO handle the exception
				}
				break;
		}
	}

	static fetchDown(blob, filename) {
		var urlObject = window.URL || window.webkitURL || window;
		var a = document.createElement('a');
		var url = urlObject.createObjectURL(blob);
		a.href = url;
		a.download = filename;
		a.click();
		window.URL.revokeObjectURL(url)
	}

	static fetchClickDown(blob, filename) {
		var urlObject = window.URL || window.webkitURL || window;
		var save_link = document.createElement("a");
		save_link.href = urlObject.createObjectURL(blob);
		save_link.download = filename;
		Config.FakeClick(save_link)
	}

	static FakeClick = function (obj) {
		var ev = document.createEvent("MouseEvents");
		ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		obj.dispatchEvent(ev)
	}

	static getBrowser = function () {
		if (!!window.ActiveXObject || "ActiveXObject" in window) {
			return "ie"
		}
		var userAgent = navigator.userAgent.toLocaleLowerCase();
		if (userAgent.indexOf("opr") > -1) {
			return "opera";
		}
		if (userAgent.indexOf("maxthon") > -1) {
			if (userAgent.indexOf("windows") > -1) {
				return "maxthon win"
			}
			return "maxthon"
		}
		if (userAgent.indexOf("edge") > -1) {
			return "edge"
		}
		if (userAgent.indexOf("firefox") > -1) {
			return "firefox"
		}
		if (userAgent.indexOf("safari") > -1 && userAgent.indexOf("chrome") == -1) {
			return "safari"
		}

		if (userAgent.indexOf("chrome") > -1) {
			return "chrome"
		}
		return 'other';
	};

	/**
	 * 下载图片
	 */
	static downloadSource(imgUrl, name) {
		axios({
			url: imgUrl,
			method: "GET",
			responseType: 'blob',
		}).then(function (response) {
			Config.downUtil(response.data, name)
		})
	}

	static keepTwoDecimalFull(num) {
		var result = parseFloat(num);
		if (isNaN(result)) {
			alert('传递参数错误，请检查！');
			return false;
		}
		result = Math.round(num * 100) / 100;
		var s_x = result.toString();
		var pos_decimal = s_x.indexOf('.');
		if (pos_decimal < 0) {
			pos_decimal = s_x.length;
			s_x += '.';
		}
		while (s_x.length <= pos_decimal + 2) {
			s_x += '0';
		}
		return s_x;
	}
	
	static Message = message
	static Notification = notification
	static Notify = {
		success(msg) {
			notification.success({
				message: msg,
			})
		}, error(msg) {
			notification.error({
				message: msg,
			})
		}, warning(msg) {
			notification.warning({
				message: msg,
			})
		}, info(msg) {
			notification.info({
				message: msg,
			})
		}
	};
	/**
	 * 七牛上传token管理
	 */
	static UpToken = (function () {
		var time_,
			token;
		var getToken = function (call) {
			if (!time_) {
				time_ = new Date().getTime();
			}
			var t = new Date().getTime();
			if (t - time_ <= 3500000) {
				if (token) {
					call(token);
				} else {
					getTokenWeb(call)
				}
			} else {
				getTokenWeb(call)
			}
		};
		var getTokenWeb = function (call) {
			Config.request("/user/getUpToken.do", {
				error: function () {
					Config.message('warning', 'upload failed!');
				}
			}, function (data) {
				token = data.data.uploadToken
				call(token);
			});
		};
		return {
			"getToken": getToken
		}
	})();

	static logout() {
		if (this.modalList.length > 0) {
			this.modalList.map((modal) => {
				modal.destroy();
			})
		}
		window.location.href = window.location.origin + window.location.pathname + '#/login?v=' + this.gethashcode()
	}

	static getParam(param) {
		let data = {
			head: {
				"sequenceCode": this.guid(),
				"callType": "H5",
				"protocolVersion": "2.0",
				"appVersion": "2.0.0",
				"systemVersion": "11.2.2",
				"bizId": "7",
				"requestTime": Date.parse(new Date()),
				"mobileModel": "iPhone",
			},
			body: param,
			sign: "utrailer-business-001"
		};
		let b = this.deepclone(data);
		b.sign = this.md5(JSON.stringify(data));
		return b;
	}

	static toFileImg(img) {
		return {
			"uid": this.guid(),
			"percent": 100,
			"status": "done",
			"thumbUrl": img+'_600-600',
			"type": "image/png",
			"response": {
				"body": {
					resUrls: [img]
				}
			}
		}
	}

	static debounce(fn,delay){
		let timer
		return function(){
			let args = arguments,that = this
			clearTimeout(timer)
			timer = setTimeout(()=>{
				fn.call(that,args)
			},delay)
		}
	}

	static guid() {
		function S4() {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		}
		return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
	}

	static saltMd5(str) {
		return Md5Lib.hex(this.salt(str) + "&" + this.GUID + "&" + str);
	}

	static md5(str) {
		return Md5Lib.hex(str);
	}

	static salt(str) {
		var ss = '';
		for (var i = 0; i < str.length; i++) {
			ss += str.charAt(i).charCodeAt();
		}
		return ss;
	}
	static clearEmpty(obj) {
		if (!obj) {
			return {};
		}
		for (var k in obj) {
			if (obj[k] === undefined || obj[k] === null) {
				delete obj[k]
			}
		}
		return obj;
	}


	/**
	 * 注入高德地图检索api
	 * @param {*} cityCode 
	 * @param {*} handler 
	 */
	static generateAutoComplete(cityCode, handler) {
		if (!window.AMap) {
			return
		}
		window.AMap.service(["AMap.Autocomplete"], function () {
			Config.autoComplete = new window.AMap.Autocomplete({
				city: cityCode ? cityCode : '全国',
				citylimit: cityCode ? true : false
			});
			//关键字查询
			// placeSearch.search('北京大学');
		});
		
		window.AMap.plugin('AMap.Geocoder', function () {
			Config.geocoder = new window.AMap.Geocoder({})
		})
	}

	/**
	 * 对象深拷贝
	 * @param {*} obj 
	 */
	static deepclone(obj) {
		if (typeof obj !== 'object') {
			return
		}

		if (obj === null) {
			return null;
		}
		if (obj === undefined) {
			return undefined;
		}
		var newObj = obj instanceof Array ? [] : {}
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				newObj[key] = typeof obj[key] === 'object' ? this.deepclone(obj[key]) : obj[key]
			}
		}
		return newObj
	}

	static isEmpty(str) {
		return (null === str || undefined === str || '' === str);
	}

	static parseParams(url) {
		var obj = {};
		var keyvalue = [];
		var key = "",
			value = "";
		var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
		for (var i in paraString) {
			keyvalue = paraString[i].split("=");
			key = keyvalue[0];
			value = keyvalue[1];
			obj[key] = value;
		}
		return obj;
	}

	/**
	 * AES加密
	 * @param {*} word 
	 * @param {*} AuthTokenKey 
	 */
	static Encrypt(word, AuthTokenKey) {
		var srcs = CryptoJS.enc.Utf8.parse(word);
		let encrypted = CryptoJS.AES.encrypt(srcs, CryptoJS.enc.Utf8.parse(AuthTokenKey), {
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7
		});
		return encrypted.toString();
	}

	/**
	 * AES解密
	 * @param {*} word 
	 * @param {*} AuthTokenKey 
	 */
	static Decrypt(word, AuthTokenKey) {
		let key = CryptoJS.enc.Utf8.parse(AuthTokenKey);
		let decrypt = CryptoJS.AES.decrypt(word, key, {
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7
		});
		return CryptoJS.enc.Utf8.stringify(decrypt).toString();
	}

	static toImgL(src) {
		if (!src) {
			return '';
		}
		return this.IMG + src + '-img800';
	}
	static toImgM(src) {
		if (!src) {
			return '';
		}
		return this.IMG + src + '-img400';
	}

	static toImgS(src) {
		if (!src) {
			return '';
		}
		return this.IMG + src + '-img100';
	}

	/**
	 * dataURLtoBlob
	 * @param {*} dataurl 
	 */
	static dataURLtoBlob(dataurl) {
		var arr = dataurl.split(','),
			mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new Blob([u8arr], {
			type: mime
		});
	}

	static blobToFile(theBlob, fileName) {
		theBlob.lastModifiedDate = new Date();
		theBlob.name = fileName;
		return theBlob;
	}

	/**
	 * 将base64转换为文件
	 * @param {*} dataurl 
	 * @param {*} filename 
	 */
	static dataURLtoFile(dataurl, filename) {
		var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], filename, { type: mime });
	}


	/**
	 * 百度坐标转高德（传入经度、纬度）
	 * @param {*} bd_lng 
	 * @param {*} bd_lat 
	 */
	static bd_decrypt(bd_lng, bd_lat) {
		var X_PI = Math.PI * 3000.0 / 180.0;
		var x = bd_lng - 0.0065;
		var y = bd_lat - 0.006;
		var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
		var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
		var gg_lng = z * Math.cos(theta);
		var gg_lat = z * Math.sin(theta);
		return { lng: gg_lng, lat: gg_lat }
	}

	/**
	 * 高德坐标转百度（传入经度、纬度）
	 * @param {*} gg_lng 
	 * @param {*} gg_lat 
	 */
	static bd_encrypt(gg_lng, gg_lat) {
		var X_PI = Math.PI * 3000.0 / 180.0;
		var x = gg_lng, y = gg_lat;
		var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
		var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
		var bd_lng = z * Math.cos(theta) + 0.0065;
		var bd_lat = z * Math.sin(theta) + 0.006;
		return {
			lat: bd_lat,
			lng: bd_lng
		};
	}
	//获取hashcode
	static gethashcode() {
		//定义一个时间戳，计算与1970年相差的毫秒数  用来获得唯一时间
		let timestamp = (new Date()).valueOf();
		let myRandom=this.randomWord(false,6);
		let hashcode=this.hashCode(myRandom+timestamp.toString());
		return hashcode;
	}
//时间戳来自客户端，精确到毫秒，但仍旧有可能在在多线程下有并发，
	//尤其hash化后，毫秒数前面的几位都不变化，导致不同日期hash化的值有可能存在相同，
	//因此使用下面的随机数函数，在时间戳上加随机数，保证hash化的结果差异会比较大
	/*
	** randomWord 产生任意长度随机字母数字组合
	** randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
	** 用法  randomWord(false,6);规定位数 flash
	*      randomWord(true,3，6);长度不定，true
	* arr变量可以把其他字符加入，如以后需要小写字母，直接加入即可
	*/
	static randomWord(randomFlag, min, max) {
		let str = "",
			range = min,
			arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
		// 随机产生
		if (randomFlag) {
			range = Math.round(Math.random() * (max - min)) + min;
		}
		for (let i = 0; i < range; i++) {
			let pos = Math.round(Math.random() * (arr.length - 1));
			str += arr[pos];
		}
		return str;
	}
	//产生一个hash值，只有数字，规则和java的hashcode规则相同
	static hashCode(str) {
		let h = 0;
		let len = str.length;
		let t = 2147483648;
		for (let i = 0; i < len; i++) {
			h = 31 * h + str.charCodeAt(i);
			if (h > 2147483647) h %= t; //java int溢出则取模
		}
		/*var t = -2147483648 * 2;
		while (h > 2147483647) {
		h += t
		}*/
		return h;
	}



	static modalList = [];

	static modal(opts) {
		let modal = AntModal.confirm({
			title: <div><span>{opts.title}</span><i onClick={() => { modal.destroy(); }} className="iconfont icon-guanbi"></i></div>,
			className: opts.className ? opts.className : ((opts.noBtn && !opts.double) ? ('mymodal modal-closeable ' + (opts.extClass || '')) : ('mymodal ' + (opts.extClass || ''))),
			// className: opts.className ? opts.className : 'mymodal' + (opts.extClass || ''),
			content: opts.content,
			cancelText: opts.cancelText || "取消",
			okText: opts.okText || '确认',
			icon: null,
			centered: true,
			maskClosable: opts.maskClosable ? opts.maskClosable : false,
			width: opts.width || 650,
			okButtonProps: opts.okButtonProps,
			maskClosable: opts.maskClosable || false,
			closable: opts.closable || true,
			onOk: (e) => {
				return opts.onOk(e)
			},
			onCancel: () => {
				return opts.onCancel ? opts.onCancel() : false
			}
		});
		this.modalList.push(modal)
		return modal;
	}

	static AudioPlayer = (function () {
		var src = null,
			audio;
		return {
			play: function (opts) {
				if (!audio) {
					audio = document.createElement('audio');
					audio.className = 'hide';
					audio.setAttribute('id', 'offerMessageVoice');
				}
				if (src == opts.url) {
					if (!audio.paused) {
						audio.pause();
						if (opts.onPause) {
							opts.onPause();
						}
					} else {
						audio.play();
						if (opts.onPlay) {
							opts.onPlay();
						}
					}
				} else {
					src = opts.url;
					audio.setAttribute('src', src);
					audio.currentTime = 0;
					audio.play();
					if (opts.onPlay) {
						opts.onPlay();
					}
				}
				if (opts.onEnd) {
					audio.onended = function () {
						opts.onEnd();
					}
				}
			},
			pause: function (opts) {
				if (!audio) {
					audio = document.createElement('audio');
					audio.className = 'hide';
					audio.setAttribute('id', 'offerMessageVoice');
				}
				audio.pause();
				if (opts.onPause) {
					opts.onPause();
				}
			},
			stop: function (opts) {
				if (!audio) {
					audio = document.createElement('audio');
					audio.className = 'hide';
					audio.setAttribute('id', 'offerMessageVoice');
				}
				audio.currentTime = 0;
				audio.pause();
				if (opts.onStop) {
					opts.onStop();
				}
			}
		}
	})()

	static amountVerify(amount) {
		if (!amount) {
			return false;
		}
		if (isNaN(amount)) {
			return false;
		}
		if (amount * 1 === 0) {
			return false;
		}
		return true;
	}

	static checkBankAccount(bankAccountNo, call) {
		this.request({
			api: '/api/external/common/bankaccountinfo',
			params: {
				bankAccountNo: bankAccountNo
			},
			success: function (data) {
				call(data)
			}
		})
	}

	static LevenshteinDistance = LevenshteinDistance;

	static imgCompress(config) {
		var that = this;
		config.maxSize = 300 * 1024; //300kb
		this.fileSelector = config.fileSelector; //选择器
		this.maxSize = config.maxSize || false; //图片最大大小，不设为无限度
		this.compressCall = config.compressCall; //压缩回调
		this.dragElement = config.dragElement;
		this.verifyCall = config.verifyCall;
		this.onCompress = config.onCompress;
		this.single = config.single;
		this.resetForm = true;
		if (config.resetForm === false) {
			this.resetForm = false;
		}
		var _this = this;
		var element;
		if (this.fileSelector[0] == '#') {
			element = document.getElementById(this.fileSelector.substring(1, this.fileSelector.length));
		}
		if (this.fileSelector[0] == '.') {
			element = document.getElementsByClassName(this.fileSelector.substring(1, this.fileSelector.length))[0];
		}

		element.onchange = function (e) {
			var files = e.currentTarget.files;
			_this.read(files);
		}

		if (_this.dragElement) {
			if (typeof _this.dragElement != "string") {
				if (!_this.dragElement instanceof Array) {
					throw ("error type of ImgCompress params 'dragElement'");
				}
				try {
					for (var i = 0; i < _this.dragElement.length; i++) {
						var dC = document.getElementById(_this.dragElement[i]);
						dC.ondrop = function (e) {
							e.preventDefault();
							if (e.dataTransfer && e.dataTransfer.files) {
								_this.read(e.dataTransfer.files);
							}
						};
						dC.ondragover = function (ev) {
							ev.preventDefault();
						};
					}
				} catch (e) {
					//TODO handle the exception
					throw ("element with id '" + _this.dragElement + "' not found");
				}
			} else {
				var dC = document.getElementById(_this.dragElement);
				dC.ondrop = function (e) {
					e.preventDefault();
					if (e.dataTransfer && e.dataTransfer.files) {
						_this.read(e.dataTransfer.files);
					}
				};
				dC.ondragover = function (ev) {
					ev.preventDefault();
				};
			}
		}

		_this.read = function (files) {
			var readerArr = [],
				Orientation = []; //图片信息 旋转矫正
			if (files.length == 0) {
				return;
			}
			var re = new RegExp(/^.*[^a][^b][^c]\.(?:png|jpg|bmp|gif|jpeg)$/);
			for (var i = 0; i < files.length; i++) {
				if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(files[i].name.toLocaleLowerCase())) {
					Config.message("warning", "please choose images")
					element.parentNode.reset();
					return;
				}
				readerArr.push(new FileReader());
				if (_this.single) {
					break;
				}
			}
			if (typeof _this.verifyCall == "function") {
				if (!_this.verifyCall(files)) {
					element.parentNode.reset();
					return;
				}
			}
			if (typeof _this.onCompress == "function") {
				_this.onCompress()
			}
			var count = 0;

			for (var i = 0, length = readerArr.length; i < length; i++) {
				var reader = readerArr[i];
				reader.onload = function (e) {
					var com_rate = 1;
					if ((_this.maxSize !== false) && (files[i].size > _this.maxSize)) { //尺寸大于300kb，计算压缩比
						com_rate = _this.maxSize / files[i].size;
					}
					_this.compressImg(e.target.result, com_rate, function (src_data) {
						if (_this.compressCall) {
							_this.compressCall(src_data);
						}
					}, Orientation[i]);
					count++;
					if (count == readerArr.length) {
						if (_this.resetForm) {
							element.parentNode.reset();
						}
					}
				}
			}

			for (var i = 0, length = files.length; i < length; i++) {
				var file = files[i];
				//图片信息查询 配置矫正参数
				// EXIF.getData(file, function() {
				// 	// alert(EXIF.pretty(this));  
				// 	EXIF.getAllTags(this);
				// 	//alert(EXIF.getTag(this, 'Orientation'));   
				// 	Orientation[index] = EXIF.getTag(this, 'Orientation');
				// 	//return;  
				// });
				Orientation[i] = -1;
				readerArr[i].readAsDataURL(file);
				if (_this.single) {
					return false;
				}
			}
		};
		this.compressImg = function (imgData, com_rate, onCompress, rotateInfo) {
			if (!imgData) return;
			onCompress = onCompress || function () { };
			com_rate = com_rate || 1; //压缩比率默认为1

			var img = new Image(),
				rotate = false,
				direction = "",
				rotateTimes = 0;

			if (rotateInfo != "" && rotateInfo != 1) {
				switch (rotateInfo) {
					case 6: //需要顺时针（向左）90度旋转  
						rotate = true;
						direction = 'left';
						rotateTimes = 1;
						break;
					case 8: //需要逆时针（向右）90度旋转  
						rotate = true;
						direction = 'right';
						rotateTimes = 1;
						break;
					case 3: //需要180度旋转  
						rotate = true;
						direction = 'right';
						rotateTimes = 2;
						break;
				}
			}
			var min_step = 0;
			var max_step = 3;
			var step = 2;
			if (step == null) {
				step = min_step;
			}
			if (direction == 'right') {
				step++;
				//旋转到原位置，即超过最大值    
				step > max_step && (step = min_step);
			} else {
				step--;
				step < min_step && (step = max_step);
			}
			var degree = step * 90 * Math.PI / 180;
			img.onload = function () {
				if (com_rate != 1) { //图片大小本身小于300kb，不用压缩，大于300才压缩，压缩输出jpg，忽略精度,忽略输出大小
					if (img.height > that.OFFER_IMG_MAXWIDTH || img.width > that.OFFER_IMG_MAXWIDTH) {
						var th, tw;
						if (img.height > img.width) {
							if (img.width > that.OFFER_IMG_MAXWIDTH) {
								tw = that.OFFER_IMG_MAXWIDTH;
								th = that.OFFER_IMG_MAXWIDTH * img.height / img.width;
							} else {
								tw = img.width;
								th = img.height;
							}
						} else {
							if (img.height > that.OFFER_IMG_MAXWIDTH) {
								th = that.OFFER_IMG_MAXWIDTH;
								tw = that.OFFER_IMG_MAXWIDTH * img.width / img.height;
							} else {
								tw = img.width;
								th = img.height;
							}
						}
						img.width = tw;
						img.height = th;
					}
				}

				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext("2d");
				//				ctx.clearRect(0, 0, canvas.width, canvas.height); // canvas清屏
				if (rotate) {
					switch (step) {
						case 0:
							canvas.width = img.width;
							canvas.height = img.height;
							ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
							break;
						case 1:
							canvas.width = img.height;
							canvas.height = img.width;
							ctx.translate(canvas.width / 2, canvas.height / 2); //设置画布上的(0,0)位置，也就是旋转的中心点
							ctx.rotate(degree);
							ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
							break;
						case 2:
							canvas.width = img.width;
							canvas.height = img.height;
							ctx.translate(canvas.width / 2, canvas.height / 2); //设置画布上的(0,0)位置，也就是旋转的中心点
							ctx.rotate(degree);
							ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
							break;
						case 3:
							canvas.width = img.height;
							canvas.height = img.width;
							ctx.translate(canvas.width / 2, canvas.height / 2); //设置画布上的(0,0)位置，也就是旋转的中心点
							ctx.rotate(degree);
							ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
							//							ctx.drawImage(img, -img.width, 0, canvas.width, canvas.height);
							break;
					}
				} else {
					canvas.width = img.width;
					canvas.height = img.height;
					ctx.drawImage(img, 0, 0, img.width, img.height);
				}
				onCompress(canvas.toDataURL("image/jpeg"));
			};
			img.src = imgData;
		}
	}

	static trimParam(obj) {
		if (obj === null) {
			return null;
		}
		if (obj === undefined) {
			return undefined;
		}
		if (typeof obj !== 'object') {
			if (typeof obj === 'string') {
				return obj.trim()
			} else {
				return obj
			}
		}
		var newObj = obj instanceof Array ? [] : {}
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				newObj[key] = typeof obj[key] === 'string' ? obj[key].trim() : this.trimParam(obj[key])
			}
		}
		return newObj
	}

	static formatAddress(address){
		return address.match(/.+?(省|市|自治区|自治州|县|区)/g)
	}


}

window.getUtrailerConfig = function () {
	return Config;
}