import React from 'react';
import { Layout, Modal, Icon, Switch as Switchd, InputNumber, Popover, Button } from 'antd'
import Header from './common/header';
import ContentBox from './common/tab';
import MyMenu from './common/menu';
import TransFrom from 'utils/tabPageManage';
import Utils from 'utils/utils';
import Loading from '../Components/lib/loading';
import { Map } from 'react-amap';
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import Events from 'gc-event/es5'
import Storage from 'gc-storage/es5'
import Chat from '../lib/chat'

const { Content } = Layout;
const ButtonGroup = Button.Group;
export default class extends React.Component {

    state = {
        a: false,
        b: false,
        c: false,
        full: false,
        cropperOptions: {
            scaleX: 1,
            scaleY: 1,
            deg: 90
        }
    }

    componentWillMount() {
        let that = this
        Events.on('addTab', function (_module, event) {
            that.addPage(_module, event);
        })
        Events.on('fullScreen', function (call) {
            that.setState({
                full: !that.state.full
            });
        });
        let isAdminUser = false;
        let info = localStorage.getItem('loginInfo');
        if (!info) {
            Utils.logout();
            return
        } else {
            info = JSON.parse(info);
            isAdminUser = (info.loginBean.userType == 1);
        }
        window.Storage = Storage
        Storage.set('isAdminUser', isAdminUser);
        Promise.all([
            Utils.request({
                api: '/api/web/me/detail',
                success: function (data) {
                    let userModule = {};
                    Storage.set('apiMap', (function () {
                        try {
                            if (!data.enterpriseModule) {
                                Utils.Message.warning('无访问权限！');
                                return;
                            }
                            let list = data.enterpriseModule.subModuleList;//主菜单列表
                            let map = {};
                            for (let i = 0; i < list.length; i++) {
                                if (list[i].type === 'Function') {
                                    userModule[list[i].moduleName] = true;
                                    if (!map[list[i].moduleName]) {
                                        map[list[i].moduleName] = {};
                                    }
                                    list[i].subModuleList.map((fn, index) => {
                                        map[list[i].moduleName][fn.moduleName] = fn.moduleUrl;
                                    })
                                } else if (list[i].subModuleList) {
                                    let menuList = list[i].subModuleList;//遍历模块
                                    for (let j = 0; j < menuList.length; j++) {
                                        let module_ = menuList[j];
                                        userModule[module_.moduleName] = true;
                                        if (!map[module_.moduleName]) {
                                            map[module_.moduleName] = {};
                                        }
                                        if (module_.subModuleList) {
                                            module_.subModuleList.map((fn, index) => {
                                                map[module_.moduleName][fn.moduleName] = fn.moduleUrl;
                                            })
                                        }

                                    }
                                }
                            }
                            Storage.set('userModule', userModule);
                            return map;
                        } catch (e) {
                            return {}
                        }
                    })());
                    Chat.init({
                        user:data.userPhone,
                        group:data.companyId,
                        socketServer:Utils.SOCKET_SERVER
                    })
                    Storage.set('userInfo', {
                        avatarUrl: data.avatarUrl,
                        id: data.id,
                        companyId: data.companyId,
                        nickName: data.nickName,
                        userName: data.userName,
                        userPhone: data.userPhone,
                        idCardNo: data.idCardNo,
                        monthlyOrderLimit: data.monthlyOrderLimit,
                    });
                    that.setState({
                        menu: data.enterpriseModule.subModuleList,
                    });
                }
            }),(()=>{
                if (isAdminUser) {
                    Utils.request({
                        api: '/api/web/enterprise/detail',
                        success: function (res) {
                            Storage.set('adminModule', res.enterpriseModule)
                            Storage.set('roleList', res.enterpriseRoleList)
                            that.initStorage(res)
                        }
                    })
                } else {
                    Utils.request({
                        api: '/api/web/enterprise/info',
                        success: function (res) {
                            that.initStorage(res)
                        }
                    })
            }})(),
            Utils.request({
                api: '/api/external/common/dictionary',
                success: function (data) {
                    that.storageDictionary.bind(that, data)();
                }
            })
        ]).then(() => {
            that.setState({
                inited:true
            })
        }) 
    }

