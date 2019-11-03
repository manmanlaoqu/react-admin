import React from 'react';
import { Select } from 'antd';
import './index.scss';

const Option = Select.Option;

export default class extends React.Component {

    constructor(props) {
        super(props)
        let tree = this.props.cityTree;
        let that = this;
        that.cityMap = {};
        this.state = {
            province: tree.map((province)=>{
                that.cityMap[province.code] = province.nodes;
                return {
                    code:province.code,
                    name:province.name
                }
            })
        }
        if(this.props.initValue.province){
            this.state.initProvince = this.props.initValue.province;
            this.state.cities = that.cityMap[this.state.initProvince.code]
            this.state.city =  this.props.initValue.city;
            this.state.cityCode =  this.props.initValue.city.code;
        }else{
            // this.state.initProvince = this.state.province[0];
            this.state.cities = that.cityMap[this.state.province[0].code]
            this.state.city =  this.state.cities[0];
            // this.state.cityCode =  this.state.cities[0].code;
        }
    }


    handleProvinceChange = (value,e) => {
        this.setState({
            cities: this.cityMap[value],
            cityCode:this.cityMap[value][0].code
        });
        this.props.onProvinceChange(e.props.province);
        this.props.onCityChange(this.cityMap[value][0]);
    }

    onSecondCityChange = (value,e) => {
        this.setState({
            cityCode: value,
        });
        this.props.onCityChange(e.props.city);
    }

    render() {
        const provinceOptions = this.state.province.map((province,index) => {
            return <Option province={province} key={index}>{province.name}</Option>
        });
        const cityOptions = this.state.cities.map((city,index) => {
            return <Option city={city} key={index}>{city.name}</Option>;
        });
        return (
            <div className="city-selector" style={this.props.style||{}}>
                <Select placeholder="请选择省" defaultValue={this.state.initProvince} style={{ width: 120 }} onChange={this.handleProvinceChange}>
                    {provinceOptions}
                </Select>
                <Select placeholder="请选择城市" value={this.state.cityCode} style={{ width: 120 }} onChange={this.onSecondCityChange}>
                    {cityOptions}
                </Select>
            </div>
        );
    }
}