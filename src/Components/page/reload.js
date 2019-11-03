import React from 'react';
import FreshComponent from './freshbind';
import Utils from 'utils/utils';

export default class extends FreshComponent{
    constructor(props){
        super(props)
        this.Child = this.props.component;
        let that = this;
        if(this.props.listener){
            this.componentRef = this.props.listener.replace('on','').replace('Refresh','').replace('-','');
            Utils['get'+that.componentRef+'state'] = function(){
                let a = that.refs[that.componentRef];
                return a.state
            }
            Utils['get'+that.componentRef+'Component'] = function(){
                let a = that.refs[that.componentRef];
                return a
            }
        }
    }
    state={
        hasChild:true,
    }
    reload(){
        this.setState({
            hasChild:false,
        },function(){
            this.setState({
                hasChild:true
            })
        })
    }
    render(){
        return(
            this.state.hasChild? <this.Child ref={this.componentRef} reload={this.reload.bind(this)} {...this.props}/>:null
        )
    }
}