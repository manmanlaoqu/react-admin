import React from 'react';

import ScrollContainer from '../index'
import FreshComponent from '../freshbind'
import Reload from '../reload'
import Button from '../../lib/button'
import Utils from 'utils/utils'
import Storage from 'gc-storage/es5'

class Safety extends FreshComponent {
    state = {
        phone: '',
        amount: '',
    }

    componentDidMount() {
        this.init();
    }

    init() {
        let config = Storage.get('companyConfig') || {}
        this.setState({
            financialUserPhone: config.financialUserPhone,
            balanceWarnLimit: config.balanceWarnLimit
        })
    }

    save() {
        let that = this;
        Utils.request({
            api: Utils.getApi('策略配置','修改'),
            params: {
                financialUserPhone: this.state.financialUserPhone,
                balanceWarnLimit: this.state.balanceWarnLimit,
                id: this.state.id
            },
            beforeRequest() {
                that.setState({
                    saving: true
                })
            },
            afterRequest() {
                that.setState({
                    saving: false,
                    edit: false
                })
            },
            success() {
                let config = Storage.get('companyConfig') || {}
                config.financialUserPhone = that.state.financialUserPhone
                config.balanceWarnLimit = that.state.balanceWarnLimit
                Storage.set('companyConfig',config)
                Utils.Message.success('操作成功！');
            }
        })
    }

    verifyParam() {
        if (isNaN(this.state.balanceWarnLimit) || !Utils.PHONE_REG.test(this.state.financialUserPhone)) {
            return true;
        }
        return false;
    }
    render() {
        const content = <div>
            <div style={{ padding: '8px 24px', background: 'rgb(233, 236, 244)', fontWeight: 'bold' }}>
                预存款预警设置
            </div>
            <div style={{ padding: '60px' }}>
                <div style={{ padding: '12px', marginBottom: '16px' }}>
                    <i className="iconfont icon-info" style={{ color: '#ff7800' }}></i> 预存款金额低于<span style={{ color: '#ff7800' }}>预存款预警金额</span>后，将会发送短信通知至<span style={{ color: '#ff7800' }}>绑定手机号</span>
                </div>
                <div style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-block', width: '100px', textAlign: 'right', marginRight: '12px' }}>
                        预存款预警金额
                </span>
                    <input ref="firstInp" readOnly={!this.state.edit}
                        style={!this.state.edit ? { width: '210px', padding: '6px 12px', borderRadius: '3px', marginRight: '12px', border: '1px solid #d9d9d9' } : { width: '210px', padding: '6px 12px', borderRadius: '3px', marginRight: '12px' }}
                        placeholder="预存款预警金额" value={this.state.balanceWarnLimit}
                        onChange={(e) => { this.setState({ balanceWarnLimit: e.target.value.toNum() }) }} maxLength={10} type="text" />
                    元
            </div>
                <div style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-block', width: '100px', textAlign: 'right', marginRight: '12px' }}>
                        绑定手机号
                </span>
                    <input readOnly={!this.state.edit}
                        style={!this.state.edit ? { width: '210px', padding: '6px 12px', borderRadius: '3px', marginRight: '12px', border: '1px solid #d9d9d9' } : { width: '210px', padding: '6px 12px', borderRadius: '3px', marginRight: '12px' }}
                        placeholder="绑定手机号" value={this.state.financialUserPhone}
                        onChange={(e) => { this.setState({ financialUserPhone: e.target.value.toNum() }) }} maxLength={11} type="text" />
                </div>
            </div>
        </div>
        return (
            <div style={{ background: '#f5f5f5', height: '100%' }}>
                <div className="list-ctrl-box">
                    {this.state.edit ? <Button text="保存" disabled={this.verifyParam()} onClick={this.save.bind(this)} loading={this.state.saving} className="common" /> :
                        <Button text="修改" onClick={() => {
                            this.setState({
                                edit: true
                            }, function () {
                                this.refs.firstInp.focus()
                            })
                        }} className="common white" />}
                </div>
                {content}
            </div>
        )
    }
}

export default class extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <Reload {...this.props} component={Safety} />
    }
}