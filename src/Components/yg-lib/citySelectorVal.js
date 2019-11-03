import React from 'react';
import { Select } from 'antd';
import Utils from 'utils/utils';
import './index.scss';

const Option = Select.Option;

export default class extends React.Component {

    constructor(props) {
        super(props)
        let tree = this.props.cityTree;
        let that = this;
        that.cityMap = {};
        this.state = {
            province: tree.map((province) => {
                that.cityMap[province.code] = province.nodes;
                return {
                    code: province.code,
                    name: province.name
                }
            })
        }
    }


    handleProvinceChange = (value, e) => {
        this.props.city.code = ''
        this.props.onProvinceChange(e.props.province);
    }

    onSecondCityChange = (value, e) => {
        if (!this.props.province.code) {
            Utils.Message.error('请先选择省')
            return
        }
        this.props.onCityChange(e.props.city);
    }

    render() {
        const provinceOptions = this.state.province.map(province => <Option province={province} key={province.code}>{province.name}</Option>);
        let cities = this.cityMap[this.props.province.code] || [];
        const cityOptions = cities.map(city => <Option city={city} key={city.code}>{city.name}</Option>);
        return (
            <div className="city-selector" style={this.props.style || {}}>
                <Select placeholder="请选择省"
                    showSearch
                    filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    disabled={this.props.disabled}
                    value={this.props.province.code}
                    style={{ width: '50%' }}
                    onChange={this.handleProvinceChange}>
                    {provinceOptions}
                </Select>
                <Select placeholder="请选择市"
                    showSearch
                    filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    disabled={this.props.disabled}
                    value={this.props.city.code}
                    style={{ width: '50%' }}
                    onChange={this.onSecondCityChange}>
                    {cityOptions}
                </Select>
            </div>
        );
    }
}