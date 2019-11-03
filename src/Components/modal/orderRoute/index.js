import React from 'react';
import { Tooltip, Steps, Skeleton } from 'antd';
import { Map, Marker, Circle } from 'react-amap';
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import Utils from 'utils/utils';
import ScrollBar from 'smooth-scrollbar';
import './index.scss'

const styleA = {
    position: 'absolute',
    fontSize: '10px',
    top: '10px',
    left: '10px',
    color: '#fff',
    padding: '5px 10px',
    border: '1px solid #d3d3d3',
    backgroundColor: 'rgba(0,0,0,0.3)'
}
const styleB = {
    position: 'absolute',
    fontSize: '10px',
    top: '10px',
    right: '10px',
    color: '#fff',
    textAlign: 'right',
    padding: '5px 10px',
    border: '1px solid #d3d3d3',
    backgroundColor: 'rgba(0,0,0,0.3)'
}
const columns = [{
    title: '校验类型',
    dataIndex: 'triggerTypeName'
}, {
    title: '定位方式',
    dataIndex: 'locationType',
    render: (type) => {
        switch (type) {
            case 0:
                return '车机定位';
            case 1:
                return '基站定位';
            default:
                return '';
        }
    }
}, {
    title: '位置',
    dataIndex: 'locCity',
}, {
    title: '偏差距离',
    dataIndex: 'distance',
    render: (distance) => {
        if (!distance) {
            return '';
        }
        return (distance / 1000).toFixed(2) + 'km'
    }
}, {
    title: '校验结果',
    dataIndex: 'valid',
    render: (valid) => {
        return valid ? '通过' : '不通过'
    }
}, {
    title: '校验时间',
    dataIndex: 'createTime',
    render: (time) => {
        return time ? (new Date(time).format('yyyy-MM-dd hh:mm')) : ''
    }
}];


const plugins = [
    'Scale',
    'OverView',
    // 'ControlBar', // v1.1.0 新增
    {
        name: 'ToolBar',
        options: {
            visible: true, // 不设置该属性默认就是 true
            onCreated(ins) {
                // console.log(ins);
            },
        },
    }
]

const { Step } = Steps;

const getColorBySpeed = function (speed) {
    speed = parseInt(speed)
    if (speed < 10) {
        return '#5FB878'
    } else if (speed < 40) {
        return '#FBD249'
    } else if (speed < 60) {
        return '#F5A623'
    } else if (speed < 80) {
        return '#ff7800';
    } else {
        return '#dd514c'
    }
}

