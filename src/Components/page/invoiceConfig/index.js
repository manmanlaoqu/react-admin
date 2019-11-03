import React from 'react';

import ScrollContainer from '../index'
import FreshComponent from '../freshbind'
import Reload from '../reload'
import Button from '../../lib/button'
import { Icon } from 'antd'
import Utils from 'utils/utils'
import Storage from 'gc-storage/es5'
import ModifyWrap from '../../modal/invoiceConfig'

class InvoiceConfig extends FreshComponent {

    state = {
        phone: '',
        amount: '',
    }

    componentDidMount() {
        this.init();
    }

    init() {
        let that = this
        let config = Storage.get('companyInfo') || {}
        Utils.request({
            api: '/api/web/invoice/info',
            beforeRequest() {
                that.pageLoading(true)
            },
            afterRequest() {
                that.pageLoading(false)
            },
            success(data) {
                that.setState({
                    companyName: config.name,
                    businessLicense: config.businessLicenseNo,
                    invoiceContent: '*运输服务*国内道路货物运输服务',
                    invoiceType: '企业增值税专用发票',
                    ...data
                })
            }
        })
    }

    verifyParam() {
        if (isNaN(this.state.balanceWarnLimit) || !Utils.PHONE_REG.test(this.state.financialUserPhone)) {
            return true;
        }
        return false;
    }

    modifyWrap() {
        let param = {
            depositBank: this.state.depositBank,
            companyAddress: this.state.companyAddress,
            contactPhone: this.state.contactPhone,
            bankAccount: this.state.bankAccount
        }, that = this
        Utils.modal({
            title: '修改发票信息',
            okText: '保存',
            width: '820px',
            cancelText: '取消',
            onOk: function (fn) {
                return Utils.request({
                    api: '/api/web/invoice/info/update',
                    params: param,
                    success: function (data) {
                        that.setState({
                            ...param
                        })
                        Utils.Message.success('保存成功！');
                    }
                })
            },
            onCancel: function () {

            },
            content: <ModifyWrap onParam={(data)=>{
                param = {
                    depositBank: data.depositBank,
                    companyAddress: data.companyAddress,
                    contactPhone: data.contactPhone,
                    bankAccount: data.bankAccount
                }
            }} {...this.state} />
        })
    }

    render() {
        const content = <div>
            <div style={{ padding: '60px' }}>
                <div style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-block', width: '120px', textAlign: 'right', marginRight: '12px' }}>
                        发票类型:
                    </span>
                    <span>{this.state.invoiceType}</span>
                </div>
                <div style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-block', width: '120px', textAlign: 'right', marginRight: '12px' }}>
                        发票内容:
                    </span>
                    <span>{this.state.invoiceContent}</span>
                </div>
                <div style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-block', width: '120px', textAlign: 'right', marginRight: '12px' }}>
                        受票方企业名称:
                    </span>
                    <span>{this.state.companyName}</span>
                </div>
                <div style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-block', width: '120px', textAlign: 'right', marginRight: '12px' }}>
                        纳税人识别码:
                    </span>
                    <span>{this.state.businessLicense}</span>
                </div>
                <div style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-block', width: '120px', textAlign: 'right', marginRight: '12px' }}>
                        开户行:
                    </span>
                    <span>{this.state.depositBank}</span>
                </div>
                <div style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-block', width: '120px', textAlign: 'right', marginRight: '12px' }}>
                        开户行账户:
                    </span>
                    <span>{this.state.bankAccount}</span>
                </div>
                <div style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-block', width: '120px', textAlign: 'right', marginRight: '12px' }}>
                        联系电话:
                    </span>
                    <span>{this.state.contactPhone}</span>
                </div>
                <div style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-block', width: '120px', textAlign: 'right', marginRight: '12px' }}>
                        公司地址:
                    </span>
                    <span>{this.state.companyAddress}</span>
                </div>
            </div>
        </div>
        return (
            <div style={{ background: '#f5f5f5', height: '100%' }}>
                <div className="list-ctrl-box">
                    <Button text={<span><Icon type="edit" />修改</span>} onClick={this.modifyWrap.bind(this)} className="common white" />
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
        return <Reload {...this.props} component={InvoiceConfig} />
    }
}