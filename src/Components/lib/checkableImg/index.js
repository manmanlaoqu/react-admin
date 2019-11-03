import React from 'react';
import { Icon } from 'antd'

export default class extends React.Component {
    render() {
        return (
            <div style={{ display: 'inline-block', cursor: 'pointer', height: '80px', width: '80px', ...this.props.style || {} }}>
                <div {...this.props} style={{ position: 'relative', display: 'table-cell', height: '80px', width: '80px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <img src={this.props.src} style={{ maxHeight: '80px', maxWidth: '80px' }} />
                        <span style={{ position: 'absolute', right: '0', bottom: '0', padding: '0px 5px 2px 5px', background: 'rgba(0,0,0,0.6)' }}>
                            <Icon type="search" style={{ color: '#fff' }} />
                        </span>
                    </div>
                </div>
            </div>
        )
    }
}