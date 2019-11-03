//弹框----新增车辆
import React from 'react';
import UpLoad from '../../lib/upButton';
import Loading from '../../lib/loading';
import { Select, Icon } from 'antd';
import Map from '../../lib/map/set';
import Button from '../../lib/button';
import CImg from '../../lib/checkableImg';
import Utils from 'utils/utils';
import Storage from 'gc-storage/es5';


const Option = Select.Option;
export default class Modal extends React.Component {

    constructor(props) {
        super(props);
        let vehicle = this.props.vehicle || {};
        let ext = JSON.parse(vehicle.ext || '{}');
        this.state = {
            rePhone: Storage.get('userInfo').userPhone,
            vehicleList: (function () {
                let obj = Storage.get('vehicleType');
                let a = [];
                for (let k in obj) {
                    a.push({
                        vehicleTypeCode: k,
                        vehicleTypeName: obj[k]
                    })
                }
                return a;
            })(),
            vehicleNo: vehicle.vehicleNo,
            vehicleColor: '黄色',
            vehicleLicenseUrl1: vehicle.vehicleLicenseUrl1,
            vehicleRoadTransportCerUrl: vehicle.vehicleRoadTransportCerUrl,
            vehicleHeadPhotoUrl: vehicle.vehicleHeadPhotoUrl,
            vehicleTypeCode: vehicle.vehicleType,
            vehicleTypeName: vehicle.vehicleTypeName,
            vehicleLen: vehicle.vehicleLen,
            vehicleTon: vehicle.vehicleTon,
            truckHeight: vehicle.vehicleHeight,
            truckWidth: vehicle.vehicleWidth,
            auditRemark:vehicle.auditRemark,
            routes: ext.routes,
            loadWeight: ext.loadWeight,
            totalWeight: ext.totalWeight,
            ownerName: ext.ownerName,
            vehicleNoEditable: true,
            onDetail: vehicle.vehicleAuthStatus == 1 ? true : false,
            status: vehicle.status,
            useStatus: vehicle.useStatus,
            runStatus: vehicle.runStatus,
            location: vehicle.location,
            locationType: vehicle.locationType,
            locationTime: vehicle.locationTime,
            enableVehicleRoadLicense: Storage.get('enableVehicleRoadLicense'),
            vehicleLenList: Storage.get('dictionary').vehicleLength.sort((a, b) => { return a.value - b.value }),
            lastPositionBean: vehicle.lastPositionBean || {}
        }
        this.modifyParam = {
            driver: {},
            ext: {}
        };
        Modal.save = this.save.bind(this);
    }

    input(val, key) {
        this.state[key] = val;
        this.setState({
            ...this.state
        }, () => {
            if (key == 'vehicleNo' || key == 'vehicleColor') {
                this.carborderNumber()
            }
        })
    }

    onChange(roleId, obj) {
        this.setState({
            ...this.state,
            roleId: roleId,
            remark: obj.remark
        })
    }

    componentDidMount() {
        if (this.state.vehicleLicenseUrl1 && this.uploader1) {
            this.uploader1.setPicData([Utils.toFileImg(this.state.vehicleLicenseUrl1)])
        }
        if (this.state.vehicleRoadTransportCerUrl && this.uploader2) {
            this.uploader2.setPicData([Utils.toFileImg(this.state.vehicleRoadTransportCerUrl)])
        }
        if (this.state.vehicleHeadPhotoUrl && this.uploader3) {
            this.uploader3.setPicData([Utils.toFileImg(this.state.vehicleHeadPhotoUrl)])
        }
    }

    getData() {
        return this.state;
    }

    handleChange(fileList, fileKey) {
        var _this = this;
        if (!fileList[0]) {
            // _this.state[fileKey] = '';
            // _this.setState({
            //     vehicleNo: '',
            // })
            switch (fileKey) {
                case 'vehicleLicenseUrl1':
                    _this.setState({
                        vehicleNo1: '',
                        vehicleLicenseUrl1: null
                    });
                    break;
                case 'vehicleRoadTransportCerUrl':
                    _this.setState({
                        vehicleNo2: '',
                        vehicleRoadTransportCerUrl: null
                    });
                    break;
                case 'vehicleHeadPhotoUrl':
                    _this.setState({
                        vehicleNo3: '',
                        vehicleHeadPhotoUrl: null
                    });
                    break;
            }
        } else {
            if (fileList.length > 0) {
                _this.imgOcr(fileList[0].response.body.resUrls[0], fileKey);
            }
        }
        // _this.state[fileKey] = fileList[0] ? fileList[0].response.body.resUrls[0] : '';
    }

