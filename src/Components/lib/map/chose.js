import React from 'react';
import { Map, Marker } from 'react-amap';
import Utils from 'utils/utils';

const styleA = {
    position: 'absolute',
    top: '10px',
    zIndex: 200,
    left: '10px',
    padding: '5px 10px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0px 0px 12px #aaaaaa'
}

const searchStyle = {
    cursor: 'pointer',
    marginLeft: '12px',
    fontSize: '20px',
    float: 'right'
}

function parseDom(arg) {
    var objE = document.createElement("div");
    objE.innerHTML = arg;
    return objE.childNodes;
};
const plugins = [
    'Scale',
    'OverView',
    // 'ControlBar', // v1.1.0 新增
    {
        name: 'ToolBar',
        options: {
            visible: true, // 不设置该属性默认就是 true
            onCreated(ins) {
            },
        },
    }
]
export default class extends React.Component {
    constructor(props) {
        super(props);
        // Good Practice
        let that = this;
        this.state = {
            center: (function () {
                if (!that.props.position) {
                    return null;
                }
                if (!that.props.position.longitude) {
                    return null
                }
                if (that.props.tranform) {
                    let pos = Utils.bd_decrypt(that.props.position.longitude, that.props.position.latitude);
                    return { longitude: pos.lng, latitude: pos.lat }
                }
                return { longitude: that.props.position.longitude, latitude: that.props.position.latitude }
            })(),
        };
        this.state.marker = (function () {
            if (!that.props.position) {
                return '';
            }
            if (!that.props.position.longitude) {
                return ''
            }
            return <Marker title={that.props.label} position={that.state.center} />
        })();
        this.placeSearch = null;
        that.geocoder = null;
        this.mapEvents = {
            created: (map) => {
                this.mapInstance = map;
                let that = this, marker;
                if (that.props.city) {
                    that.mapInstance.setCity(that.props.city.name);
                }
                map.setMapStyle('amap://styles/' + Utils.mapStyle)
                window.AMap.service(["AMap.PlaceSearch"], function () {
                    that.placeSearch = new window.AMap.PlaceSearch({ //构造地点查询类
                        pageSize: 10,
                        pageIndex: 1,
                        citylimit: false,
                        map: map,
                    });
                    //关键字查询
                    // placeSearch.search('北京大学');
                });
                window.AMap.plugin('AMap.Geocoder', function () {
                    that.geocoder = new window.AMap.Geocoder({
                    })

                    // var lnglat = [116.396574, 39.992706]
                })
                window.AMap.event.addListener(map, "click", function (e) {
                    that.geocoder.getAddress([e.lnglat.lng, e.lnglat.lat], function (status, result) {
                        if (status === 'complete' && result.info === 'OK') {
                            try {
                                map.remove(marker)
                            } catch (e) {

                            }
                            let arr = Utils.formatAddress(result.regeocode.formattedAddress)
                            let address = result.regeocode.formattedAddress.replace(result.regeocode.addressComponent.province, '').replace(result.regeocode.addressComponent.city, '').replace(result.regeocode.addressComponent.district, '')
                            marker = new window.AMap.Marker({
                                position: new window.AMap.LngLat(e.lnglat.lng, e.lnglat.lat),   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                                map: map
                            });

                            let infoWindow = new window.AMap.InfoWindow({
                                isCustom: true,  //使用自定义窗体
                                content: contentCreater({
                                    latitude: e.lnglat.lat,
                                    longitude: e.lnglat.lng,
                                    provinceName: arr[0],
                                    cityName: arr[1],
                                    countryName: arr[2],
                                    countryCode: result.regeocode.addressComponent.adcode,
                                    formatAddress: result.regeocode.formattedAddress,
                                    address
                                }),
                                offset: new window.AMap.Pixel(16, -45)
                            });
                            infoWindow.open(map, marker.getPosition());
                        } else {
                            Utils.Message.warning('无法识别该地址，您可以搜索试试！');
                        }
                    })

                });
                let contentCreater = function (info) {
                    let dom = parseDom(
                        `<div style="background:#fff;width:260px;display:inline-block;box-shadow:1px 1px 6px #cccccc;padding:12px";position:relative}>
                        <i style="position:absolute;right:4px;top:4px;font-size:10px;cursor:pointer" class="iconfont icon-guanbi"></i>
                        <div>${info.provinceName || ''}${info.cityName || ''}${info.countryName || ''}</div>
                        <div>地址：${info.address}</div>
                        <div class="ant-popover-arrow" style=" position: absolute;left: 42%;bottom: -4px;border-color:#fff"></div>
                        </div>`
                    )
                    let d = parseDom(
                        "<div style='text-align:right;padding-top:8px'><button class='ant-btn ant-btn-primary'>选择</button></div>"
                    )
                    d[0].getElementsByTagName('button')[0].onclick = function () {
                        that.choseAddress.bind(that, info)()
                    }

                    dom[0].getElementsByClassName('icon-guanbi')[0].onclick = function () {
                        map.clearInfoWindow();
                    }
                    dom[0].appendChild(d[0]);
                    return dom[0]
                }
                window.AMap.event.addListener(that.placeSearch, "markerClick", function (e) {
                    let countryName, provinceName, cityName, address, countryCode
                    if (['北京市', '上海市', '重庆市', '天津市'].indexOf(e.data.pname) > -1) {
                        provinceName = e.data.cityname
                        cityName = e.data.adname
                    } else {
                        provinceName = e.data.pname
                        cityName = e.data.cityname
                        countryName = e.data.adname
                        countryCode = e.data.adcode
                    }
                    address = e.data.name + `(${e.data.address})`
                    let infoWindow = new window.AMap.InfoWindow({
                        isCustom: true,  //使用自定义窗体
                        content: contentCreater({
                            latitude: e.data.location.lat,
                            longitude: e.data.location.lng,
                            address: address,
                            formatAddress: (provinceName || '') + (cityName || '') + (countryName || '') + address,
                            provinceName,
                            cityName,
                            countryName,
                            countryCode
                        }),
                        offset: new window.AMap.Pixel(16, -45)
                    });
                    infoWindow.open(map, e.marker.getPosition());
                })
            },
            // click: (e,a) => {
            //     console.log(e)
            //     console.log(a)
            // },
            moveend: () => { }
        };
    }

    choseAddress(info) {
        delete info['id']
        this.props.onChoosen(info)
    }

    record(val) {
        this.searchWord = val;
    }

    search() {
        if (!this.searchWord) {
            return;
        }
        this.placeSearch.search(this.searchWord, function (a, result) {
            // Utils.confirm({

            // })
        });
    }

    keyDonwSearch(e) {
        if (e.keyCode === 13) {
            this.search();
        }
    }

    render() {
        return <div style={{ width: 800, height: 400 }}>
            <Map center={this.state.center} zoom={8} amapkey={Utils.amapkey} events={this.mapEvents} plugins={plugins}>
                <div className="customLayer" style={styleA}>
                    <input onKeyDown={this.keyDonwSearch.bind(this)} maxLength={20} style={{ border: 'none', borderBottom: '1px solid #ccc', paddingBottom: '3px' }} type="text" onChange={(e) => this.record.bind(this, e.target.value)()} />
                    <i onClick={this.search.bind(this)} style={searchStyle} className="iconfont icon-search"></i>
                </div>
                {this.state.marker}
            </Map>

        </div>
    }
}