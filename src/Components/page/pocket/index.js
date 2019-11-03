import React from 'react';
import Layout from 'antd/lib/layout';
import { Table, Icon, Popover, Pagination } from 'antd';
import AjaxTable from '../../lib/table/ajaxTable'
import Button from '../../lib/button';
import ButtonP from '../../lib/button/promise';
import ImageViewer from '../../lib/imageViewer';
import SelectFilter from '../../yg-lib/selectFilter'
import MyRangerFilter from '../../yg-lib/rangePicker'
import InputFilter from '../../yg-lib/inputFilter'
import ScrollContainer from '../index';
import FreshComponent from '../freshbind';
import Reload from '../reload';
import Storage from 'gc-storage/es5'
import Events from 'gc-event/es5'
import './index.scss';
import {bankCharge,uploadModal as transfer} from '../../../rd/common'
import Utils from 'utils/utils';

class MyPocket extends FreshComponent {

    constructor(props) {
        super(props)
        this.statistic = true;
        this.state = {
            show: false,
            noselected: true,
            selectedRowKeys: [],
            addForm: {},
            exporting: false,
            statInfo: {},
            accountInfo: {},
            pageSize: Utils.PAGESIZE
        };
        this.finicialInfo = Utils.getInvoiceModel()
        this.filters = {};
        this.data = {};
        this.staticColumn = [{
            title: '期初账户余额',
            dataIndex: 'startAmount'
        }, {
            title: '充值金额',
            dataIndex: 'comeInAmount'
        }, {
            title: '支付金额',
            dataIndex: 'comeOutAmount'
        }, {
            title: '期末账户余额',
            dataIndex: 'endAmount'
        }];
        this.columns = [{
            title: '订单号',
            dataIndex: 'orderNo',
        }, {
            title: '交易类型',
            dataIndex: 'tradeType',
            render: (tradeType, row) => {
                switch (tradeType) {
                    case '0':
                        if (row.productType == 'oilRebate') {
                            return '返利';
                        } else {
                            return '充值';
                        }
                    case '1':
                        return '支出';
                    default:
                        return '';
                }
            }

        }, {
            title: '金额',
            dataIndex: 'amount'
        }, {
            // title: '对方户名',
            title: '司机姓名',
            // dataIndex: 'driverName',
            render: (row) => {
                if (row.productTypeName === '服务费') {
                    return '浙江优挂'
                } else {
                    return row.driverName
                }
            }
        },
        {
            title: '收款人姓名',
            dataIndex: 'payeeName',
        },
        {
            title: '收款账户',
            dataIndex: 'payeeBankAccountNo',
        }, {
            title: '支付方式',
            dataIndex: 'paymentTypeName',
        }, {
            title: '交易状态',
            dataIndex: 'statusName'
        }, {
            title: '客户费用',
            dataIndex: 'productTypeName',
        }, {
            title: '申请时间',
            dataIndex: 'dealTime'
        }, {
            title: '凭证',
            render: (row) => {
                let that = this;
                if (row.paymentType === 'offlinetransfer') {
                    return (
                        <div style={{ textAlign: 'center' }}>
                            <img src={row.voucherUrl} onClick={() => {
                                let state = {};
                                state['voucherView' + row.id] = true;
                                that.setState(state);
                            }} style={{ width: 24, height: 24 }} />
                            <ImageViewer thumb={'_600-600'} handleCancel={() => {
                                let state = {};
                                state['voucherView' + row.id] = false;
                                this.setState(state)
                            }} list={[row.voucherUrl]} show={that.state['voucherView' + row.id]} index={0} />
                        </div>
                    )
                }
            }

        }];
        this.getData = (params, call) => {
            let that = this;
            if (this.statistic) {
                params.statFlag = 1;
            }
            params.pageNum = params.pageNum;
            Utils.request({
                api: Utils.getApi('企业钱包','交易流水'),
                params: params,
                success: function (data) {

                    let r = {
                        list: data.dataList.data,
                        total: data.dataList.totalSize
                    }
                    that.data.tablelist = r;
                    if (data.statInfo) {
                        that.setState({
                            statInfo: data.statInfo
                        })
                    }
                    that.statistic = false;
                    call(r);
                }
            })
        }
    }

    componentWillMount() {
        var that = this;
        this.initAccount()
        Events.bind('企业钱包Open', function () {
            that.chargeModal();
        })
        Events.bind('企业钱包刷新', function () {
            that.initAccount();
        })
    }


