import React from 'react';
import { Modal } from 'antd';

export default class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            review: true,
            ...this.props
        };
        this.noPicMap = {};
    }


    componentWillReceiveProps(nextProps) {
        let list = nextProps.list||[];
        let total = list.length,noBtn;
        for (const key in list) {
            if (!list[key]) {
                total--;
                this.noPicMap[key] = true;
            }else{
                this.noPicMap[key] = false;
            }
        }
        if(total===1){
            noBtn = true;
        }
        this.setState({
            ...nextProps,
            noBtn:noBtn
        })
    }

    swipeImg(n) {
        let that = this;
        let length = this.state.list.length, index;
        if (this.state.index + n === length) {
            index = 0
        } else if (this.state.index + n === -1) {
            index = length - 1
        } else {
            index = this.state.index + n
        }
        this.state.index = index;
        if (this.noPicMap[index]) {
            this.swipeImg(n);
        } else {
            this.setState({
                index: this.state.index,
                review: false,
            }, function () {
                setTimeout(function () {
                    that.setState({
                        review: true
                    })
                }, 200)
            })
        }
    }

    render() {
        let { list, index,thumb } = this.state;
        list = list||[]
        return (
            <Modal className="my-image-viewer" maxWidth={'70%'} maxHeight={'80%'} visible={this.props.show} footer={null}>
                <div className="img-box">
                <div className="close-my" style={{"top":"-76px","right":'-68px'}} onClick={this.props.handleCancel}>
                    <i className="iconfont icon-guanbi clickable"></i>
                </div>
                    <span className="open btn" onClick={() => window.open(list[index], '_blank')}>
                        <i className="iconfont icon-open"></i>
                    </span>
                    {this.state.noBtn?'':<span onClick={this.swipeImg.bind(this, -1)} className="left btn">
                        <i className="iconfont icon-left-circle-o"></i>
                    </span>}
                    {this.state.noBtn?'':<span onClick={this.swipeImg.bind(this, 1)} className="right btn">
                        <i className="iconfont icon-right-circle-o"></i>
                    </span>}
                    <img alt="没找到" className={this.state.review ? "imgfade" : ''} style={{ maxWidth: '600px', maxHeight: '600px' }} src={list[index] + (thumb?thumb:'') } />
                </div>
            </Modal>
        )
    }
}