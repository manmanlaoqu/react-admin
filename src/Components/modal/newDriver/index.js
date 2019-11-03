//弹框---新增司机
import React from 'react';
import UpLoad from '../../lib/upButton'
import CImg from '../../lib/checkableImg'
import { Spin, Icon, Select } from 'antd'
import ImageViewer from '../../lib/imageViewer'
import Loading from '../../lib/loading'
import Button from '../../lib/button'
import Utils from 'utils/utils'
import Storage from 'gc-storage/es5';

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
const Option = Select.Option;
let cityTree = Storage.get('dictionary').location, cityMap = {};
export default class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            authStatusId: '',//授权状态
            fromOcr: true,
            restifyStatus: true,
            isEditBankData: true,
            authStatusId: -1,
            status: true,//按钮文字,
            backfill: true,
            clickable: false, //是否可点击,
            rePhone: Storage.get('userInfo').userPhone,
            province: cityTree.map((province) => {
                cityMap[province.code] = province.nodes;
                return {
                    code: province.code,
                    name: province.name
                }
            }),
            name2: '',
            isNotSame: false
        }
        this.phoneMap = {};
        this.state.city = cityMap[this.state.province[0].code];
        this.state.bankProvince = this.state.province[0].name;
        this.state.bankProvinceCode = this.state.province[0].code;
        this.state.bankCity = cityMap[this.state.province[0].code][0].name;
        this.state.bankCityCode = cityMap[this.state.province[0].code][0].code;
    }

    checkPhoneStatus(value) {
        var that = this;
        if (Utils.PHONE_REG.test(value)) {
            this.state.clickable = false;
            this.state.isEditBankData = true
            this.state.phone = value;
            let _index = 0;
            //控制按钮是否为发短信还是更换手机号
            Utils.request({
                api: '/api/external/common/lbs/checkloc',
                params: {
                    phone: value
                },
                success(data) {
                    //回复过y,已授权 
                    if (!data) {
                        return
                    }
                    that.setState({
                        locSent: data.status !== 'NOT_SEND'
                    })
                    _index = _index + 1;
                    if (_index == 2) {
                        //两次请求都完成
                        that.setState({
                            phoneCleanable: true
                        })
                    }
                }
            });

            // this.checkRestifyStatus(value)
            //是否有信息带出
            Utils.request({
                api: Utils.getApi('司机管理', '查询'),
                params: {
                    phone: this.state.phone
                },
                handleError() {

                },
                success(data) {
                    _index = _index + 1
                    if (_index == 2) {
                        that.setState({
                            phoneCleanable: true
                        })
                    }
                    if (!data.phoneAdded) {
                        // that.state.fromOcr = false;
                        if (data.name) {
                            if (data.ext) {
                                data.ext = JSON.parse(data.ext)
                            } else {
                                data.ext = {}
                            }
                            that.setState({
                                data: data,
                                name: data.name,
                                fromOcr: false,
                                idCardNum: data.idCardNum,
                                address: data.address,
                                idCardImg1: data.idCardImg1,
                                idCardImg2: data.idCardImg2,
                                driverLicencePic: data.driverLicencePic,
                                idCardAuthStatus: data.idCardAuthStatus,
                                driverLicenseAuthStatus: data.driverLicenseAuthStatus,
                                onCopy: true,
                                // bankUserName: data.bankUserName,
                                // bankAccountNo: data.bankAccountNo,
                                // bankIdCardNum: data.bankIdCardNum,
                                // bankCardPhone: data.bankCardPhone,
                                // fromType: data.fromType,
                                // id: data.id,
                                // hasDriverData: true,
                                routes: data.ext.routes,
                                phoneCleanable: true
                                // isEditBankData: true,
                            }, function () {
                                that.props.notifyChange(that.state)
                                if (data.idCardImg1) {
                                    that.imgOcr(data.idCardImg1, 'idCardImg1')
                                    if (data.idCardAuthStatus == 3 || data.idCardAuthStatus == 0) {
                                        if(that.uploader1){
                                            that.uploader1.setPicData([Utils.toFileImg(data.idCardImg1)])
                                        }
                                    }
                                }
                                if (data.idCardImg2) {
                                    // that.imgOcr(data.idCardImg2,'idCardImg2')
                                    if (data.idCardAuthStatus == 3 || data.idCardAuthStatus == 0) {
                                        if(that.uploader2){
                                            that.uploader2.setPicData([Utils.toFileImg(data.idCardImg2)])
                                        }
                                    }
                                }
                                if (data.driverLicencePic) {
                                    that.imgOcr(data.driverLicencePic, 'driverLicencePic')
                                    if (data.driverLicenseAuthStatus == 3 || data.driverLicenseAuthStatus == 0) {
                                        if(that.uploader3){
                                            that.uploader3.setPicData([Utils.toFileImg(data.driverLicencePic)])
                                        }
                                    }
                                }
                            });
                        } else {
                            that.setState({
                                onCopy: false,
                                phoneCleanable: true
                            })
                        }
                    } else {
                        Utils.Message.warning("该手机号已被添加！")
                        that.setState({
                            onCopy: false,
                            phone: '',
                            phoneCleanable: false
                        })
                    }
                }
            })

            that.phoneMap[that.state.phone] = true;
        }
    }

    input(val, key) {
        var that = this
        if (key === 'phone') {
            that.checkPhoneStatus(val)
        }
        this.state[key] = val;
        this.setState({
            ...this.state
        }, function () {
            this.props.notifyChange(this.state)
        })
    }

    bankLoading() {
        let st = { position: 'absolute', right: '0', top: '14px', textAlign: 'center', borderLeft: '1px solid #ccc', opacity: '0.7', padding: '0 6px' };
        if (this.state.bankCardChecking) {
            return <span style={st}><Spin indicator={antIcon} /></span>
        } else {
            return <span style={st}>{this.state.bankName}</span>
        }
    }

    onChange(roleId, obj) {
        this.setState({
            ...this.state,
            roleId: roleId,
            remark: obj.remark
        }, function () {
            this.props.notifyChange(this.state)
        })
    }

    getData() {
        return this.state;
    }

    handleChange(fileList, field) {
        if (!fileList[0]) {
            this.state[field] = null;
            this.setState({
                ...this.state
            }, function () {
                this.props.notifyChange(this.state);
            })
            return;
        }
        if (field == 'idCardImg1') {
            this.setState({
                ocrIdCardName1: '',
                ocrIdCardNum1: '',
                idCardImg1: '',
                idCardNum: '',
                name: '',
                address: ''
            }, function () {
                this.props.notifyChange(this.state);
            })
        } else if (field == 'driverLicencePic') {
            this.setState({
                ocrIdCardName2: '',
                ocrIdCardNum2: '',
            }, function () {
                this.props.notifyChange(this.state);
            })
        } else {
            this.setState({
                idCardImg2: fileList[0].response.body.resUrls[0]
            }, function () {
                this.props.notifyChange(this.state);
            })
            return;
        }
        this.imgOcr(fileList[0].response.body.resUrls[0], field);
    }

    imgOcr(img, field) {
        if (!img) {
            return
        }
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
                if (!data.driverResp) {
                    data.driverResp = {}
                }
                if (!data.driverResp.userName && !data.driverResp.idCardNo) {
                    if (field == 'idCardImg1') {
                        that.setState({
                            name: '',
                            idCardNum: '',
                            address: '',
                            fromOcr: true,
                            // fromOcr: false,
                            idCardImg1: '',
                            ocrIdCardNum1: '',
                            ocrIdCardName1: ''
                        }, function () {
                            that.props.notifyChange(that.state)
                        })
                    } else {
                        that.setState({
                            driverLicencePic: img,
                            ocrIdCardNum2: '',
                            ocrIdCardName2: ''
                        }, function () {
                            that.props.notifyChange(that.state)
                        })
                    }
                    Utils.Message.warning('请上传正确的证件照片')
                } else {
                    if (field === 'idCardImg1') {
                        that.setState({
                            name: data.driverResp.userName,
                            ocrName1: data.driverResp.userName,
                            idCardNum: data.driverResp.idCardNo,
                            idCardImg1: img,
                            ocrIdCardNum1: data.driverResp.idCardNo,
                        }, function () {
                            that.props.notifyChange(that.state)
                        })
                    } else {
                        that.setState({
                            ocrName2: data.driverResp.userName,
                            driverLicencePic: img,
                            ocrIdCardNum2: data.driverResp.idCardNo,
                        }, function () {
                            that.props.notifyChange(that.state)
                        })
                    }
                }
            }
        })
    }


    checkBankAccount() {
        let that = this;
        if (!this.bankAccountChanged) {
            return;
        }
        that.input('', 'bankCode');
        if (this.state.bankAccountNo && this.state.bankAccountNo.length < 12) {
            that.setState({
                bankName: <span style={{ color: 'red', padding: '0' }}>无效银行卡</span>
            })
            Utils.Message.warning('无效的银行卡号！');
            return;
        }
        if (!this.state.bankAccountNo) {
            return;
        }
        Utils.request({
            api: '/api/external/common/bankaccountinfo',
            params: {
                bankAccountNo: this.state.bankAccountNo
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
                if (data.bankCardInfo.isEnabled === 1 && data.bankCardInfo.isValid === 1 && data.bankCardInfo.cardType === 1) {
                    that.input(data.bankCardInfo.bankName, 'bankName')
                    that.input(data.bankCardInfo.bankCode, 'bankCode');
                } else {
                    that.setState({
                        bankName: <span style={{ color: 'red', padding: '0' }}>不支持该卡</span>
                    })
                    Utils.Message.warning('不支持该银行卡！')
                }
            }
        })
    }

    onProvinceChange(province) {
        this.setState({
            bankProvince: province.name,
            bankProvinceCode: province.code,
            city: cityMap[province.code],
            bankCity: cityMap[province.code][0].name,
            bankCityCode: cityMap[province.code][0].code,
        }, function () {
            this.props.notifyChange(this.state)
        })
    }

    onCityChange(city) {
        this.setState({
            bankCity: city.name,
            bankCityCode: city.code,
        }, function () {
            this.props.notifyChange(this.state)
        })
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

    cleanCopyData() {
        if(this.uploader1){
            this.uploader1.setPicData([])
        }
        if(this.uploader2){
            this.uploader2.setPicData([])
        }
        if(this.uploader3){
            this.uploade3.setPicData([])
        }
        this.setState({
            phone: '',
            name: '',
            ocrName: '',
            idCardNum: '',
            ocrIdCardNum1: '',
            // address: '',
            idCardImg1: '',
            idCardImg2: '',
            driverLicencePic: '',
            ocrIdCardNum2: '',
            routes: '',

            onCopy: false,

            phoneCleanable: false,
            idCardAuthStatus: 0,
            driverLicenseAuthStatus: 0
        }, function () {
            this.props.notifyChange(this.state)
        });
    }

    render() {
        // const provinceOptions = this.state.province.map(province => <Option province={province} key={province.code}>{province.name}</Option>);
        // const cityOptions = this.state.city.map(city => <Option city={city} key={city.code}>{city.name}</Option>);
        return (
            <div style={{ position: 'relative' }} className='upLoadChangeStyle'>
                {!this.authSuccess() ? <div className="exam-remark"><span><span className='iconfont icon-gantanhao' style={{ color: 'red', fontSize: '10px', marginRight: '5px', }}></span>司机信息认证失败！原因：提交身份证和驾驶证信息不一致</span></div> : ''}
                {this.state.loading ? <div style={{ position: 'absolute', width: '736px', height: '455px', zIndex: '10', cursor: 'progress' }}><div style={{ position: 'relative', width: '100%', height: '100%' }}><Loading /></div></div> : ''}
                <div className="ant-table ant-table-default">
                    <div className="ant-table-content">
                        <div className="driver-group-head">填写司机手机号、姓名可先下单</div>
                        <div className="ant-table-body form-table" style={{ borderTop: '#E2E2E3' }}>
                            <div className="group-head">
                                <span>
                                    {/* <div className="mod-form-title">司机信息<span style={{ marginLeft: '16px', fontSize: '12px' }}>（上传身份证照片后，系统将自动识别您的身份信息至该页面）</span></div> */}
                                    <div className="mod-form-title">司机信息</div>
                                </span>
                            </div>
                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        {/* <td className="head">
                                            <span className="title"><span className="needed">*</span>手机号</span>
                                            <input style={{ width: '120px', margin: '0 16px', padding: '0 8px' }}
                                                readOnly={!this.state.editable}
                                                value={this.state.phone}
                                                onChange={(e) => this.input.bind(this, e.target.value.toNum(), 'phone')()}
                                                maxLength={11} type="text" />
                                            <Button loading={this.state.btnloading} className="common" disabled={!this.state.clickable} text={!this.state.status
                                                ? '更换手机号' : '发送短信'} onClick={this.onClick.bind(this)} />
                                            {!this.state.status ?
                                                ((this.state.authStatusId !== 1) ?
                                                    <span style={{ fontSize: '12px', marginLeft: '6px' }}>
                                                        <i style={{ color: '#ff7800' }} className="iconfont icon-info"></i>短信已发送，等待司机授权，您可以<span style={{ color: 'rgb(255, 120, 0)', cursor: 'pointer' }}
                                                            onClick={this.reSendMsg.bind(this)}>重新发送短信</span></span> : '')
                                                : <span style={{ fontSize: '12px', marginLeft: '6px' }}> <i style={{ color: '#ff7800' }} className="iconfont icon-info"></i>点击发送短信，该手机号将会收到定位授权的短信通知！</span>}
                                            {this.state.authStatusId == 0 ? <span style={{ fontSize: '12px', marginLeft: '6px', }}> <i style={{ color: '#ff7800' }} className="iconfont icon-info"></i>未授权</span> : ''}
                                            {(this.state.authStatusId == 1) ? <span style={{ fontSize: '12px', marginLeft: '6px', color: '#66c386' }}> <i style={{ color: '#66c386' }} className="iconfont icon-right"></i>已授权</span> : ''}
                                            {this.state.authStatusId == -10 ? <span style={{ fontSize: '12px', marginLeft: '6px' }}> <i style={{ color: 'red' }} className="iconfont icon-info"></i>已拒绝</span> : ''}
                                        </td> */}
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>手机号</span>
                                        </td>
                                        <td className="column">
                                            <input
                                                readOnly={this.state.phoneCleanable}
                                                value={this.state.phone}
                                                className="sm"
                                                onChange={(e) => this.input.bind(this, e.target.value.toNum(), 'phone')()}
                                                maxLength={11} type="text" />
                                            <Button loading={this.state.btnloading} className="common" disabled={!this.state.phoneCleanable} text={'更换手机号'} onClick={() => {
                                                if (this.state.onCopy) {
                                                    this.cleanCopyData();
                                                } else {
                                                    this.setState({
                                                        phone: '',
                                                        phoneCleanable: false
                                                    })
                                                }
                                            }} />
                                        </td>
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>司机姓名</span>
                                        </td>
                                        <td className="column">
                                            <input readOnly={this.state.onCopy} placeholder="司机姓名"
                                                onChange={(e) => this.input.bind(this, e.target.value, 'name')()}
                                                value={this.state.name} />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="driver-group-head nt">请在申请支付前，完成司机认证</div>
                        <div className="ant-table-body form-table" style={{ borderTop: '#E2E2E3' }}>
                            <div className="group-head">
                                <span>
                                    {/* <div className="mod-form-title">司机信息<span style={{ marginLeft: '16px', fontSize: '12px' }}>（上传身份证照片后，系统将自动识别您的身份信息至该页面）</span></div> */}
                                    <div className="mod-form-title">司机信息</div>
                                </span>
                            </div>
                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>身份证照片</span>
                                        </td>
                                        {(this.state.idCardAuthStatus == 1 || this.state.idCardAuthStatus == 2) && this.state.idCardImg1 ?
                                            <td className="column center">
                                                <span style={{ padding: '0 12px', display: 'inline-block' }}>
                                                    <CImg onClick={() => this.setState({ ImageViewer: true, ImageViewerIndex: 0 })} style={{ maxHeight: '80px', margin: '12px' }} src={this.state.idCardImg1} />
                                                    <CImg onClick={() => this.setState({ ImageViewer: true, ImageViewerIndex: 1 })} style={{ maxHeight: '80px', margin: '12px' }} src={this.state.idCardImg2} />
                                                </span>
                                            </td> :
                                            <td className="column center">
                                                <div className={`changeIcCard1Style ${this.state.idCardAuthStatus == 3 ? 'failed' : ''}`} style={{ display: 'inline-block', textAlign: 'center', marginRight: '12px' }}>
                                                    <UpLoad ref={ele => { this.uploader1 = ele }}
                                                        cropper={true}
                                                        aspectRatio={16 / 10}
                                                        className={this.state.hasDriverData ? 'dis-remove' : ''}
                                                        accept="image/jpg,image/jpeg,image/png,image/bmp"
                                                        style={{ display: 'inline-block', marginBottom: '4px' }}
                                                        disabled={!this.state.phone || !this.phoneMap[this.state.phone]}
                                                        handleChange={(fileList) => this.handleChange.bind(this, fileList, 'idCardImg1')()} max={1} />
                                                    <span style={{ marginTop: '0px', display: 'block' }}>身份证正面</span>
                                                </div>
                                                <div className={`changeIcCard2Style ${this.state.idCardAuthStatus == 3 ? 'failed' : ''}`} style={{ display: 'inline-block', textAlign: 'center', }}>
                                                    <UpLoad ref={ele => { this.uploader2 = ele }}
                                                        cropper={true}
                                                        aspectRatio={16 / 10}
                                                        accept="image/jpg,image/jpeg,image/png,image/bmp"
                                                        className={this.state.hasDriverData ? 'dis-remove' : ''}
                                                        style={{ display: 'inline-block', marginBottom: '4px' }}
                                                        disabled={!this.state.phone || !this.phoneMap[this.state.phone]}
                                                        handleChange={(fileList) => this.handleChange.bind(this, fileList, 'idCardImg2')()} max={1} />
                                                    <span style={{ marginTop: '0px', display: 'block' }}>身份证反面</span>
                                                </div>
                                            </td>}
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>驾驶证照片</span>
                                        </td>
                                        {(this.state.driverLicenseAuthStatus == 1 || this.state.driverLicenseAuthStatus == 2) && this.state.driverLicencePic ?
                                            <td className="column center">
                                                <span style={{ padding: '0 12px', display: 'inline-block' }}>
                                                    <CImg onClick={() => this.setState({ ImageViewer: true, ImageViewerIndex: 2 })} style={{ maxHeight: '80px', margin: '12px' }} src={this.state.driverLicencePic} />
                                                </span>
                                            </td> :
                                            <td className="column center">
                                                <div className={`changeDriverStyle ${this.state.driverLicenseAuthStatus == 3 ? 'failed' : ''}`} style={{ display: 'inline-block', textAlign: 'center', margin: '12px 12px' }}>
                                                    <UpLoad ref={ele =>{this.uploader3 = ele}}
                                                        cropper={true}
                                                        aspectRatio={16 / 10}
                                                        accept="image/jpg,image/jpeg,image/png,image/bmp"
                                                        className={this.state.hasDriverData ? 'dis-remove' : ''}
                                                        style={{ display: 'inline-block', marginBottom: '4px' }}
                                                        disabled={!this.state.phone || !this.phoneMap[this.state.phone]}
                                                        handleChange={(fileList) => this.handleChange.bind(this, fileList, 'driverLicencePic')()} max={1} />
                                                    <span style={{ marginTop: '0px', display: 'block' }}>驾驶证正页</span>
                                                </div>
                                            </td>}
                                    </tr>
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>身份证号</span>
                                        </td>
                                        <td className="column">
                                            <input maxLength={18}
                                                readOnly={this.state.onCopy}
                                                placeholder="身份证号"
                                                onChange={(e) => this.input.bind(this, e.target.value.toIdcard(), 'idCardNum')()}
                                                value={this.state.idCardNum} type="text" />
                                        </td>
                                        <td className="head">
                                            <span className="title">常跑线路</span>
                                        </td>
                                        <td className="column single">
                                            <input maxLength={50}
                                                placeholder="如：北京,上海"
                                                onChange={(e) => this.input.bind(this, e.target.value, 'runLine')()}
                                                value={this.state.routes} type="text" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {/* <div className="ant-table-body form-table">
                            <div className="group-head">
                                <span>
                                    <div className="mod-form-title">收款信息</div>
                                </span>
                            </div>
                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>收款人姓名</span>
                                        </td>
                                        <td className="column">
                                            <input maxLength={20} readOnly={this.state.isEditBankData ? false : true}
                                                placeholder="收款人姓名" value={this.state.bankUserName}
                                                onChange={(e) => this.input.bind(this, e.target.value, 'bankUserName')()} type="text" />
                                        </td>
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>银行卡号</span>
                                        </td>
                                        <td className="column" style={{ position: 'relative' }}>
                                            {this.state.bankAccountNo ? this.bankLoading() : ''}
                                            <input maxLength={20} readOnly={this.state.isEditBankData ? false : true}
                                                placeholder="银行卡号"
                                                value={this.state.bankAccountNo}
                                                onBlur={this.checkBankAccount.bind(this)}
                                                onChange={(e) => { this.input.bind(this, e.target.value.toNum(), 'bankAccountNo')(); this.bankAccountChanged = true }} type="text" />
                                        </td>
                                    </tr>
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>身份证号</span>
                                        </td>
                                        <td className="column">
                                            <input maxLength={18} readOnly={this.state.isEditBankData ? false : true}
                                                placeholder="身份证号" value={this.state.bankIdCardNum}
                                                onChange={(e) => this.input.bind(this, e.target.value.toIdcard(), 'bankIdCardNum')()} type="text" />
                                        </td>
                                        <td className="head">
                                            <span className="title"><span className="needed">*</span>手机号</span>
                                        </td>
                                        <td className="column" style={{ position: 'relative' }}>
                                            <input maxLength={11} readOnly={this.state.isEditBankData ? false : true}
                                                placeholder="此手机号用于运费到账通知" value={this.state.bankCardPhone}
                                                onChange={(e) => this.input.bind(this, e.target.value.toNum(), 'bankCardPhone')()} type="text" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div> */}
                    </div>
                    <div style={{ textAlign: 'center', margin: '8px 0 0 0', color: '#ff7800' }}><i className="iconfont icon-info"></i>司机将会收到定位授权短信，提醒司机回复“Y”，避免订单无轨迹，不能开票的风险。</div>
                </div>
                <ImageViewer thumb={'_600-600'} handleCancel={() => this.setState({ ImageViewer: false })} list={[this.state.idCardImg1, this.state.idCardImg2, this.state.driverLicencePic]} show={this.state.ImageViewer} index={this.state.ImageViewerIndex} />

            </div>
        )
    }
}