import React from 'react'

export default class extends React.Component {
    getColor(color) {
        switch (color) {
            case '黄':
                return '#FBC505'
            case '蓝':
                return '#83B4F3'
            case '绿':
                return '#6ED994'
            default:
                return '#fff'
        }
    }
    render() {
        return (
            <span style={{
                fontSize: 10,
                color: '#fff',
                borderRadius: '3px',
                marginLeft: '16px',
                padding:'1px 2px',
                backgroundColor: this.getColor(this.props.color)
            }}>{this.props.color}牌</span>
        )
    }
}