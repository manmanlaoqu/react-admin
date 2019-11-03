import React from 'react';
import moment from 'moment';
import { DatePicker } from 'antd';
import './index.scss';

export default class extends React.Component {
    storage = {};
    state={};
    disabledStart(current){
        if(this.storage.endMoment){
            return current >= moment().endOf(moment().add(1, 'days'))||current>this.storage.endMoment.startOf('day');
        }
        return current > moment().endOf(moment().add(1, 'days')); 
    }
    disabledEnd(current){
        if(this.storage.startMoment){
            return current >= moment().endOf(moment().add(1, 'days'))||current<this.storage.startMoment.startOf('day');
        }
        return current > moment().endOf(moment().add(1, 'days')); 
    }
    onStartChange(moment){
        this.storage.startMoment = moment;
        this.props.onStartChange(moment)
        this.setState({
            start:moment
        })
    }
    onEndChange(moment){
        this.storage.endMoment = moment;
        this.props.onEndChange(moment)
        this.setState({
            end:moment
        })
    }
    clean(){
        this.storage = {};
        this.setState({
            start:null,
            end:null
        })
    }
    render() {
        return (
            <span style={this.props.style} className="list-filter range">
                <span className="list-filter-text">{this.props.text}</span>
                <div className="range-picker-box">
                    <DatePicker value={this.state.start} disabledDate={this.disabledStart.bind(this)} style={{border:'none'}} onChange={this.onStartChange.bind(this)} />
                    <i style={{ color: '#333333',display:'inline-block' }} className="iconfont icon-jiantou"></i>
                    <DatePicker value={this.state.end} disabledDate={this.disabledEnd.bind(this)} style={{border:'none'}} onChange={this.onEndChange.bind(this)} />
                </div>
            </span>
        )
    }
}