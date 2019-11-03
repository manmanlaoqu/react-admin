import React from 'react';
import Layout from 'antd/lib/layout';
import { Tabs, Upload, LocaleProvider, Button as AButton, Pagination } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';

import AjaxTable from '../../lib/table/ajaxTable'
import Button from '../../lib/button';
import SelectFilter from '../../yg-lib/selectFilter';
import MyRangerFilter from '../../yg-lib/rangePicker';
import OrderSide from '../../yg-lib/order-side'
import ScrollContainer from '../index';
import FreshComponent from '../freshbind';
import InputFilter from '../../yg-lib/inputFilter';
import VehicleColor from '../../yg-lib/vehicleColor'
import AreaFilter from '../../yg-lib/areaFilter'
import InpRangeFilter from '../../yg-lib/inputRangeFilter'
import Reload from '../reload';
import Enum from '../../../lib/enum'
import OrderUtils from '../../../lib/orderUtils';
import Highlight from '../../lib/highlight'
import Utils from 'utils/utils';
import Events from 'gc-event/es5'

class OrderManage extends FreshComponent {
    constructor(props) {
        super(props)
        this.state = {
            status: 'WAIT_PAY',
            list: [],
            pagination: {},
            count: 0,
            rowSelection: true,
            selectedRowKeys: [],
            pageSize: Utils.PAGESIZE
        };
        this.apikey = this.props.apikey
        this.selectedListMap = {};
        let that = this;

        this.filters = {};
        this.data = {};


        this.payColumns = [{
            title: '创建时间',
            dataIndex: 'orderCreateTime',
            render: (orderCreateTime) => {
                return orderCreateTime ? new Date(orderCreateTime).format('yyyy-MM-dd hh:mm') : ''
            }
        }, {
            title: '创建人',
            dataIndex: 'createByUserName',
            render: (str) => {
                return <Highlight
                    str={str}
                    keyword={this.keyword}
                />
            }
        }, {
            title: '申请款项',
            dataIndex: 'stageName',
        }, {
            title: '付款类型',
            dataIndex: 'typeName',
        }, {
            title: '申请支付金额（元）',
            dataIndex: 'amountName',
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
            title: '服务费（元）',
            dataIndex: 'taxAmountName',
            render: (taxAmountName) => {
                return taxAmountName && parseFloat(taxAmountName) > 0 ? taxAmountName : '--'
            }
        }, {
            title: '操作',
            render: (row) => {
                return Utils.getApi(this.apikey, '申请支付') ?
                    <a href="javascript:void(0)"
                        onClick={() => {
                            OrderUtils.batchPayAction([row], 0, () => { that.refreshTable() })
                        }}>申请</a> : '--'
            }
        }, {
            title: '支付状态',
            dataIndex: 'paymentStatusName',
        }, {
            title: '订单号',
            dataIndex: 'orderNo',
            render: (price, row) => {
                return Utils.getApi(this.apikey, '详情') ?
                    <a href="javascript:void(0)" className={(row.exceptionType == 1) ? 'redText' : ''}
                        onClick={() => Events.emit('addTab', {
                            moduleText: '订单详情-' + row.orderNo,
                            module: '订单详情-' + row.orderNo,
                            ext: {
                                order: {
                                    ...row,
                                    id: row.orderId
                                }
                            }
                        })}>{row.orderNo}</a> : row.orderNo
            }
        }, {
            title: '订单状态',
            dataIndex: 'statusName',
        }, {
            title: '承运司机',
            dataIndex: 'askDriverName',
            render: (str) => {
                return <Highlight
                    str={str}
                    keyword={this.keyword}
                />
            }
        }, {
            title: '车牌号',
            dataIndex: 'askVehiclePlateNo',
            render: (askVehiclePlateNo, row) => {
                return row.askVehiclePlateNo ? <span>
                    <Highlight
                        str={row.askVehiclePlateNo}
                        keyword={this.keyword}
                    />
                    <VehicleColor color={row.askVehiclePlateColor ? row.askVehiclePlateColor.replace('色', '') : ''} />
                </span> : null
            }
        }, {
            title: '货物名称',
            dataIndex: 'cargoName',
        }, {
            title: '总运费',
            dataIndex: 'totalPriceName',
        }, {
            title: '装货地',
            dataIndex: 'fromName',
            render: (fromName) => {
                return (fromName || '').replace('|', '')
            }
        }, {
            title: '卸货地',
            dataIndex: 'toName',
            render: (toName) => {
                return (toName || '').replace('|', '')
            }
        }]

        /**
         * 列表查询
         */
        this.getData = (params, call) => {
            let that = this;
            if (!params.status) {
                params.status = 'WAIT_PAY'
            }
            Utils.request({
                api: Utils.getApi(this.apikey, '查询'),
                params: params,
                success: function (data) {
                    let r = {
                        list: data.data,
                        total: data.totalSize
                    }
                    that.data.tablelist = r;
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
        this.setState({
            selectedRowKeys: []
        }, () => {
            this.orderSide.setData({})
            this.orderSide.toggleHide(false)
        })
        this.selectedList = []
    }

    /**
     * 初始化
     */
    init() {
        this.setState({
            // data: [],
            list: [],
            count: 0,
        }, function () {
            this.refs.table.initTable();
        })
    }

    // 搜索条件
    updateFilters(key, val) {
        if (key == 'payStatus') {
            this.setState({
                payStatus: val,
                selectedRowKeys: [],
                data: [],
                list: [],
                count: 0,
            })
        }
        this.filters[key] = val;
    }

    onItemSelected(keys, list) {
        if (keys.length == 0) {
            this.setState({
                selectedRowKeys: []
            }, () => {
                this.orderSide.setData({})
                this.orderSide.toggleHide(false)
            })
            this.selectedList = []
        } else {
            this.selectedList = list
            this.setState({
                selectedRowKeys: keys
            }, () => {
                setTimeout(() => {
                    this.orderSide.setData((() => {
                        let totalPrice = 0, tax = 0, cash = 0, oil = 0, countMap = {}, count = 0
                        this.selectedList.map(price => {
                            if (price.type === Enum.PaymentType.CASH && price.stage != Enum.PaymentStage.TAX) {
                                cash += price.amount
                            }
                            if (price.type === Enum.PaymentType.OIL) {
                                oil += price.amount
                            }
                            if (price.stage === Enum.PaymentStage.TAX) {
                                tax += price.amount
                            }
                            totalPrice += price.amount
                            if (price.taxAmount) {
                                tax += price.taxAmount
                                totalPrice += price.taxAmount
                            }
                            if (!countMap[price.orderNo]) {
                                countMap[price.orderNo] = true
                                count++
                            }
                        })
                        return {
                            tax: (tax / 100).toFixed(2),
                            totalPrice: (totalPrice / 100).toFixed(2),
                            cash: (cash / 100).toFixed(2),
                            oil: (oil / 100).toFixed(2),
                            count: count
                        }
                    })())
                }, 100)
            })
        }
    }



    export() {
        // if (this.state.selectedRowKeys.length < 1) {
        //     return;
        // }
        let that = this;
        Utils.request({
            api: Utils.getApi(that.apikey, '查询'),
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
                ids: that.state.selectedRowKeys.length > 0 ? that.state.selectedRowKeys.toString() : null,
                pageNum: -1,
                export: true
            },
            download: true,
            fileName:Date.now() + '.xls'
        })
    }

    search() {
        if (this.state.minPrice && this.state.maxPrice) {
            if (parseFloat(this.state.maxPrice) <= parseFloat(this.state.minPrice)) {
                Utils.Message.warning('最大金额要大于最小金额')
                return

            }
        }

        this.filters['status'] = 'WAIT_PAY';  //所选择的key
        this.refs.table.setParam(this.filters);
        this.setState({
            selectedRowKeys: [],
            data: [],
            list: [],
            count: 0,
        })
        this.refs.table.initTable();
    }

    clean() {
        this.filters = {};
        this.filters.status = 'WAIT_PAY';
        this.refs.table.setParam({});
        this.setState({
            payStatus: null
        })
        for (let k in this.refs) {
            if (k.indexOf('filt_') > -1) {
                this.refs[k].clean();
            }
        }
    }

    render() {
        let that = this;
        const pagination = this.state.pagination || { total: 0, current: 0 };
        const content = (
            <div>
                <div className="list-search-box">
                    <div style={{ maxWidth: 'calc(100vw - 300px)', width: '100%', display: 'inline-block' }}>
                        <div>
                            <MyRangerFilter
                                style={this.hasAdd ? { float: 'left' } : {}}
                                ref="filt_rangeParam"
                                onStartChange={(val) => this.updateFilters.bind(this, 'createStartTime', val ? (val.format('YYYY-MM-DD') + ' 00:00:00') : '')()}
                                onEndChange={(val) => this.updateFilters.bind(this, 'createEndTime', val ? (val.format('YYYY-MM-DD' + ' 23:59:59')) : '')()}
                                text="创建时间" />
                            <AreaFilter ref="filt_area"
                                onFromSelected={(val) => {
                                    this.updateFilters('fromName', val);
                                }}
                                onToSelected={(val) => {
                                    this.updateFilters('toName', val);
                                }} />
                            <InpRangeFilter
                                ref="filt_inpRange"
                                onMin={(val) => {
                                    this.updateFilters('minPrice', val);
                                }}
                                onMax={(val) => {
                                    this.updateFilters('maxPrice', val);
                                }}
                            />
                            <SelectFilter ref="filt_selectParam2" handleChange={(e, v) => this.updateFilters.bind(this, 'type', e)()} list={Utils.FILT_TYPE} field={'filts'} value={'text'} text="支付类型" />
                            <SelectFilter ref="filt_selectParam3" handleChange={(e, v) => this.updateFilters.bind(this, 'stage', e)()} list={Utils.FILT_STAGE} field={'filts'} value={'text'} text="付款方式" />
                            <InputFilter ref="filt_inputParam" text="条件搜索"
                                onChange={(e) => this.updateFilters.bind(this, 'keyword', e.target.value.replace(/\s+/g, ""))()}
                                onKeyDown={(e) => {
                                    if (e.keyCode === 13) {
                                        this.search();
                                    }
                                }}
                                placeholder={'请输入搜索关键字'} />
                        </div>
                    </div>
                    <div className="search-btn">
                        <Button onClick={this.clean.bind(this)} className="common white search" text="清空" />
                        <Button onClick={this.search.bind(this)} className="common search" text="查询" />
                    </div>
                </div>

                <Layout style={{ background: '#f5f5f5' }}>
                    <div className="mytablebox" style={{ padding: '12px' }}>
                        <AjaxTable
                            rowSelection={this.state.rowSelection}
                            selectedRowKeys={this.state.selectedRowKeys}
                            ref="table"
                            columns={this.payColumns}
                            getData={this.getData}
                            keyField="id"
                            onPaginationChange={(pagination) => {
                                this.setState({
                                    pagination: pagination
                                })
                            }}
                            onItemSelected={this.onItemSelected.bind(this)}
                        />
                    </div>
                </Layout >
            </div>
        );

        return (
            <LocaleProvider locale={zh_CN}>
                <div style={{ height: '100%' }}>
                    <ScrollContainer isList loading={this.state.pageloading} style={{ height: 'calc(100% - 52px)' }} init height={'0px'} content={content} />
                    <div className="kc-table-foot">
                        <div className="table-ctrl-box">
                            {Utils.getApi(that.apikey, '申请支付') ?
                                <Button text="批量申请"
                                    className="common"
                                    onClick={() => { OrderUtils.batchPayAction(this.selectedList, 0, () => { that.refreshTable() }) }}
                                    disabled={!this.selectedList || this.selectedList.length == 0} /> : ''}
                            {/* <Button text="导出"
                                loading={this.state.exporting}
                                className="common white" onClick={this.export.bind(this)} /> */}
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
                    <OrderSide ref={ele => { this.orderSide = ele }} />
                </div>
            </LocaleProvider>
        )
    }
}

class OrderBtn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        }
    }
    render() {
        let { text, dis, fun, className, style } = this.props;
        let that = this;
        let disabled = dis || !fun
        style = style || {}
        className = className || ''
        if (disabled) {
            style.color = '#999 important'
        }
        return <AButton disabled={disabled}
            className={'order-inner-btn ' + className}
            style={style}
            loading={this.state.loading}
            onClick={(e) => {
                that.setState({
                    loading: true
                }, function () {
                    setTimeout(function () {
                        that.setState({
                            loading: false
                        })
                    }, 500)
                })
                fun()
            }}>{text}</AButton>
    }
}

export default class OrderReload extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <Reload {...this.props} component={OrderManage} />
    }
}