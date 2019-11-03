import React from 'react'
import Layout from 'antd/lib/layout'
// const TabPane = Tabs.TabPane;
import { Checkbox, Select, DatePicker, Input, Upload } from 'antd'
import moment from 'moment'
import Selector from '../../lib/address-search'
import ScrollBar from 'smooth-scrollbar';
import FreshComponent from '../freshbind'
import Map from '../../lib/map/chose'
import Reload from '../reload'
import OrderUtils from '../../../lib/orderUtils'
import Enums from '../../../lib/enum'
import Utils from 'utils/utils'
import Events from 'gc-event/es5'
import Storage from 'gc-storage/es5'
import './index1.scss';
import { Form, Row, Col, Button, Icon, Divider, Radio } from 'antd';
import FSelect from '../../lib/fetch-select'

const UserInfo = Storage.get('userInfo') || {}
const CompanyInfo = Storage.get('companyConfig') || {}
const Dictionary = Storage.get('dictionary') || {}
const cityCodeMap = Storage.get('areaCode')
const { TextArea } = Input;
const Option = Select.Option;

let cityTree = Dictionary.location, cityMap = {}
cityTree.map((province) => {
    cityMap[province.code] = province.nodes;
})

class NewOrder extends FreshComponent {
    constructor(props) {
        super(props);
        this.invoiceRate = CompanyInfo.invoiceRate;
        this.storage = {}
        this.validateMap = {}
        let that = this;
        this.pid = Utils.guid() + '-'
        this.init(this.props.order, this.props.onEdit);
        this.initValidMap()
        this.CONTRACT_TEMPLATE = Utils.getInvoiceModel().contractTemplate
        this.uploadProps = {
            name: 'files',
            action: Utils.FILE_UPLOAD,
            headers: {
                authorization: 'authorization-text',
            },
            accept: "image/jpg,image/jpeg,image/png,image/bmp",
            data: {
                meta: JSON.stringify({
                    companyId: CompanyInfo.companyId.toString(),
                    userId: UserInfo.id.toString(),
                })
            },
            showUploadList: false,
            onChange(info) {
                if (info.file.status === 'done') {
                    if (info.file.response.body.resUrls[0]) {
                        that.setState({
                            contractUrl: info.file.response.body.resUrls[0]
                        })
                    }
                } else if (info.file.status === 'error') {
                    Utils.Message.error(`文件上传失败！`);
                }
            },
        }
    }

    componentDidMount() {
        this.scrollInstance = ScrollBar.init(this.refs.newOrderForm)
        let that = this
        Utils.request({
            api: '/api/web/enterprise/address/hotAddress',
            success: function (data) {
                that.setState({
                    fromAddressChosen: data.fromAddresses,
                    toAddressChosen: data.toAddresses,
                    usuaCargo: data.cargoEntities
                })
            }
        })
    }

    initValidMap() {
        this.validateMap = {
            fromAddresses: {
                0: {},
                1: {}
            },
            toAddresses: {
                0: {},
                1: {}
            },
            cargo: {
                0: {}
            }
        }
    }

    selectSearchFun(type, keywords) {
        return new Promise((resolve, reject) => {
            Utils.request({
                api: Utils.getApi('新建订单', type),
                params: {
                    pageSize: 20,
                    pageNum: 1,
                    like1: keywords,
                },
                success: function (data) {
                    resolve(data.data)
                }
            })
        })
    }

    init(order, onEdit) {
        if (onEdit) {
            if (order) {
                //on edit
                this.storage.startMoment = moment(new Date(order.expDepartTime))
                this.storage.endMoment = moment(new Date(order.expArriveTime))
                order.expArrive = moment(new Date(order.expArriveTime))
                order.expDepart = moment(new Date(order.expDepartTime))
                order.expArriveTime = new Date(order.expArriveTime).format('yyyy-MM-dd hh:mm')
                order.expDepartTime = new Date(order.expDepartTime).format('yyyy-MM-dd hh:mm')
                this.initDrivers = order.driver ? [{
                    driverAuthStatus: order.driver.driverAuthStatus,
                    driverName: order.driver.name,
                    driverPhone: order.driver.phone,
                    driverIdCardNo: order.driver.idCardNum
                }] : null
                this.state = {
                    ...order,
                    needInvoice: order.needInvoice ? 1 : 0,
                    needReceipt: order.needReceipt ? 1 : 0,
                    // driverPayeeList: order.driverPayeeList || [],
                    driverPayeeList: (function () {
                        let r = []
                        if (order.carrierFeePayee && order.carrierFeePayee.name) {
                            r.push(order.carrierFeePayee)
                        }
                        if (order.payee && order.payee.name) {
                            r.push(order.payee)
                        }
                        return r
                    })(),
                    onEdit: true
                }
            }
        } else {
            if (order) {
                //copy order
                this.state = {
                    fromAddresses: order.fromAddresses || [{}],
                    toAddresses: order.toAddresses || [{}],
                    orderCargoEntities: order.orderCargoEntities || [{}],
                    remark: order.remark,
                    orderPriceEntity: order.orderPriceEntity || {},
                    needInvoice: order.needInvoice ? 1 : 0,
                    needReceipt: order.needReceipt ? 1 : 0,
                    orderReceiptEntity: order.orderReceiptEntity || [{}],
                    agentPriceName: order.agentPriceName,
                    driver: {},
                    vehicle: {},
                    payee: {},
                    driverPayeeList: [],
                    carrierFeePayee: {}
                }
            } else {
                //new order
                this.state = {
                    fromAddresses: [{
                    }],
                    toAddresses: [{
                    }],
                    orderPriceEntity: {
                        // paymentStatus
                    },
                    driver: {},
                    vehicle: {},
                    payee: {},
                    needReceipt: 0,
                    needInvoice: 1,
                    orderReceiptEntity: {},
                    orderCargoEntities: [{}],
                    driverPayeeList: [],
                    carrierFeePayee: {}
                }
            }
        }
    }