    imgOcr(img, field) {
        let that = this
        that.state[field] = img;
        if (field === 'vehicleLicenseUrl1') {
            field = 'VEHICLE_LICENSE_URL1'
        } else if (field === 'vehicleHeadPhotoUrl') {
            field = 'VEHICLE_HEAD_PHOTO_URL'
        } else if (field === 'vehicleRoadTransportCerUrl') {
            field = 'VEHICLE_ROAD_TRANSPORT_CER_URL'
        }
        // if (!this.state.enableVehicleRoadLicense &&
        //     (field == 'VEHICLE_ROAD_TRANSPORT_CER_URL' || field == 'VEHICLE_HEAD_PHOTO_URL')
        // ) {
        //     that.setState({
        //         vehicleRoadTransportCerUrl: img,
        //         vehicleNo2: ''
        //     })
        //     return;
        // }
        if (field != 'VEHICLE_LICENSE_URL1') {
            return;
        }
        let hasVehicleNoVal = !Utils.isEmpty(this.state.vehicleNo)
        Utils.request({
            api: '/api/internal/common/ocr',
            params: {
                ocrRecogType: field,
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
                // console.log(data)
                switch (field) {
                    case "VEHICLE_LICENSE_URL1":
                        if (data.vehicleResp && data.vehicleResp.vehicleNo) {
                            if (data.vehicleResp.vehicleNo.indexOf('挂') > 0) {
                                that.setState({
                                    vehicleNo1: '',
                                    vehicleLicenseUrl1: '',
                                    vehicleNo: ''
                                })
                                if (that.uploader1) {
                                    that.uploader1.setPicData([])
                                }
                                Utils.Message.warning('车型不支持')
                                return
                            }
                            that.setState({
                                vehicleNo1: data.vehicleResp.vehicleNo,
                                vehicleLicenseUrl1: img,
                                vehicleNo: data.vehicleResp.vehicleNo
                            }, function () {
                                //当没有改动车牌号
                                if (!hasVehicleNoVal) {
                                    that.carborderNumber()
                                }
                            })
                        } else {
                            Utils.Message.warning('请上传正确的行驶证照片');
                            that.setState({
                                vehicleNo1: '',
                                vehicleNo: ''
                            })
                        }
                        break;
                    case "VEHICLE_ROAD_TRANSPORT_CER_URL":
                        that.setState({
                            vehicleNo2: data.vehicleResp.vehicleNo,
                            vehicleRoadTransportCerUrl: img,
                        })
                        break;
                    case "VEHICLE_HEAD_PHOTO_URL":
                        if (data.vehicleResp && data.vehicleResp.vehicleNo) {
                            that.setState({
                                vehicleNo3: data.vehicleResp.vehicleNo,
                                vehicleHeadPhotoUrl: img,
                            })
                        } else {
                            Utils.Message.warning('请上传正确的带车牌的车辆照片');
                            that.setState({
                                vehicleNo3: ''
                            })
                        }
                    default:
                        break;
                }
            }
        })
    }

    recordVehicle(e, evt) {
        this.state.vehicleTypeCode = evt.props.item.vehicleTypeCode;
        this.state.vehicleTypeName = evt.props.item.vehicleTypeName;
        this.setState({
            ...this.state
        })
    }
    chooseVehicleLen(value, event) {
        this.state.vehicleLen = event.props.item.value
        this.setState({
            ...this.state
        })
    }

    cleanCopyData() {
        this.setState({
            onCopy: false,
            vehicleNo: '',
            vehicleLicenseUrl1: '',
            vehicleHeadPhotoUrl: '',
            vehicleRoadTransportCerUrl: '',
            vehicleTypeName: '',
            vehicleTypeCode: null,
            vehicleLen: '',
            vehicleTon: '',
            truckHeight: '',
            truckWidth: '',
            routes: '',
            loadWeight: '',
            totalWeight: '',
            ownerName: ''
        })
    }

