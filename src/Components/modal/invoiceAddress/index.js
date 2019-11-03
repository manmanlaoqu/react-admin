import React from 'react';
import Selector from '../../lib/address-search';
import Utils from 'utils/utils';
import Map from '../../lib/map/chose';
import CitySelector from '../../yg-lib/citySelectorVal';
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import Storage from 'gc-storage/es5';


let cityTree = Storage.get('dictionary').location;

export default class extends React.Component {

    constructor(props) {
        super(props);
        let contact = this.props.contact||{}
        this.state = {
            contact: contact,
            province: {},
            city: {}
        };
        this.cityMap = {};
        this.state.contact.cityInfo = {
            city:{
                code:contact.cityCode||null,
                name:contact.cityName||null
            },
            province: {
                code:contact.provinceCode||null,
                name:contact.provinceName||null
            }
        };
        let that = this;
        cityTree.map((province) => {
            that.cityMap[province.code] = province.nodes;
            return {
                code: province.code,
                name: province.name
            }
        })
        if (this.state.contact.lon && this.state.contact.lat) {
            let pos = Utils.bd_decrypt(this.state.contact.lon, this.state.contact.lat);
            this.state.contact.longitude = pos.lng;
            this.state.contact.latitude = pos.lat;
            this.state.positionSelected = true;

            this.state.province = {
                name: this.state.contact.provinceName,
                code: this.state.contact.provinceCode
            };
            this.state.cities = this.cityMap[this.state.province.code]
            this.state.city = {
                name: this.state.contact.cityName,
                code: this.state.contact.cityCode
            };
            this.state.cityCode = this.state.contact.cityCode;
        }
    }

    input(val, key) {
        if (key == 'phone') {
            val = val.toNum()
        }
        this.state.contact[key] = val;
        this.setState({
            ...this.state.contact,
        }, function () {
            this.props.notifyChange(this.state.contact)
        })
    }

    onChange(roleId, obj) {
        this.setState({
            ...this.state,
            roleId: roleId,
            remark: obj.remark
        }, function () {
            this.props.notifyChange(this.state)
        })
    }

    getData() {
        return this.state;
    }


    showMap() {
        if (!this.state.contact.cityInfo.city || !this.state.contact.cityInfo.city.code) {
            return
        }
        let modal = Utils.modal({
            content: <Map onChoosen={(info) => { this.onChoosen.bind(this, info)(); modal.destroy() }}
                position={this.state.contact}
                label={this.state.contact.address}
                city={this.state.contact.cityInfo.city}
                mapStyle={Utils.mapStyle} />,
            noBtn: true,
            width: 864,
            height: 400
        })
    }

    onChoosen(info) {
        this.setState({
            contact: {
                ...this.state.contact,
                ...info
            },
            positionSelected: true
        }, function () {
            this.props.notifyChange(this.state.contact)
        })
    }

    onCityChange(city) {
        this.state.contact.cityInfo.city = city;
        this.state.contact.address = '';
        this.props.notifyChange(this.state.contact)
        this.setState({
            positionSelected: false,
        })
    }
    onProvinceChange(province) {
        this.state.contact.address = '';
        this.state.contact.location = null;
        this.state.contact.longitude = null;
        this.state.contact.cityInfo.province = province;
        this.state.contact.cityInfo.city = {};
        this.props.notifyChange(this.state.contact)
        this.setState({
            positionSelected: false,
        })
    }

    render() {
        return (
            <LocaleProvider locale={zh_CN}>
                <div className="ant-table ant-table-default">
                    <div className="ant-table-content">
                        <div className="ant-table-body form-table">
                            <div className="group-head">
                                <span>联系人信息</span>
                            </div>
                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>联系人</span>
                                        </td>
                                        <td className="column">
                                            <input maxLength={20} placeholder="联系人" value={this.state.contact.contactName} onChange={(e) => this.input.bind(this, e.target.value, 'contactName')()} type="text" />
                                        </td>
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>地址</span>
                                        </td>
                                        <td className="column">
                                            <CitySelector
                                                province={this.state.province}
                                                city={this.state.city}
                                                onProvinceChange={(province) => {
                                                    this.setState({
                                                        province,
                                                        city: {}
                                                    })
                                                    this.onProvinceChange(province)
                                                }}
                                                onCityChange={(city) => {
                                                    this.setState({
                                                        city
                                                    })
                                                    this.onCityChange(city)
                                                }}
                                                cityTree={cityTree} />
                                        </td>
                                    </tr>
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>联系电话</span>
                                        </td>
                                        <td className="column">
                                            <input maxLength={11} placeholder="联系电话" value={this.state.contact.contactPhone} onChange={(e) => this.input.bind(this, e.target.value.toNum(), 'contactPhone')()} type="text" />
                                        </td>
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>详细地址</span>
                                        </td>
                                        <td className="column">
                                            <div style={{ position: 'relative' }}>
                                                <Selector
                                                    className="place-search"
                                                    placeholder="请选择详细地址"
                                                    onSelect={(data) => {
                                                        this.onChoosen(data);
                                                    }}
                                                    cityInfo={this.state.contact.cityInfo}
                                                    value={this.state.contact.address}
                                                    cityCode={this.state.contact.cityInfo.city ? (this.state.contact.cityInfo.city.code || '010') : '010'}
                                                    disabled={!this.state.contact.cityInfo.city || !this.state.contact.cityInfo.city.code}
                                                />
                                                <i className="iconfont icon-didian-copy" style={{ cursor: 'pointer', position: 'absolute', right: '6px', top: '6px', color: 'rgb(0, 153, 255)' }} onClick={this.showMap.bind(this)}></i>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </LocaleProvider>
        )
    }
}

