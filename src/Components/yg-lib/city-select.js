import React from 'react'
import { Cascader } from 'antd';
import Storage from 'gc-storage/es5'


export default class CitySelect extends React.Component {
    state={
        value:null
    }
    options = Storage.get('cityNodes')
    render() {
        return <Cascader
            id={this.props.id}
            value={this.props.hasOwnProperty('value')?this.props.value:this.state.value}
            popupClassName="utrailer"
            placeholder={this.props.placeholder||''}
            fieldNames={{ label: 'name', value: 'code', children: 'nodes' }}
            options={this.options}
            onChange={(value,options) => { this.setState({value});this.props.onSelected(options) }}/>
    }
}