    initAccount() {
        let that = this;
        Utils.request({
            api: Utils.getApi('企业钱包','账户信息'),
            beforeRequest() {
                that.pageLoading(true);
            },
            afterRequest() {
                that.pageLoading(false);
            },
            success: function (data) {
                that.setState({
                    accountInfo: {
                        ...data,
                        rebateAmount: Storage.get('rebateAmount')
                    }
                },()=>{
                    Storage.set('usableAmount',data.usableAmount)
                })
            }
        })
    }

    init() {
        this.setState({
            show: false,
            noselected: true,
            addForm: {}
        }, function () {
            this.refs.table.initTable();
        })
    }


    onItemSelected(keys, list) {
        this.setState({
            selectedRowKeys: keys
        })
    }

    export() {
        // let that = this;
        // that.addMemberModal()
        let that = this;
        Utils.request({
            api: Utils.getApi('企业钱包','导出'),
            beforeRequest() {
                that.setState({
                    exporting: true,
                })
            },
            afterRequest() {
                that.setState({
                    exporting: false,
                })
            },
            params: {
                // ...this.filters,
                ids: that.state.selectedRowKeys.length > 0 ? that.state.selectedRowKeys.toString() : null,
                statFlag: 0
            },
            download: true,
            fileName:Date.now() + '.xls'
        })
    }

    refresh() {
        this.props.reload();
        Utils.updatePocket()
    }

    search() {
        this.setState({
            selectedRowKeys: []
        })
        this.statistic = true;
        this.refs.table.setParam(this.filters);
        this.refs.table.initTable();
    }

    clean() {
        this.filters = {};
        this.refs.table.setParam({});
        for (let k in this.refs) {
            if (k.indexOf('filt_') > -1) {
                this.refs[k].clean();
            }
        }
    }

    notifyChange(addForm) {
        this.addData = addForm;
    }

    updateFilters(key, val) {
        this.filters[key] = val;
    }


    chargeModal() {
        return bankCharge()
    }

