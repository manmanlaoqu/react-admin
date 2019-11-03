import React from 'react';
import { Table, Collapse } from 'antd';
import Utils from 'utils/utils';
import Button from '../../lib/button';
import './index.scss'

const Panel = Collapse.Panel;
export default class extends React.Component {
    constructor(props) {
        super(props);
        this.id = 'batch-box-id-' + Utils.guid();
        this.state = {
            list: this.props.list,
            collapse: 'on'
        }
        this.paymentColumns = [{
            title: '订单号',
            dataIndex: 'orderNo'
        }, {
            title: '创建时间',
            dataIndex: 'createTime',
            render: (time) => {
                return time ? (new Date(time).format('yyyy-MM-dd hh:mm')) : ''
            }
        }, {
            title: '车牌号',
            dataIndex: 'vehiclePlateNo'
        }, {
            title: '支付款项',
            render: (row) => {
                return row.extinfo.amountTypeName
            }
        }, {
            title: "支付金额",
            render: (row) => {
                return row.extinfo.amountDetail
            }
        }]
    }

    onCollapse(keys) {
        let box = document.getElementById(this.id).parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
        if (keys.length > 0) {
            //增加宽度
            box.style.width = '800px';
            this.setState({
                collapse: 'on'
            })
        } else {
            //减小宽度
            box.style.width = '500px';
            this.setState({
                collapse: ''
            })
        }
    }

    render() {
        const { payResultCount } = this.props;
        var that = this;
        return (
            <div className="batch-table" style={{ textAlign: 'center' }} id={this.id}>
                {payResultCount.cashCount > 0 ?
                    <div className="result-item">
                        现金：{payResultCount.cashFailedCount > 0 ?
                            <span style={{ color: '#fc2c2c' }}>支付失败{payResultCount.cashFailedCount}笔</span> : <span>支付成功</span>}
                    </div>
                    :
                    null}
                {payResultCount.oilCount > 0 ?
                    <div className="result-item">油卡：{payResultCount.oilFailedCount > 0 ?
                        <span style={{ color: '#fc2c2c' }}>支付失败{payResultCount.oilFailedCount}笔</span> : <span>支付成功</span>}
                    </div>
                    :
                    null}
                {payResultCount.serveCount > 0 ?
                    <div className="result-item">服务费：{payResultCount.serveFailedCount > 0 ?
                        <span style={{ color: '#fc2c2c' }}>支付失败{payResultCount.serveFailedCount}笔</span> : <span>支付成功</span>}
                    </div>
                    :
                    null}
                <div className="batch-btn">
                    <Button text="好，知道了" onClick={() => this.props.onOk()} className="common white" />
                </div>
                <div>
                    <Collapse onChange={this.onCollapse.bind(this)} defaultActiveKey={['1']}>
                        <Panel header={<span>查看订单明细<i className={"icon-zuojiantou iconfont " + this.state.collapse}></i></span>} key="1">
                            <Table columns={that.paymentColumns} dataSource={that.state.list} pagination={false} key></Table>
                        </Panel>
                    </Collapse>
                </div>
            </div>
        )
    }
}