export default class extends React.Component {
    constructor(props) {
        super(props);
        // Good Practice
        this.id = 'locList-id-' + Utils.guid();
        let that = this, arrTimeMills = this.props.arriveTime, rechTimeMills = this.props.reachTime;
        this.state = {
            center: (function () {
                return { longitude: '102.2382812500', latitude: '33.6751474361' }
            })(),
            arriveTimeStr: new Date(this.props.arriveTime).format('yyyy-MM-dd hh:mm'),
            reachTimeStr: new Date(this.props.reachTime).format('yyyy-MM-dd hh:mm'),
            hoverList: [],
            hoverListAddressMap: {},
            hoverMarker: []
        };
        let circle = [];
        let markerIndex = 0;
        this.state.marker = (function () {
            let from = (function () {
                return that.props.from.map((address, index) => {
                    markerIndex++;
                    return <Marker key={markerIndex} position={(function () {
                        let pos = Utils.bd_decrypt(address.longitude, address.latitude)
                        circle.push(<Circle
                            center={{ longitude: pos.lng, latitude: pos.lat }}
                            radius={parseInt(that.props.range||50*1000)}
                            style={{ fillColor: '#5ba1e2', fillOpacity: '0.1', strokeStyle: 'dashed', strokeColor: '#5ba1e2', strokeWeight: '1' }}
                        />)
                        return {
                            longitude: pos.lng,
                            latitude: pos.lat
                        }
                    })()}>
                        <Tooltip placement="topLeft" title={'装货点'}>
                            <span className="route-check-from"></span>
                        </Tooltip>
                    </Marker>
                })
            }())
            let to = (function () {
                return that.props.to.map((address, index) => {
                    markerIndex++;
                    return <Marker key={markerIndex} position={(function () {
                        let pos = Utils.bd_decrypt(address.longitude, address.latitude)
                        circle.push(<Circle
                            center={{ longitude: pos.lng, latitude: pos.lat }}
                            radius={parseInt(that.props.range||50*1000)}
                            style={{ fillColor: '#5ba1e2', fillOpacity: '0.1', strokeStyle: 'dashed', strokeColor: '#5ba1e2', strokeWeight: '1' }}
                        />)
                        return {
                            longitude: pos.lng,
                            latitude: pos.lat
                        }
                    })()}>
                        <Tooltip placement="topLeft" title={'卸货点'}>
                            <span className="route-check-to"></span>
                        </Tooltip>
                    </Marker>
                })
            }())
            from = from.concat(to);
            return from
        })();

        let _3to9 = function (mills, type) {
            let dis = (mills - arrTimeMills);
            switch (type) {
                case 0:
                    dis = (mills - arrTimeMills);
                    break;
                case 1:
                    dis = (mills - rechTimeMills);
                    break;
                default:
                    dis = 0;
            }
            return dis > (-3 * 60 * 60 * 1000) && dis < (9 * 60 * 60 * 1000);
        }

        var locPath = this.props.list.map((location, index) => {
            markerIndex++;
            location.gpsTime = location.createTime
            let className = "route-check-loc ";
            if (_3to9(location.createTime, 0) && location.triggerType == 0) {
                className += 'from';
            } else if (_3to9(location.createTime, 1) && location.triggerType == 1) {
                className += 'to';
            } else {
                className += '';
            }
            let pos = Utils.bd_decrypt(location.longitude, location.latitude)
            location.lng = pos.lng
            location.lat = pos.lat
            return (function () {
                that.state.marker.push(<Marker key={markerIndex} position={{
                    longitude: pos.lng,
                    latitude: pos.lat,
                }}>
                    <Tooltip placement="topLeft" title={(location.triggerType == 0 ? '发车校验' : '到站校验') + '，校验时间：' + new Date(location.createTime).format('yyyy-MM-dd hh:mm') + ',目标点距离：' + location.distance ? ((location.distance / 1000).toFixed(2) + 'km') : ''}>
                        <span className={className}></span>
                    </Tooltip>
                </Marker>)
                return new window.AMap.LngLat(pos.lng, pos.lat)
            })()
        })

        this.state.circle = circle;
        this.placeSearch = null;
        that.geocoder = null;
        this.mapEvents = {
            created: (map) => {
                this.mapInstance = map;
                map.setMapStyle('amap://styles/' + Utils.mapStyle)
                var hoverList = new Array(), paths = [], lastSpeed, lastDot
                var path = (function () {
                    if (that.props.routes.length == 0) {
                        return locPath;
                    } else {
                        var len = that.props.routes
                        var gCount = Math.floor(that.props.routes.length / 20)

                        hoverList = hoverList.concat(that.props.list)
                        return that.props.routes.map((dot, index) => {
                            if (index % gCount === 0 || index === len) {
                                hoverList.push(dot)
                            }
                            let pos = Utils.bd_decrypt(dot.lon, dot.lat)
                            dot.lng = pos.lng
                            dot.lat = pos.lat
                            if (!lastSpeed || Math.abs(dot.gpsSpeed - lastSpeed) > 10) {
                                paths.push({
                                    color: getColorBySpeed(dot.gpsSpeed),
                                    speeds: lastSpeed ? [lastSpeed] : [],
                                    path: lastDot ? [lastDot] : []
                                })
                            }
                            lastDot = new window.AMap.LngLat(pos.lng, pos.lat)
                            lastSpeed = dot.gpsSpeed
                            paths[paths.length - 1].path.push(lastDot)
                            paths[paths.length - 1].speeds.push(lastSpeed)
                            // return (function () {
                            //     return new window.AMap.LngLat(pos.lng, pos.lat)
                            // })()
                        })
                    }
                })()
                hoverList.sort(function (a, b) {
                    return a.gpsTime - b.gpsTime
                })
                that.setState({
                    hoverList
                }, function () {
                    that.state.hoverList.map((loc, idx) => {
                        (function (index) {
                            Utils.geocoder.getAddress([loc.lng, loc.lat], function (status, result) {
                                if (status === 'complete' && result.info === 'OK') {
                                    // result为对应的地理位置详细信息
                                    that.state.hoverListAddressMap[index] = result.regeocode.formattedAddress
                                    hoverList.address = result.regeocode.formattedAddress
                                    that.setState({
                                        hoverListAddressMap: that.state.hoverListAddressMap
                                    })
                                }
                            })
                        })(idx)
                    })
                })
                // 创建折线实例
                if (paths.length > 0) {
                    paths.map(path => {
                        var polyline = new window.AMap.Polyline({
                            path: path.path,
                            borderWeight: 1, // 线条宽度，默认为 1
                            strokeColor: path.color, // 线条颜色
                            lineJoin: 'round' // 折线拐点连接处样式
                        });
                        map.add(polyline);
                    })
                } else {
                    var polyline = new window.AMap.Polyline({
                        path: path,
                        borderWeight: 1, // 线条宽度，默认为 1
                        strokeColor: '#ff7800', // 线条颜色
                        lineJoin: 'round' // 折线拐点连接处样式
                    });
                    // 将折线添加至地图实例
                    map.add(polyline);
                }

            },
            moveend: () => { }
        };
    }