    componentDidMount() {
        let that = this
        Utils.cropper = function (options, handler) {
            that.onCropper = handler
            that.setState({
                cropperVisible: true,
                cropperUrl: options.url,
                aspectRatio: options.aspectRatio || null,
                cropperOptions: {
                    scaleX: 1,
                    scaleY: 1,
                    deg: 90
                }
            }, function () {
                try {
                    that.refs.cropper.reset()
                } catch (e) { }
            })
        }
    }


    /**
     * 基本配置 企业信息缓存
     * @param {*} res 
     */
    initStorage(res) {
        Storage.set('usableAmount', res.usableAmount)
        Storage.set('balanceAmount', res.balanceAmount)
        Storage.set('rebateAmount', res.rebateAmount)
        Storage.set('balanceWarnLimit', res.balanceWarnLimit)
        Storage.set('subAccountNo',res.subAccountNo)
        Storage.set('companyInfo', {
            name: res.name,
            registerName: res.registerName,
            registerPhone: res.registerPhone,
            businessLicenseNo: res.businessLicenseNo,
        });
        Storage.set('companyConfig', res.companyConfig)
        Storage.set('isSetPayPwd', res.companyConfig.setPayPassword)
        Storage.set('payeeBenefyLimit', res.companyConfig.limit || 1000)
    }


    /**
     * 缓存字典数据
     * @param {*} data 
     */
    storageDictionary(data) {
        let areaCodeMap = {}
        data.location = (function (location) {
            let a = location.map((province) => {
                if (province.nodes[0].code.length < 6) {
                    province.nodes.shift();
                }
                areaCodeMap[province.name] = province.code
                if(province.nodes.length>0){
                    province.nodes.map(city=>{
                        areaCodeMap[city.name] = city.code
                    })
                }
                return province;
            })
            return a;
        })(data.location);
        Storage.set('dictionary', data);
        Storage.set('areaCode', areaCodeMap);
        Storage.set('cityNodes', data.location);
        let vehicleTypeMap = {}, vehicleTypeNameMap = {};
        data.vehicleType.map((vehicle) => {
            vehicleTypeMap[vehicle.id] = vehicle.value;
            vehicleTypeNameMap[vehicle.value] = vehicle.id;
        });
        Storage.set('vehicleType', vehicleTypeMap);
        Storage.set('vehicleTypeNameMap', vehicleTypeNameMap);
        Storage.set('vehicleTypeOption', data.vehicleType);
        Storage.set('vehicleLengthOption', data.vehicleLength);
        Storage.set('vehicleWeightOption', data.vehicleWeight);
        this.setState({
            c: true
        })
    }
    /**
     * 添加页面方法
     * @param {*} module_ 
     * @param {*} event 
     */
    addPage(module_, event) {
        this.refs.tabContent.add({
            title: module_.moduleText,
            module: module_.module,
            content: TransFrom(module_.module, module_.ext || {})
        }, event)
    }

