import React from 'react';
import Utils from './utils';
import Button from '../Components/lib/button';
import PayResult from '../Components/modal/payResult';
import Listchose from '../Components/modal/listchose';
import OrderDispatch from '../Components/modal/orderdispatch'
import Batch from '../Components/modal/batch'
import Appeal from '../Components/modal/appeal'
import Enum from './enum'
import Storage from 'gc-storage/es5'
import Events from 'gc-event/es5'


// const usableAmount = Storage.get('orderStatusNums').orderStatistics.usableAmount //账户余额`
export default class OrderUtils {
    static appeal(exception, callback) {
        let appealList
        Utils.modal({
            title: '订单申诉',
            okText: '提交',
            noBtn: true,
            double: true,
            width: 800,
            cancelText: '取消',
            onOk() {
                if (!appealList || appealList.length == 0) {
                    return
                }
                let lackParam = 0
                appealList.map((appeal, index) => {
                    appeal.sort = index
                    if (!appeal.voucherType) {
                        lackParam = 1
                        return null
                    }
                    if (!appeal.voucherImgs) {
                        lackParam = 2
                        return null
                    }
                })
                if (lackParam == 1) {
                    Utils.Message.error('请选择凭证类型！');
                    return true;
                }
                if (lackParam == 2) {
                    Utils.Message.error('请上传申诉凭证');
                    return true;
                }
                return Utils.request({
                    api: Utils.getApi('订单管理', '异常申诉'),
                    params: {
                        id: exception.id,
                        appealList: appealList,
                    },
                    success: function (data) {
                       
                        // Utils.Message.success('您的申诉已提交！');
                        let modelAppel = Utils.error({
                            title: '提交成功',
                            okText: '好，知道了',
                            content: '您的订单申诉提交成功，我们会在24小时内进行处理，请及时关注您的订单状态!',
                            onOk() {
                                modelAppel.destroy()
                            }
                        })
                        if (callback && typeof callback == "function") {
                            callback();
                        }
                    }
                })
            },
            onCancel() {

            },
            content: <Appeal exception={exception} handler={(_appealList) => { appealList = _appealList }} />
        })
    }

    static getOrderDetail(option) {
        if (!Utils.getApi('订单管理', '详情')) {
            return;
        }
        Utils.request({
            api: Utils.getApi('订单管理', '详情'),
            params: {
                id: option.id,
            },
            beforeRequest() {
                if (option.beforeRequest && typeof option.beforeRequest == 'function') {
                    option.beforeRequest();
                }
            },
            afterRequest() {
                if (option.afterRequest && typeof option.afterRequest == 'function') {
                    option.afterRequest();
                }
            },
            success: function (data) {
                option.success(data);
            }
        });
    }


    static payReject(priceItems, handler) {
        let remark, that = this;
        Utils.confirm({
            content:
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <div style={{ padding: '3px', fontSize: '12px' }}>
                        <span style={{ color: 'red' }}>*</span>驳回原因
                        <input maxLength={100} type="text"
                            style={{
                                width: '200px',
                                padding: '2px 6px',
                                marginLeft: '12px'
                            }}
                            onChange={(e) => { remark = e.target.value }} />
                    </div>
                </div>,
            title: '支付驳回',
            okText: '确认驳回',
            cancelText: '取消',
            onOk() {
                if (!remark) {
                    Utils.Message.error('请输入驳回原因！');
                    return true;
                }
                return Utils.request({
                    api: Utils.getApi('付款审核', '支付审核'),
                    params: {
                        orderPriceItemIds: priceItems.map(priceItem => {
                            return priceItem.id
                        }).toString(),
                        payApplyStatus: 3,
                        remark: remark
                    },
                    success: function (data) {
                        Utils.Message.success('驳回完成！');
                        if (handler) {
                            handler()
                        }
                    }
                })
            }
        })
    }

