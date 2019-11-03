import React from 'react';
import { Select, Radio } from 'antd';
import Events from 'gc-event/es5'
import Button from '../../lib/button';
import Listchose from '../listchose';
import Utils from '../../../lib/utils'
import Storage from 'gc-storage/es5';


const Option = Select.Option;

const chooseAddress = function (address, handler) {
    let addressChosen;
    let onSelected = function (item) {
        addressChosen = item;
    }
    let modal = Utils.modal({
        //指定承运司机/车辆弹框
        width: 800,
        title: <soan>选择常用地址</soan>,
        onOk: function () {
            handler(addressChosen);
            modal.destroy();
        },
        content: <Listchose
            current={address}
            api={Utils.getApi('邮寄地址管理', '列表')}
            placeholder="姓名/联系电话"
            empty={!Utils.getApi('邮寄地址管理', '保存')}
            className="driver-select-item-box inline"
            test={(item1, item2) => {
                return item1.id == item2.id
            }}
            template={
                (address) => {
                    return (
                        <div>
                            <span style={{ display: 'inline-block', textAlign: 'center' }}>
                                <span style={{ width: '90px', display: 'inline-block', textAlign: 'left', paddingLeft: 12 }}>{address.contactName}</span>
                                <span style={{ width: '110px', display: 'inline-block', textAlign: 'left' }}>{address.contactPhone}</span>
                            </span>
                            <span className="info" style={{ width: 'calc(100% - 200px)' }}>{address.provinceName + address.cityName + (address.countryName || '') + address.address}</span>
                        </div>
                    )
                }
            }
            onSelected={onSelected}
            emptyTemplate={
                <Button text="添加邮寄地址"
                    className="common"
                    onClick={() => {
                        modal.destroy()
                        Events.emit('addTab', {
                            moduleText: '邮寄地址管理',
                            module: '邮寄地址管理'
                        }, {
                                event: '邮寄地址Open'
                            })
                    }} />}
        />
    });
}

export default class extends React.Component {
    constructor(props) {
        super(props);
        let lastInfo = this.props.lastInfo || {}
        let invoiceInfo = this.props.invoiceInfo
        this.state = {
            invoiceType: (null == lastInfo.invoiceType || undefined == lastInfo.invoiceType) ? 0 : lastInfo.invoiceType,
            depositBank: lastInfo.depositBank || '',
            bankAccount: lastInfo.bankAccount || '',
            contactPhone: lastInfo.contactPhone || '',
            companyAddress: lastInfo.companyAddress || '',
            recipients: lastInfo.recipients || '',
            invoiceContent: lastInfo.invoiceContent || '',
            deliveryAddress: lastInfo.deliveryAddress,
            recipientsPhone: lastInfo.recipientsPhone,
            invoiceTitleName: lastInfo.invoiceTitle,
            businessLicenseNo: lastInfo.taxpayerNo,
            orderNos: (function () {
                return invoiceInfo.orderCount > 10 ? (invoiceInfo.orderNos + `等${invoiceInfo.orderCount}个订单`) : invoiceInfo.orderNos
            })(),
            invoicePrice: invoiceInfo.invoicePrice,
            actualInvoicePrice: invoiceInfo.actualInvoicePrice,
            oilRebatePrice: invoiceInfo.oilRebatePrice,
            needAccountStatement: 0,
            // 申请开票金额
            // 返利余额
            invoiceRate: Storage.get('companyConfig').invoiceRate
        }
        this.infoBackUp = {
            depositBank: lastInfo.depositBank || '',
            bankAccount: lastInfo.bankAccount || '',
            contactPhone: lastInfo.contactPhone || '',
            companyAddress: lastInfo.companyAddress || '',
        }
        this.props.notifyChange(this.state)
    }

    componentDidMount() {
        let companyInfo = Storage.get('companyInfo')
        this.state.invoiceTitle = this.state.invoiceTitleName || companyInfo.name
        this.state.taxpayerNo =  this.state.businessLicenseNo || companyInfo.businessLicenseNo
        this.state.contactPhone = this.state.contactPhone || companyInfo.registrantPhone
        this.state.companyAddress = this.state.companyAddress || companyInfo.companyAddress
        this.setState({
            ...this.setState
        })
    }

