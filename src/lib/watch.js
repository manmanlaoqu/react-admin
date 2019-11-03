const LazWatch = (function () {
    let $option = {
        ACCOUNT: 'none',
        api:{}
    }, loadTime
    let $requestStatistic = {}
    let $lifeCycleStatistic = {}
    const onUnLoad = function () {
        if(!$option.api.unload){
            return
        }
        post($option.API + $option.api.unload, (() => {
            let data = new FormData()
            data.append('data', JSON.stringify({
                account: $option.ACCOUNT,
                start: new Date(loadTime).toLocaleString(),
                end: new Date().toLocaleString(),
                stayTime: (Date.now() - loadTime) + 'ms',
                lifeCycles:$lifeCycleStatistic,
                requestStatistic:$requestStatistic
            }))
            return data
        })())
    }
    const onError = function (error) {
        if(!$option.api.error){
            return
        }
        post($option.API + $option.api.error, (() => {
            let data = new FormData()
            data.append('data', JSON.stringify(error))
            return data
        })())
    }
    const post = function (url, data) {
        if (navigator.sendBeacon) {
            navigator.sendBeacon(url, data)
        } else {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("POST", url, false);
            xmlhttp.send(data);
        };
    }
    return {
        getTestFun() {
            return {
                onUnLoad: onUnLoad
            }
        },
        watch(options) {
            new Promise((resolve, reject) => {
                if (!$requestStatistic[options.api]) {
                    $requestStatistic[options.api] = {
                        reponseCounts: 0,// request counts
                        resolveCounts: 0,// resolve counts
                        maxRespDuration: 0,// max response duration
                        minRespDuration: 0,// min response duration
                        maxReslvDuration: 0,// max resolve duration
                        minReslvDuration: 0,//min resolve duration
                        totalRespTime: 0,
                        totalReslvTime: 0,
                        averageRespTime: 0,
                        averageReslvTime: 0
                    }
                }
                switch (options.$$type) {
                    case 'response':
                        $requestStatistic[options.api].reponseCounts = $requestStatistic[options.api].reponseCounts + 1
                        $requestStatistic[options.api].totalRespTime = $requestStatistic[options.api].totalRespTime + options.time
                        $requestStatistic[options.api].averageRespTime = $requestStatistic[options.api].totalRespTime / $requestStatistic[options.api].reponseCounts
                        if (options.time > $requestStatistic[options.api].maxRespDuration) {
                            $requestStatistic[options.api].maxRespDuration = options.time
                        }
                        if (options.time < $requestStatistic[options.api].minRespDuration) {
                            $requestStatistic[options.api].minRespDuration = options.time
                        }
                        break;
                    case 'resolve':
                        $requestStatistic[options.api].resolveCounts = $requestStatistic[options.api].resolveCounts + 1
                        $requestStatistic[options.api].totalReslvTime = $requestStatistic[options.api].totalReslvTime + options.time
                        $requestStatistic[options.api].averageReslvTime = $requestStatistic[options.api].totalReslvTime / $requestStatistic[options.api].resolveCounts
                        if (options.time > $requestStatistic[options.api].maxReslvDuration) {
                            $requestStatistic[options.api].maxReslvDuration = options.time
                        }
                        if (options.time < $requestStatistic[options.api].minReslvDuration) {
                            $requestStatistic[options.api].minReslvDuration = options.time
                        }
                        break;
                }
            })
        },
        LifeCycle(pageName) {
            this.page = pageName
            if (!$lifeCycleStatistic[pageName]) {
                $lifeCycleStatistic[pageName] = {
                    desc: pageName,
                    cycles: [],//child {from:timestamp,to:timestamp,interval:time}
                }
            }
            let cycle
            this.start = function () {
                cycle = {
                    from: Date.now(),
                }
                return function () {
                    cycle.to = Date.now()
                    cycle.interval = cycle.to - cycle.from
                    $lifeCycleStatistic[pageName].cycles.push(cycle)
                    cycle = null
                }
            }
            this.end = function () {
                if (!cycle || !cycle.from) {
                    throw new Error(`cycle parameter 'from' has not been set!`)
                }
                cycle.to = Date.now()
                cycle.interval = cycle.to - cycle.from
                $lifeCycleStatistic[pageName].cycles.push(cycle)
                cycle = null
                return this
            }
        },
        init(options) {
            $option = options
            window.addEventListener('load', function () {
                loadTime = Date.now()
            });
            window.addEventListener('unload', function () {
                onUnLoad()
            })
            window.onerror = function (msg, url, line, col, error) {
                if (msg != "Script error." && !url) {
                    return true;
                }
                new Promise(resolve => {
                    var data = {};
                    col = col || (window.event && window.event.errorCharacter) || 0;
                    data.url = url;
                    data.line = line;
                    data.col = col;
                    if (!!error && !!error.stack) {
                        data.msg = error.stack.toString();
                    } else if (!!arguments.callee) {
                        var ext = [];
                        var f = arguments.callee.caller, c = 3;
                        while (f && (--c > 0)) {
                            ext.push(f.toString());
                            if (f === f.caller) {
                                break;
                            }
                            f = f.caller;
                        }
                        ext = ext.join(",");
                        data.msg = error.stack.toString();
                    }
                    data.browserInfo = $option.browserInfo
                    resolve(data)
                }).then((data) => {
                    onError(data)
                })
                return false;
            };
        },
        update(options) {
            for (let k in options) {
                if (options[k]) {
                    $option[k] = options[k]
                }
            }
        }
    }
})()
window.LazWatch = LazWatch
export default LazWatch