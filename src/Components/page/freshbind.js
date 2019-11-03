import React from 'react';
import Events from 'gc-event/es5';
import Storage from 'gc-storage/es5'

export default class extends React.Component{
    constructor(props){
        super(props);
        this.state={
            pageloading:false
        };
        let that = this;
        if(this.props.listener){
            Events.bind(this.props.listener,function(){
               try{
                    that.props.reload();
               }catch(e){
                
               }
            })
            let map = Storage.get('apiMap')
            this.funMap =map[this.props.listener.replace('on','').replace('Refresh','')];
        }
    }
    pageLoading(loading){
        this.setState({
            pageloading:loading
        })
    }
}