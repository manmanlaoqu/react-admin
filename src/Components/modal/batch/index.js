import React from 'react';
import Button from '../../lib/button';
import Events from 'gc-event/es5'
import ScrollBar from 'smooth-scrollbar';
import { Table, Collapse, Divider } from 'antd';

import './index.scss'

const Panel = Collapse.Panel;
export default class extends React.Component {
    constructor(props) {
        super(props);
        this.id = 'batch-box-id-' + this.props.id
        this.scrollId = 'batch-box-scrollid-' + this.props.id
        this.state = {
            list: this.props.list,
            collapse: 'on',
            usableAmount: this.props.usableAmount,
            showResult: false
        }

        this.state.paymentColumns = [{
            title: '订单号',
            dataIndex: 'orderNo'
        }, {
            title: '支付款项',
            render: (row) => {
                return row.stageName
            }
        }, {
            title: "支付金额",
            render: (row) => {
                return row.typeName + row.amountName + '元'
            }
        }, {
            title: "服务费金额",
            dataIndex:'taxAmountName',
            render: (taxAmountName) => {
                return taxAmountName&&parseFloat(taxAmountName)>0?(taxAmountName + '元'):'--'
            }
        }, {
            title: "收款人",
            render: (row) => {
                return (row.payeeName || '') + ' ' + (row.payeeBankAccountNo || '')
            }
        }]
    }

    componentDidMount() {
        let that = this
        Events.on('showRes_' + that.props.id, function (resultList) {
            let statusMap = {}
            let messageMap = {}
            resultList.map(res => {
                statusMap[res.orderPriceItemId] = res.status
                messageMap[res.orderPriceItemId] = res.message
            })
            that.state.list.map(price => {
                price.finalStatus = statusMap[price.id]
                price.finalMsg = messageMap[price.id]
            })
            let newColumn1 = {
                title: '操作结果',
                render: (row) => {
                    return row.finalStatus == 1 ? '成功' : '失败'
                }
            }
            let newColumn2 = {
                title: '备注',
                render: (row) => {
                    return row.finalMsg
                }
            }
            that.state.paymentColumns.push(newColumn1)
            that.state.paymentColumns.push(newColumn2)
            that.setState({
                paymentColumns: that.state.paymentColumns,
                list: that.state.list,
                showResult: true,
            }, () => {
                that.onCollapse('1')
            })
        })
    }

    onCollapse(keys) {
        let box = document.getElementById(this.id).parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
        let handler = () => {
            if (!this.props.isSingle && !this.scrollInited) {
                this.scrollInited = true
                setTimeout(() => {
                    ScrollBar.init(document.getElementById(this.scrollId)) 
                }, 500);
            }
        }
        if (keys.length > 0) {
            //增加宽度
            box.style.width = this.state.showResult ? '1000px' : '800px';
            this.setState({
                collapse: '',
                key: keys
            },handler)
        } else {
            //减小宽度
            box.style.width = '500px';
            this.setState({
                collapse: 'on',
                key: keys
            },handler)
        }
    }

    render() {
        var that = this;
        const { showResult } = this.state
        const highLight = {
            color: '#fd9a42',
        }
        return (
            <div className="batch-table" style={{ textAlign: 'center' }} id={this.id}>
                {this.props.type === 2 ? <div>账户余额：<span style={{ color: '#fd9a42', marginBottom: '5px', display: 'inline-block' }}>{this.state.usableAmount}</span>元</div> : null}
                {!this.props.isSingle ?
                    <div style={{
                        color: '#000',
                        marginBottom: '5px',
                        fontSize: '16px'
                    }}>
                        <span>支付总金额：<span style={highLight}>{that.props.price.totalAmount}</span>元，</span>
                        {that.props.rebateAmount ? <span>使用返利 <span style={highLight}>{that.props.rebateAmount}</span>元，</span> : null}
                        <span>总计<span style={highLight}>{that.props.count}</span>笔</span>
                    </div> : null}
                {!this.props.isSingle ?
                    <div style={{ padding: '3px 0' }}>
                        （
                        {that.props.price.totalCash > 0 ? <span>现金总额：<span style={highLight}>{that.props.price.totalCash}</span>元；</span> : null}
                        {that.props.price.totalOil > 0 ? <span>油卡总额：<span style={highLight}>{that.props.price.totalOil}</span>元</span> : null}
                        {that.props.price.totalTax > 0 ? <span>服务费总额：<span style={highLight}>{that.props.price.totalTax}</span>元</span> : null}
                        ）
                    </div> : <div>
                        <div style={{ padding: '3px 0' }}>
                            <span>支付金额：<span style={highLight}>{that.props.price.typeName}{that.props.price.amountName}</span>元；</span>
                            {that.props.price.taxAmountName?<span>服务费金额：<span style={highLight}>{that.props.price.taxAmountName}</span>元；</span>:null}
                        </div>
                        {that.props.price.payeeName && that.props.price.totalCash > 0 ? <div style={{ padding: '3px 0' }}>
                            <span>
                                收款人：<span style={highLight}>{that.props.price.payeeName}</span>；
                            收款账户：<span style={highLight}>{that.props.price.payeeBankAccountNo}</span>
                            </span>
                        </div> : null}
                        {that.props.price.totalOil > 0 ? <span>
                            油卡卡号：<span style={highLight}>{that.props.price.oilAccountNo}</span>
                        </span> : null}
                    </div>}
                {showResult ? null : this.props.pwdTemplate}
                {showResult ? null : <div className="batch-btn">
                    <Button text={this.props.cancelText} onClick={this.props.onCancel} className="common white" />
                    <Button text={this.props.okText} loading={this.state.loading} style={{ marginLeft: '52px' }}
                        onClick={() => this.props.onOk(
                            () => {
                                this.setState({
                                    loading: true
                                })
                            },
                            () => {
                                this.setState({
                                    loading: false
                                })
                            }
                        )} className="common" />
                </div>}
                {this.props.isSingle ? null :
                    <div>
                        <Collapse onChange={this.onCollapse.bind(this)} activeKey={this.state.key}>
                            <Panel header={<Divider><span>查看订单明细<i className={"icon-zuojiantou iconfont " + this.state.collapse}></i></span></Divider>} key="1">
                                <div id={that.scrollId} style={{ maxHeight: 'calc(100vh - 325px)', overflow: 'auto', marginTop: '12px' }}>
                                    <div >
                                        <Table columns={that.state.paymentColumns} dataSource={that.state.list} pagination={false} key></Table>
                                    </div>
                                </div>
                            </Panel>
                        </Collapse>
                    </div>}
            </div>
        )
    }
}