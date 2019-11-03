import React from 'react'
import {Icon,Tag } from 'antd'
import './order-side.scss'

class HighLight extends React.Component{
    render(){
        return <span style={{color:'#ff7800',fontWeight:'bold',margin:'0 2px'}}>{this.props.children}</span>
    }
}

export default class extends React.Component{

    state={
        visiable:false,
        data:{}
    }

    toggleHide(visiable){
        this.setState({
            visiable:visiable===undefined?!this.state.visiable:visiable
        })
    }

    setData(data){
        this.setState({
            data:data,
            visiable:JSON.stringify(data)==='{}'?false:true
        })
    }

    render(){
        const {count=0,totalPrice=0,cash=0,oil=0,tax=0} = this.state.data
        return <div className="order-side">
            <div className={"container "+(this.state.visiable?'':'hide')}>
                <div className="left">
                    <div className="title">订单总计:<HighLight>{count}</HighLight>笔，运费总计:<HighLight>{totalPrice}</HighLight>元</div>
                    <div style={{fontSize:'12px'}}>
                        <span style={{marginRight:'6px'}}><Tag>现金</Tag>{cash}元</span>
                        <span style={{marginRight:'6px'}}><Tag>油卡</Tag>{oil}元</span>
                        <span><Tag>服务费</Tag>{tax}元</span>
                    </div>
                </div>
                <div onClick={this.toggleHide.bind(this,undefined)} className="right"><Icon type="right" /></div>
            </div>
        </div>
    }
}