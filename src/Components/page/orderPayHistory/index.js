import React from 'react';
import Layout from 'antd/lib/layout';
import { LocaleProvider, Pagination } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';

import AjaxTable from '../../lib/table/ajaxTable'
import Button from '../../lib/button';
import SelectFilter from '../../yg-lib/selectFilter';
import MyRangerFilter from '../../yg-lib/rangePicker';
import ScrollContainer from '../index';
import FreshComponent from '../freshbind';
import InputFilter from '../../yg-lib/inputFilter';
import AreaFilter from '../../yg-lib/areaFilter'
import Reload from '../reload';
import Utils from 'utils/utils';
import Highlight from '../../lib/highlight'
import Events from 'gc-event/es5'

class OrderManage extends FreshComponent {
    constructor(props) {
        super(props)
        this.state = {
            status: this.props.type || 'ALL',
            list: [],
            count: 0,
            rowSelection: true,
            selectedRowKeys: [],
            noChecked: false,
            minPrice: '',
            maxPrice: '',
            pageSize: Utils.PAGESIZE
        };
        this.selectedListMap = {};
        this.filters = {};
        this.data = {};

        this.columns = [{
            title: '创建时间',
            dataIndex: 'createTime',
            render: (createTime) => {
                return createTime ? new Date(createTime).format('yyyy-MM-dd hh:mm') : ''
            }
        }, {
            title: '申请时间',
            dataIndex: 'applyTime',
            render: (applyTime, row) => {
                return applyTime ? new Date(applyTime).format('yyyy-MM-dd hh:mm') : null
            }
        }, {
            title: '支付时间',
            dataIndex: 'payTime',
            render: (payTime, row) => {
                return payTime ? new Date(payTime).format('yyyy-MM-dd hh:mm') : null
            }
        }, {
            title: '订单号',
            dataIndex: 'orderNo',
            render: (orderNo, row) => {
                return Utils.getApi('订单管理', '详情') ?
                    <a href="javascript:void(0)" className={(row.exceptionType == 1) ? 'redText' : ''}
                        onClick={() => {
                            Events.emit('addTab', {
                                moduleText: '订单详情-' + orderNo,
                                module: '订单详情-' + orderNo,
                                ext: {
                                    order: {
                                        ...row,
                                        id: row.orderId
                                    }
                                }
                            })
                        }}><Highlight
                            str={orderNo}
                            keyword={this.keyword}
                        /></a> : <Highlight
                        str={orderNo}
                        keyword={this.keyword}
                    />
            }
        }, {
            title: '支付款项',
            dataIndex: 'stageName'
        }, {
            title: '付款类型',
            dataIndex: 'typeName'
        }, {
            title: '支付金额（元）',
            dataIndex: 'amountStr',
        }, {
            title: '支付状态',
            dataIndex: 'payStatusStr',
        }, {
            title:'服务费（元）',
            dataIndex:'taxAmountStr',
        }, {
            title: '服务费支付状态',
            dataIndex: 'taxPayStatusStr',
        }, {
            title: '收款人',
            dataIndex: 'payeeName',
            render: (str) => {
                return <Highlight
                    str={str}
                    keyword={this.keyword}
                />
            }
        }, {
            title: '申请人',
            dataIndex: 'applyByUserName',
            render: (str) => {
                return <Highlight
                    str={str}
                    keyword={this.keyword}
                />
            }
        }, {
            title: '订单状态',
            dataIndex: 'orderStatusStr',
        }, {
            title: '装货地',
            dataIndex: 'fromAddress',
            render: (fromName) => {
                return (fromName || '').replace('|', '')
            }
        }, {
            title: '卸货地',
            dataIndex: 'toAddress',
            render: (toName) => {
                return (toName || '').replace('|', '')
            }
        }];

        /**
         * 列表查询
         */
        this.getData = (params, call) => {
            let that = this;
            Utils.request({
                api: Utils.getApi('支付记录', '列表'),
                params: {
                    applyType: 'PAYED',
                    ...params
                },
                success: function (data) {
                    let r = {
                        list: data.data,
                        total: data.totalSize
                    }
                    that.data.tablelist = r
                    if (that.filters['keyword']) {
                        that.keyword = that.filters['keyword']
                    } else {
                        that.keyword = null
                    }
                    call(r);
                }
            })
        }
    }

    /**
     * 刷新列表
     */
    refreshTable() {
        this.refs.table.getData();
    }

    // 搜索条件
    updateFilters(key, val) {
        this.filters[key] = val;
    }

    // onItemSelected(keys, list) {
    //     let that = this;
    //     list.map((order) => {
    //         that.selectedListMap[order.id] = order;
    //     })
    //     that.selectedList = keys.map((id) => {
    //         return that.selectedListMap[id];
    //     })
    //     // this.data.selected = list;
    //     if (list.length > 0) {
    //         that.setState({
    //             data: that.selectedList,
    //             count: keys.length,
    //             list: that.selectedList,
    //             selectedRowKeys: keys
    //         })
    //     } else {
    //         that.setState({
    //             data: [],
    //             list: [],
    //             count: 0,
    //             selectedRowKeys: keys
    //         })
    //     }
    // }

    search() {
        this.refs.table.setParam(this.filters);
        this.refs.table.initTable();
    }

    clean() {
        this.filters = {};
        this.refs.table.setParam({});
        this.setState({
            filtTo: '',
            filtFrom: '',
        })
        for (let k in this.refs) {
            if (k.indexOf('filt_') > -1) {
                this.refs[k].clean();
            }
        }
    }

