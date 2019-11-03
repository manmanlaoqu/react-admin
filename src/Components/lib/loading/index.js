import React from 'react';
import './index.css'
import { Spin } from 'antd';

export default class extends React.Component {
    render() {
        const loadingStyle = {
            position: 'absolute',
            left: '50%',
            top: '50%'
        };
        return (
            <div className="ebs-load2">
                <div className="shaft1"></div>
                <div className="shaft2"></div>
                <div className="shaft3"></div>
                <div className="shaft4"></div>
                <div className="shaft5"></div>
                <div className="shaft6"></div>
                <div className="shaft7"></div>
                <div className="shaft8"></div>
                <div className="shaft9"></div>
                <div className="shaft10"></div>
            </div>
        )
    }
}