    save(handler) {
        //dosave
        let that = this;
        let addData = Utils.deepclone(this.state);
        //提交 是否信息是带过来的数据
        let keyArr = [{
            field: 'vehicleNo',
            name: '车牌号'
        }
            // , {
            // //     field: 'vehicleTypeName',
            // //     name: '车型',
            // //     type: 'choose'
            // // }, {
            // //     field: 'vehicleLen',
            // //     name: '车长'
            // // }, {
            // //     field: 'vehicleTon',
            // //     name: '载重'
            // // }, {
            //     field: 'vehicleLicenseUrl1',
            //     name: '行驶证正面照',
            //     type: 'upload'
            // },
            // {
            //     field: 'vehicleHeadPhotoUrl',
            //     name: '车牌照片',
            //     type: 'upload'
            // }, 
            // {
            //     field: 'vehicleRoadTransportCerUrl',
            //     name: '道路运输证',
            //     type: 'upload'
            // }
        ];
        for (let i = 0; i < keyArr.length; i++) {
            if (!addData[keyArr[i].field]) {
                if (keyArr[i].type === 'upload') {
                    Utils.Message.warning('请上传' + keyArr[i].name + '！');
                    return;
                }
                if (keyArr[i].type === 'choose') {
                    Utils.Message.warning('请选择' + keyArr[i].name + '！');
                    return;
                }
                Utils.Message.warning('请填写' + keyArr[i].name + '！');
                return;
            }
        }
        if (!Utils.VEHICLE_REG.test(addData.vehicleNo.toLocaleUpperCase())) {
            Utils.Message.warning('请输入正确的车牌号！');
            return false;
        }
        if (addData.vehicleNo.indexOf('挂') > -1) {
            Utils.Message.warning('车型不支持！');
            return false;
        }
        let p = {
            vehicleNo: addData.vehicleNo,
            vehicleLicenseUrl1: addData.vehicleLicenseUrl1,
            vehicleHeadPhotoUrl: addData.vehicleHeadPhotoUrl,
            vehicleRoadTransportCerUrl: addData.vehicleRoadTransportCerUrl,
            vehicleTypeName: addData.vehicleTypeName,
            vehicleTypeCode: addData.vehicleTypeCode,
            vehicleLen: addData.vehicleLen,
            vehicleTon: addData.vehicleTon,
        };
        p.ext = JSON.stringify({
            truckHeight: addData.truckHeight,
            truckWidth: addData.truckWidth,
            routes: addData.routes,
            loadWeight: addData.loadWeight,
            totalWeight: addData.totalWeight,
            ownerName: addData.ownerName
        })
        if (that.props.vehicle) {
            p.id = that.props.vehicle.id
        }
        p.vehicleNo = p.vehicleNo.toLocaleUpperCase();
        return Utils.request({
            params: p,
            api: that.props.api,
            success: function (data) {
                if (handler) {
                    handler()
                }
                //建立车辆和司机的弱关系
                if (that.props.driverId) {
                    Utils.request({
                        api: '/api/internal/common/saveoptemp',
                        params: {
                            key: that.props.driverId,
                            opt: {
                                vehicleNo: p.vehicleNo,
                                vehicleHeadPhotoUrl: p.vehicleHeadPhotoUrl,
                                vehicleLicenseUrl1: p.vehicleLicenseUrl1,
                                vehicleRoadTransportCerUrl: p.vehicleRoadTransportCerUrl,
                                // id:p.id
                            },
                        }
                    })
                }
            },
            handleError: function (responseHeasd) {
                if (handler) {
                    handler()
                }
                if (responseHeasd.head.errorMessage.indexOf('bizId') == -1) {
                    Utils.Message.error(responseHeasd.head.errorMessage)
                    return
                }
                var msg = responseHeasd.head.errorMessage.split('bizId:')[0]
                var id = responseHeasd.head.errorMessage.split('bizId:')[1]
                // console.log(responseHeasd);
                // console.log(responseHeasd.head.perAuthStatus == 2);
                //如果没有修改的api  就不提示编辑
                let apiMap = Storage.get('apiMap');
                if (!apiMap['车辆管理'] || !apiMap['车辆管理']['修改']) {
                    return;
                }
                var modal = Utils.modal({
                    title: '认证失败',
                    noBtn: responseHeasd.head.perAuthStatus == 2 ? true : false,
                    cancelText: msg == '稍后再说',
                    okText: '重新编辑',
                    width: 300,
                    // className:'restify',
                    onOk() {
                        modal.destroy();
                        // 如果是从车辆管理中的新增车辆
                        if (that.props.checkDetail) {
                            that.props.checkDetail(id)
                        }
                    },
                    content: msg
                })
            },
        })
    }

