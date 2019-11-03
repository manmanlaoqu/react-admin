import React from 'react';
import UpLoad from '../../lib/upButton';
import Utils from 'utils/utils';

export default class extends React.Component {

    constructor(props){
        super(props);
        this.state={
            receiptCarrier:this.props.data.receiptCarrier,
            deliveryNo:this.props.data.deliveryNo,
            receiptImgUrl:this.props.data.receiptImgUrl
        };
    }

    componentDidMount(){
        if(this.state.receiptImgUrl){
            let that = this;
            this.uploader.setPicData((function(){
                let list = that.state.receiptImgUrl.split(';');
                return list.map((img)=>{
                    return Utils.toFileImg(img);
                })
            })())
        }
    }

    input(val,key){
        this.state[key] = val;
        this.setState({
            ...this.state
        },function(){
            this.props.notifyChange(this.state)
        })
    }

    getData() {
        return this.state.fileList;
    }

    handleChange(fileList) {
        let f = fileList.map((file)=>{
            return file.response.body.resUrls[0];
        })
        f = f.toString().replaceAll(',',';');
        this.state.receiptImgUrl = f;
        this.props.notifyChange(this.state);
    }

    render() {
        return (
            <div>
                <div className="mod-form">
                <div className="mod-form-title">回单信息</div>
                    <div className="mod-form-item">
                        <span className="mod-form-head"><span className="needed">*</span>快递公司</span>
                        <div className="mod-form-inp half">
                            <input maxLength={20} placeholder="快递公司" value={this.state.receiptCarrier} onChange={(e) => this.input.bind(this,e.target.value,'receiptCarrier')()} type="text" />
                        </div>
                        <span className="mod-form-head"><span className="needed">*</span>快递单号</span>
                        <div className="mod-form-inp half">
                            <input maxLength={18} placeholder="快递单号" value={this.state.deliveryNo} onChange={(e) => this.input.bind(this,e.target.value,'deliveryNo')()}   type="text" />
                        </div>
                    </div>
                    <div className="mod-form-item">
                        <span className="mod-form-head"><span className="needed">*</span>回单上传</span>
                        <div className="mod-form-inp recept" style={{ paddingLeft: '24px' }}>
                            <UpLoad ref={ele=>{this.uploader = ele}}  multiple handleChange={(fileList) => this.handleChange.bind(this, fileList)()} max={3} />
                        </div>
                    </div>
                </div>
            </div >
        )
    }
}