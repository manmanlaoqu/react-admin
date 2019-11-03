import React from 'react'
import Layout from 'antd/lib/layout'
// const TabPane = Tabs.TabPane;
import { Checkbox, Select, DatePicker, Input, Upload, Radio, Tooltip } from 'antd'
import moment from 'moment'
import Button from '../../lib/button'
import Selector from '../../lib/address-search'
import ScrollContainer from '../index'
import FreshComponent from '../freshbind'
import Map from '../../lib/map/chose'
import CitySelector from '../../yg-lib/citySelectorVal'
import Reload from '../reload'
import ImageViewer from '../../lib/imageViewer'
import CImg from '../../lib/checkableImg'
import OrderUtils from '../../../lib/orderUtils'
import Enums from '../../../lib/enum'
import Utils from 'utils/utils'
import Events from 'gc-event/es5'
import Storage from 'gc-storage/es5'
import './index.scss';

const RadioGroup = Radio.Group;
const UserInfo = Storage.get('userInfo') || {}
const CompanyInfo = Storage.get('companyConfig') || {}
const Dictionary = Storage.get('dictionary') || {}
const { TextArea } = Input;
const Option = Select.Option;

let cityTree = Dictionary.location, cityMap = {};
cityTree.map((province) => {
    cityMap[province.code] = province.nodes;
})


class NewOrder extends FreshComponent {
    constructor(props) {
        super(props);
        this.invoiceRate = CompanyInfo.invoiceRate;
        this.storage = {}
        let that = this;
        this.init(this.props.order, this.props.onEdit);
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

    init(order, onEdit) {
        let that = this
        if (onEdit) {
            if (order) {
                this.storage.startMoment = moment(new Date(order.expDepartTime))
                this.storage.endMoment = moment(new Date(order.expArriveTime))
                order.expArrive = moment(new Date(order.expArriveTime))
                order.expDepart = moment(new Date(order.expDepartTime))
                this.state = {
                    ...order,
                    needInvoice: order.needInvoice ? true : false,
                    needReceipt: order.needReceipt ? true : false,
                    driverPayeeList: order.driverPayeeList || [],
                    onEdit: true
                }
            }
        } else {
            if (order) {
                this.state = {
                    fromAddresses: order.fromAddresses || [{}],
                    toAddresses: order.toAddresses || [{}],
                    orderCargoEntities: order.orderCargoEntities || [{}],
                    remark: order.remark,
                    orderPriceEntity: order.orderPriceEntity || {},
                    needReceipt: order.needReceipt ? true : false,
                    needInvoice: order.needInvoice ? true : false,
                    orderReceiptEntity: order.orderReceiptEntity || [{}],
                    agentPriceName: order.agentPriceName,
                    driver: {},
                    vehicle: {},
                    payee: {},
                    driverPayeeList: [],
                    carrierFeePayee: {}
                }
            } else {
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
                    needReceipt: false,
                    needInvoice: true,
                    orderReceiptEntity: {},
                    orderCargoEntities: [{}],
                    driverPayeeList: [],
                    carrierFeePayee: {}
                }
            }
        }
    }

