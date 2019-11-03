import React, { Suspense } from 'react'
import Layout from 'antd/lib/layout'
import { Select, DatePicker, Upload, Timeline, Input, Icon, Row, Col } from 'antd'
import moment from 'moment'
// const TabPane = Tabs.TabPane;
import Button from '../../lib/button'
import CImg from '../../lib/checkableImg'
import ScrollContainer from '../index'
import FreshComponent from '../freshbind'
import UploadRecept from '../../modal/receiptUpload'
import RoutesView from '../../modal/orderRoute'
import Reload from '../reload'
import OrderUtils from '../../../lib/orderUtils'
import Enum from '../../../lib/enum'
import Utils from 'utils/utils'
import EditOrder from '../newOrder'
import VehicleColor from '../../yg-lib/vehicleColor'
import Events from 'gc-event/es5'
import Storage from 'gc-storage/es5'
import './index.scss'



const Option = Select.Option;
const { TextArea } = Input;
let cityTree = Storage.get('dictionary').location, cityMap = {};
cityTree.map((province) => {
    cityMap[province.code] = province.nodes;
})

class TimelineInfo extends React.Component {
    render() {
        return (
            <div className="order-opt-log">
                <div className="opt-name">
                    {this.props.info.optName}
                </div>
                <div className="opt-content">
                    {this.props.info.content}
                </div>
                <div className="opt-user">
                    {'操作人：' + this.props.info.createUserName}
                </div>
                <div className="opt-time">
                    {'操作时间：' + (new Date(this.props.info.createTime).format("yyyy年MM月dd日 hh时mm分"))}
                </div>
            </div>
        )
    }
}

class OrderDetail extends FreshComponent {
    constructor(props) {
        super(props);
        this.usedContact = {
            fromAddresses: [],
            toAddresses: [],
            choosedBeneficiary: {}
        };
        this.invoiceRate = Storage.get('userInfo').invoiceRate;
    }

    componentWillMount() {
        let that = this;
        cityTree = Storage.get('dictionary').location;
        this.initState(this.props.order);
        this.refreshOrder(this.props.order);
        this.inited = true;
        Events.bind('onOrderId' + this.props.order.id + 'Update', function () {
            that.refreshOrder(that.order)
        })
        let prePaySum = (parseFloat(that.props.order.prepayCash) + parseFloat(that.props.order.prepayOil) + parseFloat(that.props.order.taxPriceName)).toFixed(2)
        this.setState({
            orderOptStatus: this.props.order.orderOptStatus,
            prePaySum: prePaySum
        })
    }

    addPrice(price1, price2) {
        return (isNaN(price1) ? 0 : parseFloat(price1)) + (isNaN(price2) ? 0 : parseFloat(price2))
    }

    goEdit() {
        this.editOrder = Utils.deepclone(this.state);
        this.setState({
            onEdit: true
        })
    }

