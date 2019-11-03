import React from 'react';

export default class extends React.Component{
    render(){
        let style={
            display:'inline-block',
        }
        if(this.props.circle){
            style.borderRadius='50%'
        }
        const src = this.props.src;
        return(
            <span className="myavatar">
                {src?<img src={src} width={this.props.width||50} height={this.props.height||50} alt={this.props.alt||''}/>:<i className="iconfont icon-user" style={{fontSize:'30px',color:'#fff'}}></i>}
            </span>
        )
    }
}