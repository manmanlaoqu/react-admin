import React from 'react'
import { Select } from 'antd';
import PropTypes from 'prop-types'

const { Option } = Select;

export default class FetchSelect extends React.Component {

    state = {
        data: [],
        loading: false
    }
    timer = null
    initData = []
    inited = false
    handleChange = (value, options, c) => {
        this.props.onSelected(options.props.data)
        this.setState({ value });
    };

    handleSearch = value => {
        if (this.timer) {
            clearTimeout(this.timer)
        }
        this.timer = setTimeout(() => {
            this.search(value)
        }, 300)
    };

    search(value) {
        this.searchValue = value
        if (!value && this.inited) {
            this.setState({ data: this.initData, loading: false })
        }
        this.setState({
            loading: true
        })
        this.props.search(value).then(data => {
            if (!value) {
                this.initData = data
                this.inited = true
            }
            this.setState({ data, loading: false })
        })
    }

    render() {
        const initData = this.props.initData || this.initData
        let arr = this.state.data
        if (this.props.initOption && this.props.initOption[this.props.keyField] && !this.searchValue) {
            if (!arr.find(item => {
                return item[this.props.keyField] == this.props.initOption[this.props.keyField]
            })) {
                arr.unshift(this.props.initOption)
            }
        }
        const options = this.state.data.map(d => <Option disabled={this.props.optionDisabled ? this.props.optionDisabled(d) : false} key={d[this.props.keyField]} data={d}>{this.props.option(d)}</Option>);
        return <Select
            dropdownClassName={`fetch-select ${this.props.dropdownClassName||''}`}
            showSearch
            disabled={this.props.disabled}
            id={this.props.id}
            value={this.props.hasOwnProperty('value') ? this.props.value : this.state.value}
            placeholder={this.props.placeholder}
            style={this.props.style}
            defaultActiveFirstOption={false}
            showArrow={true}
            filterOption={false}
            onSearch={this.handleSearch}
            onChange={this.handleChange}
            notFoundContent={null}
            onFocus={() => {
                if (initData.length == 0) {
                    this.search('')
                } else {
                    this.setState({ data: initData })
                }
            }}
            onBlur={() => {
                this.setState({ data: this.initData })
            }}
            loading={this.state.loading}
        >
            {options}
        </Select>
    }
}


FetchSelect.propTypes = {
    placeholder: PropTypes.string,
    filterOption: PropTypes.func,
    search: PropTypes.func,
    option: PropTypes.func,
    style: PropTypes.object,
    onSelected: PropTypes.func,
    keyField: PropTypes.string,
    initOption: PropTypes.object//初始化选项 回填用
}