    input(val, key) {
        if (key == 'userPhone') {
            val = val.replace(/[^\d]/g, '')
        }
        if (key == 'idCardNo') {
            val = val.toIdcard()
        }
        // if(key == 'remark'){
        //     val = '系统提取客户的备注信息' +this.state.remarkClient + ' ;用户填写的信息：' + val
        // }
        this.state[key] = val;
        this.setState({
            ...this.state
        }, function () {
            this.props.notifyChange(this.state)
        })
    }

    onChange(roleId, obj) {
        this.setState({
            invoiceType: obj.invoiceType,
            invoiceTypeName: obj.invoiceTypeName,
        }, function () {
            this.props.notifyChange(this.state)
        })
    }

    getData() {
        return this.state;
    }

    onAddress(address) {
        this.addressChoosen = address
        this.setState({
            recipients: address.contactName,
            recipientsPhone: address.contactPhone,
            deliveryAddress: (address.provinceName || '') + (address.cityName || '') + (address.countryName || '') + (address.address || '')
        }, () => {
            this.props.notifyChange(this.state)
        })
    }

    render() {
        return (
            <div>
                <div className="ant-table ant-table-default">
                    <div className="ant-table-content">

                        <div className="ant-table-body form-table">
                            <div className="group-head">
                                <span>
                                    <div className="mod-form-title">
                                        <span>发票信息</span>
                                        <span className={"click-th-main " + (this.state.onEdit ? 'blue' : '')} style={{ float: 'right', fontSize: '12px' }}
                                            onClick={() => {
                                                this.setState({
                                                    onEdit: !this.state.onEdit
                                                }, function () {
                                                    if (this.state.onEdit) {
                                                        this.state.onEdit && this.refs.focusTarget.focus()
                                                    } else {
                                                        this.setState({
                                                            ...this.infoBackUp
                                                        })
                                                    }
                                                })
                                            }}>
                                            {!this.state.onEdit ? <span><i style={{ fontSize: '12px', marginRight: 4 }} className="iconfont icon-bianji"></i>修改发票信息</span> :
                                                <span><i style={{ fontSize: '12px', marginRight: 4 }} className="iconfont icon-quxiao"></i>取消修改</span>}
                                        </span>
                                    </div>
                                </span>
                            </div>


                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title">订单号</span>
                                        </td>
                                        <td className="column single"  >
                                            <input readOnly value={this.state.orderNos} type="text" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>

                        <div className="ant-table-body form-table">
                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title">发票类型</span>
                                        </td>
                                        <td className="column center">
                                            <Select className="form-selector" disabled value={this.state.invoiceType} onChange={(val, event) => { this.onChange.bind(this, val, event.props.item)() }} style={{ border: 'none' }}>
                                                <Option key={0} item={{ invoiceType: 0, invoiceTypeName: '增值税专票' }} value={0}>增值税专票</Option>
                                                <Option key={1} item={{ invoiceType: 1, invoiceTypeName: '增值税普票' }} value={1}>增值税普票</Option>
                                            </Select>

                                        </td>
                                        <td className="head">
                                            <span className="title">发票内容</span>
                                        </td>
                                        <td className="column center">
                                            <input value={this.state.invoiceContent} readOnly onChange={(e) => this.input.bind(this, e.target.value, 'invoiceContent')()} ></input>
                                        </td>
                                    </tr>

                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title">受票方企业名称</span>
                                        </td>
                                        <td className="column center">
                                            <input value={this.state.invoiceTitle} readOnly></input>
                                        </td>
                                        <td className="head">
                                            <span className="title">纳税人识别码</span>
                                        </td>
                                        <td className="column center">
                                            <input value={this.state.taxpayerNo} readOnly></input>
                                        </td>
                                    </tr>

                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>开户行</span>
                                        </td>
                                        <td className="column center">
                                            <input maxLength={20} value={this.state.depositBank}
                                                readOnly={!this.state.onEdit}
                                                ref="focusTarget"
                                                onChange={(e) => this.input.bind(this, e.target.value, 'depositBank')()} type="text" />

                                        </td>
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>开户行账户</span>
                                        </td>
                                        <td className="column center">
                                            <input maxLength={50} value={this.state.bankAccount}
                                                readOnly={!this.state.onEdit}
                                                onChange={(e) => this.input.bind(this, e.target.value.toNum(), 'bankAccount')()} type="text" />
                                        </td>
                                    </tr>


                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>联系电话</span>
                                        </td>
                                        <td className="column center">
                                            <input maxLength={20} value={this.state.contactPhone}
                                                readOnly={!this.state.onEdit}
                                                onChange={(e) => this.input.bind(this, e.target.value, 'contactPhone')()} type="text" />
                                        </td>
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>公司地址</span>
                                        </td>
                                        <td className="column center">
                                            <input maxLength={50} value={this.state.companyAddress}
                                                readOnly={!this.state.onEdit}
                                                onChange={(e) => this.input.bind(this, e.target.value, 'companyAddress')()} type="text" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>

                        <div className="ant-table-body form-table">
                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title">开票要求</span>
                                        </td>
                                        <td className="column single">
                                            <textarea value={this.state.remark} onChange={(e) => this.input.bind(this, e.target.value, 'remark')()}
                                                style={{ width: '100%', border: 'none', outline: 'none', padding: '6px 6px' }}></textarea>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>

                        <div className="ant-table-body form-table">
                            <div className="group-head">
                                <span>

                                    <div className="mod-form-title">开票金额</div>
                                </span>
                            </div>

                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title">开票金额</span>
                                        </td>
                                        <td className="column">
                                            <div style={{ padding: '10px', color: 'rgb(255, 120, 0)' }}>
                                                {this.state.invoicePrice}
                                            </div>
                                        </td>
                                        <td className="head">
                                            <span className="title">服务费返利金额</span>
                                        </td>
                                        <td className="column">
                                            <div style={{ padding: '10px', color: 'rgb(255, 120, 0)' }}>
                                                {this.state.oilRebatePrice}
                                            </div>
                                        </td>
                                    </tr>

                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title">实际开票金额</span>
                                        </td>
                                        <td className="column">
                                            <div style={{ padding: '10px', color: 'rgb(255, 120, 0)' }}>
                                                {this.state.actualInvoicePrice}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="ant-table-body form-table">
                            <div className="group-head">
                                <span>
                                    <div className="mod-form-title">
                                        <span>收票信息</span>
                                        <span className="click-th-main" style={{ float: 'right', fontSize: '12px' }}
                                            onClick={() => { chooseAddress.bind(this, this.addressChoosen, this.onAddress.bind(this))() }}>
                                            <i style={{ fontSize: '12px', marginRight: 4 }} className="iconfont icon-xuanze1"></i>选择邮寄地址
                                        </span>
                                    </div>
                                </span>
                            </div>
                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>收件人</span>
                                        </td>
                                        <td className="column center">
                                            <input maxLength={20} value={this.state.recipients} onChange={(e) => this.input.bind(this, e.target.value, 'recipients')()} type="text" />
                                        </td>
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>联系电话</span>
                                        </td>
                                        <td className="column center">
                                            <input maxLength={11} value={this.state.recipientsPhone} onChange={(e) => this.input.bind(this, e.target.value, 'recipientsPhone')()} type="text" />
                                        </td>
                                    </tr>

                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>邮寄地址</span>
                                        </td>
                                        <td className="column center" colSpan="3">
                                            <textarea maxLength={50}
                                                value={this.state.deliveryAddress}
                                                onChange={(e) => this.input.bind(this, e.target.value, 'deliveryAddress')()}
                                                style={{ width: '100%', border: 'none', outline: 'none', padding: '6px 6px' }}></textarea>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="group-head">
                                <span>
                                    <div className="mod-form-title">
                                        <span>对账单</span>
                                    </div>
                                </span>
                            </div>
                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>是否需要对账单</span>
                                        </td>
                                        <td className="column single">
                                            <Radio.Group style={{ height: '28px' }} onChange={(e) => {
                                                this.input.bind(this, e.target.value, 'needAccountStatement')()
                                            }} value={this.state.needAccountStatement}>
                                                <Radio value={1}>是</Radio>
                                                <Radio value={0}>否</Radio>
                                            </Radio.Group>
                                            <span>(选择需要对账单，对账单会与发票一同寄出)</span>
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