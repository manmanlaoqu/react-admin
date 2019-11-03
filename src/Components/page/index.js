import React from 'react';
import ScrollBar from 'smooth-scrollbar';
import Loading from '../lib/loading';

export default class extends React.Component {
    
    componentDidMount() {
        ScrollBar.init(this.refs.scrollContainer.getElementsByClassName('scroll-container')[0])
    }
    state={
        percent:0,
        // pageloading:true
    }
    render() {
        const style = {
            height: 'calc(100% - ' + (this.props.height || '0px') + ')',
            marginTop:this.props.init?'0px':'0px',
            overflow: 'auto'
        }
        return (
            <div ref="scrollContainer" style={{
                height:'100%',
                ...(this.props.style||{})
            }}>
                <div className={"scroll-container "+(this.props.isList?"list":'')} style={style} >
                    <div style={{ height: '100%', overflow: 'hidden',width:'fit-content',minWidth: '100%' }} >
                        {this.props.content}
                    </div>
                </div>
                {this.props.loading?<div className="inner-page-loading">
                    <Loading />
                </div>:''}
            </div>
        )
    }
}