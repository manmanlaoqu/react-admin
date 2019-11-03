
import React from 'react';
import { Select } from 'antd';
import './index.scss';
const Option = Select.Option;

export default class extends React.Component {
    constructor(props){
        super(props)
        this.state={};
        this.state.value=this.props.list?this.props.list[0][this.props.value]:'';
    }
    handleChange(e,v){
        this.setState({
            value:e
        })
        this.props.handleChange(e,v)
    }

    clean(){
        this.setState({
            value:this.props.list?this.props.list[0][this.props.value]:''
        })
    }

    render() {
        const { text } = this.props;
        
        let options=[];
        if(this.props.list){
            options = this.props.list.map((item,i)=>{
                if(this.props.exclude&&this.props.exclude(item)){
                    return null
                }
                return <Option key={i} value={item[this.props.field]}>{item[this.props.value]}</Option>
            })
        }
        return (
            <span className="list-filter">
                <span className="list-filter-text">{text}</span>
                <Select onKeyDown={this.props.onKeyDown} className="list-filter-selector" value={this.state.value} onChange={this.handleChange.bind(this)}>
                    {options}
                </Select>
            </span>
        );
    }

}

// InputFiler.propTypes = {
//     onPressEnter: PropTypes.func,
//     onChange: PropTypes.func,
//     placeholder: PropTypes.string,
//     type: PropTypes.string
// };