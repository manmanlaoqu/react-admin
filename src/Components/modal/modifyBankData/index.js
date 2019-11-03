import React from 'react';
import Utils from 'utils/utils';
import { Spin, Icon } from 'antd';
import Loading from '../../lib/loading';

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
export default class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            bankInfo: this.props.bankData || {},
            show: this.props.showErrorMsg,
            loading: this.props.bankDataLoading,
        }
        this.filters = {};
        this.modifyParam = this.props.bankData||{};
    }



    bankLoading() {
        let st = { float: 'right', top: '15px', textAlign: 'center', borderLeft: '1px solid #ccc', opacity: '0.7', padding: '0 6px',lineHeight:'28px' };
        if (this.state.bankCardChecking) {
            return <span style={st}><Spin indicator={antIcon} /></span>
        } else {
            return <span style={st}>{this.state.bankInfo.bankName}</span>
        }
    }

    checkBankAccount() {
        if (!this.bankAccountChanged) {
            return;
        }
        let that = this;
        that.recordModify(null, 'bankCode');
        if (this.state.bankInfo.bankAccountNo && this.state.bankInfo.bankAccountNo.length < 12) {
            that.setState({
                ...this.state,
                bankInfo: {
                    ...that.state.bankInfo,
                    bankName: <span style={{ color: 'red', padding: '0' }}>无效银行卡</span>
                }
            })
            Utils.Message.warning('无效的银行卡号！');
            return;
        }
        if (!this.state.bankInfo.bankAccountNo) {
            return;
        }
        Utils.request({
            api: '/api/external/common/bankaccountinfo',
            params: {
                bankAccountNo: this.state.bankInfo.bankAccountNo
            },
            beforeRequest() {
                that.setState({
                    bankCardChecking: true
                })
            },
            afterRequest() {
                that.setState({
                    bankCardChecking: false
                })
            },
            success: function (data) {
                that.bankAccountChanged = false;
                if (data.bankCardInfo.isEnabled == 1 && data.bankCardInfo.isValid == 1&&data.bankCardInfo.cardType==1) {
                    that.recordModify(data.bankCardInfo.bankName, 'bankName');
                    that.recordModify(data.bankCardInfo.bankCode, 'bankCode');
                } else {
                    that.setState({
                        ...this.state,
                        bankInfo: {
                            ...that.state.bankInfo,
                            bankName: <span style={{ color: 'red', padding: '0' }}>不支持该卡</span>
                        }
                    })
                    Utils.Message.warning('不支持该银行卡！')
                }
            }
        })
    }
    recordModify(val, key) {
        this.modifyParam[key] = val;
        this.state.bankInfo = this.modifyParam;
        this.props.onParam(this.modifyParam);
        this.update();
    }
    update() {
        this.setState({
            ...this.state,
        })
    }

    render() {
        const { bankInfo } = this.state;
        return (
            <div>
                <div className="ant-table ant-table-default">
                    <div className="ant-table-content">
                        <div className="ant-table-body form-table">
                            <div className="group-head">
                                <span>收款信息</span>
                            </div>
                            {this.state.loading ? <div style={{ position: 'absolute', width: '736px', height: '455px', zIndex: '10', cursor: 'progress' }}><div style={{ position: 'relative', width: '100%', height: '100%' }}><Loading /></div></div> : ''}
                            <table>
                                <tbody className='ant-table-tbody'>
                                    <tr className="ant-table-row">
                                        <td className='head'>
                                            <span className="title">收款人姓名</span>
                                        </td>
                                        <td className='column'>
                                            <input maxLength={50} placeholder='收款人姓名'
                                                value={bankInfo.bankUserName}
                                                onChange={(e) => this.recordModify.bind(this, e.target.value, 'bankUserName')()}
                                                type="text" />

                                        </td>
                                        <td className='head'>
                                            <span className="title">身份证号</span>
                                        </td>
                                        <td className='column' >
                                            <input maxLength={20} placeholder='身份证号'
                                                value={bankInfo.bankIdCardNum}
                                                onChange={(e) => {
                                                    this.recordModify.bind(this, e.target.value.toIdcard(), 'bankIdCardNum')();
                                                }}
                                                type='text' />

                                        </td>
                                    </tr>

                                    <tr className="ant-table-row">
                                        <td className='head'>
                                            <span className="title">银行卡号</span>
                                        </td>
                                        <td className='column' style={{ position: 'relative' }}>
                                            {bankInfo.bankAccountNo ? this.bankLoading() : ''}
                                            <input maxLength={20} placeholder="银行卡号"
                                                onBlur={this.checkBankAccount.bind(this)}
                                                value={bankInfo.bankAccountNo}
                                                onChange={(e) => {
                                                    this.recordModify.bind(this, e.target.value.toIdcard(), 'bankAccountNo')();
                                                    this.bankAccountChanged = true
                                                }}
                                                type="text" />
                                        </td>
                                        <td className='head'>
                                            <span className="title">手机号</span>

                                        </td>
                                        <td className='column' style={{ position: 'relative' }}>
                                            <input maxLength={11} placeholder="此手机号用于运费到账通知"
                                                value={bankInfo.bankCardPhone}
                                                onChange={(e) => {
                                                    this.recordModify.bind(this, e.target.value.toNum(), 'bankCardPhone')();
                                                }}
                                                type="text" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