    componentDidMount() {
        ScrollBar.init(document.getElementById(this.id));
    }

    hoverMarker(loc, index,islast) {
        this.mapInstance.setCenter(new window.AMap.LngLat(loc.lng, loc.lat))
        this.mapInstance.setZoom(8)
        this.setState({
            hoverMarker: <Marker key={'hover-marker'} offset={new window.AMap.Pixel(-5, -5)} position={{
                longitude: loc.lng,
                latitude: loc.lat
            }}>
                <div className="order-loc-box">
                    <i className="iconfont icon-dot-circle"></i>
                    <div className="order-loc-info">
                        <div className="title"><i className="icon-dot iconfont"></i>{islast?'最新位置':'历史位置'}</div>
                        <div className="time">{new Date(loc.gpsTime).format('yyyy-MM-dd hh:mm')}</div>
                        <div className="address">{this.state.hoverListAddressMap[index]}</div>
                    </div>
                </div>
            </Marker>
        })
    }

    render() {
        let that = this
        return (
            <LocaleProvider locale={zh_CN}>
                <div style={{ width: '100%', height: '360px', border: '1px solid #e2e2e3' }}>
                    <div style={{ width: '800px', height: '100%', display: 'inline-block' }}>
                        <Map center={this.state.center} zoom={3.5} events={this.mapEvents} amapkey={Utils.amapkey} plugins={plugins} mapStyle={Utils.mapStyle}>
                            {this.state.marker}
                            {this.state.hoverMarker}
                            {this.state.circle}
                            <div className="customLayer" style={styleA}>
                                <div>预计发车时间：{this.state.arriveTimeStr}</div>
                                <div>预计到站时间：{this.state.reachTimeStr}</div>
                            </div>
                            <div className="customLayer" style={styleB}>
                                <div>行驶速度</div>
                                <div>{'<10km/h'}<span style={{ display: 'inline-block', width: '100px', height: '3px', marginLeft: '12px', backgroundColor: '#5FB878' }}></span></div>
                                <div>{'10-40km/h'}<span style={{ display: 'inline-block', width: '100px', height: '3px', marginLeft: '12px', backgroundColor: '#FBD249' }}></span></div>
                                <div>{'40-60km/h'}<span style={{ display: 'inline-block', width: '100px', height: '3px', marginLeft: '12px', backgroundColor: '#F5A623' }}></span></div>
                                <div>{'60-80km/h'}<span style={{ display: 'inline-block', width: '100px', height: '3px', marginLeft: '12px', backgroundColor: '#ff7800' }}></span></div>
                                <div>{'>80km/h'}<span style={{ display: 'inline-block', width: '100px', height: '3px', marginLeft: '12px', backgroundColor: '#dd514c' }}></span></div>
                            </div>
                        </Map>
                    </div>
                    <div id={this.id} className="order-route-step" style={{ width: 'calc(100% - 800px)', height: '100%', display: 'inline-block', verticalAlign: 'top' }}>
                        {this.state.hoverList.length > 0 ?
                            <div style={{ padding: '12px' }}>
                                <Steps direction={'vertical'}>
                                    {this.state.hoverList.map((loc, index) => {
                                        return <Step onMouseOver={this.hoverMarker.bind(this, loc, index,index==0)}
                                            icon={index==0?<div className="stepSpot curr"></div>:<div className="stepSpot"></div>}
                                            title={<span className="step-title">{new Date(loc.gpsTime).format('yyyy-MM-dd hh:mm')} {loc.triggerTypeName ? <span className={`step-title-loc ${loc.valid ? 'valid' : ''}`}>{loc.triggerTypeName + (loc.valid ? '通过' : '失败')}</span> : null}</span>}
                                            key={index}
                                            description={<Skeleton on active loading={that.state.hoverListAddressMap[index] ? false : true}>
                                                <span>{that.state.hoverListAddressMap[index]}</span>
                                            </Skeleton>} />
                                    })}
                                </Steps>
                            </div> : <div className="empty">
                                <i className="iconfont icon-didian-copy"></i>
                                <div className="desc">暂无轨迹</div>
                            </div>}
                    </div>
                </div>
            </LocaleProvider>
        )
    }
}