    filter(inputValue, path) {
        return (path.some(option => (option.name).toLowerCase().indexOf(inputValue.toLowerCase()) > -1));
    }

    render() {
        let that = this;
        const pagination = this.state.pagination || { total: 0, current: 0 };
        const content = (
            <div>
                <div className="list-search-box">
                    <div style={{ maxWidth: 'calc(100vw - 300px)', width: '100%', display: 'inline-block' }}>
                        <div style={{ maxWidth: '1280px' }}>
                            <MyRangerFilter
                                style={this.hasAdd ? { float: 'left' } : {}}
                                ref="filt_rangeParam1"
                                onStartChange={(val) => this.updateFilters.bind(this, 'applyStartTime', val ? (val.format('YYYY-MM-DD') + ' 00:00:00') : '')()}
                                onEndChange={(val) => this.updateFilters.bind(this, 'applyEndTime', val ? (val.format('YYYY-MM-DD' + ' 23:59:59')) : '')()}
                                text="申请时间" />
                            <MyRangerFilter
                                style={this.hasAdd ? { float: 'left' } : {}}
                                ref="filt_rangeParam2"
                                onStartChange={(val) => this.updateFilters.bind(this, 'payStartTime', val ? (val.format('YYYY-MM-DD') + ' 00:00:00') : '')()}
                                onEndChange={(val) => this.updateFilters.bind(this, 'payEndTime', val ? (val.format('YYYY-MM-DD' + ' 23:59:59')) : '')()}
                                text="支付时间" />
                            <MyRangerFilter
                                style={this.hasAdd ? { float: 'left' } : {}}
                                ref="filt_rangeParam3"
                                onStartChange={(val) => this.updateFilters.bind(this, 'createStartTime', val ? (val.format('YYYY-MM-DD') + ' 00:00:00') : '')()}
                                onEndChange={(val) => this.updateFilters.bind(this, 'createEndTime', val ? (val.format('YYYY-MM-DD' + ' 23:59:59')) : '')()}
                                text="创建时间" />
                            <SelectFilter ref="filt_selectParam1"
                                handleChange={(e, v) => this.updateFilters.bind(this, 'stage', e)()}
                                list={Utils.PAYMENT_STAGE} field={'filts'}
                                value={'text'} text="支付款项" />
                            <SelectFilter ref="filt_selectParam2"
                                handleChange={(e, v) => this.updateFilters.bind(this, 'type', e)()}
                                list={Utils.PAYMENT_TYPE} field={'filts'}
                                value={'text'} text="付款类型" />
                            <AreaFilter ref="filt_area"
                                onFromSelected={(val) => {
                                    this.updateFilters('fromName', val);
                                }}
                                onToSelected={(val) => {
                                    this.updateFilters('toName', val);
                                }} />
                            <SelectFilter ref="filt_selectParam4" handleChange={(e, v) => this.updateFilters.bind(this, 'payStatus', e)()} list={Utils.PAY_STATE} field={'filts'} value={'text'} text="支付状态" />
                            <InputFilter ref="filt_inputParam"
                                text="条件搜索"
                                onKeyDown={(e) => {
                                    if (e.keyCode === 13) {
                                        this.search();
                                    }
                                }}
                                onChange={(e) => this.updateFilters.bind(this, 'keyword', e.target.value.replace(/\s+/g, ""))()}
                                placeholder={'申请人/订单号'} />
                        </div>
                    </div>
                    <div className="search-btn">
                        <Button onClick={this.clean.bind(this)} className="common white search" text="清空" />
                        <Button onClick={this.search.bind(this)} className="common search" text="查询" />
                    </div>
                </div>

                <Layout style={{ background: '#f5f5f5' }}>
                    {/* <SidePage show={this.state.show} width={650} page={<OrderDtail/>}/> */}

                    <div className="mytablebox" style={{ padding: '12px' }}>
                        <AjaxTable
                            rowSelection={this.state.rowSelection}
                            selectedRowKeys={this.state.selectedRowKeys}
                            placeholder={this.hasAdd ? <div style={{ textAlign: 'center', height: '300px', display: 'table' }}>
                                <div style={{ display: 'table-cell', verticalAlign: 'middle' }}>
                                    <i style={{ fontSize: '46px', color: '#ced3df' }} className="iconfont icon-unie633"></i>
                                    <p style={{ color: '#ced3df', position: 'relative', top: '-6px' }}>暂无订单数据</p>
                                    <Button text="创建订单" className="common" onClick={this.events.add.bind(this)} />
                                </div>
                            </div> : null}
                            ref="table"
                            columns={this.columns}
                            getData={this.getData}
                            keyField="id"
                            onPaginationChange={(pagination) => {
                                this.setState({
                                    pagination: pagination
                                })
                            }}
                            // onItemSelected={this.onItemSelected.bind(this)}
                        />
                    </div>
                </Layout >
            </div>
        );

        return (
            <LocaleProvider locale={zh_CN}>
                <div style={{ height: '100%' }}>
                    <ScrollContainer isList loading={this.state.pageloading} init style={{ height: 'calc(100% - 52px)' }} init height={'0px'} content={content} />
                    <div className="kc-table-foot">
                        <div className="table-ctrl-box">
                            {/* <Button text="导出"
                                loading={this.state.exporting}
                                className="common white" onClick={() => { }} /> */}
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
            </LocaleProvider>
        )
    }

}

export default class extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <Reload {...this.props} component={OrderManage} />
    }
}