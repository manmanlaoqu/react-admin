import React from 'react'
import Upload from '../../lib/upButton';
import { Icon, Input } from 'antd'
import ImageViewer from '../../lib/imageViewer';
import './index.scss'

var pzimg = require('../../../images/pz-view.jpg');
export default class CertificationModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        }
    }
    render() {
        return (
            <div style={{ paddingTop: 24 }}>
                <div style={{ textAlign: 'center', marginBottom: '12px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0', top: '0' }}><span style={{ color: 'red' }}>*</span> 上传充值凭证</span>
                    <div style={{ display: 'inline-block' }}>
                        <Upload
                            ext={{ path: 'kc-offline-transfer-voucher' }}
                            max={1}
                            handleChange={(fileList) => this.props.handleChange.bind(this, fileList[0].response.body.resUrls[0], 'voucherUrl')()} />
                        <div style={{
                            display: 'inline-block',
                            border: '1px dashed #d9d9d9',
                            width: '104px',
                            height: '104px',
                            padding: '5px',
                            position: 'absolute',
                            right: '42px',
                            top: '0',
                            textAlign: 'center'
                        }}>
                            <div className="pz-demo" onClick={() => this.setState({ pzView: true })} style={{ height: 64, width: 94, marginBottom: 12, cursor: 'pointer', position: 'relative' }}>
                                <span style={{ position: 'absolute', right: '0', bottom: '0', padding: '0px 5px 2px 5px', background: 'rgba(0,0,0,0.6)' }}>
                                    <Icon type="search" style={{ color: '#fff' }} />
                                </span>
                            </div>
                            <ImageViewer handleCancel={() => {
                                this.setState({
                                    pzView: false
                                })
                            }} list={[pzimg]} show={this.state.pzView} index={0} />
                            <span>示例</span>
                        </div>
                    </div>
                </div>
                <div>
                    <span><span style={{ color: 'red' }}>*</span>转账金额</span>
                    <Input style={{ width: '340PX', marginLeft: 12, marginRight: 6 }}
                        placeholder='请输入银行转账金额' value={this.state.value}
                        onChange={(e) => {
                            this.setState({ value: e.target.value.toDecimal2() })
                            this.props.handleChange.bind(this, e.target.value.toDecimal2(), 'amount')()
                        }} />
                    元
                </div>
            </div>
        )
    }
}