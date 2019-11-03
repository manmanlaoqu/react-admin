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
import NewInvoice from '../../modal/newInvoice';
import OrderImport from '../../modal/orderImport';
import OrderUtils from '../../../lib/orderUtils';
import Highlight from '../../lib/highlight'
import Utils from 'utils/utils';
import Storage from 'gc-storage/es5'
import Events from 'gc-event/es5'
import './index.scss'




let cityTree = Storage.get('dictionary').location, cityMap = {};
const options = cityTree.map(item => {
    return {
        value: item.name,
        label: item.name,
        // value: item.name.indexOf('黑龙江') > -1 ? item.name.substring(0, 3) : item.name.substring(0, 2),
        // label: item.name.indexOf('黑龙江') > -1 ? item.name.substring(0, 3) : item.name.substring(0, 2),
        provinceCode: item.code,
        children: item.nodes.map(city => {
            return {
                cityCode: city.code,
                value: city.name,
                label: city.name,
            }
        })
    }
})

const TabPane = Tabs.TabPane;
class OrderManage extends FreshComponent {
    constructor(props) {
        super(props)
        this.state = {
            status: this.props.type || 'ALL',
            list: [],
            pagination: {},
            count: 0,
            rowSelection: true,
            selectedRowKeys: [],
            abnormalOrderNum: Storage.get('abnormalOrderNum'),
            pageSize: Utils.PAGESIZE
        };
        this.apikey = this.props.apikey
        this.OrderStatus = this.props.type || 'ALL'
        this.selectedListMap = {};
        this.hasAdd = Storage.get('userModule')['创建订单'];   //true
        this.hasCopy = Storage.get('apiMap')[this.apikey]['详情']
        let that = this;
        Storage.watch('abnormalOrderNum', function (data) {
            that.setState({
                abnormalOrderNum: data
            })
        });
        this.filters = {};
        this.data = {};

        this.columns = [{
            title: '创建时间',
            dataIndex: 'createTime',
            render: (createTime) => {
                return createTime ? new Date(createTime).format('yyyy-MM-dd hh:mm') : null
            }
        }, {
            title: '订单号',
            dataIndex: 'orderNo',
            render: (orderNo, row) => {
                return Utils.getApi(that.apikey, '详情') ?
                    <a href="javascript:void(0)" className={(row.exceptionType == 1) ? 'redText' : ''}
                        onClick={() => this.events.checkDetail.bind(this, orderNo, row)()}><Highlight
                            str={orderNo}
                            keyword={this.keyword}
                        /></a> : <Highlight
                        str={orderNo}
                        keyword={this.keyword}
                    />
            }
        }, {
            title: '操作',
            dataIndex: 'orderOptStatusName',
            render: (orderOptStatusName, row) => {
                let that = this;
                let orderOptStatus = row.orderOptStatus
                switch (orderOptStatus) {
                    case 'exception':
                        return <OrderBtn text="异常申诉" dis={!Utils.getApi(that.apikey, '详情')} className={'redText '} fun={that.events.checkDetail.bind(that, row.orderNo, row)} />
                    case 'contract':
                        return <Upload {...OrderUtils.getUpLoadProps((url) => {
                            Utils.request({
                                api: Utils.getApi(that.apikey, '上传合同'),
                                beforeRequest() {
                                    that.pageLoading(true);
                                },
                                afterRequest() {
                                    that.pageLoading(false);
                                },
                                params: {
                                    orderId: row.id,
                                    contractUrl: url
                                },
                                success: function (data) {
                                   
                                    that.refs.table.initTable();
                                    Events.emit('onOrderId' + row.id + 'Update');
                                }
                            })
                        })} className="table-upload">
                            <a href='javascript:void(0)'>{orderOptStatusName}</a>
                        </Upload>
                    case 'assign':
                        if (Utils.getApi(that.apikey, '指派')) {
                            return <OrderBtn text={orderOptStatusName} dis={false} fun={() => {
                                OrderUtils.getOrderDetail({
                                    id: row.id,
                                    success: (order) => {

                                        let driver = {}, vehicle = {}
                                        if (order.askDriverPhone) {
                                            driver.phone = order.askDriverPhone
                                        }
                                        if (order.askVehicleId) {
                                            vehicle.id - order.askVehicleId
                                        }
                                        OrderUtils.orderDispatch(order.askDriverPhone ? 1 : 0, driver, vehicle, false, function (selectedDriver, selectedVehicle) {
                                            //刷新列表
                                            Utils.request({
                                                api: Utils.getApi(that.apikey, '指派'),
                                                params: {
                                                    askDriverPhone: selectedDriver.phone,
                                                    askVehicleId: selectedVehicle.id,
                                                    orderId: order.id
                                                },
                                                success: function (data) {
                                                    that.refs.table.initTable();
                                                    Events.emit('onOrderId' + order.id + 'Update');
                                                }
                                            })
                                        })
                                    }
                                })
                            }} />
                        } else {
                            return <OrderBtn text={'待派车'} dis={true} />
                        }
                    case 'waitingVerify':
                        return <OrderBtn text={orderOptStatusName} dis={false} fun={() => {
                            OrderUtils.getOrderDetail({
                                id: row.id,
                                success: (od) => {
                                    OrderUtils.goVerify(od, function () {
                                        that.refs.table.initTable();
                                        Events.emit('onOrderId' + od.id + 'Update');
                                    });
                                }
                            })
                        }} />
                    case 'uploadTransferVoucher':
                        return <Upload {...OrderUtils.getUpLoadProps((url) => {
                            Utils.request({
                                api: Utils.getApi(that.apikey, '上传司机转账凭证'),
                                beforeRequest() {
                                    that.pageLoading(true);
                                },
                                afterRequest() {
                                    that.pageLoading(false);
                                },
                                params: {
                                    orderId: row.id,
                                    transferVoucherImage: url
                                },
                                success: function (data) {
                                    that.refs.table.initTable();
                                    Events.emit('onOrderId' + row.id + 'Update');
                                }
                            })
                        })} className="table-upload">
                            <a href='javascript:void(0)'>{orderOptStatusName}</a>
                        </Upload>
                    default:
                        return <OrderBtn text={orderOptStatusName} dis={true} />
                }
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
            title: '订单状态',
            dataIndex: 'statusName',
        }, {
            title: '装货地',
            dataIndex: 'fromName',
            render: (fromName, row) => {
                return (row.fromName || '').replace('|', '')
            }
        }, {
            title: '卸货地',
            dataIndex: 'toName',
            render: (toName, row) => {
                return (row.toName || '').replace('|', '')
            }
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
            title: '司机手机号',
            dataIndex: 'askDriverPhone',
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
            title: '总运费（元）',
            render: (row) => {
                return (parseFloat(row.totalPriceName) - parseFloat(row.taxPriceName)).toFixed(2)
            }
        }, {
            title: '服务费（元）',
            dataIndex: 'taxPriceName',
        }, {
            title: '合计（元）',
            dataIndex: 'totalPriceName',
        }
            // , {
            //     title: '预付油卡（元）',
            //     render: (row) => {
            //         row.priceItemEntityList = row.priceItemEntityList || []
            //         let price = row.priceItemEntityList.find(item => {
            //             return item.type == Enum.PaymentType.OIL && item.stage == Enum.PaymentStage.PRE
            //         })
            //         return <OrderPriceColumn price={price} />
            //     }
            // }, {
            //     title: '预付现金（元）',
            //     render: (row) => {
            //         row.priceItemEntityList = row.priceItemEntityList || []
            //         let price = row.priceItemEntityList.find(item => {
            //             return item.type == Enum.PaymentType.CASH && item.stage == Enum.PaymentStage.PRE
            //         })
            //         return <OrderPriceColumn price={price} />
            //     }
            // }, {
            //     title: '尾款油卡（元）',
            //     render: (row) => {
            //         row.priceItemEntityList = row.priceItemEntityList || []
            //         let price = row.priceItemEntityList.find(item => {
            //             return item.type == Enum.PaymentType.OIL && item.stage == Enum.PaymentStage.REST
            //         })
            //         return <OrderPriceColumn price={price} />
            //     }
            // }, {
            //     title: '尾款现金（元）',
            //     render: (row) => {
            //         row.priceItemEntityList = row.priceItemEntityList || []
            //         let price = row.priceItemEntityList.find(item => {
            //             return item.type == Enum.PaymentType.CASH && item.stage == Enum.PaymentStage.REST
            //         })
            //         return <OrderPriceColumn price={price} />
            //     }
            // }, {
            //     title: '回单油卡（元）',
            //     render: (row) => {
            //         row.priceItemEntityList = row.priceItemEntityList || []
            //         let price = row.priceItemEntityList.find(item => {
            //             return item.type == Enum.PaymentType.OIL && item.stage == Enum.PaymentStage.RECEIPT
            //         })
            //         return <OrderPriceColumn price={price} />
            //     }
            // }, {
            //     title: '回单现金（元）',
            //     render: (row) => {
            //         row.priceItemEntityList = row.priceItemEntityList || []
            //         let price = row.priceItemEntityList.find(item => {
            //             return item.type == Enum.PaymentType.CASH && item.stage == Enum.PaymentStage.RECEIPT
            //         })
            //         return <OrderPriceColumn price={price} />
            //     }
            // }
        ];

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
                return Utils.getApi(that.apikey, '申请支付') ?
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
                return Utils.getApi(that.apikey, '详情') ?
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
            if (!this.inited && this.props.type && (Date.now() - this.props.time) < 500) {
                this.inited = true;
                this.filtStatus(this.props.type);
                return;
            }
            if (!params.status) {
                if (!that.OrderStatus) {
                    params.status = 'ALL'
                    that.OrderStatus = 'ALL'
                } else {
                    params.status = that.OrderStatus
                }
            }
            Utils.request({
                api: Utils.getApi(that.apikey, '查询'),
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
                    if (that.OrderStatus == 'ABNORMAL') {
                        Storage.set('abnormalOrderNum', data.totalSize)
                    }
                    if (params.status == that.OrderStatus || that.OrderStatus == 'ALL') {
                        call(r);
                    }
                }
            })
        }
    }

    componentWillMount() {
        let that = this;
        Events.bind('filtOrderType', function (type) {
            that.filtStatus(type);
        });
        Events.bind('initOrderList', function () {
            that.init();
        })
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
        // this.renderSelections(this.state.status);
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
                        if (this.state.status === 'WAIT_PAY') {
                            //支付项列表
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
                        } else {
                            this.selectedList.map(order => {
                                totalPrice += order.totalPrice;
                                tax += order.taxPrice;
                                order.priceItemEntityList.map(price => {
                                    if (price.type === Enum.PaymentType.CASH && price.stage != Enum.PaymentStage.TAX) {
                                        cash += price.amount
                                    }
                                    if (price.type === Enum.PaymentType.OIL) {
                                        oil += price.amount
                                    }
                                })
                            })
                            return {
                                tax: (tax / 100).toFixed(2),
                                totalPrice: (totalPrice / 100).toFixed(2),
                                cash: (cash / 100).toFixed(2),
                                oil: (oil / 100).toFixed(2),
                                count: this.selectedList.length
                            }
                        }
                    })())
                }, 100)
            })
        }
    }



    events = {
        cancel: function (order) {
            let that = this;
            Utils.confirm({
                title: '确认取消订单？',
                okText: '确认',
                cancelText: '取消',
                onOk() {
                    return Utils.request({
                        api: Utils.getApi(that.apikey, '取消订单'),
                        params: {
                            id: order.id,
                        },
                        success: function (data) {
                            console.log(999)
                            console.log(data,"================")
                            Utils.Message.success('操作成功！');
                            that.refreshTable();
                        }
                    })
                }
            })
        },
        checkDetail: function (orderNo, row, opt) {
            Events.emit('addTab', { moduleText: '订单详情-' + orderNo, module: '订单详情-' + orderNo, ext: { order: row, operate: opt } })
        },
        add: function (orders) {
            if (!orders) {
                Events.emit('addTab', { moduleText: '创建订单', module: '创建订单' })
            } else {
                let list = Utils.deepclone(orders);
                if (list && list.length > 10) {
                    Utils.Message.warning("最多允许同时创建复制10个订单");
                    list = list.splice(0, 10);
                }
                list.map(order => {
                    Events.emit('addTab', { moduleText: '复制订单' + order.orderNo, module: '复制订单' + order.orderNo, ext: { order: order } })
                })
            }
        },
        export: function () {
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
                    ...that.filters,
                    status: that.OrderStatus,
                    pageNum: -1,
                    export: true
                },
                download: true,
                fileName: Date.now() + '.xls'
            })
        },
        orderImport() {
            Utils.modal({
                content: <OrderImport />,
                noBtn: true,
                width: 600,
                title: `导入运单`
            })
        }
    }

    search() {
        if (this.state.minPrice && this.state.maxPrice) {
            if (parseFloat(this.state.maxPrice) <= parseFloat(this.state.minPrice)) {
                Utils.Message.warning('最大金额要大于最小金额')
                return

            }
        }

        this.filters['status'] = this.OrderStatus;  //所选择的key
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
        this.filters.status = this.OrderStatus;
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

    // 切换状态
    filtStatus(key) {
        this.OrderStatus = key;
        if (key == 'WAIT_BILLING') {
            this.filters['invoiceStatus'] = null
        }
        this.selectedRowKeys = []
        this.selectedList = []
        this.setState({
            status: key
        }, () => {
            this.orderSide.setData({})
            this.orderSide.toggleHide(false)
        })
        this.search();
    }

    renderSelections(status) {
        switch (status) {
            case 'Assigned':
                this.setState({
                    rowSelection: true,

                })
                break;
            case 'Unpayed':
                this.setState({
                    // rowSelection: true,
                    rowSelection: true,
                })
                break;
            default:
                this.setState({
                    rowSelection: true,
                })
                break;
        }
    }

    invoiceReady() {
        let that = this;
        new Promise((resolve, reject) => {
            Utils.request({
                api: Utils.getApi(that.apikey, '开票复制'),
                params: ((isAll) => {
                    return isAll ? this.filters : { orderNos: (() => { return that.selectedList.map((order) => { return order.orderNo }) })().toString() }
                })(!this.testBatchDisable().selected),
                beforeRequest() {
                    that.setState({
                        loadingInvoice: true,
                    })
                },
                afterRequest() {
                    that.setState({
                        loadingInvoice: false,
                    })
                },
                handleError(res) {
                    if (res.head.status === '1') {
                        Utils.error({
                            title: '开票提示',
                            content: res.head.errorMessage,
                            okText: "知道了",
                            width: 500,
                        })
                    }
                },
                success: function (data) {
                    resolve(data)
                }
            })
        }).then(data => {
            let lastInfo = data.orderInvoiceBean,
                invoiceInfo = {
                    invoicePrice: data.invoicePriceName,
                    actualInvoicePrice: data.actualInvoicePriceName,
                    oilRebatePrice: data.oilRebatePriceName,
                    orderNos: data.orderNos,
                    orderCount: data.orderCount,
                    invoiceInfoSign: data.invoiceInfoSign
                };
            let params = {}, notifyChange = function (data) {
                params = data;
            }
            Utils.modal({
                title: '申请开票',
                width: 800,
                okText: '提交',
                onOk: function (fn) {
                    let keyArr = [
                        {
                            field: 'invoiceContent',
                            name: '开票内容'
                        }, {
                            field: 'invoiceType',
                            name: '开票类型'
                        }, {
                            field: 'depositBank',
                            name: '开户行'
                        }, {
                            field: 'bankAccount',
                            name: '开户行账户'
                        }, {
                            field: 'contactPhone',
                            name: '联系电话'
                        }, {
                            field: 'companyAddress',
                            name: '公司地址'
                        }, {
                            field: 'recipients',
                            name: '收票人姓名'
                        }, {
                            field: 'recipientsPhone',
                            name: '收票人联系方式'
                        }, {
                            field: 'deliveryAddress',
                            name: '邮寄地址'
                        }];
                    let p = {
                        ...params
                    };
                    p.invoiceInfoSign = invoiceInfo.invoiceInfoSign;
                    for (let i = 0; i < keyArr.length; i++) {
                        if (p[keyArr[i].field] === '' || p[keyArr[i].field] === undefined || p[keyArr[i].field] === null) {
                            Utils.Message.warning(`请填写${keyArr[i].name}`);
                            return;
                        }
                    }
                    return Utils.request({
                        api: Utils.getApi(that.apikey, '申请开票'),
                        params: p,
                        success: function (data) {
                            Utils.Message.success('申请成功！');
                            that.refs.table.initTable();
                            that.setState({
                                selectedRowKeys: ''
                            })
                        }
                    })
                },
                onCancel: function () {

                },
                content: <NewInvoice
                    lastInfo={lastInfo}
                    invoiceInfo={invoiceInfo}
                    loading={that.pageLoading.bind(that)}
                    notifyChange={notifyChange}
                />
            })
        })
    }

    testBatchDisable() {
        if (!this.selectedList || this.selectedList.length == 0) {
            return {
                selected: false
            }
        }
        for (let i = 0; i < this.selectedList.length; i++) {
            if (this.selectedList[i].orderOptStatus != 'invoiceApply') {
                return {
                    selected: true,
                    invDis: true
                }
            }
        }
        return {
            selected: true,
            invDis: false
        }
    }

    render() {
        let that = this;
        const pagination = this.state.pagination || { total: 0, current: 0 };
        const { selected: invSelected, invDis } = this.testBatchDisable()
        const content = (
            <div>
                {this.props.hideTab ? null : <div className="list-ctrl-box">
                    <Tabs activeKey={this.state.status} className="order-status-filter-tab" onChange={this.filtStatus.bind(this)}>
                        <TabPane tab="全部" key="ALL"></TabPane>
                        <TabPane tab="待派车" key="WAIT_DISPATCH"></TabPane>
                        <TabPane tab="待认证" key="WAIT_IMPROVE"></TabPane>
                        <TabPane tab="待支付"
                            // {<span>待支付{this.state.orderStatusNums.unpayOrderNum == '0' ? "" : <span style={{
                            //     padding: '2px 4px', color: '#fff', fontSize: '10px',
                            //     background: '#ff7800', display: 'inline-block', textAlign: 'center',
                            //     borderRadius: '10px', lineHeight: '10px', position: 'relative',
                            //     top: '-10px '
                            // }}>{this.state.orderStatusNums.unpayOrderNum}</span>}
                            // </span>}
                            key="WAIT_PAY"  >
                        </TabPane>
                        {/* <TabPane tab="待结算" key="Unpayed"></TabPane> */}
                        {Utils.getApi(that.apikey, '申请开票') ? <TabPane tab="待开票" key="WAIT_BILLING"></TabPane> : null}
                        <TabPane tab="已完成" key="COMPLETED"></TabPane>
                        <TabPane tab="已取消" key="CANCELED"></TabPane>
                        {/* <TabPane tab={<span>异常<span style={style}>0</span></span>} key="abnormal" ref='error' ></TabPane> */}
                        <TabPane tab={<span>异常{this.state.abnormalOrderNum == '0' ? '' : <span style={{
                            padding: '2px 4px', color: '#fff', fontSize: '10px',
                            background: '#ff7800', display: 'inline-block', textAlign: 'center',
                            borderRadius: '10px', lineHeight: '10px',
                            position: 'relative', top: '-10px '
                        }}>{this.state.abnormalOrderNum}</span>}
                        </span>} key="ABNORMAL" ref='error' ></TabPane>
                    </Tabs>
                </div>}
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
                            {this.state.status == 'WAIT_BILLING' ? <SelectFilter ref="filt_selectParam1" handleChange={(e, v) => this.updateFilters.bind(this, 'invoiceStatus', e)()} list={Utils.INVOICE_STATE} field={'filts'} value={'text'} text="开票状态" /> : null}
                            {this.state.status === 'WAIT_PAY' ? <SelectFilter ref="filt_selectParam2" handleChange={(e, v) => this.updateFilters.bind(this, 'type', e)()} list={Utils.FILT_TYPE} field={'filts'} value={'text'} text="支付类型" /> : null}
                            {this.state.status === 'WAIT_PAY' ? <SelectFilter ref="filt_selectParam3" handleChange={(e, v) => this.updateFilters.bind(this, 'stage', e)()} list={Utils.FILT_STAGE} field={'filts'} value={'text'} text="付款方式" /> : null}
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
                            expandedRowRender={this.state.status === 'WAIT_PAY' ? null : (row) => {
                                return <table className="expand-table">
                                    <tbody>
                                        {row.priceItemEntityList.map(price => {
                                            return (<tr>
                                                <td><i style={{ color: price.paymentStatus == 1 ? '#66c386' : '#ff7800', marginRight: '4px' }} className="iconfont icon-dot"></i>{price.stageName}</td>
                                                <td>{price.typeName}</td>
                                                <td>{price.amountName}元</td>
                                                <td><span style={{ display: 'inline-block', width: '90px' }}>{price.type === Enum.PaymentType.OIL ? '油卡卡号' : price.payeeName}</span>{price.type === Enum.PaymentType.OIL ? price.oilAccountNo : price.payeeBankAccountNo}</td>
                                                <td>{price.taxAmountName && parseInt(price.taxAmountName) > 0 ? <span style={{ display: 'inline-block', width: '120px', marginLeft: '60px' }}>服务费：{price.taxAmountName}元</span> : null}</td>
                                            </tr>)
                                        })}
                                    </tbody>
                                </table>
                            }}
                            // expandRowByClick={true}
                            placeholder={this.hasAdd ? <div style={{ textAlign: 'center', height: '300px', display: 'table' }}>
                                <div style={{ display: 'table-cell', verticalAlign: 'middle' }}>
                                    <i style={{ fontSize: '46px', color: '#ced3df' }} className="iconfont icon-unie633"></i>
                                    <p style={{ color: '#ced3df', position: 'relative', top: '-6px' }}>暂无订单数据</p>
                                    <Button text="创建订单" className="common" onClick={this.events.add.bind(this)} />
                                </div>
                            </div> : null}
                            ref="table"
                            columns={this.state.status === 'WAIT_PAY' ? this.payColumns : this.columns}
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
                    <ScrollContainer isList loading={this.state.pageloading} style={{ height: `calc(100% - ${this.props.hideTab ? '52px' : '53px'})` }} init height={'0px'} content={content} />
                    <div className="kc-table-foot">
                        <div className="table-ctrl-box">
                            {this.hasAdd ? <Button
                                text="创建订单" className="common" onClick={this.events.add.bind(this, null)} /> : ''}
                            {/* {this.hasCopy ? <Button
                                text="复制订单" className="common" onClick={this.events.add.bind(this, that.state.list)}
                                disabled={this.state.list.length <= 0}
                            /> : ''} */}
                            {this.state.status === 'WAIT_BILLING' && Utils.getApi(that.apikey, '申请开票') ?
                                <Button text={invSelected ? "申请开票" : "全部开票"} disabled={(invSelected && invDis) || this.state.pagination.total == 0} loading={this.state.loadingInvoice}
                                    className="common"
                                    onClick={this.invoiceReady.bind(this)} /> : ''}
                            {this.state.status === 'WAIT_PAY' && Utils.getApi(that.apikey, '申请支付') ?
                                <Button text="批量申请"
                                    className="common"
                                    onClick={() => { OrderUtils.batchPayAction(this.selectedList, 0, () => { that.refreshTable() }) }}
                                    disabled={!this.selectedList || this.selectedList.length == 0} /> : ''}
                            {this.props.type ? null : <Button text="批量导入"
                                loading={this.state.exporting}
                                className="common" onClick={this.events.orderImport.bind(this)} />}
                            {this.props.hideTab ? null : <Button text="导出"
                                loading={this.state.exporting}
                                className="common white" onClick={this.events.export.bind(this)} />}
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