    carborderNumber() {
        if (!Utils.VEHICLE_REG.test(this.state.vehicleNo)) {
            return
        }
        var _this = this;
        Utils.request({
            params: {
                vehicleNo: this.state.vehicleNo,
                color: this.state.vehicleColor
            },
            api: Utils.getApi('车辆管理', '查询'),
            beforeRequest() {
                _this.setState({
                    vehicleNoEditable: false
                })
            },
            afterRequest() {
                _this.setState({
                    vehicleNoEditable: true
                })
            },
            success: function (data) {
                if (data.vehicleNoAdded && !_this.props.vehicle) {
                    Utils.Message.warning("该车辆已经添加过");
                    _this.setState({
                        vehicleNo: '',
                    })
                    if (_this.uploader1) {
                        _this.uploader1.setPicData([])
                    }
                    return;
                }
                if (data.vehicleNo) {
                    if (data.ext) {
                        data.ext = JSON.parse(data.ext)
                    } else {
                        data.ext = {};
                    }
                    _this.setState({
                        vehicleLicenseUrl1: _this.state.vehicleLicenseUrl1 || data.vehicleLicenseUrl1,
                        vehicleRoadTransportCerUrl: _this.state.vehicleRoadTransportCerUrl || data.vehicleRoadTransportCerUrl,
                        vehicleHeadPhotoUrl: _this.state.vehicleHeadPhotoUrl || data.vehicleHeadPhotoUrl,
                        vehicleTypeName: _this.state.vehicleTypeName || data.vehicleTypeName,
                        vehicleType: _this.state.vehicleType || data.vehicleType,
                        vehicleLen: _this.state.vehicleLen || data.vehicleLen,
                        vehicleTon: _this.state.vehicleTon || data.vehicleTon,
                        truckWidth: _this.state.truckWidth || data.ext.truckWidth,
                        truckHeight: _this.state.truckHeight || data.ext.truckHeight,
                        ownerName: _this.state.ownerName || data.ext.ownerName,
                        totalWeight: _this.state.totalWeight || data.ext.totalWeight,
                        loadWeight: _this.state.loadWeight || data.ext.loadWeight,
                        routes: data.routes,
                        onCopy: false,
                    }, function () {
                        if (data.vehicleLicenseUrl1 && _this.uploader1) {
                            _this.uploader1.setPicData([Utils.toFileImg(data.vehicleLicenseUrl1)])
                        }
                        if (data.vehicleRoadTransportCerUrl && _this.uploader2) {
                            _this.uploader2.setPicData([Utils.toFileImg(data.vehicleRoadTransportCerUrl)])
                        }
                        if (data.vehicleHeadPhotoUrl && _this.uploader3) {
                            _this.uploader3.setPicData([Utils.toFileImg(data.vehicleHeadPhotoUrl)])
                        }
                    })
                }
            }
        })
    }

    showPos() {
        let that = this;
        let pos = Utils.bd_decrypt(that.state.lastPositionBean.lon, that.state.lastPositionBean.lat);
        Utils.modal({
            content: <Map markers={[{ pos: { longitude: pos.lng, latitude: pos.lat }, label: that.props.vehicle.location }]} />,
            noBtn: true,
            width: 864,
            height: 400,
            title: `车辆位置`
        })
    }

    isNotSame() {
        if (this.state.vehicleNo && this.state.vehicleNo1 && Utils.VEHICLE_REG.test(this.state.vehicleNo)) {
            let rate = Utils.LevenshteinDistance.init(this.state.vehicleNo, this.state.vehicleNo1).get()

            if (rate > 0.8) {
                return false
            } else {
                return true
            }
        }
    }

