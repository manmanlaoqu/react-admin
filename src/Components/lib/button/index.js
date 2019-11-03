import React from 'react';
import { Button } from 'antd';
import './index.scss';

export default class extends React.Component {
    render() {
        return (
            <Button
                disabled={this.props.disabled}
                className={this.props.className}
                type={this.props.type}
                loading={this.props.loading}
                onClick={this.props.onClick}
                style={this.props.style}
            >
                {this.props.text}
            </Button>
        )
    }
}