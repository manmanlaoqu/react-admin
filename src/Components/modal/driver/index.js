//弹框---司机详情
import React from 'react';

import { Spin, Icon, Select, Table } from 'antd'
import UpLoad from '../../lib/upButton'
import ImageViewer from '../../lib/imageViewer'
import CImg from '../../lib/checkableImg'
import Loading from '../../lib/loading'
import Button from '../../lib/button'
import ModifyBankData from '../modifyBankData'
import Utils from 'utils/utils'
import OrderUtils from '../../../lib/orderUtils'
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import Storage from 'gc-storage/es5';
import './index.scss'

const Option = Select.Option;
const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
let cityTree = Storage.get('dictionary').location, cityMap = {};
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            driver: this.props.driver || {},
            listData: this.props.driver.driverBindPayeeList || [],
            oilBtn: '修改',
            oilEdit: false,
            msgSent: true,
            isNotSame: true,
            isNotSignal: false,
            restifyStatus: true,
            isEditBankData: true,
            showErrorMsg: false
        };
        this.phoneMap = {};
        this.columns = [{
            title: '收款人',
            dataIndex: 'name',
        }, {
            title: '身份证号',
            dataIndex: 'idCardNo',
        },
        {
            title: '银行卡号',
            dataIndex: 'bankAccountNo',
        }, {
            title: '手机号',
            dataIndex: 'phone',
        }, {
            title: '操作',
            render: (row) => {
                return <div style={{ textAlign: 'center' }}>
                    <span className='click-th-main' onClick={this.delete.bind(this, row)}>解除关联</span>
                </div>
            }
        }]


        this.phoneMap[this.state.driver.phone] = true;
        this.modifyParam = {
            driver: {},
            ext: {}
        };
        this.state.province = cityTree.map((province) => {
            cityMap[province.code] = province.nodes;
            return {
                code: province.code,
                name: province.name
            }
        });
        if (this.state.driver.ext) {
            this.modifyParam.ext = JSON.parse(this.state.driver.ext);
            this.state.ext = JSON.parse(this.state.driver.ext);
            let ext = this.state.ext;
            if (this.state.ext.bankCityCode) {
                this.state.city = cityMap[ext.bankProvinceCode];
                this.state.bankProvince = this.state.bankProvince;
                this.state.bankProvinceCode = ext.bankProvinceCode;
                this.state.bankCity = ext.bankCity;
                this.state.bankCityCode = ext.bankCityCode;
            } else {
                this.initCity()
            }
        } else {
            this.state.ext = {};
            this.initCity()
        }
    }

    initCity() {
        this.state.city = cityMap[this.state.province[0].code];
        this.state.bankProvince = this.state.province[0].name;
        this.state.bankProvinceCode = this.state.province[0].code;
        this.state.bankCity = cityMap[this.state.province[0].code][0].name;
        this.state.bankCityCode = cityMap[this.state.province[0].code][0].code;
    }

    getListData() {
        var that = this;
        Utils.request({
            api: '/api/web/resource/driver/beneficiary/list',
            // api:'/api/web/resource/driver/list',
            params: {
                // pageNum: 1,
                // pageSize: 2
                phone: this.state.driver.phone,
            },
            beforeRequest() {
                that.setState({
                    listloading: true
                })
            },
            afterRequest() {
                that.setState({
                    listloading: false
                })
            },
            success: function (data) {
                that.setState({
                    listData: data.data
                })
            }
        })
    }

    componentDidMount() {
        if (this.props.editable) {
            if (this.state.driver.idCardImg1 && this.uploader1) {
                this.uploader1.setPicData([Utils.toFileImg(this.state.driver.idCardImg1)])
            }
            if (this.state.driver.idCardImg2 && this.uploader2) {
                this.uploader2.setPicData([Utils.toFileImg(this.state.driver.idCardImg2)])
            }
            if (this.state.driver.driverLicencePic && this.uploader3) {
                this.uploader3.setPicData([Utils.toFileImg(this.state.driver.driverLicencePic)])
            }
        }
    }

    initOcr(img, field) {
        let that = this;
        Utils.request({
            api: '/api/internal/common/ocr',
            params: {
                ocrRecogType: field === 'idCardImg1' ? 'ID_CARD_IMG1' : 'DRIVER_LICENCE_PIC',
                imgUrl: img
            },
            beforeRequest() {
                that.setState({
                    loading: true
                })
            },
            afterRequest() {
                that.setState({
                    loading: false
                })
            },
            success(data) {
                if (data.driverResp) {
                    if (field === 'idCardImg1') {
                        that.setState({
                            ocrIdCardNum1: data.driverResp.idCardNo,
                            ocrIdCardName1: data.driverResp.userName,
                        })
                    } else {
                        that.setState({
                            ocrIdCardNum2: data.driverResp.idCardNo,
                            ocrIdCardName2: data.driverResp.userName,
                        })
                    }
                }
            }
        })
    }


    handleChange(fileList, fileKey) {
        if (fileKey === 'idCardImg1') {
            this.recordModify('', 'driver', 'name');
            this.recordModify('', 'driver', 'idCardImg1');
            this.recordModify('', 'driver', 'idCardNum');
            this.recordModify('', 'ext', 'address');
            this.setState({
                ocrIdCardName1: '',
                ocrIdCardNum1: ''
            })
        } else if (fileKey === 'driverLicencePic') {
            this.recordModify('', 'driver', 'driverLicencePic');
            this.setState({
                ocrIdCardName2: '',
                ocrIdCardNum2: ''
            })
        } else {
            this.setState({
                idCardImg2: ''
            })
        }
        if (!fileList[0]) {
            return;
        }
        if (fileKey === 'idCardImg2') {
            this.recordModify(fileList[0].response.body.resUrls[0], 'driver', 'idCardImg2');
            this.setState({
                idCardImg2: fileList[0].response.body.resUrls[0]
            });
            return;
        }
        this.imgOcr(fileList[0].response.body.resUrls[0], fileKey);
        // this.updateDriver();
    }

    imgOcr(img, field) {
        let that = this;
        Utils.request({
            api: '/api/internal/common/ocr',
            params: {
                ocrRecogType: field === 'idCardImg1' ? 'ID_CARD_IMG1' : 'DRIVER_LICENCE_PIC',
                imgUrl: img
            },
            beforeRequest() {
                that.setState({
                    loading: true
                })
            },
            afterRequest() {
                that.setState({
                    loading: false,
                    verified: true
                })
            },
            success(data) {
                switch (field) {
                    case 'idCardImg1':
                        if (data.driverResp) {
                            if (!data.driverResp.userName || !data.driverResp.idCardNo) {
                                if (that.uploader1) {
                                    that.uploader1.setPicData([])
                                }
                                that.recordModify('', 'driver', 'name');
                                that.recordModify('', 'driver', 'idCardNum');
                                that.recordModify('', 'driver', 'idCardImg1');
                                Utils.Message.warning('请上传正确的证件照')
                            } else {
                                that.recordModify(data.driverResp.userName, 'driver', 'name');
                                that.recordModify(data.driverResp.idCardNo, 'driver', 'idCardNum');
                                that.recordModify(data.driverResp.address, 'ext', 'address');
                                that.recordModify(img, 'driver', 'idCardImg1');
                                that.setState({
                                    idCardName: data.driverResp.userName,
                                    ocrIdCardName1: data.driverResp.userName,
                                    ocrIdCardNum1: data.driverResp.idCardNo,
                                })
                            }
                        }
                        break;
                    case 'driverLicencePic':
                        if (data.driverResp) {
                            if (!data.driverResp.userName || !data.driverResp.idCardNo) {
                                if (that.uploader3) {
                                    that.uploader3.setPicData([])
                                }
                                that.recordModify('', 'driver', 'driverLicencePic');
                                Utils.Message.warning('请上传正确的证件照')
                            } else {
                                that.recordModify(img, 'driver', 'driverLicencePic');
                                that.setState({
                                    transportCardName: data.driverResp.userName,
                                    ocrIdCardName2: data.driverResp.userName,
                                    ocrIdCardNum2: data.driverResp.idCardNo,
                                }, function () {

                                })
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
        })
    }

    updateDriver() {
        this.props.onParamSet(this.modifyParam);
        this.setState({
            ...this.state,
            driver: {
                ...this.state.driver,
                ...this.modifyParam.driver
            },
            ext: {
                ...this.modifyParam.ext
            }
        })
    }
    resendMsg(driver) {
        let that = this;
        that.setState({
            isNotSame: false
        })
        Utils.request({
            // api: '/api/internal/common/driverphoneloc',
            api: '/api/external/common/lbs/opensms',
            params: {
                phone: driver.phone
            },
            beforeRequest() {
                that.setState({
                    btnloading: true
                })
            },
            afterRequest() {
                that.setState({
                    btnloading: false
                })
            },
            success(data) {
                Utils.Message.success("定位授权短信发送成功，请回复Y授权定位！")
            }
        });
    }
    sendMsg() {

        if (this.state.msgSent) {
            if (this.state.fromOcr) {
                this.recordModify('', 'driver', 'phone');
                this.setState({
                    msgSent: false,
                })
            } else {
                if (that.uploader1) {
                    that.uploader1.setPicData([])
                }
                if (that.uploader2) {
                    that.uploader2.setPicData([])
                }
                if (that.uploader3) {
                    that.uploader3.setPicData([])
                }
                this.recordModify('', 'driver', 'phone');
                this.recordModify('', 'driver', 'name');
                this.recordModify('', 'driver', 'idCardNum');
                this.recordModify('', 'driver', 'idCardImg1');
                this.recordModify('', 'driver', 'idCardImg2');
                this.recordModify('', 'driver', 'driverLicencePic');
                this.recordModify('', 'driver', 'bankAccountNo');
                this.recordModify('', 'driver', 'bankUserName');
                this.recordModify('', 'driver', 'bankCardPhone');
                this.recordModify('', 'driver', 'bankIdCardNum');
                // this.recordModify('', 'ext', 'address');
                this.setState({
                    fromOcr: false,
                    msgSent: false,
                    isNotSame: false
                });
            }
            return;
        }
        let that = this; that.setState({
            btnloading: true
        });
        let done1 = false, done2 = false;
        Utils.request({
            // api: '/api/internal/common/driverphoneloc',
            api: '/api/external/common/lbs/opensms',
            params: {
                phone: this.state.driver.phone
            },
            success(data) {
                that.phoneMap[that.state.driver.phone] = true;
                done1 = true;
                if (done2) {
                    that.setState({
                        btnloading: false,
                    })
                }
            }
        });
        Utils.request({
            api: this.props.queryApi,
            params: {
                phone: this.state.driver.phone
            },
            success(data) {
                done2 = true;
                if (done1) {
                    that.setState({
                        btnloading: false
                    })
                }
                if (!data.phoneAdded) {
                    done2 = 1;
                    that.state.fromOcr = false;
                    if (data.name) {
                        that.recordModify(data.name, 'driver', 'name');
                        that.recordModify(data.idCardNum, 'driver', 'idCardNum');
                        that.recordModify(data.idCardImg1, 'driver', 'idCardImg1');
                        that.recordModify(data.idCardImg2, 'driver', 'idCardImg2');
                        that.recordModify(data.driverLicencePic, 'driver', 'driverLicencePic');
                        // that.recordModify(data.address, 'ext', 'address');
                        that.setState({
                            fromOcr: false,
                            msgSent: true,
                        });
                        if (that.uploader1) {
                            that.uploader1.setPicData([Utils.toFileImg(data.idCardImg1)])
                        }
                        if (that.uploader2) {
                            that.uploader2.setPicData([Utils.toFileImg(data.idCardImg2)])
                        }
                        if (that.uploader3) {
                            that.uploader3.setPicData([Utils.toFileImg(data.driverLicencePic)])
                        }
                    } else {
                        that.setState({
                            msgSent: true,
                        });
                    }
                } else {
                    done2 = 2;
                    Utils.Message.error('该手机号已被添加！')
                    that.setState({
                        msgSent: false,
                        driver: {
                            ...that.state.driver,
                            phone: ''
                        }
                    })
                }
            }
        })
    }

    recordModify(val, st, key) {
        this.modifyParam[st][key] = val;
        this.updateDriver();
    }

    authSuccess() {
        if ((this.state.ocrIdCardNum1 && this.state.ocrIdCardNum2) && this.state.ocrIdCardNum1 != this.state.ocrIdCardNum2) {
            return false;
        }
        if ((this.state.ocrIdCardName1 && this.state.ocrIdCardName2) && this.state.ocrIdCardName1 != this.state.ocrIdCardName2) {
            return false
        }
        return true;
    }

    checkBankAccount() {
        if (!this.bankAccountChanged) {
            return;
        }
        let that = this;
        that.recordModify('', 'driver', 'bankCode');
        if (this.state.driver.bankAccountNo && this.state.driver.bankAccountNo.length < 12) {
            that.setState({
                ...this.state,
                driver: {
                    ...that.state.driver,
                    bankName: <span style={{ color: 'red', padding: '0' }}>无效银行卡</span>
                }
            })
            Utils.Message.warning('无效的银行卡号！');
            return;
        }
        if (!this.state.driver.bankAccountNo) {
            return;
        }
        Utils.request({
            api: '/api/external/common/bankaccountinfo',
            params: {
                bankAccountNo: this.state.driver.bankAccountNo
            },
            beforeRequest() {
                that.setState({
                    bankCardChecking: true
                })
                that.props.disabled(true)
            },
            afterRequest() {
                that.setState({
                    bankCardChecking: false
                })
                that.props.disabled(false)
            },
            success: function (data) {
                that.bankAccountChanged = false;
                if (data.bankCardInfo.isEnabled === 1 && data.bankCardInfo.isValid === 1) {
                    that.recordModify(data.bankCardInfo.bankName, 'driver', 'bankName');
                    that.recordModify(data.bankCardInfo.bankCode, 'driver', 'bankCode');
                } else {
                    that.setState({
                        ...this.state,
                        driver: {
                            ...that.state.driver,
                            bankName: <span style={{ color: 'red', padding: '0' }}>不支持该卡</span>
                        }
                    })
                    Utils.Message.warning('不支持该银行卡！')
                }

            }
        })
    }

    bankLoading() {
        let st = { position: 'absolute', right: '0', top: '15px', textAlign: 'center', borderLeft: '1px solid #ccc', opacity: '0.7', padding: '0 6px' };
        if (this.state.bankCardChecking) {
            return <span style={st}><Spin indicator={antIcon} /></span>
        } else {
            return <span style={st}>{this.state.driver.bankName}</span>
        }
    }

    disabledInp() {
        if (!this.state.driver.phone || !this.phoneMap[this.state.driver.phone]) {
            Utils.Message.warning('请先填写手机并授权定位！');
            return;
        }
    }

    restifyBankData(type) {
        //false为取消修改 true为修改

        this.setState({
            restifyStatus: !this.state.restifyStatus
        })
        switch (type) {
            case 'restify':
                this.setState({
                    bankUserName: '',
                    bankAccountNo: '',
                    bankIdCardNum: '',
                    bankCardPhone: '',
                    isEditBankData: true,

                })
                break;
            case 'cancelRestify':
                this.setState({
                    bankUserName: this.state.driver.bankUserName,
                    bankAccountNo: this.state.driver.bankAccountNo,
                    bankIdCardNum: this.state.driver.bankIdCardNum,
                    bankCardPhone: this.state.driver.bankCardPhone,
                    isEditBankData: false,
                })
                break;
        }

    }
    modify(row) {
        let params = {
            phone: this.state.driver.phone,

        };
        let driverBeneficiaryReq = {}
        var that = this;
        let onParam = function (data, data2) {
            driverBeneficiaryReq = {
                bankUserName: data.driver.bankUserName || data2.bankUserName,
                bankAccountNo: data.driver.bankAccountNo || data2.bankAccountNo,
                bankCardPhone: data.driver.bankCardPhone || data2.bankCardPhone,
                bankIdCardNum: data.driver.bankIdCardNum || data2.bankIdCardNum,
                bankCode: data.driver.bankCode || data2.bankCode,
                bankName: data.driver.bankName || data2.bankName,
                id: row.id
            }
            params = {
                ...params,
                driverBeneficiaryReq
            };
            that.setState({
                params: params,
            })
        }
        let modal = Utils.modal({
            title: '修改收款人',
            width: '770px',
            content: <ModifyBankData bankData={row} onParam={onParam} />,
            okText: '提交',
            cancelText: '取消',
            onOk: function () {
                if (!params.driverBeneficiaryReq) {
                    modal.destroy()
                    return
                }
                modal.update({
                    okButtonProps: {
                        loading: true
                    }
                })
                Utils.request({
                    api: '/api/admin/resource/driver/beneficiary/upsert',
                    params: params,
                    beforeRequest() {
                        that.setState({
                            listloading: true
                        })
                    },
                    afterRequest() {
                        that.setState({
                            listloading: false
                        })
                    },
                    success: function (data) {

                        //刷新列表
                        that.getListData()
                        if (!data.msg) {
                            modal.destroy()
                            Utils.Message.success('修改成功！')
                        }
                    },
                    handleError(result) {
                        modal.update({
                            okButtonProps: {
                                loading: false
                            }
                        })
                        Utils.Message.warning(result.head.errorMessage)
                        // that.modify(params)
                    }
                })

            },

        })
    }

    addBankUser() {
        let params = {
            phone: this.state.driver.phone,
        };
        let driverBeneficiaryReq = {}
        var that = this;
        let onParam = function (data) {
            driverBeneficiaryReq = {
                bankUserName: data.driver.bankUserName,
                bankAccountNo: data.driver.bankAccountNo,
                bankCardPhone: data.driver.bankCardPhone,
                bankIdCardNum: data.driver.bankIdCardNum,
            }
            params = {
                ...params,
                driverBeneficiaryReq
            };
        }

        let modal = Utils.modal({
            title: '新增收款人',
            width: '780px',
            content: <ModifyBankData onParam={onParam} />,
            okText: '提交',
            cancelText: '取消',
            onOk: function () {
                if (!params.driverBeneficiaryReq) {
                    Utils.Message.warning('请填写相关收款人信息')
                    return
                }
                if (!params.driverBeneficiaryReq.bankUserName) {
                    Utils.Message.warning('请输入收款人姓名')
                    return
                }
                if (!params.driverBeneficiaryReq.bankAccountNo) {
                    Utils.Message.warning('请输入收款人银行卡')
                    return
                }
                if (!params.driverBeneficiaryReq.bankIdCardNum) {
                    Utils.Message.warning('请输入收款人身份证号')
                    return
                }
                if (!params.driverBeneficiaryReq.bankCardPhone) {
                    Utils.Message.warning('请填写手机号')
                    return
                }
                if (!Utils.PHONE_REG.test(params.driverBeneficiaryReq.bankCardPhone)) {
                    Utils.Message.warning('请填写正确的手机号')
                    return
                }
                modal.update({
                    okButtonProps: {
                        loading: true
                    }
                })
                Utils.request({
                    api: '/api/admin/resource/driver/beneficiary/upsert',
                    params: params,
                    beforeRequest() {
                        that.setState({
                            listloading: true
                        })
                    },
                    afterRequest() {
                        that.setState({
                            listloading: false
                        })
                    },
                    success(data) {
                        //刷新列表
                        if (!data.msg) {
                            modal.destroy();
                            Utils.Message.success('新增收款人成功！')
                        } else {
                            Utils.Message.warning('收款人信息有误')
                        }
                        that.getListData()
                    },
                    handleError(result) {
                        Utils.Message.warning(result.head.errorMessage)
                        modal.update({
                            okButtonProps: {
                                loading: false
                            }
                        })
                    }
                })
            },

        })
    }

    bindPayee(payee) {
        let that = this
        Utils.request({
            api: Utils.getApi('司机管理', '关联收款人'),
            params: {
                driverPhone: that.state.driver.phone,
                payeeId: payee.id
            },
            beforeRequest() {
                that.setState({
                    listloading: true
                })
            },
            afterRequest() {
                that.setState({
                    listloading: false
                })
            },
            success(data) {
                //刷新列表
                if (!data.msg) {
                    Utils.Message.success('关联收款人成功！')
                    that.state.listData.push(payee)
                    that.setState({
                        listData: that.state.listData
                    })
                } else {
                    Utils.Message.warning('收款人信息有误')
                }
            },
        })
    }

    delete(row) {
        var that = this;
        let deleteModel = Utils.modal({
            content: '确定解除司机与该收款人的关联？',
            width: '300px',
            onOk: function () {
                return Utils.request({
                    api: Utils.getApi('司机管理', '解除收款人'),
                    params: {
                        driverPhone: that.state.driver.phone,
                        payeeId: row.id,
                    },
                    beforeRequest() {
                        that.setState({
                            listloading: true
                        })
                    },
                    afterRequest() {
                        that.setState({
                            listloading: false
                        })
                    },
                    success: function (data) {
                        deleteModel.destroy();
                        let list = []
                        that.state.listData.map((payee) => {
                            if (payee.id != row.id) {
                                list.push(payee)
                            }
                        })
                        that.setState({
                            listData: list
                        })
                        Utils.Message.success('删除成功')
                    },
                })
            }
        })
    }

    sendLocMsg(phone) {
        let that = this;
        Utils.request({
            api: '/api/external/common/lbs/opensms',
            params: {
                phone: phone
            },
            beforeRequest() {
                that.setState({
                    btnloading: true,
                })
            },
            afterRequest() {
                that.setState({
                    btnloading: false,
                })
            },
            success(data) {
                Utils.Message.success('定位授权短信已发送，请及时回复Y')
            }
        });
    }

    render() {
        const { driver, listData } = this.state;
        const { editable } = this.props;
        const that = this
        const payeeExistMap = (function (list) {
            let map = {}
            list.map(item => {
                if (item.bankAccountNo) {
                    map[item.bankAccountNo] = true
                }
            })
            return map
        })(listData)

        return (
            <div style={{ position: 'relative' }} className='upLoadChangeStyle'>
                {(driver.perAuthStatus === 3 && driver.auditRemark && !this.authSuccess()) ? <div className="exam-remark">
                    <i className="iconfont icon-gantanhao" style={{ top: 0, fontSize: '13px' }}></i>
                    {this.state.verified ? <span>证件信息不匹配！</span> : <span>认证失败原因：<span>{driver.auditRemark}</span></span>}
                </div> : ''}

                <div className="ant-table ant-table-default">
                    <div className="ant-table-content">
                        {editable ? <div className="driver-group-head">填写司机手机号、姓名可先下单</div> : null}
                        <div className="ant-table-body form-table" style={{ borderTop: '#E2E2E3' }}>
                            <div className="group-head">
                                <span>
                                    <div className="mod-form-title">司机信息</div>
                                </span>
                            </div>
                            {this.state.loading ? <div style={{ position: 'absolute', width: '736px', height: '455px', zIndex: '10', cursor: 'progress' }}><div style={{ position: 'relative', width: '100%', height: '100%' }}><Loading /></div></div> : ''}
                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        {/* <td className="head">
                                            <span className="title"><span className={editable ? "needed" : "needed none"}>*</span>手机号</span>
                                            <input style={{ width: '120px', margin: '0 16px', padding: '0 8px' }}
                                                readOnly={driver.perAuthStatus === 2 ? true : this.state.msgSent}
                                                value={driver.phone}
                                                onChange={(e) => this.recordModify.bind(this, e.target.value.toNum(), 'driver', 'phone')()}
                                                maxLength={11} type="text" />


                                            {driver.perAuthStatus === 2 ?
                                                <div style={{ display: 'inline-block' }}>
                                                    {driver.locAuthStatus != 1 ? <Button loading={this.state.btnloading} className="common" text="重新发送短信" onClick={this.resendMsg.bind(this, driver)} /> : ''}
                                                    {driver.locAuthStatus ? '' : <span style={{ fontSize: '12px', marginLeft: '6px' }}>
                                                        <i style={{ color: '#ff7800' }} className="iconfont icon-info"></i>未授权</span>}
                                                    {driver.locAuthStatus === 1 ? <span style={{ fontSize: '12px', marginLeft: '6px' }}>
                                                        <i style={{ color: '#66c386' }} className="iconfont icon-right"></i>已授权</span> : ''}
                                                    {driver.locAuthStatus === 2 ? <span style={{ fontSize: '12px', marginLeft: '6px' }}>
                                                        <i style={{ color: 'red' }} className="iconfont icon-fail1f"></i>已拒绝</span> : ''}
                                                </div> : ''}
                                            {driver.perAuthStatus != 2 ? <div style={{ display: 'inline-block' }}>
                                                <Button loading={this.state.btnloading} className="common" text={this.state.msgSent ? '更换手机号' : '发送短信'} onClick={this.sendMsg.bind(this, driver)} />
                                                {driver.locAuthStatus ? '' : <span style={{ fontSize: '12px', marginLeft: '6px' }}>
                                                    <i style={{ color: '#ff7800' }} className="iconfont icon-info"></i>未授权</span>}
                                                {driver.locAuthStatus === 1 ? <span style={{ fontSize: '12px', marginLeft: '6px' }}>
                                                    <i style={{ color: '#66c386' }} className="iconfont icon-right"></i>已授权</span> : ''}
                                                {driver.locAuthStatus === 2 ? <span style={{ fontSize: '12px', marginLeft: '6px' }}>
                                                    <i style={{ color: 'red' }} className="iconfont icon-fail1f"></i>已拒绝</span> : ''}
                                                {this.state.msgSent ? '' : <span style={{ fontSize: '12px', marginLeft: '6px' }}>
                                                    <i style={{ color: '#ff7800' }} className="iconfont icon-info"></i>
                                                    点击发送短信，该手机号将会受到定位授权的短信通知！</span>}
                                            </div> : ''}
                                        </td> */}
                                        <td className="head">
                                            <span className="title"><span className={editable ? "needed" : "needed none"}>*</span>手机号</span>
                                        </td>
                                        <td className="column">
                                            <input
                                                readOnly={true}
                                                value={driver.phone}
                                                className="sm"
                                                // onChange={(e) => this.input.bind(this, e.target.value.toNum(), 'phone')()}
                                                maxLength={11} type="text" />
                                            {driver.locAuthStatus != 1 ? <Button loading={this.state.btnloading} className="common" text={'重新发送短信'} onClick={() => {
                                                this.sendLocMsg(driver.phone)
                                            }} /> : <span style={{ color: '#66c386', fontSize: 12 }}> <i className="iconfont icon-right"></i>已授权</span>}
                                        </td>
                                        <td className="head">
                                            <span className="title"><span className={editable ? "needed" : "needed none"}>*</span>司机姓名</span>
                                        </td>
                                        <td className="column">
                                            <input readOnly={!editable} placeholder="司机姓名"
                                                onChange={(e) => this.recordModify.bind(this, e.target.value, 'driver', 'name')()}
                                                value={driver.name} />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {editable ? <div className="driver-group-head nt">请在申请支付前，完成司机认证</div> : null}
                        <div className="ant-table-body form-table" style={{ borderTop: '#E2E2E3' }}>
                            {editable ? <div className="group-head">
                                <span>
                                    <div className="mod-form-title">司机信息</div>
                                </span>
                            </div> : null}
                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title"><span className={editable ? "needed" : "needed none"}>*</span>身份证照片</span>
                                        </td>
                                        {this.state.driver.idCardAuthStatus != 1 ? <td className="column center">
                                            <div className={`changeIcCard1Style ${this.state.driver.idCardAuthStatus == 3 ? 'failed' : ''}`} onClick={this.disabledInp.bind(this)} style={{ display: 'inline-block', textAlign: 'center', marginRight: '12px' }}>
                                                <UpLoad ref={ele => { this.uploader1 = ele }}
                                                    cropper={true}
                                                    aspectRatio={16 / 10}
                                                    accept="image/jpg,image/jpeg,image/png,image/bmp"
                                                    style={{ display: 'inline-block', marginBottom: '4px' }}
                                                    // className={this.state.fromOcr?'':'dis-remove'} 
                                                    disabled={!this.state.driver.phone || !this.phoneMap[this.state.driver.phone]}
                                                    handleChange={(fileList) => this.handleChange.bind(this, fileList, 'idCardImg1')()} max={1} />
                                                <span style={{ marginTop: '0px', display: 'block' }}>身份证正面</span>
                                            </div>
                                            <div className={`changeIcCard2Style ${this.state.driver.idCardAuthStatus == 3 ? 'failed' : ''}`} onClick={this.disabledInp.bind(this)} style={{ display: 'inline-block', textAlign: 'center', }}>
                                                <UpLoad ref={ele => { this.uploader2 = ele }}
                                                    cropper={true}
                                                    aspectRatio={16 / 10}
                                                    accept="image/jpg,image/jpeg,image/png,image/bmp"
                                                    // className={this.state.fromOcr?'':'dis-remove'} 
                                                    style={{ display: 'inline-block', marginBottom: '4px' }}
                                                    disabled={!this.state.driver.phone || !this.phoneMap[this.state.driver.phone]}
                                                    handleChange={(fileList) => this.handleChange.bind(this, fileList, 'idCardImg2')()} max={1} />
                                                <span style={{ marginTop: '0px', display: 'block' }}>身份证反面</span>
                                            </div>
                                        </td> : <td className="column center">
                                                <span style={{ padding: '0 12px', display: 'inline-block' }}>
                                                    <CImg onClick={() => this.setState({ ImageViewer: true, ImageViewerIndex: 0 })} style={{ maxHeight: '80px', margin: '12px' }} src={driver.idCardImg1} />
                                                    <CImg onClick={() => this.setState({ ImageViewer: true, ImageViewerIndex: 1 })} style={{ maxHeight: '80px', margin: '12px' }} src={driver.idCardImg2} />
                                                </span>
                                            </td>}
                                        <td className='head'>
                                            <span className="title"><span className={editable ? "needed" : "needed none"}>*</span>驾驶证照片</span>
                                        </td>
                                        {this.state.driver.driverLicenseAuthStatus != 1 ? <td className='column center'>
                                            <div className={`changeDriverStyle ${this.state.driver.driverLicenseAuthStatus == 3 ? 'failed' : ''}`} onClick={this.disabledInp.bind(this)} style={{ display: 'inline-block', textAlign: 'center', margin: '12px 12px' }}>
                                                <UpLoad ref={ele => { this.uploader3 = ele }}
                                                    cropper={true}
                                                    aspectRatio={16 / 10}
                                                    accept="image/jpg,image/jpeg,image/png,image/bmp"
                                                    // className={this.state.fromOcr?'':'dis-remove'} 
                                                    style={{ display: 'inline-block', marginBottom: '4px' }}
                                                    disabled={!this.state.driver.phone || !this.phoneMap[this.state.driver.phone]}
                                                    handleChange={(fileList) => this.handleChange.bind(this, fileList, 'driverLicencePic')()} max={1} />
                                                <span style={{ marginTop: '0px', display: 'block' }}>驾驶证正页</span>
                                            </div>
                                        </td> :
                                            <td className="column center">
                                                <span style={{ padding: '0 12px', display: 'inline-block' }}>
                                                    <CImg onClick={() => this.setState({ ImageViewer: true, ImageViewerIndex: 2 })} style={{ maxHeight: '80px', margin: '12px' }} src={driver.driverLicencePic} />
                                                </span>
                                            </td>}

                                    </tr>
                                    <tr className="ant-table-row">
                                        <td className='head'>
                                            <span className="title"><span className={editable ? "needed" : "needed none"}>*</span>身份证号</span>

                                        </td>
                                        <td className='column center'>
                                            <input maxLength={18}
                                                readOnly={!editable} placeholder="身份证号"
                                                value={driver.idCardNum}
                                                onClick={this.disabledInp.bind(this)}
                                                onChange={(e) => this.recordModify.bind(this, e.target.value.toIdcard(), 'driver', 'idCardNum')()} type="text" />
                                        </td>
                                        <td className='head'>
                                            <span className="title"><span className={editable ? "needed" : "needed none"}>*</span>常跑线路</span>
                                        </td>
                                        <td className='column '>
                                            <input onClick={this.disabledInp.bind(this)} maxLength={50}
                                                placeholder={editable ? "如：北京,上海" : ''}
                                                readOnly={!editable}
                                                onChange={(e) => this.recordModify.bind(this, e.target.value, 'driver', 'runLine')()}
                                                value={driver.runLine} type="text" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {/* <div className='ant-table-body form-table'>
                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        <td className='head'>
                                            <span className="title"><span className={editable ? "needed" : "needed none"}>*</span>常跑线路</span>
                                        </td>
                                        <td className='column '>
                                            <input onClick={this.disabledInp.bind(this)} maxLength={50}
                                                placeholder={editable ? "如：北京,上海" : ''}
                                                readOnly={!editable}
                                                onChange={(e) => this.recordModify.bind(this, e.target.value, 'ext', 'routes')()}
                                                value={ext.routes} type="text" />
                                        </td>
                                        <td className='head'>
                                            <span className="title">最近用车</span>

                                        </td>
                                        <td className='column '>
                                            <input onClick={this.disabledInp.bind(this)} maxLength={50}
                                                value={driver.usedVehicle} type="text" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div> */}
                        <div className="driver-group-head nt">
                            <span>关联收款人</span>
                            {(listData && listData.length >= 3) || !Utils.getApi('司机管理', '关联收款人') ? null : <span style={{ marginLeft: '24px' }}
                                className="click-th-main"
                                onClick={() => {
                                    OrderUtils.chosepayee({}, {
                                        disabledInfo: '收款人已存在',
                                        title: '选择关联收款人',
                                        disable: (payeeitem) => {
                                            return !Utils.isEmpty(payeeExistMap[payeeitem.bankAccountNo])
                                        }
                                    }, (payeeChosen) => {
                                        that.bindPayee(payeeChosen)
                                    })
                                }}>+新增关联收款人</span>}
                        </div>
                        <div className='bankTable'>
                            {listData && listData.length > 0 ? <LocaleProvider locale={zh_CN}>
                                <Table
                                    dataSource={listData}
                                    columns={this.columns}
                                    loading={this.state.listloading} />
                            </LocaleProvider> : null}
                        </div>
                        {/* <ImageViewer thumb={'_600-600'} handleCancel={() => this.setState({ ImageViewer: false })} list={[driver.idCardImg1, driver.idCardImg2, driver.driverLicencePic]} show={this.state.ImageViewer} index={this.state.ImageViewerIndex} /> */}
                    </div>
                    {driver.locAuthStatus != 1 ? <div style={{
                        textAlign: 'center',
                        margin: '8px 0 0 0',
                        color: '#ff7800',
                        paddingTop: '12px',
                        marginTop: '24px'
                    }}>
                        <i className="iconfont icon-info"></i>司机将会收到定位授权短信，提醒司机回复“Y”，避免订单无轨迹，不能开票的风险。</div> : null}
                </div>
                <ImageViewer thumb={'_600-600'} handleCancel={() => this.setState({ ImageViewer: false })} list={[driver.idCardImg1, driver.idCardImg2, driver.driverLicencePic]} show={this.state.ImageViewer} index={this.state.ImageViewerIndex} />
            </div>
        )
    }
}