    render() {
        return (
            <div className='upLoadChangeStyle unit' style={{ position: 'relative' }} >
                {this.isNotSame()||this.state.auditRemark ?
                    <div style={{ right: '110px', marginBottom: '12px' }}>
                        <span style={{
                            width: '100%',
                            fontSize: '13px',
                            display: 'inline-block',
                            backgroundColor: '#fbead0',
                            padding: '6px 12px'
                        }}>
                            <span className='iconfont icon-gantanhao'
                                style={{
                                    color: 'red',
                                    fontSize: '10px',
                                    marginRight: '5px',
                                }}>
                            </span>车辆信息认证失败！原因：{this.state.auditRemark ?this.state.auditRemark:'车牌号与行驶证照片信息不一致'}</span>
                    </div> : ''}
                {this.state.loading ? <div style={{ position: 'absolute', width: '736px', height: '455px', zIndex: '10', cursor: 'progress' }}><div style={{ position: 'relative', width: '100%', height: '100%' }}><Loading /></div></div> : ''}

                <div className="ant-table ant-table-default">
                    <div className="ant-table-content">
                        {this.state.onDetail ? null : <div className="driver-group-head">填写车牌号可先下单</div>}
                        <div className="ant-table-body form-table">
                            <div className="group-head">
                                <span>
                                    <div className="mod-form-title">车辆信息<span style={{ marginLeft: '16px', fontSize: '12px' }}></span></div>
                                </span>
                            </div>
                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title"><span className={"needed " + (this.state.onDetail ? 'none' : '')}>*</span>车牌号</span>
                                        </td>
                                        <td className="column single">
                                            <input maxLength={7} placeholder="车牌号"
                                                style={{ width: '18%' }}
                                                value={this.state.vehicleNo}
                                                readOnly={this.state.onCopy || !this.state.vehicleNoEditable || this.state.onDetail}
                                                onChange={(e) => this.input.bind(this, e.target.value, 'vehicleNo')()}
                                                type="text" />
                                            {this.state.onDetail ? null : <span style={{ color: '#ff7800' }}>
                                                <Button text={'更换车辆'}
                                                    className="common" disabled={!this.state.onCopy}
                                                    style={{ marginRight: 24 }}
                                                    onClick={() => {
                                                        this.cleanCopyData()
                                                    }} />
                                                <Icon type="info-circle" />车牌号与行驶证必须一致，否则会影响轨迹校验，请核对！</span>}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {this.state.onDetail ? null : <div className="driver-group-head nt">请在申请支付前，完成车辆认证</div>}
                        <div className="ant-table-body form-table">
                            {this.state.onDetail ? null : <div className="group-head">
                                <span>
                                    <div className="mod-form-title">车辆信息<span style={{ marginLeft: '16px', fontSize: '12px' }}></span></div>
                                </span>
                            </div>}
                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title"><span className={"needed " + (this.state.onDetail ? 'none' : '')}>*</span>证件照片</span>
                                        </td>
                                        <td className="column single">
                                            {this.state.onCopy && this.state.vehicleLicenseUrl1 || this.state.onDetail ?
                                                <CImg onClick={() => this.setState({ ImageViewer: true, ImageViewerIndex: 0 })} style={{ maxHeight: '80px', margin: '12px' }} src={this.state.vehicleLicenseUrl1} />
                                                :
                                                <div className='changeVehicle1Style' style={{ display: 'inline-block', textAlign: 'center', margin: '12px 12px', width: '120px' }}>
                                                    <UpLoad ref={ele => { this.uploader1 = ele }}
                                                        cropper={true}
                                                        aspectRatio={16 / 10}
                                                        accept="image/jpg,image/jpeg,image/png,image/bmp"
                                                        style={{ display: 'inline-block', marginBottom: '4px' }}
                                                        handleChange={(fileList) => this.handleChange.bind(this, fileList, 'vehicleLicenseUrl1')()} max={1} />
                                                    <span style={{ marginTop: '0px', display: 'block' }}><span style={{ color: 'red', padding: '0' }}>*</span>行驶证正页</span>
                                                </div>}
                                            {this.state.onCopy && this.state.vehicleRoadTransportCerUrl || this.state.onDetail ?
                                                (this.state.vehicleRoadTransportCerUrl ? <CImg onClick={() => this.setState({ ImageViewer: true, ImageViewerIndex: 1 })} style={{ maxHeight: '80px', margin: '12px' }} src={this.state.vehicleRoadTransportCerUrl} /> : null)
                                                :
                                                <div className='changeVehicle1Style road' style={{ display: 'inline-block', textAlign: 'center', margin: '12px 12px', width: '120px' }}>
                                                    <UpLoad ref={ele => { this.uploader2 = ele }}
                                                        cropper={true}
                                                        accept="image/jpg,image/jpeg,image/png,image/bmp"
                                                        style={{ display: 'inline-block', marginBottom: '4px' }}
                                                        handleChange={(fileList) => this.handleChange.bind(this, fileList, 'vehicleRoadTransportCerUrl')()} max={1} />
                                                    <span style={{ marginTop: '0px', display: 'block' }}>道路运输证</span>
                                                </div>}
                                            {this.state.onCopy && this.state.vehicleHeadPhotoUrl || this.state.onDetail ?
                                                (this.state.vehicleHeadPhotoUrl ? <CImg onClick={() => this.setState({ ImageViewer: true, ImageViewerIndex: 2 })} style={{ maxHeight: '80px', margin: '12px' }} src={this.state.vehicleHeadPhotoUrl} /> : null)
                                                :
                                                <div className='changeVehicle1Style head-vehicle' style={{ display: 'inline-block', textAlign: 'center', margin: '12px 12px', width: '120px' }}>
                                                    <UpLoad ref={ele => { this.uploader3 = ele }}
                                                        cropper={true}
                                                        accept="image/jpg,image/jpeg,image/png,image/bmp"
                                                        style={{ display: 'inline-block', marginBottom: '4px' }}
                                                        handleChange={(fileList) => this.handleChange.bind(this, fileList, 'vehicleHeadPhotoUrl')()} max={1} />
                                                    <span style={{ marginTop: '0px', display: 'block' }}>人车合影</span>
                                                </div>}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="ant-table-body form-table">
                            <table>
                                <tbody className="ant-table-tbody">
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title"><span className={"needed " + (this.state.onDetail ? 'none' : '')}>*</span>车型</span>
                                        </td>
                                        <td className="column center">
                                            <Select className="form-selector"
                                                placeholder="选择车型"
                                                disabled={this.state.onCopy || this.state.onDetail}
                                                value={this.state.vehicleTypeName}
                                                onChange={(val, event) => { this.recordVehicle.bind(this, val, event)() }} style={{ border: 'none' }}>
                                                {
                                                    this.state.vehicleList.map((item) => {
                                                        return (
                                                            <Option key={item.vehicleTypeCode} item={item} value={item.vehicleTypeName}>{item.vehicleTypeName}</Option>
                                                        )
                                                    })
                                                }
                                            </Select>
                                        </td>
                                        <td className="head">
                                            <span className="title"><span className={"needed " + (this.state.onDetail ? 'none' : '')}>*</span>吨位（吨）</span>
                                        </td>
                                        <td className="column center">
                                            <input maxLength={8}
                                                placeholder="填写吨位"
                                                readOnly={this.state.onCopy || this.state.onDetail}
                                                value={this.state.vehicleTon}
                                                onChange={(e) => this.input.bind(this, e.target.value.toDecimal2(), 'vehicleTon')()}
                                                type="text" />
                                        </td>
                                    </tr>
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title"><span className={"needed " + (this.state.onDetail ? 'none' : '')}>*</span>车长（米）</span>
                                        </td>
                                        <td className="column center">
                                            <Select className='form-selector'
                                                placeholder='选择车长'
                                                disabled={this.state.onCopy || this.state.onDetail}
                                                value={this.state.vehicleLen}
                                                onChange={(value, event) => { this.chooseVehicleLen.bind(this, value, event)() }}
                                                style={{ border: 'none' }}
                                            >
                                                {
                                                    this.state.vehicleLenList.map((item) => {
                                                        return (
                                                            <Option key={item.value} item={item} value={item.value}>{item.value}米</Option>
                                                        )
                                                    })
                                                }

                                            </Select>
                                        </td>

                                        <td className="head">
                                            <span className="title"><span className={"needed " + (this.state.onDetail ? 'none' : '')}>*</span>车牌颜色</span>
                                        </td>
                                        <td className="column center">
                                            <Select className='form-selector'
                                                disabled={this.state.onCopy || this.state.onDetail}
                                                value={this.state.vehicleColor}
                                                onChange={(value, event) => { this.input(value, 'vehicleColor') }}
                                                style={{ border: 'none' }}
                                            >
                                                <Option key={1} value={'黄色'}>黄色</Option>
                                                <Option key={2} value={'蓝色'}>蓝色</Option>
                                                <Option key={3} value={'绿色'}>绿色</Option>
                                            </Select>
                                        </td>
                                    </tr>
                                    <tr className="ant-table-row">
                                        <td className="head">
                                            <span className="title">车宽 / 车高</span>
                                        </td>
                                        <td className="column">
                                            <input style={{ display: 'inline-block', width: '35%', border: 'none', outline: 'none' }}
                                                maxLength={8} placeholder="填写车宽"
                                                value={this.state.truckWidth}
                                                readOnly={this.state.onCopy || this.state.onDetail}
                                                onChange={(e) => this.input.bind(this, e.target.value.toDecimal2(), 'truckWidth')()} type="text" />
                                            <span style={{ padding: 12, borderRight: '1px solid #e2e2e3' }}>米</span>
                                            <input style={{ display: 'inline-block', width: '40%' }}
                                                maxLength={8}
                                                readOnly={this.state.onCopy || this.state.onDetail}
                                                placeholder="填写车高" value={this.state.truckHeight}
                                                onChange={(e) => this.input.bind(this, e.target.value.toDecimal2(), 'truckHeight')()} type="text" />
                                            <span>米</span>
                                        </td>
                                        <td className="head">
                                            <span className="title">业户名称</span>
                                        </td>
                                        <td className="column">
                                            <input maxLength={10}
                                                placeholder="业户名称"
                                                readOnly={this.state.onCopy || this.state.onDetail}
                                                value={this.state.ownerName}
                                                onChange={(e) => this.input.bind(this, e.target.value, 'ownerName')()}
                                                type="text" />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="head">
                                            <span className="title">整备质量（吨）</span>
                                        </td>
                                        <td className="column">
                                            <input maxLength={10}
                                                placeholder="整备质量"
                                                readOnly={this.state.onCopy || this.state.onDetail}
                                                value={this.state.totalWeight}
                                                onChange={(e) => this.input.bind(this, e.target.value.toDecimal2(), 'totalWeight')()}
                                                type="text" />
                                        </td>
                                        <td className="head">
                                            <span className="title">核载质量（吨）</span>
                                        </td>
                                        <td className="column">
                                            <input maxLength={10}
                                                placeholder="核定载（牵引）质量"
                                                value={this.state.loadWeight}
                                                readOnly={this.state.onCopy || this.state.onDetail}
                                                onChange={(e) => this.input.bind(this, e.target.value.toDecimal2(), 'loadWeight')()}
                                                type="text" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {this.state.onDetail ?
                            <div className="ant-table-body form-table">
                                <div className="group-head">
                                    <span>
                                        <div className="mod-form-title">运行情况<span style={{ marginLeft: '16px', fontSize: '12px' }}></span></div>
                                    </span>
                                </div>
                                <table>
                                    <tbody className="ant-table-tbody">

                                        <tr className="ant-table-row">
                                            <td className="head">
                                                <span className="title">当前状态</span>
                                            </td>
                                            <td className="column center">
                                                <input
                                                    readOnly
                                                    value={(function (status) {
                                                        switch (status) {
                                                            case '1':
                                                                return '在线';
                                                            case '0':
                                                                return '离线';
                                                            default:
                                                                return '';
                                                        }
                                                    })(this.state.lastPositionBean.isOnline)} />
                                            </td>
                                            <td className="head">
                                                <span className="title">定位速度</span>
                                            </td>
                                            <td className="column center">
                                                <input
                                                    readOnly
                                                    value={(function (speed) {
                                                        return speed ? (speed + 'km/h') : ''
                                                    })(this.state.lastPositionBean.gpsSpeed)} />
                                            </td>
                                        </tr>
                                        <tr className="ant-table-row">
                                            <td className="head">
                                                <span className="title">当前位置</span>
                                            </td>
                                            <td className="column center">
                                                <input
                                                    readOnly
                                                    style={{
                                                        color: '#0099ff',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={this.showPos.bind(this)}
                                                    value={(function (pos) {
                                                        return (pos.provinceName || '') + (pos.cityName || '') + (pos.countryName || '')
                                                    })(this.state.lastPositionBean)} />
                                            </td>
                                            <td className="head">
                                                <span className="title">定位时间</span>
                                            </td>
                                            <td className="column single">
                                                <input
                                                    readOnly
                                                    onClick={this.showPos.bind(this)}
                                                    value={this.state.lastPositionBean.utc ? new Date(this.state.lastPositionBean.utc * 1).format('yyyy-MM-dd hh:mm') : ''} />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div> : null}
                    </div>
                </div>
            </div>
        )
    }
}