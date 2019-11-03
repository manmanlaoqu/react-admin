import React from 'react'
import {Cascader} from 'antd'
import Storage from 'gc-storage/es5'
import './index.scss'

export default class extends React.Component {

    constructor(props) {
        super(props)

        let cityTree = Storage.get('dictionary').location, cityMap = {};
        this.options = cityTree.map(item => {
            return {
                value: item.name,
                label: item.name,
                // value: item.name.indexOf('黑龙江') > -1 ? item.name.substring(0, 3) : item.name.substring(0, 2),
                // label: item.name.indexOf('黑龙江') > -1 ? item.name.substring(0, 3) : item.name.substring(0, 2),
                provinceCode: item.code,
                children: item.nodes.map(city => {
                    return {
                        cityCode: city.code,
                        value: city.name,
                        label: city.name,
                    }
                })
            }
        })

    }

    state = {
        filtTo: '',
        filtFrom: ''
    }

    filter(inputValue, path) {
        return (path.some(option => (option.name).toLowerCase().indexOf(inputValue.toLowerCase()) > -1));
    }


    clean() {
        this.setState({
            filtTo: '',
            filtFrom: ''
        })
    }

    render() {
        return (
            <span className="list-filter range">
                <span className="list-filter-text">线路：</span>
                <div className="range-picker-box">
                    <Cascader
                        popupClassName="utrailer"
                        options={this.options}
                        onChange={(e) => {
                            this.setState({
                                filtTo: e
                            }, function () {
                                this.props.onFromSelected(e.length == 0 ? null : (e[0] + '|' + e[1]))
                            })
                            // this.updateFilters.bind(this, 'fromName', e.length == 0 ? null : (e[0] + '|' + e[1]))();
                        }}
                        placeholder="选择装货地"
                        showSearch={this.filter.bind(this)}
                        value={this.state.filtTo}
                    />
                    <i style={{ color: '#333333',display:'inline-block' }} className="iconfont icon-jiantou"></i>
                    <Cascader
                        popupClassName="utrailer"
                        options={this.options}
                        onChange={(e) => {
                            this.setState({
                                filtFrom: e
                            }, function () {
                                this.props.onToSelected(e.length == 0 ? null : (e[0] + '|' + e[1]))
                            })
                            // this.updateFilters.bind(this, 'toName', e.length == 0 ? null : (e[0] + '|' + e[1]))();
                        }}
                        value={this.state.filtFrom}
                        placeholder="选择卸货地"
                        showSearch={this.filter.bind(this)}
                    />
                </div>
            </span>
        )
    }
}