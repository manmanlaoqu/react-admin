import React from 'react';
import { Table, Input } from 'antd';
import Storage from 'gc-storage/es5';

const { TextArea } = Input;
export default class extends React.Component {

    page = 1;

    state = {
        invoiceRate: Storage.get('companyConfig').invoiceRate,

    }
    columns = [{
        title: '序号',
        render: (row, c, index) => {
            return ((this.page || 0) - 1) * 5 + index + 1
        }
    }, {
        title: '订单号',
        dataIndex: 'orderNo',
        width: '120px'
    }, {
        title: '线路',
        render: (row) => {
            return row.fromName.split('|')[0] + '——' + row.toName.split('|')[0]
        },
        width: '200px'
    }, {
        title: '发车时间',
        dataIndex: 'expDepartTime',
        width: '120px',
        render: (expDepartTime) => {
            return expDepartTime ? new Date(expDepartTime).format('yyyy-MM-dd hh:mm') : null
        }
    }, {
        title: '供应商',
        dataIndex: 'invoiceTitleName'
    }, {
        title: '总金额',
        dataIndex: 'totalPriceName'
    }, {
        title: '车牌号',
        dataIndex: 'askVehiclePlateNo',
        width: '120px'
    }];
    // componentDidMount() {
    //     ScrollBar.init(document.getElementById('invoiceDetailList'))
    // }
    render() {
        const invoice = this.props.invoice;
        const acturalPrice = (parseFloat(invoice.rebateAmount) + parseFloat(invoice.price)).toFixed(2)
        return (
            <div>
                {<div style={{ padding: '8px 16px', background: '#fbead0', marginBottom: '6px' }}>
                    {[4, 5].indexOf(invoice.status) > -1 ?
                        <span><i style={{ color: 'red', marginRight: '6px' }} className={"iconfont icon-gantanhao"}></i> {invoice.extraInfo}</span>
                        : <span>开票进度：{invoice.extraInfo}</span>}
                </div>}
                <div className="ant-table ant-table-default">
                    <div className="ant-table-content">
                        <div className="ant-table-body form-table">
                            <div className="group-head">
                                <span>
                                    <div className="mod-form-title">发票信息</div>
                                </span>
                            </div>
                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title">发票类型</span>
                                        </td>
                                        <td className="column center">
                                            <input value={invoice.invoiceTypeName} readOnly></input>
                                        </td>
                                        <td className="head">
                                            <span className="title">发票内容</span>
                                        </td>
                                        <td className="column center">
                                            <input value={invoice.invoiceContent} readOnly></input>
                                        </td>
                                    </tr>
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title">受票方企业名称</span>
                                        </td>
                                        <td className="column center">
                                            <input value={invoice.companyName} readOnly></input>
                                        </td>
                                        <td className="head">
                                            <span className="title">纳税人识别码</span>
                                        </td>
                                        <td className="column center">
                                            <input value={invoice.taxpayerNo} readOnly></input>
                                        </td>
                                    </tr>
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title">开户行</span>
                                        </td>
                                        <td className="column center">
                                            <input value={invoice.depositBank} readOnly></input>
                                        </td>
                                        <td className="head">
                                            <span className="title">开户行账户</span>
                                        </td>
                                        <td className="column center">
                                            <input value={invoice.depositBank} readOnly></input>
                                        </td>
                                    </tr>
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title">联系电话</span>
                                        </td>
                                        <td className="column center">
                                            <input value={invoice.contactPhone} readOnly></input>
                                        </td>
                                        <td className="head">
                                            <span className="title">公司地址</span>
                                        </td>
                                        <td className="column center">
                                            <input value={invoice.companyAddress} readOnly></input>
                                        </td>
                                    </tr>
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title">发票申请时间</span>
                                        </td>
                                        <td className="column center">
                                            <input value={invoice.applyTime} readOnly></input>
                                        </td>
                                        <td className="head">
                                            <span className="title">发票审核时间</span>
                                        </td>
                                        <td className="column center">
                                            <input value={invoice.auditTime} readOnly></input>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="ant-table-body form-table">
                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr>
                                        <td className="head">
                                            <span className="title">开票要求</span>
                                        </td>
                                        <td className="column single">
                                            <textarea value={invoice.remark} readOnly style={{ padding: '6px', width: '100%' }}></textarea>
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
                                            <span className="title">申请开票金额</span>
                                        </td>
                                        <td className="column center">
                                            <input style={{ color: '#ff7800' }} value={acturalPrice} readOnly></input>
                                        </td>
                                        <td className="head">
                                            <span className="title">油卡返利金额</span>
                                        </td>
                                        <td className="column center">
                                            <input style={{ color: '#ff7800' }} value={invoice.rebateAmount} readOnly></input>
                                        </td>
                                    </tr>
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title">实际开票金额</span>
                                        </td>
                                        <td className="column center">
                                            <input style={{ color: '#ff7800' }} value={invoice.price} readOnly></input>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="ant-table-body form-table">
                            <div className="group-head">
                                <span>
                                    <div className="mod-form-title">收票信息</div>
                                </span>
                            </div>
                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title">收件人</span>
                                        </td>
                                        <td className="column center">
                                            <input value={invoice.recipients} readOnly></input>
                                        </td>
                                        <td className="head">
                                            <span className="title">联系电话</span>
                                        </td>
                                        <td className="column center">
                                            <input value={invoice.recipientsPhone} readOnly></input>
                                        </td>
                                    </tr>
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title">邮寄地址</span>
                                        </td>
                                        <td className="column center" colSpan={3} >
                                            <textarea value={invoice.deliveryAddress} readOnly style={{ padding: '6px', width: '100%' }}></textarea>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <Table
                            columns={this.columns}
                            dataSource={invoice.invoiceOrderList}
                            pagination={{
                                position: 'bottom',
                                pageSize: 5,
                                onChange: (page) => {
                                    this.page = page
                                }
                            }}
                        />
                    </div>
                </div>

                {/* <div id="invoiceDetailList" style={{ height: '0px', overflow: 'auto' }}>
                    
                </div> */}
            </div>
        )
    }
}