    showMap(address) {
        let that = this;
        let chosed = function (info) {
            let pos = Utils.bd_encrypt(info.longitude, info.latitude)
            address.latitude = pos.lat
            address.longitude = pos.lng
            address.address = info.address
            address.formatAddress = info.formatAddress
            address.province = info.provinceName
            address.provinceCode = cityCodeMap[info.provinceName]
            address.city = info.cityName
            address.cityCode = cityCodeMap[info.cityName]
            modal.destroy();
            that.refreshForm();
        }
        let modal = Utils.modal({
            content: <Map tranform
                amapkey={Utils.amapkey}
                position={{
                    longitude: address.longitude,
                    latitude: address.latitude
                }}
                onChoosen={chosed}
                label={address.address}
                city={{
                    name: address.city,
                    code: address.cityCode
                }} />,
            noBtn: true,
            width: 864,
            height: 400
        })
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
        }, function () {
        })
    }

    addAddress(type) {
        this.state[type].push({
            loadType: type === 'fromAddresses' ? 0 : 1,
        });
        this.refreshForm()
    }
    removeAddress(type) {
        this.state[type].pop();
        this.refreshForm()
    }

    refreshForm() {
        this.setState({
            ...this.state
        })
    }
    addGoods() {
        this.state.orderCargoEntities.push({});
        this.refreshForm();
    }

    dispatch(key) {
        OrderUtils.orderDispatch(key, this.state.driver, this.state.vehicle, false, (driver, vehicle) => {
            if (this.state.driver.phone && driver.phone && this.state.driver.phone != driver.phone) {
                this.state.askDriverPayeeId = null
                this.state.payeeId = null
                this.state.carrierFeePayee = {}
                this.state.payee = {}
            }
            this.state.driverPayeeList = []
            if (driver.payeeInfoEntityList && driver.payeeInfoEntityList.length > 0) {
                this.state.driverPayeeList = driver.payeeInfoEntityList
            }
            this.state.contractUrl = null
            this.state.contractStatus = null
            if (driver.orderContractEntity) {
                this.state.contractUrl = driver.orderContractEntity.contractUrl
                this.state.contractStatus = driver.orderContractEntity.status
            }
            this.setState({
                ...this.state,
                driver: driver,
                vehicle: vehicle
            })
        })
    }

    /**
     * 金额计算 过滤
     */
    verifyPrice() {
        let { orderPriceEntity } = this.state
        let a = parseFloat(orderPriceEntity.prepayCash);
        let b = parseFloat(orderPriceEntity.prepayOil);
        let c = parseFloat(orderPriceEntity.restPayCash);
        let d = parseFloat(orderPriceEntity.restPayOil);
        let e = parseFloat(orderPriceEntity.receiptPayCash);
        let f = parseFloat(orderPriceEntity.receiptPayOil);
        let g = parseFloat(this.state.agentPriceName);
        if (isNaN(a)) {
            this.state.orderPriceEntity.prepayCash = '';
            a = 0;
        }
        if (isNaN(b)) {
            this.state.orderPriceEntity.prepayOil = '';
            b = 0;
        }
        if (isNaN(c)) {
            this.state.orderPriceEntity.restPayCash = '';
            c = 0;
        }
        if (isNaN(d)) {
            this.state.orderPriceEntity.restPayOil = '';
            d = 0;
        }
        if (isNaN(e)) {
            this.state.orderPriceEntity.receiptPayCash = '';
            e = 0;
        }
        if (isNaN(f)) {
            this.state.orderPriceEntity.receiptPayOil = '';
            f = 0;
        }
        if (isNaN(g)) {
            this.state.agentPriceName = '';
            g = 0;
        }
        return [a, b, c, d, e, f, g];
    }

    /**
     * 计算费用类型总额
     * @param {*} index 
     */
    countAmount(index) {
        let price;
        let pArr = this.verifyPrice();
        switch (index) {
            case 0:
                price = pArr[0] + pArr[1];
                break;
            case 1:
                price = pArr[2] + pArr[3];
                break;
            case 2:
                price = pArr[4] + pArr[5];
                break;
            default:
                price = '';
        }
        return price.toFixed(2)
    }

    /**
     * 选择常用联系人
     * @param {*} type 
     * @param {*} index 
     */
    addRecent(type, index) {
        let that = this, ids = new Array(), localaddress = that.state[type][index];
        this.state.fromAddresses.map(address => {
            if (!address || address.id != localaddress.id) {
                ids.push(address.id)
            }
        })
        this.state.toAddresses.map(address => {
            if (!address || address.id != localaddress.id) {
                ids.push(address.id)
            }
        })
        OrderUtils.orderAddressChose(localaddress, ids, (contact => {
            that.state[type][index] = {
                contactName: contact.contactName,
                contactPhone: contact.contactPhone,
                latitude: contact.lat,
                longitude: contact.lon,
                province: contact.provinceName,
                provinceCode: contact.provinceCode,
                city: contact.cityName,
                cityCode: contact.cityCode,
                address: contact.address,
                id: contact.id
            };
            this.refreshForm();
        }))
    }

    removeGoods(index) {
        this.state.orderCargoEntities.splice(index, 1);
        this.refreshForm();
    }
    /**
     * 时间选择器
     */
    disabledStart(current) {
        let date = this.state.onEdit ? (new Date(this.state.createTime - 60 * 60 * 12 * 1000)) : (new Date())
        if (this.storage.endMoment) {
            return current < moment(date).startOf('hour') || current > this.storage.endMoment;
        }
        return current < moment(date).startOf('hour');
    }
    disabledEnd(current) {
        let date = this.state.onEdit ? (new Date(this.state.createTime - 60 * 60 * 12 * 1000)) : (new Date())
        if (this.storage.startMoment) {
            return current < moment(date).startOf('hour') || current < this.storage.startMoment;
        }
        return current < moment(date).startOf('hour');
    }

    onEndChange(moment) {
        this.storage.endMoment = moment;
        this.setState({
            expArriveTime: moment ? moment.format('YYYY-MM-DD HH:mm') : null,
            expArrive: moment
        })
    }

    save(copy) {
        let orderPropertyArray = [
            'fromAddresses', 'toAddresses', 'orderCargoEntities',
            'expDepartTime', 'expArriveTime', 'remark',
            'orderPriceItem', 'agentPriceName', 'askDriverPriceName', 'payeeId', 'askDriverPayeeId', 'oilCardNo',
            'needInvoice', 'needReceipt',
            'orderReceiptEntity', 'askDriverPhone', 'askVehicleId',
            'contractUrl', 'orderId'
        ]

        let p = Utils.deepclone(this.state);
        let that = this;
        delete p['expArrive']
        delete p['expDepart']

        if (!p.needReceipt) {
            delete p['orderReceiptEntity'];
        }
        delete p['pageloading']
        delete p['driverPayeeList']
        if (p.vehicle.id) {
            p.askVehicleId = p.vehicle.id
        }
        if (p.driver.phone) {
            p.askDriverPhone = p.driver.phone
        }

        if (p.agentPriceName && p.agentPriceName > 0
            && p.carrierFeePayee.idCardNo && p.driver.driverAuthStatus == 1
            && p.carrierFeePayee.idCardNo
            && p.carrierFeePayee.idCardNo != p.driver.idCardNum) {
            //运费非司机收取 有中介费  提示
            Utils.Message.error('有中介费时，收款人必须是司机本人。')
            return
        }

        delete p['vehicle']
        delete p['payee']
        delete p['driver']
        p.needInvoice = p.needInvoice ? 1 : 0;
        p.needReceipt = p.needReceipt ? 1 : 0;
        let orderPriceItems = new Array();

        let oilPriceExist = false, prepayExist = false, otherFeeExist = false
        if (p.orderPriceEntity.prepayCash > 0) {
            prepayExist = true
            orderPriceItems.push({
                stage: Enums.PaymentStage.PRE,
                type: Enums.PaymentType.CASH,
                amountName: p.orderPriceEntity.prepayCash
            })
        }
        if (p.orderPriceEntity.prepayOil > 0) {
            oilPriceExist = true
            prepayExist = true
            orderPriceItems.push({
                stage: Enums.PaymentStage.PRE,
                type: Enums.PaymentType.OIL,
                amountName: p.orderPriceEntity.prepayOil
            })
        }
        if (p.orderPriceEntity.restPayCash > 0) {
            otherFeeExist = true
            orderPriceItems.push({
                stage: Enums.PaymentStage.REST,
                type: Enums.PaymentType.CASH,
                amountName: p.orderPriceEntity.restPayCash
            })
        }
        if (p.orderPriceEntity.restPayOil > 0) {
            oilPriceExist = true
            otherFeeExist = true
            orderPriceItems.push({
                stage: Enums.PaymentStage.REST,
                type: Enums.PaymentType.OIL,
                amountName: p.orderPriceEntity.restPayOil
            })
        }
        if (p.orderPriceEntity.receiptPayCash > 0) {
            otherFeeExist = true
            orderPriceItems.push({
                stage: Enums.PaymentStage.RECEIPT,
                type: Enums.PaymentType.CASH,
                amountName: p.orderPriceEntity.receiptPayCash
            })
        }
        if (p.orderPriceEntity.receiptPayOil > 0) {
            oilPriceExist = true
            otherFeeExist = true
            orderPriceItems.push({
                stage: Enums.PaymentStage.RECEIPT,
                type: Enums.PaymentType.OIL,
                amountName: p.orderPriceEntity.receiptPayOil
            })
        }
        let paramVerified = true, lastFaildTarget = null
        p.orderPriceItem = orderPriceItems;
        delete p['orderPriceEntity']
        for (let k in p) {
            if (orderPropertyArray.indexOf(k) == -1) {
                delete p[k]
            }
        }

        for (let index in p.fromAddresses) {
            let address = p.fromAddresses[index]
            // if (!address.province) {
            //     paramVerified = false
            //     this.validateMap['fromAddresses'][index]['province'] = 'error'
            //     if (!lastFaildTarget)
            //         lastFaildTarget = `fromAddresses-${index}-province`
            // }
            if (!address.address) {
                paramVerified = false
                this.validateMap['fromAddresses'][index]['address'] = 'error'
                if (!lastFaildTarget)
                    lastFaildTarget = `fromAddresses-${index}-address`
            }
            if (address.contactPhone && !Utils.PHONE_REG.test(address.contactPhone)) {
                paramVerified = false
                this.validateMap['fromAddresses'][index]['contactPhone'] = 'error'
                if (!lastFaildTarget)
                    lastFaildTarget = `fromAddresses-${index}-contactPhone`
            }
        }
        for (let index in p.toAddresses) {
            let address = p.toAddresses[index]
            // if (!address.province) {
            //     paramVerified = false
            //     this.validateMap['toAddresses'][index]['province'] = 'error'
            //     if (!lastFaildTarget)
            //         lastFaildTarget = `toAddresses-${index}-province`
            // }
            if (!address.address) {
                paramVerified = false
                this.validateMap['toAddresses'][index]['address'] = 'error'
                if (!lastFaildTarget)
                    lastFaildTarget = `toAddresses-${index}-address`
            }
            if (!address.contactName) {
                paramVerified = false
                this.validateMap['toAddresses'][index]['contactName'] = 'error'
                if (!lastFaildTarget)
                    lastFaildTarget = `toAddresses-${index}-contactName`
            }
            if (!address.contactPhone || !Utils.PHONE_REG.test(address.contactPhone)) {
                paramVerified = false
                this.validateMap['toAddresses'][index]['contactPhone'] = 'error'
                if (!lastFaildTarget)
                    lastFaildTarget = `toAddresses-${index}-contactPhone`
            }
        }
        if (!p.orderCargoEntities || p.orderCargoEntities.length == 0) {
            Utils.Message.error('请完善订单货物信息！')
            return false;
        }
        for (let index in p.orderCargoEntities) {
            let cargo = p.orderCargoEntities[index]
            if (!cargo.cargoName) {
                paramVerified = false
                this.validateMap['cargo'][index]['cargoName'] = 'error'
                if (!lastFaildTarget)
                    lastFaildTarget = `cargo-${index}-cargoName`
            }
            if (!cargo.cargoTypeName) {
                paramVerified = false
                this.validateMap['cargo'][index]['cargoType'] = 'error'
                if (!lastFaildTarget)
                    lastFaildTarget = `cargo-${index}-cargoType`
            }
            if (!cargo.cargoWeight) {
                paramVerified = false
                this.validateMap['cargo'][index]['cargoWeight'] = 'error'
                if (!lastFaildTarget)
                    lastFaildTarget = `cargo-${index}-cargoWeight`
            }
        }

        if (!p.expDepartTime) {
            paramVerified = false
            this.validateMap['expDepartTime'] = 'error'
            if (!lastFaildTarget)
                lastFaildTarget = `expDepartTime`
        }
        if (!p.expArriveTime) {
            paramVerified = false
            this.validateMap['expArriveTime'] = 'error'
            if (!lastFaildTarget)
                lastFaildTarget = `expArriveTime`
        }

        if (p.expArriveTime && p.expDepartTime && (new Date(p.expArriveTime).getTime()) <= (new Date(p.expDepartTime).getTime())) {
            paramVerified = false
            this.validateMap['expArriveTime'] = 'error'
            if (!lastFaildTarget)
                lastFaildTarget = `expArriveTime`
        }
        if (!p.orderPriceItem || p.orderPriceItem.length == 0) {
            paramVerified = false
            this.validateMap['orderPrice'] = 'error'
            if (!lastFaildTarget)
                lastFaildTarget = `orderPrice`
        }

        if (prepayExist && !otherFeeExist) {
            paramVerified = false
            this.validateMap['orderPrice'] = 'error'
            if (!lastFaildTarget)
                lastFaildTarget = `orderPrice`
        }

        if (oilPriceExist && !p.oilCardNo) {
            paramVerified = false
            this.validateMap['oilCardNo'] = 'error'
            if (!lastFaildTarget)
                lastFaildTarget = `oilCardNo`
        }

        if (this.state.needReceipt && this.state.orderReceiptEntity) {
            if (!this.state.orderReceiptEntity.receiptAddress) {
                paramVerified = false
                this.validateMap['receiptAddress'] = 'error'
                if (!lastFaildTarget)
                    lastFaildTarget = `receiptAddress`
            }
            if (this.state.orderReceiptEntity.receiptPhone && !this.state.orderReceiptEntity.receiptPhone) {
                paramVerified = false
                this.validateMap['receiptPhone'] = 'error'
                if (!lastFaildTarget)
                    lastFaildTarget = `receiptPhone`
            }
        }

        if (lastFaildTarget) {
            this.scrollInstance.scrollIntoView(document.getElementById(`${this.pid}-${lastFaildTarget}`))
            document.getElementById(`${this.pid}-${lastFaildTarget}`).focus()
        }

        if (!paramVerified) {
            this.setState({
                time: new Date()
            })
            return
        }
        p.expArriveTime = p.expArriveTime + ':00'
        p.expDepartTime = p.expDepartTime + ':00'
        Utils.request({
            api: that.state.onEdit ? Utils.getApi('订单管理', '修改') : Utils.getApi('新建订单', '新建'),
            beforeRequest() {
                that.setState({
                    saveLoading: true
                })
            },
            afterRequest() {
                that.setState({
                    saveLoading: false
                })
            },
            params: p,
            success: function (res) {
                Utils.Message.success(that.state.onEdit ? '修改成功' : '新建成功！')
                if (that.state.vehicle.vehicleNo && that.state.driver.phone) {
                    //TODO 建立弱关系
                    Utils.request({
                        api: '/api/internal/common/saveoptemp',
                        params: {
                            key: that.state.driver.phone,
                            opt: JSON.stringify(that.state.vehicle),
                        },
                        success: function (data) {

                        }
                    })
                }
                if (that.state.onEdit) {
                    that.props.success()
                    return
                }
                if (copy) {
                    that.setState({
                        expArriveTime: null,
                        expArrive: null,
                        expDepartTime: null,
                        expDepart: null,
                        oilCardNo: '',
                        driver: {},
                        askDriverPayeeId: null,
                        payeeId: null,
                        askDriverBankAccountNo: null,
                        contractStatus: null,
                        contractUrl: null,
                        vehicle: {}
                    })
                } else {
                    that.props.reload();
                    let status;
                    if (!that.state.driver.phone || !that.state.vehicle.vehicleNo) {
                        status = 'New'
                    } else {
                        status = 'Assigned'
                    }
                    Events.emit('addTab', { moduleText: '订单管理', module: '订单管理', }, { event: 'filtOrderType', params: [status] })
                    Events.emit('initOrderList');
                }
            }
        })
    }



    verifyParam() {
        let addressKey = [
            { key: 'address', info: '联系人地址' },
            { key: 'contactName', info: '联系人姓名' },
            { key: 'contactPhone', info: '联系电话' }
        ];
        let goodsKey = [{ key: 'cargoName', info: '货物名称' }, { key: 'cargoTypeName', info: '货物类型' }, { key: 'cargoWeight', info: '货物重量' }];
        let otherKey = [
            // { key: 'vehicleType', info: '车辆类型' },
            // { key: 'vehicleLength', info: '车辆长度' },
            // { key: 'vehicleLoadWeight', info: '车辆载重' },
            // { key: 'expDepartTime', info: '期望装货时间' },
            { key: 'expDepartTime', info: '期望发车时间' },
            { key: 'expArriveTime', info: '期望到达时间' },

            // { key: 'prepayCash', info: '预付款现金金额', numberOnly: true },
            // { key: 'prepayOil', info: '预付款油卡金额', numberOnly: true },

            // { key: 'restPayCash', info: '尾款现金金额', numberOnly: true },
            // { key: 'restPayOil', info: '尾款油卡金额', numberOnly: true },

            // {key:'receiptPayCash',info:'回单现金金额'},
            // {key:'receiptPayOil',info:'回单油卡金额'},
        ]
        if (this.newParam.orderAddresses.length < 1) {
            Utils.Message.error('请填写收货人和发货人信息！');
            return false;
        }
        for (let i = 0; i < this.newParam.orderAddresses.length; i++) {
            let add = this.newParam.orderAddresses[i];
            if (add.loadType == 1) {//收货地全校验
                for (let j = 0; j < addressKey.length; j++) {
                    let kObj = addressKey[j];
                    if (!add[kObj.key]) {
                        Utils.Message.error(`请填写${kObj.info}!`);
                        return false;
                    }
                    if (kObj.key === 'contactPhone') {
                        if (!Utils.PHONE_REG.test(add.contactPhone)) {
                            Utils.Message.error(`请填正确的手机号!`);
                            return false;
                        }
                    }
                }
            } else {
                if (!add.address) {
                    Utils.Message.error(`请填写详细地址!`);
                    return false;
                }
            }
        }
        if (!this.newParam.orderCargoEntities || this.newParam.orderCargoEntities.length < 1) {
            Utils.Message.error('请填货物信息！');
            return false;
        }
        for (let i = 0; i < this.newParam.orderCargoEntities.length; i++) {
            let goods = this.newParam.orderCargoEntities[i];
            for (let j = 0; j < goodsKey.length; j++) {
                let kObj = goodsKey[j];
                if (!goods[kObj.key]) {
                    Utils.Message.error(`请填写${kObj.info}!`);
                    return false;
                }
            }
        }

        for (let i = 0; i < otherKey.length; i++) {
            if (this.newParam[otherKey[i].key] == undefined || this.newParam[otherKey[i].key] == '' || this.newParam[otherKey[i].key] == null) {
                Utils.Message.error(`请填写${otherKey[i].info}!`);
                return false;
            }
            if (otherKey[i].numberOnly) {
                if (isNaN(this.newParam[otherKey[i].key])) {
                    Utils.Message.error(`请输入正确的${otherKey[i].info}!`);
                    return false;
                }
            }
        }

        if (this.newParam.prepayCash && isNaN(this.newParam.prepayCash)) {
            Utils.Message.error(`请输入正确的预付款现金金额!`);
            return false;
        } else {
            if (!this.newParam.prepayCash) {
                this.newParam.prepayCash = '0';
            }
        }
        if (this.newParam.prepayOil && isNaN(this.newParam.prepayOil)) {
            Utils.Message.error(`请输入正确的预付款油卡金额!`);
            return false;
        } else {
            if (!this.newParam.prepayOil) {
                this.newParam.prepayOil = '0';
            }
        }

        if (this.newParam.restPayCash && isNaN(this.newParam.restPayCash)) {
            Utils.Message.error(`请输入正确的尾款现金金额!`);
            return false;
        } else {
            if (!this.newParam.restPayCash) {
                this.newParam.restPayCash = '0';
            }
        }
        if (this.newParam.restPayOil && isNaN(this.newParam.restPayOil)) {
            Utils.Message.error(`请输入正确的尾款油卡金额!`);
            return false;
        } else {
            if (!this.newParam.restPayOil) {
                this.newParam.restPayOil = '0';
            }
        }

        if (this.newParam.receiptPayCash && isNaN(this.newParam.receiptPayCash)) {
            Utils.Message.error(`请输入正确的回单现金金额!`);
            return false;
        }
        if (this.newParam.receiptPayOil && isNaN(this.newParam.receiptPayOil)) {
            Utils.Message.error(`请输入正确的回单油卡金额!`);
            return false;
        }

        if ((!this.newParam.prepayCash || parseFloat(this.newParam.prepayCash) == 0)
            && (!this.newParam.prepayOil || parseFloat(this.newParam.prepayOil) == 0)
            && (!this.newParam.restPayCash || parseFloat(this.newParam.restPayCash) == 0)
            && (!this.newParam.restPayOil || parseFloat(this.newParam.restPayOil) == 0)
            && (!this.newParam.receiptPayCash || parseFloat(this.newParam.receiptPayCash) == 0)
            && (!this.newParam.receiptPayOil || parseFloat(this.newParam.receiptPayOil) == 0)) {
            Utils.Message.error(`请填写订单金额!`);
            return false;
        }

        if ((!this.newParam.restPayCash || parseFloat(this.newParam.restPayCash) == 0)
            && (!this.newParam.restPayOil || parseFloat(this.newParam.restPayOil) == 0)
            && (!this.newParam.receiptPayCash || parseFloat(this.newParam.receiptPayCash) == 0)
            && (!this.newParam.receiptPayOil || parseFloat(this.newParam.receiptPayOil) == 0)) {
            Utils.Message.error(`请输入尾款或回单款!`);
            return false;
        }

        if (!this.newParam.oilCardNo && (OrderUtils.amountCorrect(this.newParam.prepayOil) || OrderUtils.amountCorrect(this.newParam.restPayOil) || OrderUtils.amountCorrect(this.newParam.receiptPayOil))) {
            Utils.Message.error('请选择油卡卡号')
            return false;
        }

        if (this.newParam.needReceipt && this.newParam.orderReceiptEntity) {
       
            if (this.newParam.orderReceiptEntity.contactPhone && !Utils.PHONE_REG.test(this.newParam.orderReceiptEntity.contactPhone)) {
                Utils.Message.error(`请正确填写回单收件人联系电话!`);
                return false;
            }
        }

      

        if ((new Date(this.newParam.expArriveTime).getTime()) <= (new Date(this.newParam.expDepartTime).getTime())) {
            Utils.Message.error(`期望到达时间不能小于发车时间`);
            return false;
        }
        return true;
    }


    getFields() {
        const count = this.state.expand ? 10 : 6;
        const children = [];
        for (let i = 0; i < 10; i++) {
            children.push(
                <Col span={12} key={i} style={{ display: i < count ? 'block' : 'none' }}>
                    <Form.Item label={`Field ${i}`}>
                        <Input placeholder="placeholder" />
                    </Form.Item>
                </Col>,
            );
        }
        return children;
    }

    /**
     * 
     * @param {*} type null 服务费 0 实际运费
     */
    getTotalPrice(type) {
        let pArr = this.verifyPrice();
        let price = pArr[0] + pArr[1] + pArr[2] + pArr[3] + pArr[4] + pArr[5] + pArr[6]
        if (isNaN(price)) {
            return '';
        }
        switch (type) {
            case 0:
                return price.toFixed(2);
            case 1:
                // return (price * (1 + this.invoiceRate / 100)).toFixed(2);
                // 10000/(1-6%)=10000+10000*6%/(1-6%)
                return (price / (1 - this.invoiceRate / 100)).toFixed(2)
            default:
                // return (price * this.invoiceRate / 100).toFixed(2);  
                // 10000*6%/(1-6%)
                return (price * (this.invoiceRate / 100) / (1 - this.invoiceRate / 100)).toFixed(2);
        }
    }

    generateDriverContact(download) {
        return new Promise(resolve => {
            let canvas = document.createElement('canvas'), that = this
            canvas.height = 3507;
            canvas.width = 2479;
            var ctx = canvas.getContext("2d");

            ctx.font = 'bold 36px 宋体';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = '#000';
            var today = new Date();
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                ctx.fillText(that.state.driver.name, 400, 406);
                ctx.fillText(that.state.driver.idCardNum, 1280, 406);

                ctx.fillText(today.getFullYear(), 830, 1670);
                ctx.fillText(today.getMonth() + 1, 1060, 1670);
                ctx.fillText(today.getDate(), 1270, 1670);

                ctx.fillText(today.getFullYear() + 1, 1530, 1670);
                ctx.fillText(today.getMonth() + 1, 1770, 1670);
                ctx.fillText(today.getDate(), 2000, 1670);
                ctx.fillText(today.getFullYear(), 400, 3256);
                ctx.fillText(today.getMonth() + 1, 620, 3256);
                ctx.fillText(today.getDate(), 800, 3256);
                ctx.fillText(today.getFullYear(), 1580, 3256);
                ctx.fillText(today.getMonth() + 1, 1820, 3256);
                ctx.fillText(today.getDate(), 2000, 3256);
                var image = canvas.toDataURL("image/png")
                image = Utils.dataURLtoBlob(image)
                image = URL.createObjectURL(image)
                if (download) {
                    resolve()
                    Utils.downloadSource(image, `${that.state.driver.name}承运合同.png`)
                } else {
                    resolve()
                    window.open(image)
                }
            }
            img.src = Utils.getInvoiceModel().contractTemplate
        })
    }

    render() {
        let that = this;
        const goodsTypeOptions = Dictionary.cargoType.map((opt, index) => {
            return (
                <Option key={index} obj={opt} value={opt.name}>{opt.name}</Option>
            )
        });

        const { driver, vehicle, orderPriceEntity, onEdit } = this.state;
        let editAbleStatus = this.state.editAbleStatus || {}
        const showAddressForm = (onEdit && (editAbleStatus.fromAddress || editAbleStatus.toAddress)) || !onEdit
        const fromAddEditable = (onEdit && editAbleStatus.fromAddress) || !onEdit
        const toAddEditable = (onEdit && editAbleStatus.toAddress) || !onEdit
        const cargoEditable = true
        const departTimeEditable = (onEdit && editAbleStatus.expArriveTime) || !onEdit
        const hasAgentFee = this.state.agentPriceName && this.state.agentPriceName > 0
        const hasOilFee = (orderPriceEntity.prepayOil && orderPriceEntity.prepayOil > 0) ||
            (orderPriceEntity.restPayOil && orderPriceEntity.restPayOil > 0) ||
            (orderPriceEntity.receiptPayOil && orderPriceEntity.receiptPayOil > 0)

        return (
            <div className="neworder">
                <div className="content left">
                    <div className="order-scroll" ref="newOrderForm">
                        <Form className="ant-advanced-search-form" onSubmit={this.handleSearch}>
                            {this.state.fromAddresses.map((address, index) => {
                                return (
                                    <Row gutter={24} key={index}>
                                        <Col className="header" span={24}>
                                            {index === 0 ? <span className="title">装货地</span> : null}
                                            {/* <span className="info"></span> */}
                                            {(index == 0 && fromAddEditable && that.state.fromAddresses.length == 1) ?
                                                <span onClick={() => that.addAddress.bind(that, 'fromAddresses')()}
                                                    className="ctrl click-th-main">+ 添加装货地</span> : ''}
                                            {(index == 1 && fromAddEditable) ?
                                                <span onClick={() => that.removeAddress.bind(that, 'fromAddresses')()}
                                                    className="ctrl click-th-main blue">- 删除装货地</span> : ''}
                                        </Col>
                                        <Col span={24} style={{ display: 'block' }}>
                                            <Form.Item className="form-item-address" label={`详细地址`}
                                                required={true}
                                                validateStatus={that.validateMap['fromAddresses'][index]['address'] || 'success'}>
                                                <div style={{ position: 'relative' }}>
                                                    <Selector
                                                        id={`${that.pid}-fromAddresses-${index}-address`}
                                                        className="place-search"
                                                        placeholder="先选择省、市，再选择详细地址"
                                                        disabled={!fromAddEditable}
                                                        onSelect={(info) => {
                                                            let pos = Utils.bd_encrypt(info.longitude, info.latitude);
                                                            address.latitude = pos.lat;
                                                            address.longitude = pos.lng;
                                                            address.address = info.address;
                                                            address.province = info.provinceName;
                                                            address.provinceCode = cityCodeMap[info.provinceName];
                                                            address.city = info.cityName;
                                                            address.cityCode = cityCodeMap[info.cityName];
                                                            address.formatAddress = info.formatAddress
                                                            that.validateMap['fromAddresses'][index]['address'] = ''
                                                            that.refreshForm()
                                                        }}
                                                        value={address.formatAddress || ((address.province || '') + (address.city || '') + (address.address || ''))}
                                                    />
                                                    {fromAddEditable ? <i className="iconfont icon-didian-copy"
                                                        style={{
                                                            cursor: 'pointer',
                                                            position: 'absolute',
                                                            right: '6px',
                                                            color: 'rgb(0, 153, 255)'
                                                        }}
                                                        onClick={that.showMap.bind(that, address)}></i> : null}
                                                </div>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12} style={{ display: 'block' }}>
                                            <Form.Item label={`装货人`}>
                                                <Input type="text"
                                                    maxLength={8}
                                                    placeholder="装货人姓名"
                                                    value={address.contactName}
                                                    readOnly={!fromAddEditable}
                                                    onChange={(e) => {
                                                        address.contactName = e.target.value;
                                                        that.refreshForm()
                                                    }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12} style={{ display: 'block' }}>
                                            <Form.Item label={`联系电话`}
                                                help={that.validateMap['fromAddresses'][index]['contactPhone'] ? <span className="form-help">请输入正确的联系电话</span> : null}
                                                validateStatus={that.validateMap['fromAddresses'][index]['contactPhone'] || 'success'}>
                                                <Input maxLength={11}
                                                    id={`${that.pid}-fromAddresses-${index}-contactPhone`}
                                                    readOnly={!fromAddEditable}
                                                    placeholder="装货人联系电话"
                                                    value={address.contactPhone}
                                                    onChange={(e) => {
                                                        address.contactPhone = e.target.value.toNum();
                                                        that.validateMap['fromAddresses'][index]['contactPhone'] = (address.contactPhone && Utils.PHONE_REG.test(address.contactPhone)) ? '' : 'error'
                                                        that.refreshForm()
                                                    }}
                                                    type="text" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                )
                            })}
                            <Divider dashed />
                            {this.state.toAddresses.map((address, index) => {
                                return (
                                    <Row gutter={24} key={index}>
                                        <Col className="header" span={24}>
                                            {index === 0 ? <span className="title">卸货地</span> : null}
                                            {/* <span className="info"></span> */}
                                            {(index == 0 && toAddEditable && that.state.toAddresses.length == 1) ?
                                                <span onClick={() => that.addAddress.bind(that, 'toAddresses')()}
                                                    className="ctrl click-th-main">+ 添加卸货地</span> : ''}
                                            {(index == 1 && toAddEditable) ?
                                                <span onClick={() => that.removeAddress.bind(that, 'toAddresses')()}
                                                    className="ctrl click-th-main blue">- 删除卸货地</span> : ''}
                                        </Col>
                                        <Col span={24} style={{ display: 'block' }}>
                                            <Form.Item className="form-item-address" label={`详细地址`}
                                                required={true}
                                                validateStatus={that.validateMap['toAddresses'][index]['address'] || 'success'}>
                                                <div style={{ position: 'relative' }}>
                                                    <Selector
                                                        id={`${that.pid}-toAddresses-${index}-address`}
                                                        className="place-search"
                                                        placeholder="先选择省、市，再选择详细地址"
                                                        disabled={!toAddEditable}
                                                        onSelect={(info) => {
                                                            let pos = Utils.bd_encrypt(info.longitude, info.latitude);
                                                            address.latitude = pos.lat;
                                                            address.longitude = pos.lng;
                                                            address.address = info.address;
                                                            address.province = info.provinceName;
                                                            address.provinceCode = cityCodeMap[info.provinceName];
                                                            address.city = info.cityName;
                                                            address.cityCode = cityCodeMap[info.cityName];
                                                            address.formatAddress = info.formatAddress
                                                            that.validateMap['toAddresses'][index]['address'] = ''
                                                            that.refreshForm()
                                                        }}
                                                        value={address.formatAddress || ((address.province || '') + (address.city || '') + (address.address || ''))}
                                                    />
                                                    {toAddEditable ? <i className="iconfont icon-didian-copy"
                                                        style={{
                                                            cursor: 'pointer',
                                                            position: 'absolute',
                                                            right: '6px',
                                                            color: 'rgb(0, 153, 255)'
                                                        }}
                                                        onClick={that.showMap.bind(that, address)}></i> : null}
                                                </div>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12} style={{ display: 'block' }}>
                                            <Form.Item label={`联系人`}
                                                validateStatus={that.validateMap['toAddresses'][index]['contactName'] || 'success'}
                                                required={true}>
                                                <Input type="text"
                                                    id={`${this.pid}-toAddresses-${index}-contactName`}
                                                    maxLength={8}
                                                    placeholder="联系人姓名"
                                                    value={address.contactName}
                                                    readOnly={!toAddEditable}
                                                    onChange={(e) => {
                                                        address.contactName = e.target.value;
                                                        that.validateMap['toAddresses'][index]['contactName'] = ''
                                                        that.refreshForm()
                                                    }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12} style={{ display: 'block' }}>
                                            <Form.Item label={`联系电话`}
                                                required={true}
                                                validateStatus={that.validateMap['toAddresses'][index]['contactPhone'] || 'success'}
                                                help={that.validateMap['toAddresses'][index]['contactPhone'] ? <span className="form-help">请输入正确的联系电话</span> : null}>
                                                <Input maxLength={11}
                                                    id={`${that.pid}-toAddresses-${index}-contactPhone`}
                                                    readOnly={!toAddEditable}
                                                    placeholder="联系电话"
                                                    value={address.contactPhone}
                                                    onChange={(e) => {
                                                        address.contactPhone = e.target.value.toNum();
                                                        that.validateMap['toAddresses'][index]['contactPhone'] = Utils.PHONE_REG.test(address.contactPhone) ? '' : 'error'
                                                        that.refreshForm()
                                                    }}
                                                    type="text" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                )
                            })}
                            <Divider dashed />
                            {this.state.orderCargoEntities.map((goods, index) => {
                                return (
                                    <Row gutter={24} key={index}>
                                        <Col className="header" span={24}>
                                            <span className="title">货物信息</span>
                                        </Col>
                                        <Col span={12} style={{ display: 'block' }}>
                                            <Form.Item label={`货物名称`}
                                                required={true}
                                                validateStatus={this.validateMap['cargo'][index]['cargoName'] || 'success'}>
                                                <Input maxLength={20}
                                                    id={`${that.pid}-cargo-${index}-cargoName`}
                                                    readOnly={!cargoEditable}
                                                    placeholder="货物名称"
                                                    type="text"
                                                    value={goods.cargoName}
                                                    onChange={(e) => {
                                                        goods.cargoName = e.target.value;
                                                        that.validateMap['cargo'][index]['cargoName'] = ''
                                                        that.refreshForm()
                                                    }} />
                                            </Form.Item>
                                        </Col>

                                        <Col span={12} style={{ display: 'block' }}>
                                            <Form.Item label={`货物类型`}
                                                required={true}
                                                validateStatus={this.validateMap['cargo'][index]['cargoType'] || 'success'}>
                                                <Select placeholder="货物类型"
                                                    id={`${that.pid}-cargo-${index}-cargoType`}
                                                    disabled={!cargoEditable}
                                                    value={goods.cargoTypeName}
                                                    onChange={(type, e) => {
                                                        goods.cargoType = e.props.obj.id;
                                                        goods.cargoTypeName = e.props.obj.name;
                                                        that.validateMap['cargo'][index]['cargoType'] = ''
                                                        that.refreshForm()
                                                    }}
                                                    style={{ width: '100%' }}>
                                                    {goodsTypeOptions}
                                                </Select>
                                            </Form.Item>
                                        </Col>

                                        <Col span={12} style={{ display: 'block' }}>
                                            <Form.Item label={`货物重量`}
                                                required={true}
                                                validateStatus={this.validateMap['cargo'][index]['cargoWeight'] || 'success'}>
                                                <Input placeholder="货物重量"
                                                    id={`${that.pid}-cargo-${index}-cargoWeight`}
                                                    readOnly={!cargoEditable}
                                                    type="text"
                                                    maxLength={8}
                                                    suffix={'吨'}
                                                    value={goods.cargoWeight}
                                                    onChange={(e) => {
                                                        goods.cargoWeight = e.target.value.toDecimal2();
                                                        that.validateMap['cargo'][index]['cargoWeight'] = ''
                                                        that.refreshForm()
                                                    }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12} style={{ display: 'block' }}>
                                            <Form.Item label={`货物体积`}>
                                                <Input placeholder="货物体积"
                                                    readOnly={!cargoEditable}
                                                    type="text"
                                                    maxLength={8}
                                                    suffix={'方'}
                                                    value={goods.cargoVolumn}
                                                    onChange={(e) => {
                                                        goods.cargoVolumn = e.target.value.toNum();
                                                        that.refreshForm()
                                                    }} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                )
                            })}
                            <Row gutter={24}>
                                <Col span={12} style={{ display: 'block' }}>
                                    <Form.Item label={`备注`}>
                                        <TextArea
                                            placeholder="输入0-100字符"
                                            maxLength={100}
                                            value={this.state.remark}
                                            onChange={(e) => {
                                                this.state.remark = e.target.value;
                                                this.refreshForm()
                                            }}
                                            autosize />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Divider dashed />
                            <Row gutter={24}>
                                <Col className="header" span={24}>
                                    <span className="title">装卸时间</span>
                                    <span className="info"><Icon type="info-circle" />期望发车时间、期望到达时间，请务必提供准确时间，我们会按照您提供的时间进行司机位置信息获取</span>
                                </Col>
                                <Col span={12} style={{ display: 'block' }}>
                                    <Form.Item label={`期望发车时间`}
                                        required={true}
                                        validateStatus={this.validateMap['expDepartTime'] || 'success'}>
                                        <DatePicker placeholder="期望发车时间"
                                            showTime={{ format: 'HH:mm' }}
                                            id={`${that.pid}-expDepartTime`}
                                            disabled={!departTimeEditable}
                                            format="YYYY-MM-DD HH:mm"
                                            value={this.state.expDepart}
                                            disabledDate={this.disabledStart.bind(this)}
                                            style={{ border: 'none', width: '100%' }}
                                            onChange={(moment) => {
                                                that.storage.startMoment = moment
                                                that.validateMap['expDepartTime'] = ''
                                                if (that.state.expArriveTime && moment && (moment.valueOf() >= (new Date(this.state.expArriveTime).getTime()))) {
                                                    that.validateMap['expArriveTime'] = 'error'
                                                }
                                                that.setState({
                                                    expDepartTime: moment ? moment.format('YYYY-MM-DD HH:mm') : null,
                                                    expDepart: moment
                                                })
                                            }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12} style={{ display: 'block' }}>
                                    <Form.Item label={`期望到达时间`}
                                        required={true}
                                        validateStatus={this.validateMap['expArriveTime'] || 'success'}>
                                        <DatePicker placeholder="期望到达时间"
                                            showTime={{ format: 'HH:mm' }}
                                            id={`${that.pid}-expArriveTime`}
                                            disabled={!departTimeEditable}
                                            format="YYYY-MM-DD HH:mm"
                                            value={that.state.expArrive}
                                            disabledDate={that.disabledEnd.bind(that)}
                                            style={{ border: 'none', width: '100%' }}
                                            onChange={(moment) => {
                                                that.storage.endMoment = moment
                                                that.validateMap['expArriveTime'] = ''
                                                if (that.state.expDepartTime && moment && (moment.valueOf() <= (new Date(this.state.expDepartTime).getTime()))) {
                                                    that.validateMap['expArriveTime'] = 'error'
                                                }
                                                that.setState({
                                                    expArriveTime: moment ? moment.format('YYYY-MM-DD HH:mm') : null,
                                                    expArrive: moment
                                                })
                                            }} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Divider dashed />

                            <Row gutter={24}>
                                <Col className="header" span={24}>
                                    <span className="title">运费信息</span>
                                    <span className="info"><Icon type="info-circle" />预付款不能作为唯一支付款项</span>
                                </Col>
                                <Col span={12} style={{ display: 'block' }}>
                                    <Form.Item label={`预付款现金`}
                                        help={that.validateMap['orderPrice'] ? <span className="form-help">预付款不能作为唯一支付款项</span> : null}
                                        validateStatus={this.validateMap['orderPrice'] || 'success'}>
                                        <Input maxLength={8}
                                            id={`${that.pid}-orderPrice`}
                                            placeholder="输入金额"
                                            suffix={'元'}
                                            disabled={orderPriceEntity.prepayCashStatus == 1 || orderPriceEntity.prepayCashStatus == 2}
                                            value={orderPriceEntity.prepayCash}
                                            onChange={(e) => {
                                                orderPriceEntity.prepayCash = e.target.value.toDecimal2();
                                                that.refreshForm()
                                            }}
                                            type="text" />
                                    </Form.Item>
                                </Col>
                                <Col span={12} style={{ display: 'block' }}>
                                    <Form.Item label={`预付款油卡`}>
                                        <Input maxLength={8}
                                            placeholder="输入金额"
                                            suffix={'元'}
                                            value={orderPriceEntity.prepayOil}
                                            disabled={orderPriceEntity.prepayOilStatus == 1 || orderPriceEntity.prepayOilStatus == 2}
                                            onChange={(e) => {
                                                orderPriceEntity.prepayOil = e.target.value.toDecimal2();
                                                that.refreshForm()
                                            }}
                                            type="text" />
                                    </Form.Item>
                                </Col>
                                <Col span={12} style={{ display: 'block' }}>
                                    <Form.Item label={`尾款现金`}
                                        validateStatus={this.validateMap['orderPrice'] || 'success'}>
                                        <Input maxLength={8}
                                            placeholder="输入金额"
                                            suffix={'元'}
                                            disabled={orderPriceEntity.restPayCashStatus == 1 || orderPriceEntity.restPayCashStatus == 2}
                                            value={orderPriceEntity.restPayCash}
                                            onChange={(e) => {
                                                orderPriceEntity.restPayCash = e.target.value.toDecimal2();
                                                that.validateMap['orderPrice'] = ''
                                                that.refreshForm()
                                            }}
                                            type="text" />
                                    </Form.Item>
                                </Col>
                                <Col span={12} style={{ display: 'block' }}>
                                    <Form.Item label={`尾款油卡`}>
                                        <Input maxLength={8}
                                            placeholder="输入金额"
                                            suffix={'元'}
                                            disabled={orderPriceEntity.restPayOilStatus == 1 || orderPriceEntity.restPayOilStatus == 2}
                                            value={orderPriceEntity.restPayOil}
                                            onChange={(e) => {
                                                orderPriceEntity.restPayOil = e.target.value.toDecimal2();
                                                that.validateMap['orderPrice'] = ''
                                                that.refreshForm()
                                            }}
                                            type="text" />
                                    </Form.Item>
                                </Col>

                                <Col span={12} style={{ display: 'block' }}>
                                    <Form.Item label={`回单款现金`}
                                        validateStatus={this.validateMap['orderPrice'] || 'success'}>
                                        <Input maxLength={8}
                                            placeholder="输入金额"
                                            suffix={'元'}
                                            disabled={orderPriceEntity.receiptPayCashStatus == 1 || orderPriceEntity.receiptPayCashStatus == 2}
                                            value={orderPriceEntity.receiptPayCash}
                                            onChange={(e) => {
                                                orderPriceEntity.receiptPayCash = e.target.value.toDecimal2();
                                                that.validateMap['orderPrice'] = ''
                                                that.refreshForm()
                                            }}
                                            type="text" />
                                    </Form.Item>
                                </Col>
                                <Col span={12} style={{ display: 'block' }}>
                                    <Form.Item label={`回单款油卡`}>
                                        <Input maxLength={8}
                                            placeholder="输入金额"
                                            suffix={'元'}
                                            disabled={orderPriceEntity.receiptPayOilStatus == 1 || orderPriceEntity.receiptPayOilStatus == 2}
                                            value={orderPriceEntity.receiptPayOil}
                                            onChange={(e) => {
                                                orderPriceEntity.receiptPayOil = e.target.value.toDecimal2();
                                                that.validateMap['orderPrice'] = ''
                                                that.refreshForm()
                                            }}
                                            type="text" />
                                    </Form.Item>
                                </Col>
                                <Col span={12} style={{ display: 'block' }}>
                                    <Form.Item label={`中介费`}>
                                        <Input maxLength={8}
                                            placeholder="输入金额"
                                            suffix={'元'}
                                            disabled={orderPriceEntity.agentPriceCashStatus == 1 || orderPriceEntity.agentPriceCashStatus == 2}
                                            value={this.state.agentPriceName}
                                            onChange={(e) => {
                                                this.state.agentPriceName = e.target.value.toDecimal2()
                                                if (!this.state.agentPriceName || this.state.agentPriceName == 0) {
                                                    this.state.payeeId = null
                                                    this.state.payee = {}
                                                } else if (driver.idCardNum != this.state.payee.idCardNo) {
                                                    this.state.askDriverPayeeId = null
                                                    this.state.carrierFeePayee = {}
                                                }
                                                that.refreshForm()
                                            }} />
                                    </Form.Item>
                                </Col>
                                {hasOilFee ? <Col span={12} style={{ display: 'block' }}>
                                    <Form.Item label={`油卡卡号`}
                                        required={true}
                                        validateStatus={this.validateMap['oilCardNo'] || 'success'}>
                                        <FSelect search={(keywords) => this.selectSearchFun('选择油卡', keywords)}
                                            placeholder={'选择油卡卡号'}
                                            id={`${that.pid}-oilCardNo`}
                                            keyField={'ucId'}
                                            value={this.state.oilCardNo}
                                            onSelected={(card) => {
                                                that.validateMap['oilCardNo'] = ''
                                                this.setState({
                                                    oilCardNo: card.cardNumber
                                                })
                                            }}
                                            option={(data) => {
                                                return <div style={{ fontSize: '12px' }}>{data.cardNumber}</div>
                                            }} />
                                    </Form.Item>
                                </Col> : null}
                            </Row>
                            <Divider dashed />

                            <Row gutter={24}>
                                <Col className="header" span={24}>
                                    <span className="title">承运信息</span>
                                </Col>
                                <Col span={12} style={{ display: 'block' }}>
                                    <Form.Item label={`承运司机`}>
                                        <FSelect search={(keywords) => this.selectSearchFun('指派司机', keywords)}
                                            style={{ width: 'calc(100% - 56px)', marginRight: '10px' }}
                                            keyField={'driverPhone'}
                                            dropdownClassName="order-fetch-select"
                                            disabled={this.state.orderPayStatus&&this.state.orderPayStatus!=0}
                                            initOption={driver.phone ? {
                                                driverAuthStatus: driver.driverAuthStatus,
                                                driverName: driver.name,
                                                driverPhone: driver.phone,
                                                driverIdCardNo: driver.idCardNum
                                            } : null}
                                            value={driver.phone || ''}
                                            onSelected={(driver) => {
                                                this.state.contractUrl = null
                                                this.state.contractStatus = null
                                                if (driver.orderContractEntity) {
                                                    this.state.contractUrl = driver.orderContractEntity.contractUrl
                                                    this.state.contractStatus = driver.orderContractEntity.status
                                                }
                                                this.setState({
                                                    driver: {
                                                        phone: driver.driverPhone,
                                                        name: driver.driverName,
                                                        idCardNum: driver.driverIdCardNo,
                                                        driverAuthStatus: driver.driverAuthStatus
                                                    },
                                                    askDriverPayeeId: null,
                                                    payeeId: null,
                                                    driverPayeeList: driver.payeeInfoEntityList
                                                })
                                            }}
                                            option={(data) => {
                                                return <div style={{ fontSize: '12px' }}>
                                                    <span style={{ display: 'inline-block', width: '46px', marginRight: '6px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', float: 'left' }}>{data.driverName}</span>
                                                    <span style={{ display: 'inline-block', width: '100px', marginRight: '6px' }}>{data.driverPhone}</span>
                                                    <span style={{ display: 'inline-block', marginRight: '6px' }}>{(() => {
                                                        switch (data.driverAuthStatus) {
                                                            case 0:
                                                                return '未认证';
                                                            case 1:
                                                                return '已认证';
                                                            case 2:
                                                                return '认证中';
                                                            case 3:
                                                                return '认证失败';
                                                        }
                                                    })()}</span>
                                                </div>
                                            }} />
                                        <Button
                                            style={{ padding: '0 8px', height: '28px', fontSize: '12px', lineHeight: '28px' }}
                                            onClick={() => {
                                                Events.emit('addTab', {
                                                    moduleText: '司机管理',
                                                    module: '司机管理'
                                                }, {
                                                        event: '司机详情Open'
                                                    })
                                            }}>新增</Button>
                                    </Form.Item>
                                </Col>
                                <Col span={12} style={{ display: 'block' }}>
                                    <Form.Item label={`承运车辆`}>
                                        <FSelect search={(keywords) => this.selectSearchFun('指派车辆', keywords)}
                                            style={{ width: 'calc(100% - 56px)', marginRight: '10px' }}
                                            keyField={'id'}
                                            dropdownClassName="order-fetch-select"
                                            initOption={vehicle.id ? vehicle : null}
                                            value={(vehicle.id || '') + ''}
                                            onSelected={(vehicle) => {
                                                this.setState({
                                                    vehicle
                                                })
                                            }}
                                            option={(data) => {
                                                return <div style={{ fontSize: '12px' }}>
                                                    <span style={{ display: 'inline-block', width: '60px', marginRight: '6px' }}>{data.vehicleNo}</span>
                                                    <span style={{ display: 'inline-block', width: '40px', marginRight: '6px' }}>{data.vehiclePlateColor}</span>
                                                    <span style={{ display: 'inline-block', marginRight: '6px' }}>{(() => {
                                                        switch (data.vehicleAuthStatus) {
                                                            case 0:
                                                                return '未认证';
                                                            case 1:
                                                                return '已认证';
                                                            case 2:
                                                                return '认证中';
                                                            case 3:
                                                                return '认证失败';
                                                        }
                                                    })()}</span>
                                                </div>
                                            }} />
                                        <Button
                                            style={{ padding: '0 8px', height: '28px', fontSize: '12px', lineHeight: '28px' }}
                                            onClick={() => {
                                                Events.emit('addTab', {
                                                    moduleText: '车辆管理',
                                                    module: '车辆管理'
                                                }, {
                                                        event:
                                                            '车辆详情Open'
                                                    })
                                            }}>新增</Button>
                                    </Form.Item>
                                </Col>
                                <Col span={11} style={{ display: 'block' }}>
                                    <Form.Item label={`收款人`}>
                                        <FSelect search={(keywords) => this.selectSearchFun('选择收款人', keywords)}
                                            style={{ width: 'calc(100% - 56px)', marginRight: '10px' }}
                                            keyField={'id'}
                                            disabled={this.state.orderPayStatus&&this.state.orderPayStatus!=0}
                                            dropdownClassName="order-fetch-select"
                                            initOption={this.state.carrierFeePayee || null}
                                            initData={this.state.driverPayeeList && this.state.driverPayeeList.length > 0 ? this.state.driverPayeeList : null}
                                            value={(this.state.askDriverPayeeId || '') + ''}
                                            onSelected={(payee) => {
                                                that.setState({
                                                    carrierFeePayee: payee,
                                                    askDriverPayeeId: payee.id,
                                                })
                                            }}
                                            optionDisabled={(data) => {
                                                if (hasAgentFee) {
                                                    return !(data.idCardNo && driver.idCardNum && data.idCardNo == driver.idCardNum)
                                                } else {
                                                    return false
                                                }
                                            }}
                                            option={(data) => {
                                                return <div style={{ fontSize: '12px' }}>
                                                    <span style={{ display: 'inline-block', width: '46px', marginRight: '6px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', float: 'left' }}>{data.name}</span>
                                                    <span style={{ display: 'inline-block' }}>{data.bankAccountNo}</span>
                                                </div>
                                            }} />
                                        <Button
                                            style={{ padding: '0 8px', height: '28px', fontSize: '12px', lineHeight: '28px' }}
                                            onClick={() => {
                                                Events.emit('addTab', {
                                                    moduleText: '收款人管理',
                                                    module: '收款人管理'
                                                }, {
                                                        event: '收款人管理Open',
                                                    })
                                            }}>新增</Button>
                                    </Form.Item>
                                </Col>

                                {hasAgentFee ? <Col span={12} style={{ display: 'block' }}>
                                    <Form.Item label={`中介费收款人`}>
                                        <FSelect search={(keywords) => this.selectSearchFun('选择收款人', keywords)}
                                            style={{ width: 'calc(100% - 56px)', marginRight: '10px' }}
                                            keyField={'id'}
                                            disabled={this.state.orderPayStatus&&this.state.orderPayStatus!=0}
                                            dropdownClassName="order-fetch-select"
                                            initOption={this.state.payee || null}
                                            initData={this.state.driverPayeeList && this.state.driverPayeeList.length > 0 ? this.state.driverPayeeList : null}
                                            value={(this.state.payeeId || '') + ''}
                                            onSelected={(payee) => {
                                                that.setState({
                                                    payee: payee,
                                                    payeeId: payee.id
                                                })
                                            }}
                                            optionDisabled={(data) => {
                                                if (hasAgentFee) {
                                                    return (data.idCardNo && driver.idCardNum && data.idCardNo == driver.idCardNum)
                                                } else {
                                                    return false
                                                }
                                            }}
                                            option={(data) => {
                                                return <div style={{ fontSize: '12px' }}>
                                                    <span style={{ display: 'inline-block', width: '46px', marginRight: '6px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', float: 'left' }}>{data.name}</span>
                                                    <span style={{ display: 'inline-block' }}>{data.bankAccountNo}</span>
                                                </div>
                                            }} />
                                        <Button
                                            style={{ padding: '0 8px', height: '28px', fontSize: '12px', lineHeight: '28px' }}
                                            onClick={() => {
                                                Events.emit('addTab', {
                                                    moduleText: '收款人管理',
                                                    module: '收款人管理'
                                                }, {
                                                        event: '收款人管理Open',
                                                    })
                                            }}>新增</Button>
                                    </Form.Item>
                                </Col> : null}
                                {this.state.contractStatus != 1 && this.state.driver.phone ?
                                    <Col span={13} style={{ display: 'block' }}>
                                        <Form.Item label={`上传运输合同`}>
                                            <Upload {...this.uploadProps} disabled={!driver.phone}
                                            accept=".jpg,.png,.jpeg"
                                            >
                                                <Button className="btn-upload">
                                                    <i className="iconfont icon-upload-model"
                                                        style={{
                                                            marginRight: '8px',
                                                            fontSize: '14px',
                                                        }} ></i>
                                                    <span>{this.state.contractUrl ? '重新上传' : '上传合同'}</span>
                                                </Button>
                                            </Upload>
                                            {this.state.contractUrl && this.state.contractStatus != 3 ?
                                                <span className="click-th-main contract"
                                                    onClick={() => { window.open(this.state.contractUrl) }} >
                                                    <i className="iconfont icon-protocol"></i>
                                                    <span>查看运输合同</span>
                                                </span> : null}
                                            <span className="click-th-main contract"
                                                onClick={() => {
                                                    if (this.state.driver.driverAuthStatus !== 1) {
                                                        OrderUtils.downLoadContractTemplate()
                                                    } else {
                                                        let modal = Utils.modal({
                                                            title: '请选择需要下载的合同模板',
                                                            content: <div style={{ fontSize: '13px' }}>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <span style={{ float: 'left' }}><i style={{ fontSize: '13px', color: '#ff7800' }} className="iconfont icon-dot"></i>合同模板</span>
                                                                    <span className="click-th-main" style={{ marginRight: '24px' }} onClick={() => {
                                                                        window.open(Utils.getInvoiceModel().contractTemplate)
                                                                    }}>预览</span>
                                                                    <span className="click-th-main" onClick={OrderUtils.downLoadContractTemplate}><i style={{ fontSize: '12px' }} className="iconfont icon-hetongxiazaixin-"></i>下载</span>
                                                                </div>
                                                                <div style={{ textAlign: 'right', marginTop: '12px' }}>
                                                                    <span style={{ float: 'left' }}><i style={{ fontSize: '13px', color: '#ff7800' }} className="iconfont icon-dot"></i>司机{this.state.driver.name}专用合同</span>
                                                                    <span className="click-th-main" style={{ marginRight: '24px' }} onClick={() => { this.generateDriverContact() }}>预览</span>
                                                                    <span className="click-th-main" onClick={() => { this.generateDriverContact(true); modal.destroy() }}><i style={{ fontSize: '12px' }} className="iconfont icon-hetongxiazaixin-"></i>下载</span>
                                                                </div>
                                                            </div>,
                                                            noBtn: true,
                                                            width: 380,
                                                        })
                                                    }
                                                }} >
                                                <i className="iconfont icon-hetongxiazaixin-"></i>
                                                <span>下载合同模板</span>
                                            </span>
                                        </Form.Item>
                                    </Col>
                                    : null}
                            </Row>
                            <Divider dashed />

                            <Row gutter={24}>
                                <Col className="header" span={24}>
                                    <span className="title">其它信息</span>
                                </Col>

                                <Col span={this.state.needReceipt ? 24 : 12} style={{ display: 'block' }}>
                                    <Form.Item label={`是否需要回单`}>
                                        <Radio.Group onChange={(e) => {
                                            this.setState({
                                                needReceipt: e.target.value
                                            })
                                        }} defaultValue={0} value={this.state.needReceipt}>
                                            <Radio value={1}>是</Radio>
                                            <Radio value={0}>否</Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>
                                {this.state.needReceipt ? <Col span={12} style={{ display: 'block' }}>
                                    <Form.Item label={`收件人`}>
                                        <Input placeholder="收件人姓名"
                                            type="text"
                                            readOnly={!this.state.needReceipt}
                                            maxLength={20}
                                            value={this.state.orderReceiptEntity.receiptName}
                                            onChange={(e) => {
                                                this.state.orderReceiptEntity.receiptName = e.target.value;
                                                this.refreshForm()
                                            }} />
                                    </Form.Item>
                                </Col> : null}
                                {this.state.needReceipt ? <Col span={12} style={{ display: 'block' }}>
                                    <Form.Item label={`联系电话`}
                                        help={that.validateMap['receiptPhone'] ? <span className="form-help">请输入正确的联系电话</span> : null}
                                        validateStatus={that.validateMap['receiptPhone'] || 'success'}>
                                        <Input placeholder="收件人联系电话"
                                            type="text"
                                            id={`${that.pid}-receiptPhone`}
                                            readOnly={!this.state.needReceipt} maxLength={11}
                                            value={this.state.orderReceiptEntity.receiptPhone}
                                            onChange={(e) => {
                                                this.state.orderReceiptEntity.receiptPhone = e.target.value.toNum();
                                                this.validateMap['receiptPhone'] = this.state.orderReceiptEntity.receiptPhone && Utils.PHONE_REG.test(this.state.orderReceiptEntity.receiptPhone) ? '' : 'error'
                                                this.refreshForm()
                                            }} />
                                    </Form.Item>
                                </Col> : null}
                                {this.state.needReceipt ? <Col span={24} style={{ display: 'block' }}>
                                    <Form.Item label={`邮寄地址`}
                                        required={true}
                                        validateStatus={that.validateMap['receiptAddress'] || 'success'}>
                                        <TextArea
                                            id={`${that.pid}-receiptAddress`}
                                            readOnly={!this.state.needReceipt}
                                            placeholder="回单邮寄地址"
                                            maxLength={50}
                                            value={this.state.orderReceiptEntity.receiptAddress}
                                            onChange={(e) => {
                                                this.state.orderReceiptEntity.receiptAddress = e.target.value;
                                                this.validateMap['receiptAddress'] = ''
                                                this.refreshForm()
                                            }}
                                            autosize
                                        />
                                    </Form.Item>
                                </Col> : null}
                                <Col span={12} style={{ display: 'block' }}>
                                    <Form.Item label={`是否需要发票`}>
                                        <Radio.Group onChange={(e) => {
                                            this.setState({
                                                needInvoice: e.target.value
                                            })
                                        }} defaultValue={0} value={this.state.needInvoice}>
                                            <Radio value={1}>是</Radio>
                                            <Radio value={0}>否</Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                    <div className="submit-panel">
                        <span className="price">总运费：<span className="amount">{new Number(this.getTotalPrice(0)).toLocaleString()}</span>元</span>
                        {this.state.needInvoice ? <span className="price">服务费：<span className="amount">{new Number(this.getTotalPrice()).toLocaleString()}</span>元</span> : null}
                        <div className="right">
                            {onEdit ? <Button className="common white"
                                onClick={this.props.cancel}>取消</Button> :
                                <Checkbox onChange={(e) => {
                                    this.copyOrder = e.target.checked
                                }}>再来一单</Checkbox>}
                            <Button className="common"
                                style={{ marginLeft: 24 }}
                                loading={this.state.saveLoading}
                                onClick={() => {
                                    this.copyOrder ? this.save(true) : this.save()
                                }}>{onEdit ? '保存' : '提交'}</Button>
                        </div>
                    </div>
                </div>
                <div className="content right">
                    <div className="address-container">
                        <div className="address">
                            <div className="title">
                                <span className="text"><i className="iconfont from icon-didian-copy"></i>常用装货地</span>
                                {that.state.fromAddressChosen && that.state.fromAddressChosen.length > 0 ?
                                    <span className="click-th-main" onClick={that.addRecent.bind(that, 'fromAddresses', this.state.fromAddresses[0].address && this.state.fromAddresses.length > 1 ? 1 : 0)}>查看更多 ></span>
                                    : <span className="click-th-main" onClick={
                                        () => {
                                            Events.emit('addTab', {
                                                moduleText: '常用联系人',
                                                module: '常用联系人'
                                            }, {
                                                    event: '常用联系人Open'
                                                })
                                        }
                                    }>新增 ></span>}
                            </div>
                            {that.state.fromAddressChosen && that.state.fromAddressChosen.length > 0 ? <div className="list">
                                {that.state.fromAddressChosen.map((address, idx) => {
                                    return <div className="item" key={idx} onClick={() => {
                                        let index = this.state.fromAddresses.length > 1 ? 1 : 0
                                        that.state['fromAddresses'][index] = {
                                            contactName: address.contactName,
                                            contactPhone: address.contactPhone,
                                            latitude: address.latitude,
                                            longitude: address.longitude,
                                            province: address.province,
                                            provinceCode: address.provinceCode,
                                            city: address.city,
                                            cityCode: address.cityCode,
                                            address: address.address,
                                            formatAddress: (address.province || '') + (address.city || '') + (address.address || ''),
                                            id: address.id
                                        };
                                        that.refreshForm();
                                    }}>
                                        <span className="address">{address.provinceName || ''}{address.cityName || ''}{address.address}</span><span className="name">{address.contactName}</span>
                                    </div>
                                })}
                            </div> : <div className="empty">
                                    <div className="icon"><i className="icon-didian-copy iconfont"></i></div>
                                    <div className="desc">暂无常用地址信息</div>
                                </div>}

                        </div>
                        <div className="address">
                            <div className="title">
                                <span className="text"><i className="iconfont to icon-didian-copy"></i>常用卸货地</span>
                                {that.state.toAddressChosen && that.state.toAddressChosen.length > 0 ?
                                    <span className="click-th-main" onClick={that.addRecent.bind(that, 'toAddresses', this.state.toAddresses[0].address && this.state.toAddresses.length > 1 ? 1 : 0)}>查看更多 ></span>
                                    : <span className="click-th-main" onClick={() => {
                                        Events.emit('addTab', {
                                            moduleText: '常用联系人',
                                            module: '常用联系人'
                                        }, {
                                                event: '常用联系人Open'
                                            })
                                    }}>新增 ></span>}
                            </div>
                            {that.state.toAddressChosen && that.state.toAddressChosen.length > 0 ? <div className="list">
                                {that.state.toAddressChosen.map((address, idx) => {
                                    return <div className="item" key={idx} onClick={() => {
                                        let index = this.state.toAddresses.length > 1 ? 1 : 0
                                        that.state['toAddresses'][index] = {
                                            contactName: address.contactName,
                                            contactPhone: address.contactPhone,
                                            latitude: address.latitude,
                                            longitude: address.longitude,
                                            province: address.province,
                                            provinceCode: address.provinceCode,
                                            city: address.city,
                                            cityCode: address.cityCode,
                                            address: address.address,
                                            formatAddress: (address.province || '') + (address.city || '') + (address.address || ''),
                                            id: address.id
                                        };
                                        that.refreshForm();
                                    }}>
                                        <span className="address">{address.provinceName || ''}{address.cityName || ''}{address.address}</span><span className="name">{address.contactName}</span>
                                    </div>
                                })}
                            </div> : <div className="empty">
                                    <div className="icon"><i className="icon-didian-copy iconfont"></i></div>
                                    <div className="desc">暂无常用地址信息</div>
                                </div>}
                        </div>
                        <div className="address">
                            <div className="title">
                                <span className="text"><i className="iconfont icon-huowu"></i>常用货物信息</span>
                            </div>
                            {that.state.usuaCargo && that.state.usuaCargo.length > 0 ? <div className="list">
                                {that.state.usuaCargo.map(cargo => {
                                    return <div className="item" onClick={() => {
                                        that.state['orderCargoEntities'][0] = cargo;
                                        that.refreshForm();
                                    }}>
                                        <span className="cargo">{cargo.cargoName}</span>
                                        <span className="cargo">{cargo.cargoTypeName}</span>
                                        <span className="cargo">{cargo.cargoWeight}吨</span>
                                        <span className="cargo">{cargo.cargoVolumn}方</span>
                                    </div>
                                })}
                            </div> : <div className="empty">
                                    <div className="icon"><i className="icon-huowu iconfont"></i></div>
                                    <div className="desc">暂无常用货物信息</div>
                                </div>}
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
        return <Reload {...this.props} component={NewOrder} />
    }
}