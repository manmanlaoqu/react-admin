import React from 'react';
import { Radio, Input, Tabs } from 'antd';
import ButtonP from '../../lib/button/promise';
import Utils from 'utils/utils';
import './index.scss'
import { resolve } from 'url';
import { rejects } from 'assert';

const TabPane = Tabs.TabPane;
const style = {
    display: 'inline-block',
    verticalAlign: 'middle',
    cursor: 'pointer',
    margin: '6px 2px',
    border: '1px solid #ccc'
}

const RadioGroup = Radio.Group;
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = { ...this.props };
        this.finicialInfo = Utils.getInvoiceModel()
    }
    onChange(index, obj) {
        this.state['value' + index] = obj.bankCode;
        this.state['bankName' + index] = obj.bankName;
        this.setState({
            ...this.state
        })
    }

    goCharge(type) {
        return new Promise((resolve,reject)=>{
            if (isNaN(this.state['chargeAmount' + type])) {
                Utils.Message.error('请输入正确的金额！');
                reject()
                return;
            }
            if (!(this.state['value' + type])) {
                Utils.Message.error('请选择支付银行！');
                reject()
                return;
            }
            let p = {
                bankAccountType: type == 1 ? 'pu' : 'pr',
                bankCode: this.state['value' + type],
                amount: this.state['chargeAmount' + type],
                bankName: this.state['bankName' + type]
            }, that = this;
            Utils.request({
                api: that.props.api,
                params: p,
                beforeRequest() {
                    resolve()
                },
                success: function (data) {
                    that.props.notifySuccess(data);
                },
            })
        })
    }

    render() {
        return (
            <div>
                <div className='bankPay'>
                    <Tabs>
                        <TabPane tab="企业网银支付" key="1">
                            <div style={{ margin: '16px 0' }}>
                                <RadioGroup onChange={(e) => { this.onChange.bind(this, 1, e.target.item)() }} value={this.state.value1}>
                                    {
                                        this.state.bank.pu.map((item, index) => {
                                            let st = style;
                                            if (item.bankCode == this.state.value) {
                                                st.borderColor = '#ff7800';
                                            }
                                            return (
                                                <Radio key={index} item={item} value={item.bankCode}>
                                                    <div style={st}>
                                                        <div style={{ position: 'relative' }}>
                                                            <img src={item.description} style={{ height: '36px' }} />
                                                        </div>
                                                    </div>
                                                </Radio>
                                            )
                                        })
                                    }
                                </RadioGroup>
                                <div className="mytablebox" style={{ padding: '12px' }}>
                                    <Input style={{ width: '50%' }} value={this.state.chargeAmount1} onChange={(e) => { let v = e.target.value; this.setState({ chargeAmount1: v.toDecimal2() }) }} addonBefore="充值金额" addonAfter="元" />
                                </div>
                                <div style={{ padding: '12px', textAlign: 'right' }}>
                                    <ButtonP onClick={this.goCharge.bind(this, 1)} disabled={!this.state.value1 || !this.state.chargeAmount1} className="common" text="下一步" />
                                </div>
                            </div>
                        </TabPane>
                        <TabPane tab="个人网银支付" key="2">
                            <div style={{ margin: '16px 0' }}>
                                <RadioGroup onChange={(e) => { this.onChange.bind(this, 2, e.target.item)() }} value={this.state.value2}>
                                    {
                                        this.state.bank.pr.map((item, index) => {
                                            let st = style;
                                            if (item.bankCode == this.state.value) {
                                                st.borderColor = '#ff7800';
                                            }
                                            return (
                                                <Radio key={index} item={item} value={item.bankCode}>
                                                    <div style={st}>
                                                        <div style={{ position: 'relative' }}>
                                                            <img src={item.description} style={{ height: '36px' }} />
                                                        </div>
                                                    </div>
                                                </Radio>
                                            )
                                        })
                                    }
                                </RadioGroup>
                                <div className="mytablebox" style={{ padding: '12px' }}>
                                    <Input style={{ width: '50%' }} addonBefore="充值金额" onChange={(e) => { let v = e.target.value; this.setState({ chargeAmount2: v.toDecimal2() }) }} addonAfter="元" />
                                </div>
                                <div style={{ padding: '12px', textAlign: 'right' }}>
                                    <ButtonP onClick={this.goCharge.bind(this, 2)} disabled={!this.state.value2 || !this.state.chargeAmount2} className="common" text="下一步" />
                                </div>
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
                <div style={{ fontSize: '12px', marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <span>账户名称：</span>{this.finicialInfo.company}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <span>银行账户：</span>{this.finicialInfo.account}
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <span>开户银行：</span>{this.finicialInfo.bank}
                    </div>
                    <div style={{ color: '#ff7800' }}>
                        <i className='iconfont icon-gantanhao' style={{ fontSize: '12px', marginRight: '8px' }}></i>重要提示：此账户不支持直接转账，只限于线上充值
                    </div>
                </div>
            </div>
        )
    }
}