    static updateOrderCarrierInfo(option, handler) {
        return Utils.request({
            api: Utils.getApi('订单管理', '指派'),
            params: option.param,
            beforeRequest() {
                if (option.before) {
                    option.before()
                }
            },
            afterRequest() {
                if (option.after) {
                    option.after()
                }
            },
            success: function (data) {
                if (handler) {
                    handler()
                }
            }
        })
    }

    /**
     * 认证订单
     * @param {*} order 
     * @param {*} callback 
     */
    static goVerify(order, callback) {
        let txtArr = ['司机未认证', '车辆未认证', '司机收款账户未选择', '收款人未选择'],
            btnTxtArr = ['去认证', '去认证', '去选择', '去选择'], modal;
        let driverPayeeList = order.driverPayeeList || [], driver = {}, payee = {}, carrierFeePayee = {}
        if (order.askDriverPhone) {
            driver = {
                phone: order.askDriverPhone,
                name: order.askDriverName,
                idCardNum: order.askDriverIdCardNo,
                driverAuthStatus: order.driverAuthStatus,
            }
        }
        if (order.payeeInfoEntity && order.payeeInfoEntity.bankAccountNo) {
            payee = order.payeeInfoEntity
        }
        if (order.driverPayeeInfoEntity && order.driverPayeeInfoEntity.bankAccountNo) {
            carrierFeePayee = order.driverPayeeInfoEntity
        }
        let hasAgentFee = (function (list) {
            let agentPrice = list.find(price => {
                return price.stage == Enum.PaymentStage.AGENT
            })
            if (agentPrice) {
                return true
            }
            return false
        })(order.priceItemEntityList)
        let funArr = [
            () => {
                if (modal) {
                    modal.destroy()
                }
                Events.emit('addTab', {
                    moduleText: '司机管理'
                    , module: '司机管理'
                }, {
                        event: '司机详情Open',
                        params: [order.askDriverPhone]
                    })
            }, () => {
                if (modal) {
                    modal.destroy()
                }
                Events.emit('addTab', {
                    moduleText: '车辆管理',
                    module: '车辆管理'
                }, {
                        event: '车辆详情Open',
                        params: [order.askVehicleId]
                    })
            }, () => {
                if (modal) {
                    modal.destroy()
                }
                this.chosepayee(carrierFeePayee, {
                    initialList: driverPayeeList || [],
                    disabledInfo: '必须选择该订单承运司机的收款账户',
                    disable: (payeeitem) => {
                        return hasAgentFee && driver.driverAuthStatus == 1 && payeeitem.idCardNo != driver.idCardNum
                    }
                }, (payee) => {
                    this.updateOrderCarrierInfo({
                        param: {
                            askDriverPayeeId: payee.id,
                            orderId: order.id,
                        }
                    }, () => {
                        Events.emit('onOrderId' + order.id + 'Update');
                        if (callback)
                            callback()
                    })
                })
            }, () => {
                if (modal) {
                    modal.destroy()
                }
                this.chosepayee(payee, {
                    initialList: driverPayeeList,
                    disabledInfo: '中介收款人不能是司机',
                    disable: (payeeitem) => {
                        return driver.driverAuthStatus == 1 && payeeitem.idCardNo == driver.idCardNum
                    }
                }, (payee) => {
                    this.updateOrderCarrierInfo({
                        param: {
                            payeeId: payee.id,
                            orderId: order.id,
                        }
                    }, () => {
                        Events.emit('onOrderId' + order.id + 'Update');
                        if (callback)
                            callback()
                    })
                })
            }]
        let _cnt1 = 0, tag = '', test = (wrong) => {
            if (wrong) {
                _cnt1++
                tag += '1'
            } else {
                tag += '0'
            }
        }

        test(order.driverAuthStatus != 1)
        test(order.vehicleAuthStatus != 1)
        test(Utils.isEmpty(order.askDriverBankAccountNo))
        test(Utils.isEmpty(order.payeeBankAccountNo) && hasAgentFee)
        if (_cnt1 == 1) {
            //只有一个为认证项
            funArr[tag.indexOf('1')]();
            return;
        }
        tag = tag.split('')
        let sortIndx = 0
        modal = Utils.modal({
            content: <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <div className="ant-list ant-list-lg ant-list-split ant-list-something-after-last-item">
                    <div className="ant-spin-nested-loading">
                        <div className="ant-spin-container">
                            <ul className="ant-list-items" style={{ padding: 0 }}>
                                {tag.map((status, index) => {
                                    if (status != '0') {
                                        sortIndx++
                                    }
                                    return status == '0' ? null :
                                        <li className="ant-list-item ant-list-item-no-flex">
                                            <div style={{ width: '100%' }}>
                                                <div style={{ display: 'inline-block', width: '70%', textAlign: 'left' }}>{sortIndx}、{txtArr[index]}</div>
                                                <div style={{ display: 'inline-block', width: '30%', textAlign: 'center' }}>
                                                    <a href="javascript:void(0)" className="click-th-main" onClick={() => {
                                                        funArr[index]();
                                                    }}>{btnTxtArr[index] + '>'}</a>
                                                </div>
                                            </div>
                                        </li>
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>,
            title: '完善认证',
            width: 420,
            noBtn: true
        })
    }

    /**
     * 判断金额大于0
     */
    static amountCorrect(amount) {
        return !isNaN(amount) && parseFloat(amount) > 0;
    }

    static orderDispatch(defaultActiveKey, driver, vehicle, isOnly, handler) {
        let localDriver = driver, localVehicle = vehicle;
        driver = driver ? {
            driverPhone: driver.phone,
            driverName: driver.name,
            driverIdCardNo: driver.idCardNum,
            driverAuthStatus: driver.driverAuthStatus,
        } : null
        let modal = Utils.modal({
            //指定承运司机/车辆弹框
            width: 800,
            title: '指派运力',
            // className: 'no-title',
            onOk: function () {
                handler(localDriver, localVehicle);
                modal.destroy();
            },
            content: <OrderDispatch
                defaultActiveKey={defaultActiveKey}
                driver={driver}
                only={isOnly}
                vehicle={vehicle}
                driverEmpty={!Utils.getApi('司机管理', '保存')}
                driverApi={Utils.getApi('新建订单', '指派司机')}
                vehicleEmpty={!Utils.getApi('车辆管理', '保存')}
                vehicleApi={Utils.getApi('新建订单', '指派车辆')}
                onDriverSelected={(driverChosen) => {
                    localDriver = {
                        phone: driverChosen.driverPhone,
                        name: driverChosen.driverName,
                        idCardNum: driverChosen.driverIdCardNo,
                        locAuthStatus: driverChosen.locAuthStatus,
                        driverAuthStatus: driverChosen.driverAuthStatus,
                        payeeInfoEntityList: driverChosen.payeeInfoEntityList,
                        orderContractEntity:driverChosen.orderContractEntity
                    };
                }}
                onVehicleSelected={(vehicleChosen) => {
                    localVehicle = vehicleChosen
                }}
                addVehicle={() => { modal.destroy(); Events.emit('addTab', { moduleText: '车辆管理', module: '车辆管理' }, { event: '车辆详情Open' }) }}
                addDriver={() => { modal.destroy(); Events.emit('addTab', { moduleText: '司机管理', module: '司机管理' }, { event: '司机详情Open' }) }}
            />
        });
    }

    /**
     * 选择收款人
     * @param {*} payee 
     * @param {*} options 其它扩展props
     * @param {*} 
     *  
     */
    static chosepayee(payee, options, handler) {
        let payeeChose;
        let payeeLimit = Storage.get('payeeBenefyLimit')
        options = options || {}
        let onSelected = function (item) {
            payeeChose = item;
        }
        let modal = Utils.modal({
            //指定承运司机/车辆弹框
            width: 900,
            title: options.title || '选择收款人',
            // className: 'no-title',
            onOk: function () {
                handler(payeeChose);
                modal.destroy();
            },
            content: <Listchose
                current={payee}
                api={Utils.getApi('收款人管理', '列表')}
                placeholder="姓名/手机号/银行卡号"
                empty={!Utils.getApi('收款人管理', '保存')}
                test={(item1, item2) => {
                    return item1.id == item2.id
                }}
                {...options}
                disabledInfo={(payee) => {
                    return <span>{options.disabledInfo}</span>
                }}
                disable={(payee => {
                    return options.disable ? options.disable(payee) : false
                })}
                initialEmptyText="无关联收款人"
                // initialEmpty={!Utils.getApi('司机管理','详情')||!Utils.getApi('司机管理','关联收款人')}
                initialEmpty={true}
                initialEmptyTemplate={
                    <Button text={"添加司机关联收款人"} className="common" onClick={() => {
                        modal.destroy()
                        Events.emit('addTab', { moduleText: '司机管理', module: '司机管理' }, { event: '司机详情Open', params: options.initData })
                    }} />
                }
                template={
                    (payee) => {
                        return (
                            <div>
                                <span style={{ display: 'inline-block', width: '70px', textAlign: 'center' }}>{payee.name}</span>
                                <span style={{ display: 'inline-block', width: 'calc(100% - 70px)' }}>{payee.bankAccountNo}</span>
                            </div>
                        )
                    }
                }
                onSelected={onSelected}
                emptyTemplate={<Button text={options.forDriver ? "添加司机收款账户" : "添加收款人"} className="common" onClick={() => {
                    modal.destroy()
                    Events.emit('addTab', { moduleText: '收款人管理', module: '收款人管理' }, { event: '收款人管理Open', params: [options.initData] })
                }} />}
            />
        });
    }

    static orderOilCardChose(oilCard, handler) {
        let cardChosen;
        let onSelected = function (item) {
            cardChosen = item;
        }
        let modal = Utils.modal({
            //指定承运司机/车辆弹框
            width: 800,
            title: '选择油卡',
            // className: 'no-title',
            onOk: function () {
                handler(cardChosen);
                modal.destroy();
            },
            content: <Listchose
                current={{
                    cardNumber: oilCard
                }}
                api={Utils.getApi('新建订单', '选择油卡')}
                placeholder="油卡卡号"
                className="driver-select-item-box"
                test={(item1, item2) => {
                    return item1.cardNumber == item2.cardNumber
                }}
                template={
                    (card) => {
                        return (
                            <div>
                                <span>{card.cardNumber}</span>
                            </div>
                        )
                    }
                }
                onSelected={onSelected}
            />
        });
    }

    /**
     * 
     * @param {*} address 已选
     * @param {*} disableIds 禁用列表
     * @param {*} handler 回调
     */
    static orderAddressChose(address, disableIds, handler) {
        let addressChosen;
        let onSelected = function (item) {
            addressChosen = item;
        }
        let modal = Utils.modal({
            //指定承运司机/车辆弹框
            width: 800,
            title: <soan>选择常用地址   {!Utils.isEmpty(Utils.getApi('常用联系人', '列表')) && !Utils.isEmpty(Utils.getApi('常用联系人', '保存')) ?
                <span style={{ marginLeft: '36px', fontSize: '10px' }}
                    className="click-th-main"
                    onClick={() => {
                        modal.destroy()
                        Events.emit('addTab', {
                            moduleText: '常用联系人',
                            module: '常用联系人'
                        }, {
                                event: '常用联系人Open'
                            })
                    }}
                >添加常用联系人</span> : null}</soan>,
            // className: 'no-title',
            onOk: function () {
                handler(addressChosen);
                modal.destroy();
            },
            content: <Listchose
                current={address}
                api={Utils.getApi('新建订单', '查询')}
                placeholder="姓名/联系电话"
                empty={!Utils.getApi('常用联系人', '保存')}
                className="driver-select-item-box inline"
                test={(item1, item2) => {
                    return item1.id == item2.id
                }}
                disable={(address => {
                    return disableIds.indexOf(address.id) > -1
                })}
                template={
                    (address) => {
                        return (
                            <div>
                                <span style={{ display: 'inline-block', textAlign: 'center' }}>
                                    <span style={{ width: '90px', display: 'inline-block', textAlign: 'left',paddingLeft:12 }}>{address.contactName}</span>
                                    <span style={{ width: '110px', display: 'inline-block', textAlign: 'left' }}>{address.contactPhone}</span>
                                </span>
                                <span className="info" style={{ width: 'calc(100% - 200px)' }}>{address.address}</span>

                            </div>
                        )
                    }
                }
                onSelected={onSelected}
                emptyTemplate={
                    <Button text="添加常用联系人"
                        className="common"
                        onClick={() => {
                            //todo 跳转司机添加
                            modal.destroy()
                            Events.emit('addTab', {
                                moduleText: '常用联系人',
                                module: '常用联系人'
                            }, {
                                    event: '常用联系人Open'
                                })
                        }} />}
            />
        });
    }

    static showPayResult(resultMap, paymentInfo) {
        if (resultMap.cashPayResult && resultMap.oilPayResult && resultMap.taxPayResult) {
            this.payModal();
            return;
        }
        if (resultMap.cashPayResult) {
            paymentInfo.cashFailed = !resultMap.cashPayResult.success;
            paymentInfo.cashMsg = resultMap.cashPayResult.msg;
        }
        if (resultMap.oilPayResult) {
            paymentInfo.oilFailed = !resultMap.oilPayResult.success;
            paymentInfo.oilMsg = resultMap.oilPayResult.msg;
        }
        if (resultMap.taxPayResult) {
            paymentInfo.taxFailed = !resultMap.taxPayResult.success;
            paymentInfo.taxMsg = resultMap.taxPayResult.msg;
        }
        Utils.info({
            title: paymentInfo.amountTypeName + "支付结果",
            content: <PayResult payResult={paymentInfo}></PayResult>,
            okText: "知道了",
        })
    }
    static payModal() {
        //1.9.4支付弹框
        Utils.info({
            title: '支付提示',
            content: <div>
                <div style={{ marginBottom: '10px', fontSize: '12px', }}>
                    订单支付已提交，支付处理中，请及时关注订单支付结果！
                                </div>
                <div style={{ fontSize: '12px', color: '#ff7800' }}>
                    <i className='iconfont icon-gantanhao' style={{ marginRight: '5px', fontSize: '12px' }}></i>
                    <span>如果订单支付失败，不会扣款成功，您可以重新发起订单支付</span>
                </div>
            </div>,
            okText: '知道了',
            okFun: function () {

            }
        })
    }

    /**
     * 
     * @param {*} priceItems 批量操作列表
     * @param {*} type 操作类型 0申请 1审核 2支付
     * @param {*} handler 回调
     */
    static batchPayAction(priceItems, type, handler) {
        if (!priceItems || priceItems.length == 0) {
            return
        }
        let totalAmount = 0,//总金额
            totalCash = 0, //现金金额
            totalOil = 0, //油卡金额
            totalTaxAmount = 0,//服务费金额
            rebateAmount = parseFloat(Storage.get('rebateAmount') || 0),
            title, okText, cancelText, modal, password;
        var that = this, tempPrice, tempTaxPrice;
        // let orderCheckPayItemReqList = [], batchPayList = [], payResultMap = {};
        priceItems.map((priceItem) => {
            let cash = 0,oil = 0,tax = 0
            tempPrice = priceItem.amountName ? parseFloat(priceItem.amountName) : 0
            tempTaxPrice = priceItem.taxAmountName ? parseFloat(priceItem.taxAmountName) : 0
            if (priceItem.type == Enum.PaymentType.CASH && priceItem.stage != Enum.PaymentStage.TAX) {
                totalCash += tempPrice
                cash = tempPrice
            }
            if (priceItem.type == Enum.PaymentType.OIL && priceItem.stage != Enum.PaymentStage.TAX) {
                totalOil += tempPrice
                oil = tempPrice
            }
            if (priceItem.stage == Enum.PaymentStage.TAX) {
                totalTaxAmount += tempPrice
                tax = tempPrice
            }
            if (tempTaxPrice) {
                tax += tempTaxPrice
                totalTaxAmount += tempTaxPrice
            }
            totalAmount += (tax+cash+oil)
        })
        rebateAmount = (rebateAmount > (totalCash + totalTaxAmount) ? (totalCash + totalTaxAmount) : rebateAmount).toFixed(2)
        if (type == 0) {
            title = priceItems.length > 1 ? '批量申请' : ('申请支付' + priceItems[0].stageName);
            okText = '提交';
            cancelText = '取消';
        } else if (type == 1) {
            title = priceItems.length > 1 ? '批量审核' : (priceItems[0].stageName + '支付审核');
            okText = '通过';
            cancelText = '驳回';
        } else {
            if (!Storage.get('companyConfig').setPayPassword) {
                //未设置支付密码 提示去设置
                if (Storage.get('isAdminUser')) {
                    Utils.confirm({
                        content: <div style={{ marginTop: '16px', textAlign: 'center' }}>
                            <div style={{ padding: '3px', fontSize: '12px' }}>
                                您还未设置支付密码！
                            </div>
                        </div>,
                        title: '提示',
                        okText: '设置支付密码',
                        cancelText: '取消',
                        onOk() {
                            Events.emit('addTab', { moduleText: '账户安全', module: '账户安全' })
                        }
                    })
                } else {
                    Utils.Message.error('系统尚未设置支付密码，请联系管理员！');
                }
                return;
            }
            title = priceItems.length > 1 ? '批量支付' : ('支付' + priceItems[0].stageName);
            okText = '确认支付';
            cancelText = '驳回';
        }
        let batchId = Utils.guid()
        modal = Utils.modal({
            title: title,
            width: 500,
            noBtn: true,
            extClass: 'ani-modal',
            content: <Batch
                id={batchId}
                price={priceItems.length === 1 ? {
                    ...priceItems[0],
                    totalAmount: totalAmount.toFixed(2),
                    totalCash: totalCash.toFixed(2),
                    totalOil: totalOil.toFixed(2),
                    totalTax: totalTaxAmount.toFixed(2)
                } : {
                        totalAmount: totalAmount.toFixed(2),
                        totalCash: totalCash.toFixed(2),
                        totalOil: totalOil.toFixed(2),
                        totalTax:totalTaxAmount.toFixed(2)
                    }}
                type={type}
                usableAmount={Storage.get('usableAmount') || '0.00'}
                rebateAmount={rebateAmount > 0 && totalCash > 0 ? rebateAmount : 0}
                isSingle={false}
                okText={okText}
                cancelText={cancelText}
                pwdTemplate={type === 2 ? <div className="batch-pay-pwd">
                    <span>
                        <span>支付密码：</span>
                        <input type="password"
                            style={{
                                width: '200px',
                                padding: '2px 6px',
                                marginRight: '6px'
                            }}
                            onChange={(e) => {
                                password = e.target.value
                            }} />
                    </span>
                    {Storage.get('isAdminUser') ?
                        <a onClick={(e) => {
                            Events.emit('addTab', { moduleText: '账户安全', module: '账户安全' });
                            modal.destroy();
                        }} href="javascript:void(0)">忘记支付密码</a> : ''}
                </div> : null}
                onOk={(start, end) => {
                    switch (type) {
                        case 0://批量申请
                            Utils.request({
                                api: Utils.getApi('订单管理', '申请支付'),
                                params: {
                                    orderPriceItemIds: priceItems.map(priceItem => {
                                        return priceItem.id
                                    }).toString(),
                                },
                                beforeRequest() {
                                    start()
                                },
                                afterRequest() {
                                    end()
                                },
                                success(resultList) {
                                    if (priceItems.length == 1) {
                                        modal.destroy();
                                        if (resultList[0].status == 0) {
                                            Utils.Message.error('申请失败，' + resultList[0].message);
                                        }
                                    } else {
                                        Events.emit('showRes_' + batchId, resultList);
                                        Events.remove('showRes_' + batchId)
                                        modal.update({
                                            title: '操作结果',
                                            className: 'mymodal single',
                                            okText: '知道了',
                                            onOk: () => {
                                                modal.destroy();
                                            }
                                        });
                                    }
                                    if (handler) {
                                        handler()
                                    }
                                }
                            })
                            break;
                        case 1://批量审批
                            Utils.request({
                                api: Utils.getApi('付款审核', '支付审核'),
                                params: {
                                    orderPriceItemIds: priceItems.map(priceItem => {
                                        return priceItem.id
                                    }).toString(),
                                    payApplyStatus: 1
                                },
                                beforeRequest() {
                                    start()
                                },
                                afterRequest() {
                                    end()
                                },
                                success(data) {
                                    modal.destroy();
                                    if (handler) {
                                        handler()
                                    }
                                }
                            })
                            break;
                        case 2://批量支付
                            let param = {
                                priceItemIdList: priceItems.map(priceItem => {
                                    return priceItem.id
                                }),
                                password: Utils.md5(password)
                            }
                            if (totalCash > 0 && rebateAmount > 0) {
                                param.rebateAmount = rebateAmount
                            }
                            Utils.request({
                                api: Utils.getApi('运费支付', '支付'),
                                params: param,
                                beforeRequest() {
                                    start()
                                },
                                afterRequest() {
                                    end()
                                    modal.destroy();
                                },
                                success(resList) {
                                    if (handler) {
                                        handler()
                                    }
                                    that.payModal();
                                    Storage.set('rebateAmount', parseFloat(Storage.get('rebateAmount') || 0) - rebateAmount)
                                }
                            });
                            break;
                        default:
                            break;
                    }
                }}
                onCancel={() => {
                    Events.remove('showRes_' + batchId)
                    switch (type) {
                        case 0://批量申请
                            modal.destroy();
                            break;
                        case 1://批量审批
                            modal.destroy();
                            that.payReject(priceItems, handler)
                            break;
                        case 2://批量支付
                            modal.destroy();
                            that.payReject(priceItems, handler)
                        default:
                            break;
                    }
                }}
                list={priceItems} count={priceItems.length}></Batch>
        })
    }

    static locateTrigger(orderId, option) {
        Utils.request({
            api: '/api/web/order/loc/trigger',
            params: orderId,
            beforeRequest() {
                option.start()
            },
            afterRequest() {
                option.end()
            },
            success(data) {
                option.handler()
                Utils.info({
                    title: "校验结果",
                    content: <div>
                        <div style={{ textAlign: 'center', padding: 6, fontWeight: 'bold' }}>{data ? '通过' : '不通过'}</div>
                        <div style={{ textAlign: 'center', padding: 6 }}>{data ? '轨迹校验通过，您可以申请支付了！' :
                            <div>
                                轨迹校验未通过，该订单流转为异常订单。
                            <div>请先进行异常申诉！</div>
                            </div>}</div>
                    </div>,
                    okText: "知道了",
                })
            }
        });
    }

    static getUpLoadProps(handler) {
        return {
            name: 'files',
            action: Utils.FILE_UPLOAD,
            headers: {
                authorization: 'authorization-text',
            },
            accept: "image/jpg,image/jpeg,image/png,image/bmp",
            data: {
                meta: JSON.stringify({
                    companyId: Storage.get('userInfo').companyId.toString(),
                    userId: Storage.get('userInfo').id.toString(),
                })
            },
            showUploadList: false,
            onChange(info) {
                if (info.file.status === 'done') {
                    handler(info.file.response.body.resUrls[0])
                } else if (info.file.status === 'error') {
                    Utils.Message.error(`上传失败！`);
                }
            },
        }
    }

    static downLoadContractTemplate() {
        Utils.downloadSource(Utils.getInvoiceModel().contractTemplate, '运输协议模板.png')
    }

}

window.getOrderUtils = function () {
    return OrderUtils;
}