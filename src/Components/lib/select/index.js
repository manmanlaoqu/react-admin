import React from 'react';
import { Select } from 'antd';
import './index.scss';

const Option = Select.Option;
export default class extends React.Component {
    handleChange(e,obj){
        this.props.handleChange(e,obj.props.label)
    }
    render() {
        
        const options = this.props.list.map((item) => {
            
            return <Option label={item} key={item[this.props.keyField]}>{item[this.props.textField]}</Option>
        });
        return (
            <Select
                defaultValue={this.props.defaultValue} 
                className="yg-selector" 
                onChange={(e,e2)=>this.handleChange.bind(this,e,e2)()}
            >
                {options}
            </Select>
        )
    }
}