    showMap(address) {
        if (!address.city || !address.cityCode) {
            return;
        }
        let that = this;
        let chosed = function (info) {
            let pos = Utils.bd_encrypt(info.location.lng, info.location.lat)
            address.latitude = pos.lat,
                address.longitude = pos.lng,
                address.address = info.address;
            modal.destroy();
            that.refreshForm();
            ;
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
    // disabledReach(current) {
    //     return current < moment().startOf('day');
    // }
    onStartChange(moment) {
        this.storage.startMoment = moment;
        this.setState({
            expDepartTime: moment ? moment.format('YYYY-MM-DD HH:mm') : null,
            expDepart: moment
        })
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

        if (oilPriceExist && !p.oilCardNo) {
            Utils.Message.error('请选择油卡！')
            return false;
        }

        p.orderPriceItem = orderPriceItems;
        delete p['orderPriceEntity']
        for (let k in p) {
            if (orderPropertyArray.indexOf(k) == -1) {
                delete p[k]
            }
        }

        if (!p.fromAddresses || p.fromAddresses.length == 0 || !p.toAddresses || p.toAddresses.length == 0) {
            Utils.Message.error('请完善装卸货地址信息！')
            return false;
        }
        for (let index in p.fromAddresses) {
            let address = p.fromAddresses[index]
            if (!address.address) {
                Utils.Message.error('请填写发货地地址！')
                return false;
            }
        }
        for (let index in p.toAddresses) {
            let address = p.toAddresses[index]
            if (!address.address) {
                Utils.Message.error('请填写卸货地地址！')
                return false;
            }
            if (!address.contactName) {
                Utils.Message.error('请填写收货人姓名！')
                return false;
            }
            if (!address.contactPhone || !Utils.PHONE_REG.test(address.contactPhone)) {
                Utils.Message.error('请填写正确的收货人手机号！')
                return false;
            }
        }
        if (!p.orderCargoEntities || p.orderCargoEntities.length == 0) {
            Utils.Message.error('请完善订单货物信息！')
            return false;
        }
        for (let index in p.orderCargoEntities) {
            let cargo = p.orderCargoEntities[index]
            if (!cargo.cargoName || !cargo.cargoTypeName || !cargo.cargoWeight) {
                Utils.Message.error('请完善订单货物信息！')
                return false;
            }
        }

        if (!p.expDepartTime || !p.expArriveTime) {
            Utils.Message.error(`请填写订单期望发车时间、期望到站时间`);
            return false;
        }

        if ((new Date(p.expArriveTime).getTime()) <= (new Date(p.expDepartTime).getTime())) {
            Utils.Message.error(`期望到达时间不能小于发车时间`);
            return false;
        }
        if (!p.orderPriceItem || p.orderPriceItem.length == 0) {
            Utils.Message.error(`请完善订单运费信息！`);
            return false;
        }

        if (prepayExist && !otherFeeExist) {
            Utils.Message.error(`预付款不能作为唯一款项！`);
            return false;
        }

        Utils.request({
            api: that.state.onEdit ? Utils.getApi('订单管理', '修改') : Utils.getApi('新建订单', '新建'),
            beforeRequest() {
                if (copy) {
                    that.setState({
                        saveLoadingC: true
                    })
                } else {
                    that.setState({
                        saveLoading: true
                    })
                }
            },
            afterRequest() {
                if (copy) {
                    that.setState({
                        saveLoadingC: false
                    })
                } else {
                    that.setState({
                        saveLoading: false
                    })
                }
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
            // if (!this.newParam.orderReceiptEntity) {
            //     Utils.Message.error(`请填写回单收件人信息!`);
            //     return false;
            // }
            // if (!this.newParam.orderReceiptEntity.contact || !this.newParam.orderReceiptEntity.contactPhone || !this.newParam.orderReceiptEntity.address) {
            //     Utils.Message.error(`请填写回单收件人信息!`);
            //     return false;
            // }
            if (this.newParam.orderReceiptEntity.contactPhone && !Utils.PHONE_REG.test(this.newParam.orderReceiptEntity.contactPhone)) {
                Utils.Message.error(`请正确填写回单收件人联系电话!`);
                return false;
            }
        }

        // if ((new Date(this.newParam.expArriveTime).getTime()) <= (new Date(this.newParam.expDepartTime).getTime())) {
        //     Utils.Message.error(`期望发车时间不能小于装货时间`);
        //     return false;
        // }

        if ((new Date(this.newParam.expArriveTime).getTime()) <= (new Date(this.newParam.expDepartTime).getTime())) {
            Utils.Message.error(`期望到达时间不能小于发车时间`);
            return false;
        }
        return true;
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

    render() {
        let that = this;
        const goodsTypeOptions = Dictionary.cargoType.map((opt, index) => {
            return (
                <Option key={index} obj={opt} value={opt.name}>{opt.name}</Option>
            )
        });

        let tFrom = { top: (that.state.fromAddresses.length == 1 && that.state.toAddresses.length > 1) ? '72px' : '0' };
        let tTo = { top: (that.state.fromAddresses.length > 1 && that.state.toAddresses.length == 1) ? '72px' : '0' };
        if (that.state.fromAddresses.length > 1) {
            tFrom.borderBottom = 'none'
        }
        if (that.state.toAddresses.length > 1) {
            tTo.borderBottom = 'none'
        }

        const { driver, vehicle, payee, carrierFeePayee, orderPriceEntity, onEdit } = this.state;
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
        const content = (
            <Layout style={{ background: '#f5f5f5' }}>
                <div style={{ margin: '12px' }}>
                    <div className="mod-form order-from" style={{ maxWidth: '1280px', margin: '0 auto' }}>
                        {/* 装卸地详情 */}
                        {!showAddressForm ?
                            < div className="order-info-address" style={{ height: (that.state.fromAddresses.length > 1 || that.state.toAddresses.length > 1) ? '290px' : '145px' }}>
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
                            </div> : null}
                        <div className="ant-table ant-table-default">
                            <div className="ant-table-content">
                                {showAddressForm ?
                                    this.state.fromAddresses.map((address, index) => {
                                        return (
                                            <div key={index} className="ant-table-body form-table order">
                                                <div className="group-head">
                                                    <span style={{ display: 'inline-block', width: '100px' }}>装货地{that.state.fromAddresses.length > 1 ? (index + 1) : ''}</span>
                                                    {fromAddEditable ?
                                                        <span className="item-latest"
                                                            onClick={that.addRecent.bind(that, 'fromAddresses', index)}>选择常用联系人</span> : null}
                                                    {(index == 0 && fromAddEditable && that.state.fromAddresses.length == 1) ?
                                                        <span onClick={() => that.addAddress.bind(that, 'fromAddresses')()}
                                                            className="item-contact-ctrl add">+添加装货地</span> : ''}
                                                    {(index == 1 && fromAddEditable) ?
                                                        <span onClick={() => that.removeAddress.bind(that, 'fromAddresses')()}
                                                            className="item-contact-ctrl remove">-删除装货地</span> : ''}
                                                </div>
                                                <table>
                                                    <tbody className="ant-table-tbody">
                                                        <tr className="ant-table-row">
                                                            <td className="head">
                                                                <span className="title">联系人</span>
                                                            </td>
                                                            <td className="column">
                                                                <input maxLength={8}
                                                                    placeholder="联系人"
                                                                    value={address.contactName}
                                                                    readOnly={!fromAddEditable}
                                                                    onChange={(e) => {
                                                                        address.contactName = e.target.value;
                                                                        that.refreshForm()
                                                                    }}
                                                                    type="text" />
                                                            </td>
                                                            <td className="head" rowspan={2} style={{borderBottom:'none'}}>
                                                                <span className="title"><span className="needed">*</span>装货地址</span>
                                                            </td>
                                                            <td className="column">
                                                                <CitySelector
                                                                    disabled={!fromAddEditable}
                                                                    province={{ name: address.province, code: address.provinceCode }}
                                                                    city={address.city ? { name: address.city, code: address.cityCode } : {}}
                                                                    onProvinceChange={(province) => {
                                                                        // console.log(province)
                                                                        address.province = province.name;
                                                                        address.provinceCode = province.code;
                                                                        address.city = null;
                                                                        address.cityCode = null;
                                                                        address.address = '';
                                                                        address.latitude = null;
                                                                        that.refreshForm()
                                                                    }}
                                                                    onCityChange={(city) => {
                                                                        address.city = city.name;
                                                                        address.cityCode = city.code;
                                                                        address.address = '';
                                                                        address.latitude = null;
                                                                        that.refreshForm()
                                                                    }}
                                                                    cityTree={cityTree} />
                                                            </td>
                                                        </tr>
                                                        <tr className="ant-table-row">
                                                            <td className="head">
                                                                <span className="title">联系电话</span>
                                                            </td>
                                                            <td className="column">
                                                                <input maxLength={11}
                                                                    readOnly={!fromAddEditable}
                                                                    placeholder="联系电话"
                                                                    value={address.contactPhone}
                                                                    onChange={(e) => {
                                                                        address.contactPhone = e.target.value.toNum();
                                                                        that.refreshForm()
                                                                    }}
                                                                    type="text" />
                                                            </td>
                                                            {/* <td className="head">
                                                                <span className="title"><span className="needed">*</span>详细地址</span>
                                                            </td> */}
                                                            <td className="column" style={{ position: 'relative' }}>
                                                                <div style={{ position: 'relative' }}>
                                                                    <Selector
                                                                        className="place-search"
                                                                        placeholder="先选择省、市，再选择详细地址"
                                                                        onSelect={(info) => {
                                                                            let pos = Utils.bd_encrypt(info.longitude, info.latitude);
                                                                            address.latitude = pos.lat;
                                                                            address.longitude = pos.lng;
                                                                            address.address = info.address || info.addressName;
                                                                        }}
                                                                        cityInfo={{
                                                                            city: {
                                                                                name: address.city
                                                                            }, province: {
                                                                                name: address.province
                                                                            }
                                                                        }}
                                                                        value={address.address}
                                                                        cityCode={address.cityCode ? (address.cityCode || '010') : '010'}
                                                                        disabled={!fromAddEditable || !address.city || !address.cityCode || !address.province || !address.provinceCode}
                                                                    />
                                                                    {fromAddEditable ? <i className="iconfont icon-didian-copy"
                                                                        style={{
                                                                            cursor: 'pointer',
                                                                            position: 'absolute',
                                                                            right: '6px',
                                                                            top: '6px',
                                                                            color: 'rgb(0, 153, 255)'
                                                                        }}
                                                                        onClick={that.showMap.bind(that, address)}></i> : null}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    }) : null
                                }

                                {showAddressForm ? this.state.toAddresses.map((address, index) => {
                                    address.sort = index
                                    return (
                                        <div key={index} className="ant-table-body form-table order">
                                            <div className="group-head">
                                                <span style={{ display: 'inline-block', width: '100px' }}>卸货地{that.state.toAddresses.length > 1 ? (index + 1) : ''}</span>
                                                {toAddEditable ?
                                                    <span className="item-latest" onClick={that.addRecent.bind(that, 'toAddresses', index)}>选择常用联系人</span> : null}
                                                {index == 0 && toAddEditable && that.state.toAddresses.length == 1 ?
                                                    <span onClick={() => that.addAddress.bind(that, 'toAddresses')()} className="item-contact-ctrl add">+添加卸货地</span> : ''}
                                                {index == 1 && toAddEditable ?
                                                    <span onClick={() => that.removeAddress.bind(that, 'toAddresses')()} className="item-contact-ctrl remove">-删除卸货地</span> : ''}
                                            </div>
                                            <table>
                                                <tbody className="ant-table-tbody">
                                                    <tr className="ant-table-row">
                                                        <td className="head">
                                                            <span className="title"><span className="needed">*</span>联系人</span>
                                                        </td>
                                                        <td className="column">
                                                            <input maxLength={8}
                                                                readOnly={!toAddEditable}
                                                                placeholder="联系人"
                                                                value={address.contactName}
                                                                onChange={(e) => {
                                                                    address.contactName = e.target.value;
                                                                    that.refreshForm()
                                                                }}
                                                                type="text" />
                                                        </td>
                                                        <td className="head" rowspan={2} style={{borderBottom:'none'}}>
                                                            <span className="title"><span className="needed">*</span>卸货地址</span>
                                                        </td>
                                                        <td className="column">
                                                            <CitySelector
                                                                disabled={!toAddEditable}
                                                                province={{ name: address.province, code: address.provinceCode }}
                                                                city={address.city ? { name: address.city, code: address.cityCode } : {}}
                                                                onProvinceChange={(province) => {
                                                                    address.province = province.name;
                                                                    address.provinceCode = province.code;
                                                                    address.city = null;
                                                                    address.cityCode = null;
                                                                    address.address = '';
                                                                    address.latitude = null;
                                                                    that.refreshForm()
                                                                }}
                                                                onCityChange={(city) => {
                                                                    address.city = city.name;
                                                                    address.cityCode = city.code;
                                                                    address.address = '';
                                                                    address.latitude = null;
                                                                    that.refreshForm()
                                                                }}
                                                                cityTree={cityTree} />
                                                        </td>
                                                    </tr>
                                                    <tr className="ant-table-row">
                                                        <td className="head">
                                                            <span className="title"><span className="needed">*</span>联系电话</span>
                                                        </td>
                                                        <td className="column">
                                                            <input maxLength={11}
                                                                readOnly={!toAddEditable}
                                                                placeholder="联系电话"
                                                                value={address.contactPhone}
                                                                onChange={(e) => {
                                                                    address.contactPhone = e.target.value.toNum();
                                                                    that.refreshForm()
                                                                }}
                                                                type="text" />
                                                        </td>
                                                        {/* <td className="head">
                                                            <span className="title"><span className="needed">*</span>详细地址</span>
                                                        </td> */}
                                                        <td className="column" style={{ position: 'relative' }}>
                                                            <div style={{ position: 'relative' }}>
                                                                <Selector
                                                                    className="place-search"
                                                                    placeholder="先选择城市再请选择详细地址"
                                                                    onSelect={(info) => {
                                                                        let pos = Utils.bd_encrypt(info.longitude, info.latitude);
                                                                        address.latitude = pos.lat;
                                                                        address.longitude = pos.lng;
                                                                        address.address = info.address || info.addressName;
                                                                    }}
                                                                    cityInfo={{
                                                                        city: {
                                                                            name: address.city
                                                                        }, province: {
                                                                            name: address.province
                                                                        }
                                                                    }}
                                                                    value={address.address}
                                                                    cityCode={address.cityCode ? (address.cityCode || '010') : '010'}
                                                                    disabled={!toAddEditable || !fromAddEditable || !address.city || !address.cityCode || !address.province || !address.provinceCode}
                                                                />
                                                                {toAddEditable ? <i className="iconfont icon-didian-copy"
                                                                    style={{
                                                                        cursor: 'pointer',
                                                                        position: 'absolute',
                                                                        right: '6px',
                                                                        top: '6px',
                                                                        color: 'rgb(0, 153, 255)'
                                                                    }}
                                                                    onClick={that.showMap.bind(that, address)}></i> : null}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                }) : null}

                                <div className="ant-table-body form-table order">
                                    <div className="group-head">
                                        <span>货物信息</span>
                                    </div>
                                    <table className="col-4">
                                        <tbody className="ant-table-tbody">
                                            <tr className="ant-table-row">
                                                <td className="line-title"><div className="start"><span className="needed">*</span>货物名称</div></td>
                                                <td className="line-title"><div className="start"><span className="needed">*</span>货物类型</div></td>
                                                <td className="line-title"><div className="start"><span className="needed">*</span>货物重量（吨）</div></td>
                                                <td className="line-title"><div className="start">货物体积（方）</div></td>
                                            </tr>
                                            {this.state.orderCargoEntities.map((goods, index) => {
                                                return (
                                                    <tr key={index} className="ant-table-row">
                                                        <td className="ant-table-row">
                                                            <input maxLength={20}
                                                                readOnly={!cargoEditable}
                                                                placeholder="货物名称"
                                                                type="text"
                                                                value={goods.cargoName}
                                                                onChange={(e) => {
                                                                    goods.cargoName = e.target.value;
                                                                    that.refreshForm()
                                                                }} />
                                                        </td>
                                                        <td className="ant-table-row">
                                                            <Select placeholder="货物类型"
                                                                disabled={!cargoEditable}
                                                                value={goods.cargoTypeName}
                                                                onChange={(type, e) => {
                                                                    goods.cargoType = e.props.obj.id;
                                                                    goods.cargoTypeName = e.props.obj.name;
                                                                    that.refreshForm()
                                                                }}
                                                                style={{ width: '100%' }}>
                                                                {goodsTypeOptions}
                                                            </Select>
                                                        </td>
                                                        <td className="ant-table-row">
                                                            <input placeholder="货物重量"
                                                                readOnly={!cargoEditable}
                                                                type="text"
                                                                maxLength={8}
                                                                value={goods.cargoWeight}
                                                                onChange={(e) => {
                                                                    goods.cargoWeight = e.target.value.toDecimal2();
                                                                    that.refreshForm()
                                                                }} />
                                                        </td>
                                                        <td className="ant-table-row">
                                                            <input placeholder="货物体积"
                                                                readOnly={!cargoEditable}
                                                                type="text"
                                                                maxLength={8}
                                                                value={goods.cargoVolumn}
                                                                onChange={(e) => {
                                                                    goods.cargoVolumn = e.target.value.toNum();
                                                                    that.refreshForm()
                                                                }} />
                                                        </td>
                                                        {/* <div className="item-inp">
                                                        <input type="text" maxLength={8} value={goods.cargoNum} onChange={(e) => { goods.cargoNum = e.target.value.toNum(); that.refreshForm() }} />
                                                    </div> */}
                                                        {/* <div className="item-inp">
                                                        {that.state.orderCargoEntities.length > 1 ? <a href="javascript:void(0)" onClick={() => { that.removeGoods.bind(that, index)() }}>删除</a> : <a href="javascript:void(0)" disabled>删除</a>}
                                                    </div> */}
                                                    </tr>
                                                )
                                            })}
                                            {/* <div style={{ border: '1px solid #ccc', textAlign: 'center', padding: '6px' }}>
                                            <span className="item-contact-ctrl add" style={{ float: 'none' }} onClick={that.addGoods.bind(that)}>+ 添加货物信息</span>
                                        </div> */}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ border: '1px solid #e2e2e3', borderTop: 'none', padding: '6px 10px', fontSize: '10px', color: '#666666' }}>
                                    <i style={{ color: '#ff7800', marginRight: '4px' }} className="iconfont icon-info"></i>
                                    <span>
                                        期望发车时间、期望到达时间，请务必提供准确时间，我们会按照您提供的时间进行司机位置信息获取
                                    </span>
                                </div>
                                <div className="ant-table-body form-table order expectTime">
                                    <table>
                                        <tbody className="ant-table-tbody">
                                            <tr className="ant-table-row">
                                                <td className="head">
                                                    <span className="title"><span className="needed">*</span>期望发车时间</span>
                                                </td>
                                                <td className="column">
                                                    <DatePicker placeholder="期望发车时间" showTime
                                                        disabled={!departTimeEditable}
                                                        format="YYYY-MM-DD HH:mm"
                                                        value={this.state.expDepart}
                                                        disabledDate={this.disabledStart.bind(this)}
                                                        style={{ border: 'none' }}
                                                        onChange={this.onStartChange.bind(this)} />
                                                </td>
                                                <td className="head">
                                                    <span className="title"><span className="needed">*</span>期望到达时间</span>
                                                </td>
                                                <td className="column">
                                                    <DatePicker placeholder="期望到达时间" showTime
                                                        disabled={!departTimeEditable}
                                                        format="YYYY-MM-DD HH:mm"
                                                        value={this.state.expArrive}
                                                        disabledDate={this.disabledEnd.bind(this)}
                                                        style={{ border: 'none' }}
                                                        onChange={this.onEndChange.bind(this)} />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="ant-table-body form-table order">
                                    <table>
                                        <tbody className="ant-table-tbody">
                                            <tr className="ant-table-row">
                                                <td className="head">
                                                    <span className="title">备注</span>
                                                </td>
                                                <td className="column single">
                                                    <TextArea
                                                        placeholder="备注"
                                                        maxLength={300}
                                                        value={this.state.remark}
                                                        onChange={(e) => { this.state.remark = e.target.value; this.refreshForm() }}
                                                        autosize />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="ant-table-body form-table order">
                                    <div className="group-head">

                                        <div>
                                            <span>运费信息</span>
                                            <span style={{ fontSize: '12px' }}>（预付款不能作为唯一填写款项）</span>
                                        </div>
                                    </div>
                                    <table>
                                        <tbody className="ant-table-tbody price">
                                            <tr className="ant-table-row">
                                                <td className="head">
                                                    <span className="title">预付款</span>
                                                </td>
                                                <td className="column">
                                                    <Input maxLength={8}
                                                        suffix={'元'}
                                                        readOnly
                                                        value={this.countAmount(0)}
                                                        type="text" />
                                                </td>
                                                <td className="head">
                                                    <span className="title">现金</span>
                                                </td>
                                                <td className="column">
                                                    <Input maxLength={8}
                                                        placeholder="填写金额"
                                                        suffix={'元'}
                                                        value={orderPriceEntity.prepayCash}
                                                        onChange={(e) => {
                                                            orderPriceEntity.prepayCash = e.target.value.toDecimal2();
                                                            that.refreshForm()
                                                        }}
                                                        type="text" />
                                                </td>
                                                <td className="head">
                                                    <span className="title">油卡</span>
                                                </td>
                                                <td className="column">
                                                    <Input maxLength={8}
                                                        placeholder="填写金额"
                                                        suffix={'元'}
                                                        value={orderPriceEntity.prepayOil}
                                                        onChange={(e) => {
                                                            orderPriceEntity.prepayOil = e.target.value.toDecimal2();
                                                            that.refreshForm()
                                                        }}
                                                        type="text" />
                                                </td>
                                            </tr>
                                            <tr className="ant-table-row">
                                                <td className="head">
                                                    <span className="title">尾款</span>
                                                </td>
                                                <td className="column">
                                                    <Input maxLength={8}
                                                        suffix={'元'}
                                                        readOnly
                                                        value={this.countAmount(1)}
                                                        type="text" />
                                                </td>
                                                <td className="head">
                                                    <span className="title">现金</span>
                                                </td>
                                                <td className="column">
                                                    <Input maxLength={8}
                                                        suffix={'元'}
                                                        placeholder="填写金额"
                                                        value={orderPriceEntity.restPayCash}
                                                        onChange={(e) => {
                                                            orderPriceEntity.restPayCash = e.target.value.toDecimal2();
                                                            that.refreshForm()
                                                        }}
                                                        type="text" />
                                                </td>
                                                <td className="head">
                                                    <span className="title">油卡</span>
                                                </td>
                                                <td className="column">
                                                    <Input maxLength={8}
                                                        suffix={'元'}
                                                        placeholder="填写金额"
                                                        value={orderPriceEntity.restPayOil}
                                                        onChange={(e) => {
                                                            orderPriceEntity.restPayOil = e.target.value.toDecimal2();
                                                            that.refreshForm()
                                                        }}
                                                        type="text" />
                                                </td>
                                            </tr>
                                            <tr className="ant-table-row">
                                                <td className="head">
                                                    <span className="title">回单款</span>
                                                </td>
                                                <td className="column">
                                                    <Input maxLength={8}
                                                        suffix={'元'}
                                                        readOnly
                                                        value={this.countAmount(2)}
                                                        type="text" />
                                                </td>
                                                <td className="head">
                                                    <span className="title">现金</span>
                                                </td>
                                                <td className="column">
                                                    <Input maxLength={8}
                                                        suffix={'元'}
                                                        placeholder="填写金额"
                                                        value={orderPriceEntity.receiptPayCash}
                                                        onChange={(e) => {
                                                            orderPriceEntity.receiptPayCash = e.target.value.toDecimal2();
                                                            that.refreshForm()
                                                        }}
                                                        type="text" />
                                                </td>
                                                <td className="head">
                                                    <span className="title">油卡</span>
                                                </td>
                                                <td className="column">
                                                    <Input maxLength={8}
                                                        suffix={'元'}
                                                        placeholder="填写金额"
                                                        value={orderPriceEntity.receiptPayOil}
                                                        onChange={(e) => {
                                                            orderPriceEntity.receiptPayOil = e.target.value.toDecimal2();
                                                            that.refreshForm()
                                                        }}
                                                        type="text" />
                                                </td>
                                            </tr>
                                            {/* 中介费模式 */}
                                            <tr className="ant-table-row">
                                                <td className="head">
                                                    <span className="title">中介费</span>
                                                </td>
                                                <td className="column single">
                                                    <Input placeholder="填写金额"
                                                        suffix={'元'}
                                                        value={this.state.agentPriceName}
                                                        onChange={(e) => {
                                                            this.state.agentPriceName = e.target.value.toDecimal2()
                                                            if (!this.state.agentPriceName || this.state.agentPriceName == 0) {
                                                                this.state.payeeId = null
                                                                this.state.payee = {}
                                                            }
                                                            that.refreshForm()
                                                        }} />
                                                </td>
                                                <td className="head">
                                                    <span className="title">总运费</span>
                                                </td>
                                                <td className="column single" colSpan="3">
                                                    <input readOnly value={this.getTotalPrice(0)} />
                                                </td>
                                            </tr>
                                            {/* 经纪人代收 */}
                                            {hasOilFee ? <tr className="ant-table-row">
                                                <td className="head">
                                                    <span className="title">油卡卡号</span>
                                                </td>
                                                <td className="column single" colSpan="5">
                                                    <input value={this.state.oilCardNo}
                                                        onClick={() => OrderUtils.orderOilCardChose(this.state.oilCardNo, (card) => {
                                                            this.setState({
                                                                oilCardNo: card.cardNumber
                                                            })
                                                        })}
                                                        style={{ cursor: 'pointer' }}
                                                        placeholder="选择油卡卡号（当油卡金额>0，油卡卡号为必选）"
                                                        readOnly type="text" />
                                                </td>
                                            </tr> : null}
                                            {/* <tr>
                                                    <td className="head">
                                                        <span className="title">运费备注</span>
                                                    </td>
                                                    <td className="column single" colSpan="5">
                                                        <TextArea
                                                            value={this.state.priceRemark}
                                                            placeholder="运费备注"
                                                            onChange={(e) => { this.state.priceRemark = e.target.value; this.refreshForm() }}
                                                            autosize />
                                                    </td>
                                                </tr> */}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="ant-table-body form-table order">
                                    <div className="group-head">
                                        <div>
                                            <span>回单</span>
                                            <span className="item-latest" >
                                                <Checkbox checked={this.state.needReceipt}
                                                    value={this.state.needReceipt}
                                                    onChange={(e) => {
                                                        this.setState({
                                                            needReceipt: e.target.checked
                                                        })
                                                    }}>需要回单</Checkbox>
                                            </span>
                                        </div>
                                    </div>
                                    {this.state.needReceipt ? <table>
                                        <tbody className="ant-table-tbody">
                                            <tr className="ant-table-row">
                                                <td className="head">
                                                    <span className="title">收件人</span>
                                                </td>
                                                <td className="column">
                                                    <input
                                                        readOnly={!this.state.needReceipt}
                                                        maxLength={20} placeholder="收件人"
                                                        value={this.state.orderReceiptEntity.receiptName}
                                                        onChange={(e) => {
                                                            this.state.orderReceiptEntity.receiptName = e.target.value;
                                                            this.refreshForm()
                                                        }}
                                                        type="text" />
                                                </td>
                                                <td className="head">
                                                    <span className="title">联系电话</span>
                                                </td>
                                                <td className="column">
                                                    <input
                                                        readOnly={!this.state.needReceipt} maxLength={11}
                                                        placeholder="联系电话"
                                                        value={this.state.orderReceiptEntity.receiptPhone}
                                                        onChange={(e) => {
                                                            this.state.orderReceiptEntity.receiptPhone = e.target.value.toNum();
                                                            this.refreshForm()
                                                        }} type="text" />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table> : null}
                                </div>
                                {this.state.needReceipt ? <div className="ant-table-body form-table order">
                                    <table>
                                        <tbody className="ant-table-tbody">
                                            <tr className="ant-table-row">
                                                <td className="head">
                                                    <span className="title">邮寄地址</span>
                                                </td>
                                                <td className="column single">
                                                    <TextArea
                                                        readOnly={!this.state.needReceipt}
                                                        placeholder="邮寄地址"
                                                        maxLength={50}
                                                        value={this.state.orderReceiptEntity.receiptAddress}
                                                        onChange={(e) => {
                                                            this.state.orderReceiptEntity.receiptAddress = e.target.value;
                                                            this.refreshForm()
                                                        }}
                                                        autosize
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div> : null}
                                <div className="ant-table-body form-table order">
                                    <div className="group-head">
                                        <div>
                                            <span>发票</span>
                                            <span className="item-latest" >
                                                <Checkbox checked={this.state.needInvoice}
                                                    onChange={(e) => {
                                                        this.setState({
                                                            needInvoice: e.target.checked
                                                        })
                                                    }}>需要开具发票</Checkbox>
                                            </span>
                                        </div>
                                    </div>
                                    {this.state.needInvoice ? <table>
                                        <tbody className="ant-table-tbody">
                                            <tr className="ant-table-row">
                                                <td className="head">
                                                    <span className="title">总运费</span>
                                                </td>
                                                <td className="column">
                                                    <Input readOnly
                                                        suffix={'元'}
                                                        value={this.getTotalPrice(0) + ' （不含服务费金额）'} type="text" />
                                                </td>
                                                <td className="head">
                                                    <span className="title">服务费</span>
                                                </td>
                                                <td className="column">
                                                    <Input readOnly
                                                        suffix={'元'}
                                                        value={this.getTotalPrice() + ' （开票需要额外支付）'} type="text" />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table> : null}
                                </div>
                                <div className="ant-table-body form-table order">
                                    <div className="group-head" style={{ borderBottom: 'none' }}>
                                        <span>指派运力</span>
                                        <span className="item-latest" onClick={this.dispatch.bind(this, '0')}>
                                            {driver.phone ?
                                                <span><i className="iconfont icon-qiehuan-"></i>更换承运司机</span>
                                                : <span><i className="iconfont icon-xuanze1"></i>指定承运司机</span>}
                                        </span>
                                        <span className="item-latest" onClick={this.dispatch.bind(this, '1')}>
                                            {vehicle.vehicleNo ?
                                                <span><i className="iconfont icon-qiehuan-"></i>更换承运车辆</span>
                                                : <span><i className="iconfont icon-xuanze1"></i>指定承运车辆</span>}
                                        </span>
                                        <span className="item-latest" style={{ paddingLeft: '24px', borderLeft: '1px solid #ccc' }} onClick={OrderUtils.downLoadContractTemplate}>
                                            <span><i className="iconfont icon-hetongxiazaixin-"></i>下载合同模板</span>
                                        </span>
                                        {/* 合同未审核通过则可以重新上传 */}
                                        {this.state.contractStatus != 1 ?
                                            <span className="item-latest">
                                                <Upload {...this.uploadProps} disabled={!driver.phone}>
                                                    <i className="iconfont icon-upload-model"
                                                        style={{
                                                            marginLeft: '4px',
                                                            color: !driver.phone ? '#ccc' : '#ff7800',
                                                            cursor: 'pointer',
                                                            marginTop: '3px',
                                                            fontSize: '14px',
                                                            top: '0'
                                                        }} ></i>
                                                    <span style={{ color: !driver.phone ? '#ccc' : '#ff7800' }}>{this.state.contractUrl ? '更换运输合同' : '上传运输合同'}</span>
                                                </Upload>
                                                    {this.state.contractUrl ? <span style={{fontSize:10,marginLeft:'6px'}} onClick={() => { window.open(this.state.contractUrl) }} >(查看合同)</span> : null}
                                            </span> : (this.state.contractUrl ?
                                                <span className="item-latest">
                                                    <span className="click-th-main" onClick={() => { window.open(this.state.contractUrl) }} >
                                                        <i className="iconfont icon-protocol"></i>查看运输合同
                                                    </span>
                                                </span> : null)}
                                        {((driver.phone || vehicle.vehicleNo) && !this.state.onEdit) ?
                                            <span className="item-latest item-contact-ctrl remove" onClick={() => {
                                                this.setState({
                                                    driver: {},
                                                    askDriverPayeeId: null,
                                                    askDriverBankAccountNo: null,
                                                    contractStatus: null,
                                                    contractUrl: null,
                                                    vehicle: {}
                                                })
                                            }}>取消选择</span> : null}
                                    </div>
                                    <table>
                                        <tbody className="ant-table-tbody">
                                            {driver.phone ? <tr className="ant-table-row">
                                                <td className="head">
                                                    <span className="title">司机</span>
                                                </td>
                                                <td className="column">
                                                    <input placeholder="" readOnly value={driver.name} type="text" />
                                                </td>
                                                <td className="head">
                                                    <span className="title">司机手机号</span>
                                                </td>
                                                <td className="column">
                                                    <input placeholder="" readOnly value={driver.phone} type="text" />
                                                </td>
                                            </tr> : null}
                                            {/* 司机全额收款、中介费模式 都要司机收款账号 */}
                                            {driver.phone
                                                ? <tr className="ant-table-row">
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
                                                            {(function () {
                                                                return (
                                                                    <div className="choose click-th-main"
                                                                        onClick={() => OrderUtils.chosepayee(carrierFeePayee, {
                                                                            initialList: that.state.driverPayeeList || [],
                                                                            disabledInfo: '必须选择该订单承运司机的收款账户',
                                                                            disable: (payeeitem) => {
                                                                                return hasAgentFee && driver.driverAuthStatus == 1 && payeeitem.idCardNo != driver.idCardNum
                                                                            }
                                                                        }, (payeeChosen) => {
                                                                            that.setState({
                                                                                carrierFeePayee: payeeChosen,
                                                                                askDriverPayeeId: payeeChosen.id,
                                                                            })
                                                                        })}>
                                                                        {carrierFeePayee.name ?
                                                                            <span><i className="iconfont icon-qiehuan-"></i>更换收款人</span> :
                                                                            <span><i className="iconfont icon-xuanze1"></i>指定收款人</span>}
                                                                    </div>
                                                                )
                                                            })()}
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
                                                                <div className="choose click-th-main"
                                                                    onClick={() => OrderUtils.chosepayee(payee, {
                                                                        initialList: that.state.driverPayeeList || [],
                                                                        disabledInfo: '中介收款人不能是司机',
                                                                        disable: (payeeitem) => {
                                                                            return driver.driverAuthStatus == 1 && payeeitem.idCardNo == driver.idCardNum
                                                                        }
                                                                    }, (payeeChosen) => {
                                                                        that.setState({
                                                                            payee: payeeChosen,
                                                                            payeeId: payeeChosen.id
                                                                        })
                                                                    })}>
                                                                    {payee.name ?
                                                                        <span><i className="iconfont icon-qiehuan-"></i>更换收款人</span> :
                                                                        <span><i className="iconfont icon-xuanze1"></i>指定收款人</span>}
                                                                </div>
                                                            </div>
                                                        </td> : null}
                                                </tr> : null}
                                        </tbody>
                                    </table>
                                </div>
                                {(function () {
                                    // const vehicleHead = <td className="head">
                                    //     <span className="title">车牌号</span>
                                    // </td>;
                                    // const VehicleColumn = function (single) {
                                    //     return <td className={"column" + (single ? " single" : "")}>
                                    //         <input placeholder="" readOnly value={vehicle.vehicleNo} type="text" />
                                    //     </td>
                                    // };
                                    // const driverInfoHead = <td className="head">
                                    //     <span className="title">司机证件信息</span>
                                    // </td>;
                                    // const DriverInfoColumn = function (single) {
                                    //     return <td className={"column" + (single ? " single" : "")}>
                                    //         <div>
                                    //             <span style={{ padding: '0 12px', display: 'inline-block' }}>
                                    //                 <div style={{ padding: '12px', textAlign: 'center', display: 'inline-block' }}>
                                    //                     <CImg onClick={() => that.setState({ ImageViewer: true, ImageViewerIndex: 0 })} style={{ maxHeight: '80px', margin: '12px' }} src={driver.idCardImg1} />
                                    //                     <div>身份证正面</div>
                                    //                 </div>
                                    //                 <div style={{ padding: '12px', textAlign: 'center', display: 'inline-block' }}>
                                    //                     <CImg onClick={() => that.setState({ ImageViewer: true, ImageViewerIndex: 1 })} style={{ maxHeight: '80px', margin: '12px' }} src={driver.idCardImg2} />
                                    //                     <div>身份证反面</div>
                                    //                 </div>
                                    //                 <div style={{ padding: '12px', textAlign: 'center', display: 'inline-block' }}>
                                    //                     <CImg onClick={() => that.setState({ ImageViewer: true, ImageViewerIndex: 2 })} style={{ maxHeight: '80px', margin: '12px' }} src={driver.driverLicencePic} />
                                    //                     <div>驾驶证</div>
                                    //                 </div>
                                    //             </span>
                                    //         </div>
                                    //     </td>
                                    // };
                                    // const vehicleInfoHead = <td className="head">
                                    //     <span className="title">车辆证件信息</span>
                                    // </td>;
                                    const vehicleInfoHeadFn = function (title, needed) {
                                        return <td className="head">
                                            <span className="title">{title}</span>
                                        </td>
                                    }
                                    const VehicleInfoColumnFn = function (single, key) {
                                        return <td className={"column" + (single ? " single" : "")}>
                                            <input placeholder="" readOnly value={vehicle[key]} type="text" />
                                        </td>
                                    }
                                    const VehicleInfoColumn = function (single) {
                                        return <td className={"column" + (single ? " single" : "")}>
                                            <div>
                                                <span style={{ padding: '0 12px', display: 'inline-block' }}>
                                                    <div style={{ padding: '12px', textAlign: 'center', display: 'inline-block' }}>
                                                        <CImg onClick={() => that.setState({ ImageViewer1: true, ImageViewerIndex1: 0 })} style={{ maxHeight: '80px', margin: '12px' }} src={vehicle.vehicleLicenseUrl1} />
                                                        <div>行驶证正页</div>
                                                    </div>
                                                    {/* <div style={{ padding: '12px', textAlign: 'center', display: 'inline-block' }}>
                                            <CImg onClick={() => this.setState({ ImageViewer1: true, ImageViewerIndex1: 1 })} style={{ maxHeight: '80px', margin: '12px' }} src={that.state.vehicle.vehicleRoadTransportCerUrl} />
                                        <div>道路运输证</div>
                                        </div>
                                        <div style={{ padding: '12px', textAlign: 'center', display: 'inline-block' }}>
                                            <CImg onClick={() => this.setState({ ImageViewer1: true, ImageViewerIndex1: 2 })} style={{ maxHeight: '80px', margin: '12px' }} src={that.state.vehicle.vehicleHeadPhotoUrl} />
                                            <div>带车牌的车辆照</div>
                                        </div> */}
                                                </span>
                                            </div>
                                        </td>
                                    }
                                    if (driver.phone && vehicle.vehicleNo) {
                                        return (
                                            <div className="ant-table-body form-table order">
                                                <table>
                                                    <tbody className="ant-table-tbody">
                                                        <tr className="ant-table-row">
                                                            {vehicleInfoHeadFn("车牌号")}
                                                            {VehicleInfoColumnFn(false, 'vehicleNo')}
                                                            {vehicleInfoHeadFn("车型")}
                                                            {VehicleInfoColumnFn(false, 'vehicleTypeName')}
                                                        </tr>
                                                        <tr className="ant-table-row">
                                                            {vehicleInfoHeadFn("车长（米）")}
                                                            {VehicleInfoColumnFn(false, 'vehicleLen')}
                                                            {vehicleInfoHeadFn("吨位（吨）")}
                                                            {VehicleInfoColumnFn(false, 'vehicleTon')}
                                                        </tr>
                                                        {/* <tr>
                                                            {driverInfoHead}
                                                            {DriverInfoColumn(false)}
                                                            {vehicleInfoHead}
                                                            {VehicleInfoColumn(false)}
                                                        </tr> */}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    } else {
                                        if (driver.phone) {
                                            return null
                                        } else if (vehicle.vehicleNo) {
                                            return <div className="ant-table-body form-table order">
                                                <table>
                                                    <tbody className="ant-table-tbody">
                                                        <tr className="ant-table-row">
                                                            {vehicleInfoHeadFn("车牌号")}
                                                            {VehicleInfoColumnFn(false, 'vehicleNo')}
                                                            {vehicleInfoHeadFn("车型")}
                                                            {VehicleInfoColumnFn(false, 'vehicleTypeName')}
                                                        </tr>
                                                        <tr className="ant-table-row">
                                                            {vehicleInfoHeadFn("车长（米）")}
                                                            {VehicleInfoColumnFn(false, 'vehicleLen')}
                                                            {vehicleInfoHeadFn("吨位（吨）")}
                                                            {VehicleInfoColumnFn(false, 'vehicleTon')}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                {/* <table>
                                                    <tbody className="ant-table-tbody" style={{ borderTop: '1px solid #e2e2e3' }}>
                                                        <tr>
                                                            {vehicleInfoHead}
                                                            {VehicleInfoColumn(true)}
                                                        </tr>
                                                    </tbody>
                                                </table> */}
                                            </div>
                                        } else {
                                            return null;
                                        }
                                    }
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </Layout >
        );
        return (
            <div style={{ height: '100%' }}>
                <div style={{ height: 'calc(100% - 48px)' }}>
                    <div className="list-ctrl-box" style={{ height: '48px' }}>
                        <span className="vehicle">
                            {this.state.onEdit ? <span>订单号：{this.state.orderNo}</span> : <span>带有<span style={{ color: 'red' }}>*</span>为必填项</span>}
                        </span>
                        {/* <span className="vehicle" style={{fontSize:'12px',color:'#eee'}}>（装货地到卸货地公里数不能小于<span></span>公里）</span> */}
                    </div>
                    <ScrollContainer init loading={this.state.pageloading} height={'48px'} content={content} />
                </div>
                <div style={{ textAlign: 'center', padding: '10px', width: '100%' }}>
                    <Button className="common" loading={this.state.saveLoading} onClick={this.save.bind(this, false)} text={this.state.onEdit ? '保存' : '提交'} />
                    {this.state.onEdit ?
                        <Button className="common white" style={{ marginLeft: 24 }} onClick={this.props.cancel} text="取消" /> :
                        <Button className="common" style={{ marginLeft: 24 }} loading={this.state.saveLoadingC} onClick={this.save.bind(this, true)} text="提交并复制" />}
                </div>
                <ImageViewer thumb={'_600-600'} handleCancel={() => this.setState({ ImageViewer: false })} list={this.state.driver ? [this.state.driver.idCardImg1, this.state.driver.idCardImg2, this.state.driver.driverLicencePic] : ''} show={this.state.ImageViewer} index={this.state.ImageViewerIndex} />
                <ImageViewer thumb={'_600-600'} handleCancel={() => this.setState({ ImageViewer1: false })} list={this.state.vehicle ? [this.state.vehicle.vehicleLicenseUrl1, this.state.vehicle.vehicleRoadTransportCerUrl, this.state.vehicle.vehicleHeadPhotoUrl] : ''} show={this.state.ImageViewer1} index={this.state.ImageViewerIndex1} />
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