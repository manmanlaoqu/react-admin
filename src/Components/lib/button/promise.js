import React from 'react';
import { Button } from 'antd';
import './index.scss';

export default class extends React.Component {

    state={
        loading:false
    }

    render() {
        return (
            <Button
                disabled={this.props.disabled}
                className={this.props.className}
                type={this.props.type}
                loading={this.state.loading}
                onClick={()=>{
                    this.setState({
                        loading:true
                    })
                    let promise = this.props.onClick(),
                    close = ()=>{
                        debugger
                        this.setState({
                            loading:false
                        })
                    }
                    promise.then(data=>close()).catch(e=>close())
                }}
                style={this.props.style}
            >
                {this.props.text}
            </Button>
        )
    }
}