    initState(order, handler) {
        let driver = {}, vehicle = {}, payee = {}, carrierFeePayee = {}, editBtn, upRecptBtn, cancelBtn, locateTriggerBtn, that = this
        if (order.askDriverPhone) {
            driver.phone = order.askDriverPhone
            driver.name = order.askDriverName
            driver.idCardNum = order.askDriverIdCardNo
            driver.driverAuthStatus = order.driverAuthStatus
        }

        if (order.askVehiclePlateNo && order.orderVehicleInfoResp) {
            vehicle.vehicleNo = order.askVehiclePlateNo
            vehicle.vehiclePlateColor = order.askVehiclePlateColor
            vehicle.id = order.askVehicleId
            vehicle.vehicleLen = order.orderVehicleInfoResp.lengthName
            vehicle.vehicleTon = order.orderVehicleInfoResp.loadWeightName
            vehicle.vehicleTypeName = order.orderVehicleInfoResp.model
        }
        if (order.payeeInfoEntity && order.payeeInfoEntity.bankAccountNo) {
            payee = order.payeeInfoEntity
        }
        if (order.driverPayeeInfoEntity && order.driverPayeeInfoEntity.bankAccountNo) {
            carrierFeePayee = order.driverPayeeInfoEntity
        }
        order.editAbleStatus = order.editAbleStatus || {}
        order.orderExceptionRecordEntityList = order.orderExceptionRecordEntityList || []
        editBtn = (function () {
            let copybtn = <Button style={{ marginLeft: '12px' }} className="common white" onClick={() => that.doCopy()} text="复制订单" />;
            return order.editAbleStatus.editable == 1 && Utils.getApi('订单管理', '修改') ?
                <span>
                    <Button style={{ marginLeft: '12px' }} className="common white" onClick={() => that.goEdit()} text="修改订单" />{copybtn}
                </span> : copybtn
        })();
        upRecptBtn = (order.uploadReceiptStatus) ? <Button style={{ marginLeft: '12px' }}
            className="common"
            onClick={() => {
                that.events.uploadRecept.bind(that, order.orderReceiptEntity)()
            }}
            text={order.orderReceiptEntity && order.orderReceiptEntity.deliveryNo ? "修改回单" : "上传回单"} /> : null;
        let editAbleStatus = order.editAbleStatus || {}
        locateTriggerBtn = editAbleStatus.locateTrigger ? <Button style={{ marginLeft: '12px' }}
            className="common"
            onClick={() => {
                OrderUtils.locateTrigger(order.id, {
                    start() {
                        that.pageLoading(true)
                    },
                    end() {
                        that.pageLoading(false)
                    },
                    handler() {
                        that.refreshOrder(that.order);
                    }
                })
            }}
            text="轨迹校验" /> : null
        let uploadTransferVoucherBtn = editAbleStatus.uploadTransferVoucher ? (function () {
            let voucherUploadProps = OrderUtils.getUpLoadProps((url) => {
                Utils.request({
                    api: Utils.getApi('订单管理', '上传司机转账凭证'),
                    beforeRequest() {
                        that.pageLoading(true);
                    },
                    afterRequest() {
                        that.pageLoading(false);
                    },
                    params: {
                        orderId: order.id,
                        transferVoucherImage: url
                    },
                    success: function (data) {
                        that.refreshOrder(that.order);
                    }
                })
            })
            return <Upload {...voucherUploadProps} className="table-upload">
                <OrderBtn text="上传转账凭证" dis={false} />
            </Upload>
        })() : null;
        this.order = order;
        let infoBarText
        let priceEntity = (function (list, order) {
            return that.generatePriceEntity(list, order)
        })(order.priceItemEntityList, order)
        let ctrlBtn = (function (orderOptStatus, orderOptStatusName) {
            if (orderOptStatus != 'exception') {
                infoBarText = that.getOrderInfoText(order)
            }
            switch (orderOptStatus) {
                case 'exception':
                    return order.orderExceptionRecordEntityList.map((item, index) => {
                        const helpBtn = <span style={{
                            marginLeft: '12px',
                            color: '#ff7800',
                            cursor: 'pointer',
                            marginRight: '12px'
                        }}
                            href="javascript:void(0)"
                            onClick={that.events.appealhelp}>申诉帮助</span>;
                        infoBarText = <span className="exception-text">
                            <i className="iconfont icon-gantanhao"></i>
                            <span style={{ color: '#333333' }}>
                                <span>异常原因{index == 0 && that.state.orderExceptionRecordEntityList.length > 1 ? (index + 1) : ''}:</span>
                                {item.exceptionTypeName} {item.occurRemark}
                            </span>
                        </span>
                        switch (item.appealStatus) {
                            case 0:
                                return (<span>
                                    {helpBtn}
                                    <OrderBtn text="异常申诉"
                                        dis={false}
                                        fun={that.events.appeal.bind(that, item)}
                                        className="common red" />
                                </span>)
                            case 1:
                                return (<span>
                                    {helpBtn}
                                    <OrderBtn text="申诉中"
                                        dis={true}
                                        fun={that.events.appeal.bind(that, item)}
                                        className="common red" />
                                </span>)
                            case 2:
                                return (<span>
                                    {helpBtn}
                                    <OrderBtn text="审核通过"
                                        dis={true}
                                        fun={that.events.appeal.bind(that, item)}
                                        className="common red" />
                                </span>)
                            case 3:
                                infoBarText = <span className="exception-text">
                                    <i className="iconfont icon-gantanhao"></i>
                                    <span>驳回原因：{item.reviewResult} </span>
                                    <span style={{ color: '#333333' }}>（异常原因: {item.exceptionTypeName} {item.occurRemark}）</span>
                                </span>
                                return (<span>
                                    {helpBtn}
                                    <OrderBtn text="再次申诉"
                                        dis={false}
                                        fun={that.events.appeal.bind(that, item)}
                                        className="common red" />
                                </span>)
                            default:
                                return null
                        }
                    })
                case 'contract':
                    let contractUploadProps = OrderUtils.getUpLoadProps((url) => {
                        Utils.request({
                            api: Utils.getApi('订单管理', '上传合同'),
                            beforeRequest() {
                                that.pageLoading(true);
                            },
                            afterRequest() {
                                that.pageLoading(false);
                            },
                            params: {
                                orderId: order.id,
                                contractUrl: url
                            },
                            success: function (data) {
                                that.refreshOrder(that.order);
                            }
                        })
                    })
                    return <span>
                        <span className="click-th-main" style={{ marginRight: 24 }} onClick={OrderUtils.downLoadContractTemplate}>
                            <span><i className="iconfont icon-hetongxiazaixin-"></i>下载合同模板</span>
                        </span>
                        <Upload {...contractUploadProps} className="table-upload">
                            <OrderBtn text={orderOptStatusName} dis={false} />
                        </Upload>
                    </span>
                case 'assign':
                    if (Utils.getApi('订单管理', '指派')) {
                        return <OrderBtn text={orderOptStatusName} dis={false} fun={() => {
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
                                    api: Utils.getApi('订单管理', '指派'),
                                    params: {
                                        orderId: order.id,
                                        askDriverPhone: selectedDriver.phone,
                                        askVehicleId: selectedVehicle.id
                                    },
                                    success: function (data) {
                                        that.refreshOrder(that.order);
                                    }
                                })
                            })
                        }} />
                    } else {
                        return <OrderBtn text={'待派车'} dis={true} />
                    }
                case 'waitingVerify':
                    return <OrderBtn text={orderOptStatusName} dis={false} fun={() => {
                        OrderUtils.goVerify(order, function () {
                            that.refreshOrder(that.order);
                        });
                    }} />
                case 'uploadTransferVoucher':
                    return <Upload {...OrderUtils.getUpLoadProps((url) => {
                        Utils.request({
                            api: Utils.getApi('订单管理', '上传司机转账凭证'),
                            beforeRequest() {
                                that.pageLoading(true);
                            },
                            afterRequest() {
                                that.pageLoading(false);
                            },
                            params: {
                                orderId: order.id,
                                transferVoucherImage: url
                            },
                            success: function (data) {
                                that.refreshOrder(that.order);
                            }
                        })
                    })} className="table-upload">
                        <OrderBtn text={orderOptStatusName} dis={false} />
                    </Upload>
                default:
                    return orderOptStatusName ? <OrderBtn text={orderOptStatusName} dis={true} /> : null
            }
        })(order.orderOptStatus, order.orderOptStatusName)
        cancelBtn = order.editAbleStatus.cancel == 1 ? <Button style={{ marginLeft: '12px' }} onClick={() => { that.events.cancel.bind(that)() }} style={{ border: '1px solid #fff', color: '#999999' }} className="common white" text="取消订单" /> : null;

        this.setState({
            onEdit: false,
            orderId: order.id,
            fromAddresses: JSON.parse(order.fromAddressJson || '[{}]'),
            toAddresses: JSON.parse(order.toAddressJson || '[{}]'),
            driver: driver,
            vehicle: vehicle,
            payee: payee,
            carrierFeePayee: carrierFeePayee,
            payeeId: payee.id,
            driverPayeeList: order.driverPayeeList || [],
            askDriverBankAccountNo: order.askDriverBankAccountNo,
            askDriverPayeeId: carrierFeePayee.id,
            contractStatus: order.contractStatus,
            contractUrl: order.contractUrl,
            orderCargoEntities: JSON.parse(order.cargoInfoJson || '[{}]'),
            expArrive: order.expArriveTime ? moment(new Date(order.expArriveTime)) : moment(new Date()),
            expDepart: order.expDepartTime ? moment(new Date(order.expDepartTime)) : moment(new Date()),
            expArriveTime: order.expArriveTime,
            expDepartTime: order.expDepartTime,
            remark: order.remark,
            orderPayStatus:order.orderPayStatus,
            orderPriceEntity: priceEntity,
            agentPriceName: priceEntity.agentPriceName,
            // agentPrice: order.agentPriceName,
            askDriverPrice: order.askDriverPriceName,
            oilCardNo: order.oilCardNo,
            operationList: order.orderOptlogEntityList || [],
            orderReceiptEntity: order.orderReceiptEntity || {},
            status: order.status,
            ctrlBtn: ctrlBtn,
            upRecptBtn: upRecptBtn,
            locateTriggerBtn: locateTriggerBtn,
            infoBarText: infoBarText,
            cancelBtn: cancelBtn,
            editBtn: editBtn,
            orderOptStatus: order.orderOptStatus,
            orderNo: order.orderNo,
            needInvoice: order.needInvoice,
            needReceipt: order.needReceipt,
            isException: order.isException,
            createTime: order.createTime,
            editAbleStatus: editAbleStatus,
            transferVoucherImage: order.transferVoucherImage,

            orderExceptionRecordEntityList: order.orderExceptionRecordEntityList,
        }, () => {
            if (handler) {
                handler()
            }
        })
    }

    toPriceKey(stage, type) {
        if (stage == Enum.PaymentStage.PRE) {
            stage = 'prepay'
        } else if (stage == Enum.PaymentStage.REST) {
            stage = 'restPay'
        } else if (stage == Enum.PaymentStage.RECEIPT) {
            stage = 'receiptPay'
        } else if (stage == Enum.PaymentStage.AGENT) {
            stage = 'agentPrice'
        } else if (stage == Enum.PaymentStage.TAX) {
            stage = 'tax'
        } else {
            stage = ''
        }
        if (type == Enum.PaymentType.CASH) {
            type = 'Cash'
        } else if (type == Enum.PaymentType.OIL) {
            type = 'Oil'
        } else {
            type = ''
        }
        return stage + type
    }

    generatePriceEntity(list, order) {
        if (!list) {
            return {}
        }
        let priceEntity = {}
        let that = this, totalPrice = 0
        list.map(price => {
            let key = that.toPriceKey(price.stage, price.type)
            priceEntity[key] = price.amountName
            priceEntity[key + 'Status'] = price.paymentStatus
            priceEntity[key + 'StatusName'] = price.paymentStatusName
            priceEntity[key + 'TaxAmount'] = price.taxAmountName
            if (price.stage == Enum.PaymentStage.AGENT) {
                priceEntity.agentPriceName = price.amountName
                priceEntity.agentPriceStatus = price.paymentStatus
                priceEntity.agentPriceStatusName = price.paymentStatusName
            }
            if (price.stage != Enum.PaymentStage.TAX) {
                totalPrice += parseFloat(price.amountName || '0')
            }
        })
        priceEntity.totalPrice = totalPrice.toFixed(2)
        priceEntity.totalAmount = order.totalPriceName
        // priceEntity.taxPrice = order.taxPriceName
        priceEntity.taxCash = order.taxPriceName
        return priceEntity
    }

    events = {
        cancel() {
            let that = this;
            Utils.confirm({
                title: '确认取消订单？',
                okText: '确认',
                cancelText: '取消',
                onOk() {
                    return Utils.request({
                        api: Utils.getApi('订单管理', '取消'),
                        params: {
                            id: that.props.order.id,
                        },
                        success: function (data) {
                            Utils.Message.success('操作成功！');
                            that.refreshOrder(that.props.order);
                        }
                    })
                }
            })
        },
        uploadRecept(receipt) {
            let that = this, formData = receipt || {};
            let notifyChange = function (data) {
                formData = data;
            }
            Utils.modal({
                title: '上传回单',
                onOk: function (fn) {
                    if (!formData.receiptImgUrl) {
                        Utils.Message.error('请选择回单进行上传！');
                        return;
                    }
                    if (!formData.receiptCarrier) {
                        Utils.Message.error('请正确填写信息！');
                        return;
                    }
                    if (!formData.deliveryNo) {
                        Utils.Message.error('请正确填写信息！');
                        return;
                    }
                    return Utils.request({
                        params: {
                            orderId: that.order.id,
                            receiptCarrier: formData.receiptCarrier,
                            deliveryNo: formData.deliveryNo,
                            receiptImgUrl: formData.receiptImgUrl
                        },
                        api: Utils.getApi('订单管理', '上传回单'),
                        success: function (data) {
                            that.refreshOrder(that.props.order);
                            Utils.Message.success('保存成功！');
                        }
                    })
                },
                onCancel: function () {

                },
                content: <UploadRecept data={receipt || {}} notifyChange={notifyChange} />
            })
        },

        invoiceApply(row) {
            Events.emit('addTab', { moduleText: '申请开票', module: '申请开票' })
        },
        appeal(exception) {
            let that = this
            OrderUtils.appeal(exception, function () {
                that.refreshOrder(that.order);
            })
            return;
        },
        appealhelp() {
            Utils.error({
                title: <span>申诉帮助</span>,
                oKText: '知道了',
                width: 520,
                content: <table className="appeal-help">
                    <thead>
                        <tr>
                            <td>申诉凭证</td>
                            <td>凭证要求说明</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>发车单或回单</td>
                            <td>
                                <ul>
                                    <li>发车单或回单与订单客户名称必须一致</li>
                                    <li>发车单或回单与订单路线必须一致</li>
                                    <li>发车单或回单与订单金额必须一致</li>
                                    <li>发车单或回单与订单车牌必须一致</li>
                                    <li>发车单或回单有客户的签字或盖章</li>
                                    <li>发车单或回单与订单时间在同一天内</li>
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>
            })
        }
    }

    doCopy() {
        Events.emit('addTab', {
            moduleText: '复制订单' + this.order.orderNo,
            module: '复制订单' + this.order.orderNo,
            ext: { order: this.state }
        })
    }

    getOrderInfoText(order) {
        let style = {
            lineHeight: '42px',
            marginLeft: '12px'
        }
        let orderStatus = <span style={{ marginRight: '24px' }}>订单状态：{order.statusName}</span>
        if (order.askDriverPhone && order.askVehiclePlateNo) {
            return <span style={style}>
                <Icon type="tag" style={{ color: '#ff7800', marginRight: 6 }} />
                {orderStatus}
                <span style={{ marginRight: 24 }}>{order.askVehiclePlateNo}
                    <VehicleColor color={order.askVehiclePlateColor.replace('色', '')} />
                </span>
                <span>{order.askDriverName} {order.askDriverPhone}</span>
            </span>
        }
        if (order.askDriverName) {
            return <span style={style}>
                <Icon type="tag" style={{ color: '#ff7800', marginRight: 6 }} />
                {orderStatus}
                {order.askDriverName} {order.askDriverPhone}
            </span>
        }
        if (order.askVehiclePlateNo) {
            return <span style={style}>
                <Icon type="tag" style={{ color: '#ff7800', marginRight: 6 }} />
                {orderStatus}
                {order.askVehiclePlateNo}
                <VehicleColor color={order.askVehiclePlateColor.replace('色', '')} />
            </span>
        }
        return <span style={style}>
            <Icon type="tag" style={{ color: '#ff7800', marginRight: 6 }} />
            {orderStatus}
            <span>未指派司机/车辆</span>
        </span>
    }

    refreshOrder(order) {
        let that = this;
        Utils.request({
            api: Utils.getApi('订单管理', '详情'),
            params: {
                id: order.id,
            },
            beforeRequest() {
                that.pageLoading(true)
            },
            afterRequest() {
                that.pageLoading()
            },
            success: function (data) {
                if (that.lastVehicle != data.askVehiclePlateNo) {
                    that.lastVehicle = data.askVehiclePlateNo
                    that.initState(data, () => {
                        that.checkRoute()
                    });
                } else {
                    that.initState(data);
                }
            }
        });
        if (this.inited) {
            Events.emit('initOrderList');
        }
    }

    onChoosen(info) {
        this.setState({
            contact: {
                ...this.state.contact,
                address: info.address,
                latitude: info.location.lat,
                longitude: info.location.lng,
            },
            positionSelected: true
        })
    }

    checkRoute() {
        let that = this
        Promise.all([new Promise(resolve => {
            Utils.request({
                api: '/api/web/resource/vehicle/trajectory',
                params: {
                    vehiclePlateNo: this.state.vehicle.vehicleNo,
                    vehiclePlateColor: this.state.vehicle.vehiclePlateColor,
                    startTime: new Date(new Date(this.state.expDepartTime).getTime() - 12 * 60 * 60 * 1000).format('yyyy-MM-dd hh:mm:ss'),
                    endTime: new Date(new Date(this.state.expArriveTime).getTime() + 24 * 60 * 60 * 1000).format('yyyy-MM-dd hh:mm:ss'),
                },
                success: function (data) {
                    resolve(data.length ? data : [])
                }
            })
        }), new Promise(resolve => {
            Utils.request({
                api: '/api/web/order/loc/info',
                params: this.order.orderNo,
                success: function (data) {
                    resolve(data)
                }
            })
        })]).then(values => {
            that.setState({
                MapSuspenseComp: <RoutesView routes={values[0] || []}
                    list={values[1] || []}
                    noLocaInfo
                    from={that.state.fromAddresses}
                    to={that.state.toAddresses}
                    arriveTime={that.order.expDepartTime}
                    reachTime={that.order.expArriveTime}
                    range={that.order.range}
                />
            })
        })
    }

    dispatch(key, driver, vehicle, only) {
        let that = this
        OrderUtils.orderDispatch(key, driver, vehicle, only, (chosenDriver, chosenVehicle) => {
            OrderUtils.updateOrderCarrierInfo({
                before: () => {
                    that.pageLoading(true);
                },
                after: () => {
                    that.pageLoading(false);
                },
                param: {
                    orderId: that.order.id,
                    askDriverPhone: chosenDriver.phone,
                    askVehicleId: chosenVehicle.id
                }
            }, function () {
                Utils.Message.success('操作成功！');
                that.refreshOrder(that.order);
            })
        })
    }

    render() {
        if (this.state.onEdit) {
            return <EditOrder order={this.editOrder} onEdit={true} cancel={() => {
                this.setState({
                    onEdit: false
                })
            }} success={() => {
                this.setState({
                    onEdit: false
                }, () => {
                    this.refreshOrder(this.order)
                })
            }} />
        }
        let that = this;
        let tFrom = { top: (that.state.fromAddresses.length == 1 && that.state.toAddresses.length > 1) ? '72px' : '0' };
        let tTo = { top: (that.state.fromAddresses.length > 1 && that.state.toAddresses.length == 1) ? '72px' : '0' };
        if (that.state.fromAddresses.length > 1) {
            tFrom.borderBottom = 'none'
        }
        if (that.state.toAddresses.length > 1) {
            tTo.borderBottom = 'none'
        }
        const onEdit = this.state.onEdit;
        let { editAbleStatus, driver, vehicle, orderPriceEntity, orderReceiptEntity, payee, carrierFeePayee } = this.state
        const driverEditable = editAbleStatus.driver && !driver.phone
        const vehicleEditable = editAbleStatus.vehicle && !vehicle.id
        const hasAgentFee = orderPriceEntity.agentPriceName && orderPriceEntity.agentPriceName > 0
        const content = (
            <Layout style={{ background: '#f5f5f5' }}>
                <div style={{ margin: '24px', marginTop: '12px' }}>
                    <div className="mod-form order-from order-info" style={{ maxWidth: '1280px', margin: '0 auto' }}>
                        {/* 装卸地详情 */}
                        <div className="order-info-address" style={{ height: (that.state.fromAddresses.length > 1 || that.state.toAddresses.length > 1) ? '290px' : '145px' }}>
                            <div style={{ display: 'inline-block', width: 'calc(50% - 70px)', float: 'left' }}>
                                <div className="info-address from" style={tFrom}>
                                    <div className="title">
                                        <span><i className="iconfont icon-didian-copy"></i> 装货点</span>
                                    </div>
                                    <div className="city">
                                        {(function () {
                                            let p = that.state.fromAddresses[0];
                                            return p.province + p.city;
                                        })()}
                                    </div>
                                    <div className="address">
                                        {that.state.fromAddresses[0].address || '...'}
                                    </div>
                                    <div className="contact">
                                        联系人：{(that.state.fromAddresses[0].contactName || '...') + ' ' + (that.state.fromAddresses[0].contactPhone || '...')}
                                    </div>
                                </div>
                                {
                                    that.state.fromAddresses[1] ? <div className="info-address from">
                                        <div className="title">
                                            <span><i className="iconfont icon-didian-copy"></i> 装货点</span>
                                        </div>
                                        <div className="city">
                                            {(function () {
                                                let p = that.state.fromAddresses[1];
                                                return p.province + p.city;
                                            })()}
                                        </div>
                                        <div className="address">
                                            {that.state.fromAddresses[1].address || '...'}
                                        </div>
                                        <div className="contact">
                                            联系人：{(that.state.fromAddresses[1].contactName || '...') + ' ' + (that.state.fromAddresses[1].contactPhone || '...')}
                                        </div>
                                    </div> : ''
                                }
                            </div>

                            <div className="arrow" style={{ float: 'left', height: (that.state.fromAddresses.length > 1 || that.state.toAddresses.length > 1) ? '300px' : '127px' }}>
                                <div className="box">
                                    <i className="iconfont icon-danxiangjiantou"></i>
                                </div>
                            </div>

                            <div style={{ display: 'inline-block', width: 'calc(50% - 70px)', float: 'left' }}>
                                <div className="info-address to" style={tTo}>
                                    <div className="title">
                                        <span><i className="iconfont icon-didian-copy"></i>卸货点</span>
                                    </div>
                                    <div className="city">
                                        {(function () {
                                            let p = that.state.toAddresses[0];
                                            return p.province + p.city;
                                        })()}
                                    </div>
                                    <div className="address">
                                        {that.state.toAddresses[0].address || '...'}
                                    </div>
                                    <div className="contact">
                                        联系人：{(that.state.toAddresses[0].contactName || '...') + ' ' + (that.state.toAddresses[0].contactPhone || '...')}
                                    </div>
                                </div>
                                {
                                    that.state.toAddresses[1] ? <div className="info-address to">
                                        <div className="title">
                                            <span><i className="iconfont icon-didian-copy"></i>卸货点</span>
                                        </div>
                                        <div className="city">
                                            {(function () {
                                                let p = that.state.toAddresses[1];
                                                return p.province + p.city;
                                            })()}
                                        </div>
                                        <div className="address">
                                            {that.state.toAddresses[1].address || '...'}
                                        </div>
                                        <div className="contact">
                                            联系人：{(that.state.toAddresses[1].contactName || '...') + ' ' + (that.state.toAddresses[1].contactPhone || '...')}
                                        </div>
                                    </div> : ''
                                }
                            </div>
                        </div>
                        <div className="ant-table ant-table-default">
                            <div className="ant-table-content">
                                {/* 货物信息 */}
                                <div className="ant-table-body form-table order">
                                    <div className="group-head">
                                        <span>货物信息</span>
                                    </div>
                                    <table className="col-4">
                                        <tbody className="ant-table-tbody">
                                            <tr className="ant-table-row">
                                                <td className="line-title"><div className="start">{onEdit ? <span className="needed">*</span> : null}货物名称</div></td>
                                                <td className="line-title"><div className="start">{onEdit ? <span className="needed">*</span> : null}货物类型</div></td>
                                                <td className="line-title"><div className="start">{onEdit ? <span className="needed">*</span> : null}货物重量（吨）</div></td>
                                                <td className="line-title"><div className="start">货物体积（方）</div></td>
                                            </tr>
                                            {this.state.orderCargoEntities.map((goods, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>
                                                            <input type="text"
                                                                maxLength={20}
                                                                placeholder="货物名称"
                                                                readOnly
                                                                value={goods.cargoName} />
                                                        </td>
                                                        <td>
                                                            <input type="text"
                                                                maxLength={8}
                                                                placeholder="货物类型"
                                                                readOnly
                                                                value={goods.cargoTypeName} />
                                                        </td>
                                                        <td>
                                                            <input type="text"
                                                                maxLength={8}
                                                                placeholder="货物重量"
                                                                readOnly
                                                                value={goods.cargoWeight} />
                                                        </td>
                                                        <td>
                                                            <input type="text"
                                                                maxLength={8}
                                                                placeholder="货物体积"
                                                                readOnly
                                                                value={goods.cargoVolumn} />
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {
                                    onEdit && (editAbleStatus.expDepartTime || editAbleStatus.expArriveTimeFinal) ? <div style={{ border: '1px solid #e2e2e3', borderTop: 'none', padding: '6px 10px', fontSize: '10px', color: '#666666' }}>
                                        <i style={{ color: '#ff7800', marginRight: '4px' }} className="iconfont icon-info"></i>
                                        <span>
                                            期望发车时间、期望到达时间，请务必提供准确时间，我们会按照您提供的时间进行司机位置信息获取
                                    </span>
                                    </div> : null
                                }
                                {/* 期望发车时间 期望到达时间 */}
                                <div className="ant-table-body form-table order">
                                    <table>
                                        <tbody className="ant-table-tbody">
                                            <tr>
                                                <td className="head">
                                                    <span className="title">{onEdit ? <span className="needed">*</span> : null}期望发车时间</span>
                                                </td>
                                                <td className="column">
                                                    <DatePicker placeholder="期望发车时间" showTime
                                                        format="YYYY-MM-DD HH:mm"
                                                        value={this.state.expDepart}
                                                        disabled
                                                        style={{ border: 'none' }}
                                                    />
                                                </td>
                                                <td className="head">
                                                    <span className="title">{onEdit ? <span className="needed">*</span> : null}期望到达时间</span>
                                                </td>
                                                <td className="column">
                                                    <DatePicker placeholder="期望到达时间" showTime
                                                        format="YYYY-MM-DD HH:mm"
                                                        value={this.state.expArrive}
                                                        disabled
                                                        style={{ border: 'none' }}
                                                    />
                                                </td>
                                            </tr>
                                            {onEdit ? null : (this.state.departTime || this.state.arriveTime ? <tr>
                                                <td className="head">
                                                    <span className="title">实际发车时间</span>
                                                </td>
                                                <td className="column">
                                                    <DatePicker placeholder="实际发车时间" showTime
                                                        format="YYYY-MM-DD HH:mm"
                                                        value={this.state.departTime} disabled
                                                        style={{ border: 'none' }}
                                                    />
                                                </td>
                                                <td className="head">
                                                    <span className="title">实际到达时间</span>
                                                </td>
                                                <td className="column">
                                                    <DatePicker placeholder="实际到达时间" showTime
                                                        format="YYYY-MM-DD HH:mm"
                                                        value={this.state.arriveTime} disabled
                                                        style={{ border: 'none' }} />
                                                </td>
                                            </tr> : null)}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="ant-table-body form-table order">
                                    <table>
                                        <tbody className="ant-table-tbody">
                                            <tr>
                                                <td className="head">
                                                    <span className="title">备注</span>
                                                </td>
                                                <td className="column single">
                                                    <TextArea
                                                        readOnly
                                                        placeholder="备注"
                                                        maxLength={300}
                                                        value={that.state.remark}
                                                        autosize />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                {/* 运费信息 价格 */}
                                <div className="ant-table-body form-table order">
                                    <div className="group-head">
                                        <span>运费信息</span>
                                    </div>
                                    <table className={hasAgentFee ? "col-5" : "col-4"}>

                                        <tbody className="ant-table-tbody">
                                            <tr className="ant-table-row">
                                                <td className="line-title">
                                                    <div className="title" style={{ textAlign: 'center' }}>
                                                        <span>预付款（元）</span>
                                                    </div>
                                                </td>
                                                <td className="line-title">
                                                    <div className="title" style={{ textAlign: 'center' }}>
                                                        <span>尾款（元）</span>
                                                    </div>
                                                </td>
                                                <td className="line-title">
                                                    <div className="title" style={{ textAlign: 'center' }}>
                                                        <span>回单款（元）</span>
                                                    </div>
                                                </td>
                                                {hasAgentFee ?
                                                    <td className="line-title">
                                                        <div className="title" style={{ textAlign: 'center' }}>
                                                            <span>中介费（元）</span>
                                                        </div>
                                                    </td> : null}
                                                <td className="line-title">
                                                    <div className="title" style={{ textAlign: 'center' }}>
                                                        <span>总运费（元）</span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr className="ant-table-row">
                                                <td className="price-td">
                                                    <div className="amount">
                                                        {orderPriceEntity.prepayCash || orderPriceEntity.restPayCash || orderPriceEntity.receiptPayCash ?
                                                            <Row className="price-item">
                                                                {orderPriceEntity.prepayCash ?
                                                                    <React.Fragment>
                                                                        <Col span={12} >
                                                                            <span>现金:<span className="price">{orderPriceEntity.prepayCash}</span> </span>
                                                                            <PayStatusText price={{ paymentStatus: orderPriceEntity.prepayCashStatus, paymentStatusName: orderPriceEntity.prepayCashStatusName }} />
                                                                        </Col>
                                                                        <Col span={12} >
                                                                            <span>服务费:<span className="price">{orderPriceEntity.prepayCashTaxAmount}</span> </span>
                                                                            <PayStatusText price={{ paymentStatus: orderPriceEntity.prepayCashStatus, paymentStatusName: orderPriceEntity.prepayCashStatusName }} />
                                                                        </Col>
                                                                    </React.Fragment> : <span className="empty">--</span>}
                                                            </Row> : null}
                                                        {orderPriceEntity.prepayOil || orderPriceEntity.restPayOil || orderPriceEntity.receiptPayOil ?
                                                            <Row className="price-item">
                                                                {orderPriceEntity.prepayOil ?
                                                                    <React.Fragment>
                                                                        <Col span={12} >
                                                                            <span>油卡:<span className="price">{orderPriceEntity.prepayOil}</span> </span>
                                                                            <PayStatusText price={{ paymentStatus: orderPriceEntity.prepayOilStatus, paymentStatusName: orderPriceEntity.prepayOilStatusName }} />
                                                                        </Col>
                                                                        <Col span={12} >
                                                                            <span>服务费:<span className="price">{orderPriceEntity.prepayOilTaxAmount}</span> </span>
                                                                            <PayStatusText price={{ paymentStatus: orderPriceEntity.prepayOilStatus, paymentStatusName: orderPriceEntity.prepayOilStatusName }} />
                                                                        </Col>
                                                                    </React.Fragment> : <span className="empty">--</span>}
                                                            </Row> : null}
                                                    </div>
                                                </td>
                                                <td className="price-td">
                                                    <div className="amount">
                                                        {orderPriceEntity.prepayCash || orderPriceEntity.restPayCash || orderPriceEntity.receiptPayCash ?
                                                            <Row className="price-item">
                                                                {orderPriceEntity.restPayCash ?
                                                                    <React.Fragment>
                                                                        <Col span={12} >
                                                                            <span>现金:<span className="price">{orderPriceEntity.restPayCash}</span> </span>
                                                                            <PayStatusText price={{ paymentStatus: orderPriceEntity.restPayCashStatus, paymentStatusName: orderPriceEntity.restPayCashStatusName }} />
                                                                        </Col>
                                                                        <Col span={12} >
                                                                            <span>服务费:<span className="price">{orderPriceEntity.restPayCashTaxAmount}</span> </span>
                                                                            <PayStatusText price={{ paymentStatus: orderPriceEntity.restPayCashStatus, paymentStatusName: orderPriceEntity.restPayCashStatusName }} />
                                                                        </Col>
                                                                    </React.Fragment> : <span className="empty">--</span>}
                                                            </Row> : null}

                                                        {orderPriceEntity.prepayOil || orderPriceEntity.restPayOil || orderPriceEntity.receiptPayOil ?
                                                            <Row className="price-item">
                                                                {orderPriceEntity.restPayOil ?
                                                                    <React.Fragment>
                                                                        <Col span={12} >
                                                                            <span>油卡:<span className="price">{orderPriceEntity.restPayOil}</span> </span>
                                                                            <PayStatusText price={{ paymentStatus: orderPriceEntity.restPayOilStatus, paymentStatusName: orderPriceEntity.restPayOilStatusName }} />
                                                                        </Col>
                                                                        <Col span={12} >
                                                                            <span>服务费:<span className="price">{orderPriceEntity.restPayOilTaxAmount}</span> </span>
                                                                            <PayStatusText price={{ paymentStatus: orderPriceEntity.restPayOilStatus, paymentStatusName: orderPriceEntity.restPayOilStatusName }} />
                                                                        </Col>
                                                                    </React.Fragment> : <span className="empty">--</span>}
                                                            </Row> : null}
                                                    </div>
                                                </td>
                                                <td className="price-td">
                                                    <div className="amount">
                                                        {orderPriceEntity.prepayCash || orderPriceEntity.restPayCash || orderPriceEntity.receiptPayCash ?
                                                            <Row className="price-item">
                                                                {orderPriceEntity.receiptPayCash ?
                                                                    <React.Fragment>
                                                                        <Col span={12} >
                                                                            <span>现金:<span className="price">{orderPriceEntity.receiptPayCash}</span> </span>
                                                                            <PayStatusText price={{ paymentStatus: orderPriceEntity.receiptPayCashStatus, paymentStatusName: orderPriceEntity.receiptPayCashStatusName }} />
                                                                        </Col>
                                                                        <Col span={12} >
                                                                            <span>服务费:<span className="price">{orderPriceEntity.receiptPayCashTaxAmount}</span> </span>
                                                                            <PayStatusText price={{ paymentStatus: orderPriceEntity.receiptPayCashStatus, paymentStatusName: orderPriceEntity.receiptPayCashStatusName }} />
                                                                        </Col>
                                                                    </React.Fragment> : <span className="empty">--</span>}
                                                            </Row> : null}
                                                        {orderPriceEntity.prepayOil || orderPriceEntity.restPayOil || orderPriceEntity.receiptPayOil ?
                                                            <Row className="price-item">
                                                                {orderPriceEntity.receiptPayOil ?
                                                                    <React.Fragment>
                                                                        <Col span={12} >
                                                                            <span>油卡:<span className="price">{orderPriceEntity.receiptPayOil}</span> </span>
                                                                            <PayStatusText price={{ paymentStatus: orderPriceEntity.receiptPayOilStatus, paymentStatusName: orderPriceEntity.receiptPayOilStatusName }} />
                                                                        </Col>
                                                                        <Col span={12} >
                                                                            <span>服务费:<span className="price">{orderPriceEntity.receiptPayOilTaxAmount}</span> </span>
                                                                            <PayStatusText price={{ paymentStatus: orderPriceEntity.receiptPayOilStatus, paymentStatusName: orderPriceEntity.receiptPayOilStatusName }} />
                                                                        </Col>
                                                                    </React.Fragment> : <span className="empty">--</span>}
                                                            </Row> : null}
                                                    </div>
                                                </td>

                                                {hasAgentFee ?
                                                    <td className="price-td">
                                                        <div className="amount">
                                                            <Row className="price-item" style={{ border: 'none' }}>
                                                                {orderPriceEntity.agentPriceCash ?
                                                                    <React.Fragment>
                                                                        <Col span={12} >
                                                                            <span>现金:<span className="price">{orderPriceEntity.agentPriceCash}</span> </span>
                                                                            <PayStatusText price={{ paymentStatus: orderPriceEntity.agentPriceCashStatus, paymentStatusName: orderPriceEntity.agentPriceCashStatusName }} />
                                                                        </Col>
                                                                        <Col span={12} >
                                                                            <span>服务费:<span className="price">{orderPriceEntity.agentPriceCashTaxAmount}</span> </span>
                                                                            <PayStatusText price={{ paymentStatus: orderPriceEntity.agentPriceCashStatus, paymentStatusName: orderPriceEntity.agentPriceCashStatusName }} />
                                                                        </Col>
                                                                    </React.Fragment> : <span className="empty">--</span>}
                                                            </Row>
                                                        </div>
                                                    </td> : null}
                                                <td className="price-td">
                                                    <div className="amount">
                                                        <Row className="price-item" style={{ border: 'none' }}>
                                                            <Col span={24} style={{ border: 'none' }}>
                                                                <span className="price">{orderPriceEntity.totalAmount} </span>
                                                                <div>
                                                                    <span>(含服务费:{orderPriceEntity.taxCash}) </span>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                {/* 运费信息 其它 */}
                                {this.state.oilCardNo ? <div className="ant-table-body form-table order">
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td className="head">
                                                    <span className="title">油卡卡号</span>
                                                </td>
                                                <td className="column single">
                                                    <input value={this.state.oilCardNo || ''}
                                                        placeholder=""
                                                        readOnly type="text" />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div> : null}
                                {/* 回单信息 详情*/}
                                {this.state.needReceipt ?
                                    <div className="ant-table-body form-table order">
                                        <div className="group-head">
                                            <div>
                                                <span>回单</span>
                                            </div>
                                        </div>
                                        <table>
                                            <tbody className="ant-table-tbody">
                                                <tr>
                                                    <td className="head">
                                                        <span className="title">收件人</span>
                                                    </td>
                                                    <td className="column">
                                                        <input
                                                            readOnly
                                                            maxLength={20} placeholder="收件人"
                                                            value={orderReceiptEntity.receiptName}
                                                            type="text" />
                                                    </td>
                                                    <td className="head">
                                                        <span className="title">联系电话</span>
                                                    </td>
                                                    <td className="column">
                                                        <input
                                                            readOnly
                                                            maxLength={11}
                                                            placeholder="联系电话"
                                                            value={orderReceiptEntity.receiptPhone}
                                                            type="text" />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    :
                                    null}
                                {this.state.needReceipt ?
                                    <div className="ant-table-body form-table order">
                                        <table>
                                            <tbody className="ant-table-tbody">
                                                <tr>
                                                    <td className="head">
                                                        <span className="title">邮寄地址</span>
                                                    </td>
                                                    <td className="column single">
                                                        <TextArea
                                                            readOnly
                                                            placeholder="邮寄地址"
                                                            maxLength={50}
                                                            value={orderReceiptEntity.receiptAddress}
                                                            autosize
                                                        />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    :
                                    null}
                                {/* 回单已上传详情 */}
                                {this.state.needReceipt && orderReceiptEntity.deliveryNo ?
                                    <div className="ant-table-body form-table order">
                                        <table>
                                            <tbody className="ant-table-tbody">
                                                <tr className="col-3">
                                                    <td className="head">
                                                        <span className="title">快递公司</span>
                                                    </td>
                                                    <td className="column" style={{ width: '22%' }}>
                                                        <input readOnly placeholder="快递公司" value={orderReceiptEntity.receiptCarrier} type="text" />
                                                    </td>
                                                    <td className="head">
                                                        <span className="title">快递单号</span>
                                                    </td>
                                                    <td className="column" style={{ width: '22%' }}>
                                                        <input readOnly placeholder="快递单号" value={orderReceiptEntity.deliveryNo} type="text" />
                                                    </td>
                                                    <td className="head">
                                                        <span className="title">上传时间</span>
                                                    </td>
                                                    <td className="column">
                                                        <input readOnly placeholder="上传时间" value={new Date(orderReceiptEntity.uploadTime).format('yyyy-MM-dd hh:mm')} type="text" />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div> : null}
                                {/* 回单已上传详情 图片*/}
                                {this.state.needReceipt && orderReceiptEntity.deliveryNo ?
                                    <div className="ant-table-body form-table order">
                                        <table>
                                            <tbody className="ant-table-tbody">
                                                <tr>
                                                    <td className="head">
                                                        <span className="title">快递公司</span>
                                                    </td>
                                                    <td className="column single">
                                                        <span style={{ padding: '0 12px', display: 'inline-block' }}>
                                                            {orderReceiptEntity.receiptImgUrl.split(';').map((img, index) => {
                                                                return (<div style={{ padding: '12px', textAlign: 'center', display: 'inline-block' }}>
                                                                    <CImg onClick={() => this.setState({
                                                                        imgViewList: orderReceiptEntity.receiptImgUrl.split(';'),
                                                                        ImageViewer: true,
                                                                        ImageViewerIndex: index
                                                                    })}
                                                                        style={{ maxHeight: '80px', margin: '12px' }}
                                                                        src={img} />
                                                                </div>)
                                                            })}
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div> : null}
                                {/* 发票详情 */}
                                {this.state.needInvoice ?
                                    <div className="ant-table-body form-table order">
                                        <div className="group-head">
                                            <div>
                                                <span>发票</span>
                                            </div>
                                        </div>
                                        <table>
                                            <tbody className="ant-table-tbody">
                                                <tr>
                                                    <td className="head">
                                                        <span className="title">总运费（元）</span>
                                                    </td>
                                                    <td className="column">
                                                        <input readOnly value={orderPriceEntity.totalPrice + ' （不含服务费金额）'} type="text" />
                                                        {/* <input readOnly value={this.getTotalPrice(1) + ' （包含服务费金额）'} type="text" /> */}
                                                    </td>
                                                    <td className="head">
                                                        <span className="title">服务费（元）</span>
                                                    </td>
                                                    <td className="column">
                                                        <input readOnly value={(orderPriceEntity.taxCash || '0.00') + ' （开票需要额外支付）'} type="text" />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div> : null}
                                {/* 基本承运信息 */}
                                <div className="ant-table-body form-table order">
                                    <div className="group-head" style={{ borderBottom: 'none' }}>
                                        <span>{'承运信息'}</span>
                                        {driverEditable ? <span className="item-latest" onClick={() => {
                                            this.dispatch(0, driver, vehicle, !vehicleEditable ? true : false)
                                        }}>
                                            <span><i className="iconfont icon-xuanze1"></i>指定承运司机</span>
                                        </span> : ''}
                                        {vehicleEditable ? <span className="item-latest" onClick={() => {
                                            this.dispatch(1, driver, vehicle, !driverEditable ? true : false)
                                        }}>
                                            <span><i className="iconfont icon-xuanze1"></i>指定承运车辆</span>
                                        </span> : ''}
                                    </div>
                                    <table>
                                        <tbody className="ant-table-tbody">
                                            {
                                                driver.phone ?
                                                    <tr className="ant-table-row">
                                                        <td className="head">
                                                            <span className="title">司机</span>
                                                        </td>
                                                        <td className="column">
                                                            <input readOnly placeholder="未选择承运司机"
                                                                type="text"
                                                                value={driver.name} />
                                                        </td>
                                                        <td className="head">
                                                            <span className="title">司机手机号</span>
                                                        </td>
                                                        <td className="column">
                                                            <input readOnly placeholder="未选择承运司机"
                                                                type="text"
                                                                value={driver.phone} />
                                                        </td>
                                                    </tr> : null}
                                            {/* 司机全额收款、中介费模式 都要司机收款账号 */}
                                            {driver.phone ? <tr className="ant-table-row">
                                                <td className="head">
                                                    <span className="title">收款人</span>
                                                </td>
                                                <td className="column" colSpan={hasAgentFee ? '1' : '5'}>
                                                    <div className="payee-column">
                                                        {(function () {
                                                            return (
                                                                carrierFeePayee.name ?
                                                                    <div className="info">
                                                                        <span className="name">{carrierFeePayee.name}</span>
                                                                        <span className="account">{carrierFeePayee.bankAccountNo}</span>
                                                                        <span className="bank">{carrierFeePayee.bankName}</span>
                                                                    </div> : null
                                                            )
                                                        })()}
                                                        {editAbleStatus.askDriverBankAccountNo && !carrierFeePayee.name ?
                                                            (function () {
                                                                return (
                                                                    <div className="choose click-th-main"
                                                                        onClick={() => OrderUtils.chosepayee(carrierFeePayee, {
                                                                            initialList: that.state.driverPayeeList || [],
                                                                            disabledInfo: '必须选择该订单承运司机的收款账户',
                                                                            disable: (payeeitem) => {
                                                                                return hasAgentFee && driver.driverAuthStatus == 1 && payeeitem.idCardNo != driver.idCardNum
                                                                            }
                                                                        }, (payeeChosen) => {
                                                                            OrderUtils.updateOrderCarrierInfo({
                                                                                before: () => {
                                                                                    that.pageLoading(true);
                                                                                },
                                                                                after: () => {
                                                                                    that.pageLoading(false);
                                                                                },
                                                                                param: {
                                                                                    orderId: that.order.id,
                                                                                    askDriverPayeeId: payeeChosen.id,
                                                                                }
                                                                            }, () => {
                                                                                Utils.Message.success('操作成功！');
                                                                                that.refreshOrder(that.order);
                                                                            })
                                                                        })}>
                                                                        <span><i className="iconfont icon-xuanze1"></i>指定收款人</span>
                                                                    </div>
                                                                )
                                                            })() : null}
                                                    </div>
                                                </td>
                                                {hasAgentFee ?
                                                    <td className="head">
                                                        <span className="title">中介费收款人</span>
                                                    </td> : null}
                                                {hasAgentFee ?
                                                    <td className="column">
                                                        <div className="payee-column">
                                                            {payee.name ?
                                                                <div className="info">
                                                                    <span className="name">{payee.name}</span>
                                                                    <span className="account">{payee.bankAccountNo}</span>
                                                                    <span className="bank">{payee.bankName}</span>
                                                                </div> : null}
                                                            {editAbleStatus.payeeBankAccountNo && !payee.name ? <div className="choose click-th-main"
                                                                onClick={() => OrderUtils.chosepayee(payee, {
                                                                    initialList: that.state.driverPayeeList || [],
                                                                    disabledInfo: '中介收款人不能是司机',
                                                                    disable: (payeeitem) => {
                                                                        return driver.driverAuthStatus == 1 && payeeitem.idCardNo == driver.idCardNum
                                                                    }
                                                                }, (payeeChosen) => {
                                                                    OrderUtils.updateOrderCarrierInfo({
                                                                        before: () => {
                                                                            that.pageLoading(true);
                                                                        },
                                                                        after: () => {
                                                                            that.pageLoading(false);
                                                                        },
                                                                        param: {
                                                                            orderId: that.order.id,
                                                                            payeeId: payeeChosen.id
                                                                        }
                                                                    }, () => {
                                                                        Utils.Message.success('操作成功！');
                                                                        that.refreshOrder(that.order);
                                                                    })
                                                                })}>
                                                                <span><i className="iconfont icon-xuanze1"></i>指定收款人</span>
                                                            </div> : null}
                                                        </div>
                                                    </td> : null}
                                            </tr> : null}
                                        </tbody>
                                    </table>
                                </div>
                                {/* 承运信息图片 */}
                                {(function () {
                                    const vehicleInfoHeadFn = function (title, needed) {
                                        return <td className="head">
                                            <span className="title">{title}</span>
                                        </td>
                                    }
                                    const VehicleInfoColumnFn = function (single, val) {
                                        return <td className={"column" + (single ? " single" : "")}>
                                            <input placeholder="" readOnly value={val} type="text" />
                                        </td>
                                    }
                                    if (driver.phone && vehicle.vehicleNo) {
                                        return (
                                            <div className="ant-table-body form-table order">
                                                <table>
                                                    <tbody className="ant-table-tbody">
                                                        <tr>
                                                            {vehicleInfoHeadFn("车牌号")}
                                                            {VehicleInfoColumnFn(false, vehicle.vehicleNo)}
                                                            {vehicleInfoHeadFn("车型")}
                                                            {VehicleInfoColumnFn(false, vehicle.vehicleTypeName)}
                                                        </tr>
                                                        <tr>
                                                            {vehicleInfoHeadFn("车长（米）")}
                                                            {VehicleInfoColumnFn(false, vehicle.vehicleLen)}
                                                            {vehicleInfoHeadFn("吨位（吨）")}
                                                            {VehicleInfoColumnFn(false, vehicle.vehicleTon)}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    } else {
                                        if (driver.phone) {
                                            return null
                                        } else if (vehicle.vehicleNo) {
                                            return (
                                                <div className="ant-table-body form-table order">
                                                    <table>
                                                        <tbody className="ant-table-tbody">
                                                            <tr>
                                                                {vehicleInfoHeadFn("车牌号")}
                                                                {VehicleInfoColumnFn(false, vehicle.vehicleNo)}
                                                                {vehicleInfoHeadFn("车型")}
                                                                {VehicleInfoColumnFn(false, vehicle.vehicleTypeName)}
                                                            </tr>
                                                            <tr>
                                                                {vehicleInfoHeadFn("车长（米）")}
                                                                {VehicleInfoColumnFn(false, vehicle.vehicleLen)}
                                                                {vehicleInfoHeadFn("吨位（吨）")}
                                                                {VehicleInfoColumnFn(false, vehicle.vehicleTon)}
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )
                                        } else {
                                            return null;
                                        }
                                    }
                                })()}
                            </div>
                        </div>
                        {that.state.MapSuspenseComp ? <div style={{ marginTop: '16px', marginLeft: '6px' }}>
                            <p>轨迹信息</p>
                            {that.state.MapSuspenseComp}
                        </div> : null}
                    </div>
                    <div className="order-opt-his">
                        <p>操作记录</p>
                        <div style={{ marginLeft: '6px' }}>
                            <Timeline>
                                {this.state.operationList.map((opt, index) => {
                                    return <Timeline.Item key={index}><TimelineInfo info={opt} /></Timeline.Item>
                                })}
                            </Timeline>
                        </div>
                    </div>
                </div>
            </Layout>
        );
        return (
            <div style={{ height: 'calc(100% - 58px)' }}>
                <div className="list-ctrl-box" style={{ textAlign: 'right', height: '48px' }}>
                    <div>
                        <span style={{ marginTop: '3px', float: 'left' }}>订单号：{this.state.orderNo}</span>
                        {that.state.contractStatus ?
                            <span
                                style={{ marginLeft: '24px', color: '#0099ff', cursor: 'pointer', marginTop: '3px', float: 'left', fontSize: '13px', position: 'relative' }}>
                                <span onClick={() => { window.open(this.state.contractUrl) }} >
                                    <i className="iconfont icon-protocol"></i>
                                    <span>查看运输合同</span>
                                </span>
                                {editAbleStatus.contract != 1 ?
                                    <Upload {...OrderUtils.getUpLoadProps((url) => {
                                        Utils.request({
                                            api: Utils.getApi('订单管理', '上传合同'),
                                            beforeRequest() {
                                                that.pageLoading(true);
                                            },
                                            afterRequest() {
                                                that.pageLoading(false);
                                            },
                                            params: {
                                                orderId: that.order.id,
                                                contractUrl: url
                                            },
                                            success: function (data) {
                                                that.refreshOrder(that.order)
                                            }
                                        })
                                    })}>
                                        <i className="iconfont icon-upload-model"
                                            style={{
                                                marginLeft: '4px',
                                                color: '#ff7800',
                                                cursor: 'pointer',
                                                marginTop: '3px',
                                                float: 'left',
                                                fontSize: '14px',
                                                position: 'absolute',
                                                top: '0'
                                            }} ></i>
                                    </Upload> : null}
                            </span>
                            : ''}
                        {that.state.transferVoucherImage ?
                            <span
                                style={{ marginLeft: '24px', color: '#0099ff', cursor: 'pointer', marginTop: '3px', float: 'left', fontSize: '13px', position: 'relative' }}>
                                <span onClick={() => { window.open(that.state.transferVoucherImage) }} >
                                    <i className="iconfont icon-protocol"></i>
                                    <span>查看转账凭证</span>
                                </span>
                                <Upload {...OrderUtils.getUpLoadProps((url) => {
                                    Utils.request({
                                        api: Utils.getApi('订单管理', '上传司机转账凭证'),
                                        beforeRequest() {
                                            that.pageLoading(true);
                                        },
                                        afterRequest() {
                                            that.pageLoading(false);
                                        },
                                        params: {
                                            orderId: that.order.id,
                                            transferVoucherImage: url
                                        },
                                        success: function (data) {
                                            that.refreshOrder(that.order)
                                        }
                                    })
                                })}>
                                    <i className="iconfont icon-upload-model"
                                        style={{
                                            marginLeft: '4px',
                                            color: '#ff7800',
                                            cursor: 'pointer',
                                            marginTop: '3px',
                                            float: 'left',
                                            fontSize: '14px',
                                            position: 'absolute',
                                            top: '0'
                                        }} ></i>
                                </Upload>
                            </span>
                            : ''}
                        {this.state.cancelBtn}
                        {this.state.editBtn}
                    </div>
                </div>
                <div className="order-status-info-bar">
                    {this.state.infoBarText}
                    <span className="ctrl-tbn">{this.state.ctrlBtn}{this.state.locateTriggerBtn}{this.state.upRecptBtn}</span>
                </div>
                <ScrollContainer init loading={this.state.pageloading} height={'70px'} content={content} />

                {/* <ImageViewer thumb={'_600-600'} handleCancel={() => this.setState({ ImageViewer: false })} list={this.state.imgViewList} show={this.state.ImageViewer} index={this.state.ImageViewerIndex} />
                <ImageViewer thumb={'_600-600'} handleCancel={() => this.setState({ ImageViewer1: false })} list={this.state.imgViewList1} show={this.state.ImageViewer1} index={this.state.ImageViewerIndex1} /> */}

            </div>
        )
    }
}

export default class extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <Reload {...this.props} component={OrderDetail} />
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
        let disabled = dis == false ? false : (dis || !fun)
        style = style || {}
        className = className || 'common'
        if (disabled) {
            style.color = '#999 important'
        }
        return <Button disabled={disabled}
            className={className}
            style={style}
            loading={this.state.loading}
            onClick={(e) => {
                fun()
            }} text={text} />
    }
}


class PayStatusText extends React.Component {
    render() {
        const color = this.props.price.paymentStatus == 1 ? { color: '#66c386' } : { color: '#ff7800' }
        color.fontSize = '10px'
        color.marginLeft = '3px'
        return <div style={color}>{this.props.price.paymentStatusName}</div>
    }
}