    render() {
        if (this.state.inited || Utils.DEBUG === true) {
            return (
                <Layout>
                    <div style={{ display: 'none' }}>
                        <Map
                            amapkey={Utils.amapkey}
                            zoom={4} width={480}
                            events={{
                                created: (map) => {
                                    Utils.map = map;
                                    setTimeout(() => {
                                        Utils.generateAutoComplete()
                                    }, 500)
                                },
                            }}></Map>
                    </div>
                    <Modal
                        title="图片裁剪"
                        width={800}
                        maskClosable={false}
                        centered={true}
                        visible={this.state.cropperVisible}
                        onOk={() => {
                            let data = this.refs.cropper.getCroppedCanvas().toDataURL()
                            this.onCropper(data)
                            this.setState({
                                cropperVisible: false
                            })
                        }}
                        zIndex={100000}
                        onCancel={() => {
                            this.setState({
                                cropperVisible: false
                            })
                            this.onCropper(null)
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <Cropper
                                ref="cropper"
                                src={this.state.cropperUrl}
                                style={{ height: 480, width: '100%' }}
                                // Cropper.js options
                                aspectRatio={this.state.aspectRatio}
                                zoomable={true}
                                rotatable={true}
                                movable={true}
                                guides={true} />
                            <div style={{ position: 'absolute', bottom: '0', zIndex: 1000, width: '100%', textAlign: 'center', background: 'rgba(255,255,255,.7)', padding: '6px 0' }}>
                                <Switchd
                                    style={{ marginRight: 8 }}
                                    checkedChildren={'移动模式'}
                                    unCheckedChildren={'裁剪模式'}
                                    onChange={(checked) => {
                                        if (checked) {
                                            this.refs.cropper.setDragMode('move')
                                        } else {
                                            this.refs.cropper.setDragMode('crop')
                                        }
                                    }}
                                />
                                <ButtonGroup style={{ marginRight: 8 }} size={'small'}>
                                    <Button type="primary" onClick={() => {
                                        this.refs.cropper.rotate(-this.state.cropperOptions.deg)
                                    }}><Icon type="undo" />左旋</Button>
                                    <Button type="primary" onClick={() => {
                                        this.refs.cropper.rotate(this.state.cropperOptions.deg)
                                    }}><Icon type="redo" />右旋</Button>
                                    <Popover content={<InputNumber placeholder="旋转角度" size="small" min={1} max={180} value={this.state.cropperOptions.deg} onChange={(value) => {
                                        this.state.cropperOptions.deg = value
                                        this.setState({
                                            cropperOptions: {
                                                ...this.state.cropperOptions
                                            }
                                        })
                                    }} />} title="设置旋转角度" trigger="click">
                                        <Button type="primary">{this.state.cropperOptions.deg}°</Button>
                                    </Popover>
                                </ButtonGroup>
                                <ButtonGroup style={{ marginRight: 8 }} size={'small'}>
                                    <Button type="primary" onClick={() => {
                                        let scalex = this.state.cropperOptions.scaleX > 0 ? -1 : 1
                                        this.refs.cropper.scaleX(scalex)
                                        this.state.cropperOptions.scaleX = scalex
                                    }}><Icon type="swap" />翻转</Button>
                                    <Button type="primary" onClick={() => {
                                        let scaley = this.state.cropperOptions.scaleY > 0 ? -1 : 1
                                        this.refs.cropper.scaleY(scaley)
                                        this.state.cropperOptions.scaleY = scaley
                                    }}><Icon type="swap" style={{ transform: 'rotate(90deg)' }} />翻转</Button>
                                </ButtonGroup>
                                <ButtonGroup size={'small'}>
                                    <Button type="primary" onClick={() => {
                                        this.refs.cropper.reset()
                                    }}><Icon type="reload" />重置</Button>
                                </ButtonGroup>
                            </div>
                        </div>
                    </Modal>
                    <Layout>
                        <MyMenu menu={this.state.menu} onMenuClick={(module_) => { this.addPage(module_) }} />
                        <Layout className="right-content-box" style={{ height: 'calc(100vh)', overflow: 'hidden', overflowX: 'auto' }}>
                            <Header user={Storage.get('userInfo')} />
                            <Content style={{ height: '100%', minWidth: '1100px',position:'relative' }}>
                                <ContentBox style={{ height: '100%' }} ref="tabContent" />
                            </Content>
                        </Layout>
                    </Layout>
                </Layout>
            )
        } else {
            return (
                <Loading />
            )
        }
    }
}