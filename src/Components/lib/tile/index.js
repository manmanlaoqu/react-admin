import React from 'react'

export default class extends React.Component{
    constructor(props){
        super(props)
        this._props = {}
        Object.assign(this._props,props||{}) 
        let style = props.style||{}
        delete this._props['style']
        this.state={
            style:{
                ...style,
                position:props.refer==='window'?'fixed':'absolute',
                left:0,
                top:0
            }
        }
    }


    moveable = false

    onMouseDown(e){
        let x = e.pageX
        let y = e.pageY
        document.onmousemove = function (_e){
            let _x = _e.pageX
            let _y = _e.pageY
        }
    }

    

    render(){
        return <div 
            onMouseDown={this.onMouseDown.bind(this)} 
            onMouseLeave={()=>this.onMouseMove = null} 
            onMouseUp={()=>this.onMouseMove = null} style={this.state.style} {...this._props||{}}>
            {this.props.children}
        </div>
    }
}