    render() {
        let that = this;
        const pagination = this.state.pagination || { total: 0, current: 0 };
        const content = (
            <Layout style={{ background: '#f5f5f5' }}>
                {/* <SidePage show={this.state.show} width={650} page={<OrderDtail/>}/> */}
                {/* <div className="list-search-box pocket">
                    <div className="amount-info" style={{display:'flex'}}>
                        <div className="content">
                            <div className="head">
                                <span className="title">账户余额</span>
                            </div>
                            <div className="info">
                                <span style={{marginRight:'12px'}}>
                                    <span className="amount">{this.state.accountInfo.usableAmount}</span>元
                                </span>
                                <Button onClick={this.chargeModal.bind(this)} text="充值" className="common"/>
                            </div>
                        </div>
                    </div>
                    <div className="amount-info">
                        <div className="content">
                            <div className="head">
                                <span className="title">当日支出</span>
                                <span className="amount">{this.state.accountInfo.payAmountToday}</span><span>元</span>
                            </div>
                            <div className="head">
                                <span className="title">当日充值</span>
                                <span className="amount">{this.state.accountInfo.rechargeAmountToday}</span><span>元</span>
                            </div>
                        </div>
                    </div>
                </div> */}

                <div className="list-search-box">
                    <div style={{ maxWidth: 'calc(100% - 300px)', width: '100%', display: 'inline-block' }}>
                        <div style={{ maxWidth: '1280px' }}>
                            <MyRangerFilter
                                ref="filt_rangeParam"
                                onStartChange={(val) => this.updateFilters.bind(this, 'startTime', val ? (val.format('YYYY-MM-DD') + ' 00:00:00') : '')()}
                                onEndChange={(val) => this.updateFilters.bind(this, 'endTime', val ? (val.format('YYYY-MM-DD' + ' 23:59:59')) : '')()}
                                text="申请时间" />
                            <SelectFilter ref="filt_selectParam1" handleChange={(e, v) => this.updateFilters.bind(this, 'tradeType', e)()} list={Utils.TRADE_TYPE} field={'filts'} value={'text'} text="交易类型" />
                            <SelectFilter ref="filt_selectParam2" handleChange={(e, v) => this.updateFilters.bind(this, 'paymentType', e)()} list={Utils.PAY_TYPE} field={'filts'} value={'text'} text="支付方式" />
                            <SelectFilter ref="filt_selectParam3" handleChange={(e, v) => this.updateFilters.bind(this, 'productType', e)()} list={Utils.CUS_FEE} field={'filts'} value={'text'} text="客户费用" />
                            <SelectFilter ref="filt_selectParam4" handleChange={(e, v) => this.updateFilters.bind(this, 'status', e)()} list={Utils.TRADE_STATUS} field={'filts'} value={'text'} text="交易状态" />
                            <InputFilter ref="filt_inputParam" text="条件搜索" style={this.hasAdd ? { float: 'left' } : {}} onChange={(e) => this.updateFilters.bind(this, 'keyword', e.target.value.replace(/\s+/g, ""))()} placeholder={'司机/收款人/订单号'} />
                        </div>
                    </div>
                    <div className="search-btn">
                        <Button onClick={this.clean.bind(this)} className="common white search" text="清空" />
                        <Button onClick={this.search.bind(this)} className="common search" text="查询" />
                    </div>
                </div>
                <div className="mytablebox" style={{ padding: '12px' }}>
                    <Table className="test-table" style={{ marginBottom: '12px' }} columns={this.staticColumn} pagination={false} dataSource={[this.state.statInfo]} />
                    <AjaxTable ref="table"
                        rowSelection={true}
                        selectedRowKeys={this.state.selectedRowKeys}
                        onItemSelected={this.onItemSelected.bind(this)}
                        onPaginationChange={(pagination) => {
                            this.setState({
                                pagination: pagination
                            })
                        }}
                        columns={this.columns} getData={this.getData} keyField="id" />
                </div>
            </Layout>
        );
        return (
            <div style={{height:'100%'}}>
                <div className="pocket_wrap">
                    <div className="pocket_content">

                        <div className="content">
                            <div className="head">
                                <span className="title">账户总余额</span>
                                <span style={{ marginRight: '12px' }}>
                                    <span className="amount" style={{ color: '#ff7800' }}>{(new Number(this.state.accountInfo.totalAmount||0).toLocaleString())}</span>
                                    <span>元</span>
                                </span>
                                <Button
                                        style={{marginLeft:'12px',position:'relative',top:'-3px'}}
                                        onClick={()=>{transfer(this.search.bind(this))}}
                                        text={"对公转账"}
                                        className="common" />
                            </div>
                           
                        </div>

                        <div className="content" style={{paddingTop:'6px'}}>
                            <div className="head">
                                <span className="title">账户余额</span>
                            </div>
                            <div className="info">
                                <span>
                                    <span className="amount">{new Number(this.state.accountInfo.usableAmount||0).toLocaleString()}</span>元
                            </span>
                            </div>
                        </div>


                        <div className="content" style={{paddingTop:'6px'}}>
                            <div className="head">
                                <span className="title">返利余额</span>
                            </div>
                            <div className="info">
                                <span>
                                    <span className="amount" style={{ marginLeft: '0' }}>{new Number(this.state.accountInfo.rebateAmount||0).toLocaleString()}</span>元
                            </span>
                            </div>
                        </div>

                    </div>
                    <div className='pocket_content'>
                        <div className="content">
                            <div className="head">
                                <span className="title">当日支出</span>
                                <span className="amount">{new Number(this.state.accountInfo.payAmountToday||0).toLocaleString()}</span><span>元</span>
                            </div>
                            <div className="head">
                                <span className="title">当日充值</span>
                                <span className="amount">{new Number(this.state.accountInfo.rechargeAmountToday||0).toLocaleString()}</span><span>元</span>
                            </div>
                        </div>
                    </div>
                </div>
                <ScrollContainer isList loading={this.state.pageloading} style={{height:'calc(100% - 156px)'}} height={'0px'} content={content} />
                <div className="kc-table-foot">
                    <div className="table-ctrl-box">
                        <Button loading={this.state.exporting} onClick={this.export.bind(this)} className="common" text="导出" />
                        <Button onClick={this.refresh.bind(this)} className="common white" text="刷新" />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div className="ajax-table-footer">
                            <span style={{ position: 'relative', top: '-10px', marginRight: '12px' }}>总计{pagination.total}条</span>
                            <Pagination style={{ display: 'inline-block' }} pageSizeOptions={['10', '20', '30', '50', '100']}
                                showSizeChanger onChange={(page, pageSize) => {
                                    if (that.refs.table) {
                                        that.refs.table.handlePageChange(page, pageSize)
                                    }
                                }} showQuickJumper
                                pageSize={this.state.pageSize}
                                onShowSizeChange={(page, pageSize) => {
                                    that.setState({
                                        pageSize: pageSize
                                    })
                                    if (that.refs.table) {
                                        that.refs.table.handlePageChange(page, pageSize)
                                    }
                                }}
                                current={pagination.current} total={pagination.total} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

export default class extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <Reload {...this.props} component={MyPocket} />
    }
}