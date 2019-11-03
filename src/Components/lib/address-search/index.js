import React from 'react';
import { Select } from 'antd';
import Utils from 'utils/utils';

const Option = Select.Option;
export default class extends React.Component {
    constructor(props) {
        super(props);
        let that = this;
        this.state = {
            value: this.props.value || '',
            data: []
        }
    }

    componentDidMount() {
        Utils.generateAutoComplete(this.props.cityCode)
        this.setState({
            value: this.props.value,
            data: []
        })
    }

    componentWillReceiveProps(nextProps) {
        Utils.generateAutoComplete(nextProps.cityCode)
        this.setState({
            value: nextProps.value,
            data: []
        })
    }

    generateAutoComplete() {
        Utils.generateAutoComplete(this.props.cityCode);
    }

    handleSearch = (value) => {
        let that = this, res;
        Utils.autoComplete.search(value, function (status, result) {
            if (status == 'complete' && result.info == 'OK') {
                that.setState({
                    data: (function (list) {
                        res = [];
                        list.map((add) => {
                            if (add.id) {
                                let address = add.name + (add.address && add.address.length > 0 ? `(${add.address})` : '')
                                let arr = Utils.formatAddress(add.district)
                                res.push({
                                    addressId: add.id,
                                    latitude: add.location.lat,
                                    longitude: add.location.lng,
                                    address: address,
                                    formatAddress: add.district + address,
                                    provinceName: arr[0],
                                    cityName: arr[1],
                                    countryName: arr[2],
                                    countryCode: add.adcode,
                                });
                            }
                        })
                        return res;
                    })(result.tips)
                })
            }
        })
    }

    handleChange = (value) => {
        this.setState({ value });
    }

    onSelect(tar) {
        this.props.onSelect(tar.props.pos);
    }

    render() {
        const options = this.state.data.map(d => <Option key={d.addressId} pos={d}>{(d.provinceName || '') + (d.cityName || '') + (d.countryName || '') + d.address}</Option>)
        return (
            <Select
                id={this.props.id}
                showSearch
                className={this.props.className}
                value={this.state.value}
                placeholder={this.props.placeholder}
                style={this.props.style}
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                onSearch={this.handleSearch}
                onChange={this.handleChange}
                onSelect={(e, tar) => this.onSelect.bind(this, tar)()}
                notFoundContent={null}
                disabled={this.props.disabled}
                onFocus={this.generateAutoComplete.bind(this)}
            >
                {options}
            </Select>
        )
    }

}