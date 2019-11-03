import React from 'react';
import FreshComponent from '../freshbind'
import ScrollContainer from '../index'
import './index.scss';
import { Switch, Checkbox, Row, Col, Input } from 'antd'
import ScrollBar from 'smooth-scrollbar'
import Button from '../../lib/button'
import NewRole from '../../modal/newrole'
import Reload from '../reload'
import Storage from 'gc-storage/es5'
import Utils from 'utils/utils'

class AuthItem extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            module: props.module,
            options: props.options,
            checkMap: props.checkMap || {},
            indeterminate: false,
            checkAll: false
        };
    }

    // toggleDisable() {
    //     if(!this.state.disabled){
    //         //取消整块选中
    //         this.notifyCheckChange(this.state.module,false);
    //         //取消suoyou功能选中
    //         this.state.options.map((item) => {
    //             if (this.state.checkMap[item.moduleUrl]) {
    //                 this.notifyCheckChange(item, false);
    //             }
    //         })
    //     }else{
    //         this.notifyCheckChange(this.state.module,true);
    //         this.state.options.map((item) => {
    //             if (!this.state.checkMap[item.moduleUrl]) {
    //                 this.notifyCheckChange(item, true);
    //             }
    //         })
    //     }
    //     this.setState({
    //         disabled: !this.state.disabled
    //     })
    // }

    componentWillReceiveProps(newProps) {
        if (newProps.disabled === this.props.disabled) {
            this.renderProp = true
        } else {

            if (newProps.disabled) {
                //取消整块选中
                if (this.state.checkAll) {
                    this.notifyCheckChange(this.state.module, false);
                }
                //取消suoyou功能选中
                this.state.options.map((item) => {
                    if (this.state.checkMap[item.id]) {
                        this.notifyCheckChange(item, false);
                    }
                    return null;
                })
            } else {
                if (this.state.checkAll) {
                    this.notifyCheckChange(this.state.module, true);
                }
                this.state.options.map((item) => {
                    if (this.state.checkMap[item.id]) {
                        this.notifyCheckChange(item, true);
                    }
                    return null;
                })
            }
        }
    }

    onChange = (checked, _module) => {
        this.state.checkMap[_module.id] = checked;
        this.renderProp = false;
        this.notifyCheckChange(_module, checked);
        let checkType = this.getCheckStatus();
        this.setState({
            checkMap: {
                ... this.state.checkMap
            },
            indeterminate: checkType == 1,
            checkAll: checkType == 2
        });
    }



    onCheckAllChange = (e) => {
        this.renderProp = false;
        let checked = e.target.checked;
        this.state.options.map((item) => {
            if (checked && !this.state.checkMap[item.id]) {
                this.notifyCheckChange(item, true);
            }
            if (!checked && this.state.checkMap[item.id]) {
                this.notifyCheckChange(item, false);
            }
            this.state.checkMap[item.id] = checked;
        })
        let checkType = this.getCheckStatus();
        this.setState({
            checkMap: {
                ... this.state.checkMap
            },
            indeterminate: checkType == 1,
            checkAll: checkType == 2
        });
    }


    getCheckStatus() {
        let hasChecked = false, checkedAll = true;
        for (let i = 0; i < this.state.options.length; i++) {
            let module_ = this.state.options[i];
            //
            if (this.state.checkMap[module_.id]) {
                hasChecked = true;
            } else {
                checkedAll = false;
            }
        }
        if (!hasChecked) {//取消所有选中 通知menu取消
            // this.notifyCheckChange(this.state.module, false);
            return 0;
        }
        //menu 有选中  通知
        // this.notifyCheckChange(this.state.module, true);
        if (hasChecked && !checkedAll) {
            return 1;
        }
        return 2;
    }

    notifyCheckChange(_module, checked) {
        //通知父组件记录
        this.props.notifyCheckChange(_module, checked);
    }

    render() {

        if (this.renderProp) {
            if (this.props.checkMap) {
                this.state.checkMap = this.props.checkMap;
                let hasChecked = false, checkedAll = true;
                for (let i = 0; i < this.state.options.length; i++) {
                    let module_ = this.state.options[i];
                    //
                    if (this.state.checkMap[module_.id]) {
                        hasChecked = true;
                    } else {
                        checkedAll = false;
                    }
                }
                if (!hasChecked) {//取消所有选中 通知menu取消
                    this.state.indeterminate = false;
                    this.state.checkAll = false;
                } else if (hasChecked && !checkedAll) {
                    this.state.indeterminate = true;
                    this.state.checkAll = false;
                } else {
                    this.state.indeterminate = false;
                    this.state.checkAll = true;
                }
            }
        }
        return (
            <div style={this.state.options ? { padding: '12px 24px' } : { padding: '12px 24px', paddingBottom: '0' }}>
                <div style={{ borderBottom: '1px solid #E9E9E9', paddingBottom: '12px' }}>
                    <Checkbox
                        indeterminate={this.state.indeterminate}
                        onChange={this.onCheckAllChange}
                        checked={this.state.checkAll}
                        disabled={this.props.disabled}
                    >
                        {this.state.module.moduleName}
                    </Checkbox>
                </div>
                {this.state.options ?
                    <Row style={{ padding: '6px 0 0 24px' }}>
                        {
                            this.state.options.map((item) => {
                                return (
                                    <Col style={{ paddingBottom: '6px' }} span={8}><Checkbox checked={this.state.checkMap[item.id]} onChange={(e) => this.onChange.bind(this, e.target.checked, item)()} disabled={this.props.disabled} value={item}>{item.moduleName}</Checkbox></Col>
                                )
                            })}
                    </Row> : ''}
            </div>
        )
    }
}

class AnthManage extends FreshComponent {

    state = {
        roleList: [],
        // webModule: {},
        selectedRole: {},
        adminModule: {},
        scrollId: Utils.guid(),
        roleAuthMap: {},
        menuDisabled: {},
        filtText: ''
    };

    storage = {
        add: [],
        addModuleId: [],
        remove: [],
        removeModuleId: []
    };

    init() {
        this.setState({
            roleList: (function () {
                let arr = [], list = Storage.get('roleList');
                for (let i = 0; i < list.length; i++) {
                    if (list[i].companyId == 0) {
                        continue;
                    }
                    arr.push(list[i]);
                }
                return arr;
            })(),
            adminModule: Storage.get('adminModule') || [],
        }, function () {
            this.onRoleSelected(null, this.state.roleList[0])
        });

    }

    editRole(role) {
        this.newRoleData = {};
        let that = this;
        Utils.modal({
            title: '编辑角色',
            onOk: function (fn) {
                if (!that.newRoleData.roleName || !that.newRoleData.remark) {
                    Utils.Message.error('请完善角色信息！');
                    return false;
                }
                return Utils.request({
                    params: {
                        ...that.newRoleData,
                        id: role.id,
                        type:role.type
                    },
                    api: Utils.getApi('角色管理','保存'),
                    success: function (data) {
                        let index, newrole = {};
                        for (let i = 0; i < that.state.roleList.length; i++) {
                            if (that.state.roleList[i].id === role.id) {
                                newrole = that.state.roleList[i];
                                index = i;
                                break;
                            }
                        }
                        that.state.roleList.splice(index, 1);
                        newrole.roleName = that.newRoleData.roleName;
                        newrole.remark = that.newRoleData.remark;
                        Utils.Message.success('修改成功！');
                        that.state.roleList.unshift(newrole);
                        that.setState({
                            roleList: that.state.roleList,
                            selectedRole: data
                        }, function () {
                            that.onRoleSelected(null, data)
                            Storage.set('roleList', that.state.roleList);
                        })
                    }
                })
            },
            onCancel: function () {

            },
            content: <NewRole role={role} notifyChange={this.receiveNewRoleData.bind(this)} />
        })
    }

    onRoleSelected(key, obj) {
        this.role = obj;
        let authList = obj.moduleList||[];
        this.state.roleAuthMap = {};
        this.storage = {
            add: [],
            addModuleId: [],
            remove: [],
            removeModuleId: []
        };
        for (let i = 0, ln = authList.length; i < ln; i++) {
            if(authList[i]){
                this.state.roleAuthMap[authList[i].id] = true;
            }
        }

        this.setState({
            roleAuthMap: this.state.roleAuthMap,
            selectedRole: this.role,
            roleName: this.role.roleName,
            isAdminRole: this.role.type===1
        })
    }

    componentDidMount() {
        ScrollBar.init(document.getElementById(this.state.scrollId));
        ScrollBar.init(document.getElementById('roleListscroll'));
        this.init();
    }

    addModal() {
        this.newRoleData = {};
        let that = this;
        Utils.modal({
            title: '新增角色',
            onOk: function (fn) {
                if (!that.newRoleData.roleName || !that.newRoleData.remark) {
                    Utils.Message.error('请完善角色信息！');
                    return false;
                }
                return Utils.request({
                    params: that.newRoleData,
                    api: Utils.getApi('角色管理','保存'),
                    success: function (data) {
                        Utils.Message.success('保存成功！');
                        that.refreshModalRole()
                        // that.state.roleList.unshift(that.newRoleData);
                        // that.setState({
                        //     roleList: that.state.roleList,
                        //     selectedRole: that.newRoleData
                        // }, function () {
                        //     that.onRoleSelected(null, data)
                        //     Storage.set('roleList', that.state.roleList);
                        // })
                    }
                })
            },
            onCancel: function () {

            },
            content: <NewRole notifyChange={this.receiveNewRoleData.bind(this)} />
        })
    }

    refreshModalRole(){
        let that = this
        Utils.request({
            api: '/api/web/enterprise/detail',
            success: function (res) {
                Storage.set('adminModule', res.enterpriseModule)
                Storage.set('roleList', res.enterpriseRoleList)
                that.init()
            }
        })
    }

    receiveNewRoleData(data) {
        this.newRoleData = data;
    }

    toggleMenuUsable(checked, _module) {
        this.state.menuDisabled[_module.id] = !checked;
        this.setState({
            menuDisabled: {
                ...this.state.menuDisabled
            }
        })

    }

    onAuthChanged(_module, checked) {
        let index = this.storage.removeModuleId.indexOf(_module.id);
        let _index = this.storage.addModuleId.indexOf(_module.id);
        if (checked) {
            //如果是选中
            if (index > -1) {
                //判断移除里面是否有 有移除则把移除去除
                this.storage.removeModuleId.splice(index, 1);
                this.storage.remove.splice(index, 1);
            } else {
                //没有 则往添加里面记录
                if (_index > -1) {
                    return
                }
                this.storage.addModuleId.push(_module.id);
                this.storage.add.push(_module);
            }
        } else {
            //取消选中
            if (_index > -1) {
                //判断新增里面是否有 有则把新增去除
                this.storage.addModuleId.splice(_index, 1);
                this.storage.add.splice(_index, 1);
            } else {
                if (index > -1) {
                    return
                }
                this.storage.removeModuleId.push(_module.id);
                this.storage.remove.push(_module);
            }
        }
    }

    filtRole(e) {
        this.setState({
            filtText: e.target.value
        })
    }

    saveAuth() {
        if (this.storage.add.length == 0 && this.storage.remove.length == 0) {
            return;
        }
        let that = this;
        let moduleList = new Array(),primitRole = Utils.deepclone(this.role),role = Utils.deepclone(this.role);
        (role.moduleList||[]).map((_module,index)=>{
            //移除去掉的权限
            if(this.storage.removeModuleId.indexOf(_module.id)==-1){
                moduleList.push(_module)
            }
        })
        this.storage.add.map(_module=>{
            //添加新增的权限
            moduleList.push(_module)
        })
        role.moduleList = moduleList;
        that.onRoleSelected(null,role)
        Utils.request({
            params: role,
            api: Utils.getApi('角色管理','保存'),
            beforeRequest() {
                that.setState({
                    saveloading: true,
                })
            },
            afterRequest() {
                that.setState({
                    saveloading: false,
                })
            },
            handleError(){
                that.onRoleSelected(null,primitRole)
            },
            success: function (data) {
                for (let i = 0; i < that.state.roleList.length; i++) {
                    if (that.state.roleList[i].id === that.role.id) {
                        that.state.roleList[i].moduleList = moduleList;
                    }
                }
                Utils.Message.success('修改成功！');
                that.setState({
                    roleList: that.state.roleList,
                }, function () {
                    // that.onRoleSelected(null, role)
                    Storage.set('roleList', that.state.roleList)
                })
            }
        })
    }

    render() {
        let that = this, authListWeb = '', authListAdmin = '';
        // if (this.state.webModule.subModuleList) {
        //     authListWeb = this.state.webModule.subModuleList.map((item) => {
        //         //存一级菜单
        //         return (
        //             <div style={{ border: '1px solid #cccccc' }}>
        //                 <div style={{ height: '40px', lineHeight: '40px', paddingLeft: '12px', background: '#e9ecf4' }}>
        //                     <span style={{ marginRight: '12px' }}>
        //                         {item.moduleName}
        //                     </span>
        //                     <Switch size="small" defaultChecked onChange={(checked) => this.toggleMenuUsable.bind(this, checked, item)()} style={{ position: 'relative', top: '-2px' }} />
        //                 </div>
        //                 {
        //                     (function () {
        //                         if (item.type === 'Function') {
        //                             let options = [];
        //                             if (item.subModuleList) {
        //                                 item.subModuleList.map((__item, index) => {
        //                                     if (__item.sort !== -4) {
        //                                         options.push({
        //                                             moduleName: __item.moduleName,
        //                                             moduleUrl: __item.moduleUrl,
        //                                             moduleId: __item.moduleId
        //                                         })
        //                                     }
        //                                 })
        //                                 return <AuthItem notifyCheckChange={that.onAuthChanged.bind(that)} disabled={that.state.menuDisabled[item.moduleId]} checkMap={that.state.roleAuthMap} module={item} options={options} />
        //                             } else {
        //                                 return ''
        //                             }
        //                         } else {
        //                             return item.subModuleList.map((_item, index) => {
        //                                 if (_item.sort === -4) {
        //                                     return ''
        //                                 }
        //                                 let options = [];
        //                                 if (_item.subModuleList) {
        //                                     _item.subModuleList.map((__item) => {
        //                                         if (__item.sort !== -4) {
        //                                             options.push({
        //                                                 moduleName: __item.moduleName,
        //                                                 moduleUrl: __item.moduleUrl,
        //                                                 moduleId: __item.moduleId
        //                                             })
        //                                         }
        //                                     })
        //                                     return <AuthItem key={'line2' + index} notifyCheckChange={that.onAuthChanged.bind(that)} disabled={that.state.menuDisabled[item.moduleId]} checkMap={that.state.roleAuthMap} module={_item} options={options} />
        //                                 } else {
        //                                     return ''
        //                                 }
        //                             })
        //                         }
        //                     })()

        //                 }
        //             </div>
        //         )
        //     })
        // }
        if (this.state.adminModule.subModuleList) {
            authListAdmin = this.state.adminModule.subModuleList.map((item) => {
                if(item.sort<1){
                    return ''
                }
                return (
                    <div style={{ border: '1px solid #cccccc' }}>
                        <div style={{ height: '40px', lineHeight: '40px', paddingLeft: '12px', background: '#e9ecf4' }}>
                            <span style={{ marginRight: '12px' }}>
                                {item.moduleName}
                            </span>
                            <Switch size="small" defaultChecked onChange={(checked) => this.toggleMenuUsable.bind(this, checked, item)()} style={{ position: 'relative', top: '-2px' }} />
                        </div>
                        {
                            (function () {
                                if (item.type === 'Function') {
                                    let options = [];
                                    if (item.subModuleList) {
                                        item.subModuleList.map((__item) => {
                                            options.push(__item)
                                        })
                                        return <AuthItem notifyCheckChange={that.onAuthChanged.bind(that)} disabled={that.state.menuDisabled[item.id]} checkMap={that.state.roleAuthMap} module={item} options={options} />
                                    } else {
                                        return ''
                                    }
                                } else {
                                    return item.subModuleList.map((_item, index) => {
                                        if (_item.sort <= 0) {
                                            return ''
                                        }
                                        let options = [];
                                        if (_item.subModuleList) {
                                            _item.subModuleList.map((__item) => {
                                                if (__item.sort >= 0) {
                                                    options.push(__item)
                                                }
                                            })
                                            return <AuthItem key={'line5' + index} notifyCheckChange={that.onAuthChanged.bind(that)} disabled={that.state.menuDisabled[item.id]} checkMap={that.state.roleAuthMap} module={_item} options={options} />
                                        } else {
                                            return ''
                                        }
                                    })
                                }
                            }())
                        }
                    </div>
                )
            })
        }

        const content = (

            <div className="role-container" style={{ background: '#fff' }}>
                <div className="left">
                    <div className="search-box">
                        <Input placeholder="搜索角色" value={this.state.filtText} suffix={<i onClick={() => this.setState({ filtText: '' })} className="iconfont icon-guanbi"></i>} onChange={this.filtRole.bind(this)} type="text" />
                    </div>
                    <div id="roleListscroll" style={{ height: 'calc(100vh - 217px)', overflow: 'auto', borderTop: '1px solid #ccc' }}>
                        <div>
                            {
                                that.state.roleList.map((role) => {
                                    return (
                                        <div onClick={() => this.onRoleSelected.bind(this, null, role)()} className={"roleList-item " + (that.state.selectedRole.id === role.id ? 'curr' : '') + ((role.roleName.indexOf(this.state.filtText) == -1 && this.state.filtText !== '') ? ' hide' : '')}>
                                            <div className="head">{role.roleName} <span onClick={(e) => { e.stopPropagation(); this.editRole.bind(this, role)() }} className="edit"><i className="icon-bianji iconfont"></i></span></div>
                                            <div className="detail">{role.remark}</div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '16px', textAlign: 'center', width: '100%' }}>
                        <Button onClick={this.addModal.bind(this)} className="common white" text="新增角色" />
                    </div>
                </div>
                <div className="right" style={{ width: 'calc(100% - 221px)', float: 'right' }}>
                    <div style={{ width: '100%', paddingLeft: '12px', background: '#e9ecf4', height: '40px', lineHeight: '40px' }}>
                        <span style={{ fontWeight: 'bold', color: '#333333', marginRight: '16px' }}>{this.state.selectedRole.roleName}权限</span>
                        {this.state.isAdminRole ? <span style={{ fontSize: '10px', color: '#aaaaaa' }}>默认权限不可更改</span> : ''}
                        <Button loading={this.state.saveloading} disabled={this.state.isAdminRole} onClick={this.saveAuth.bind(this)} style={{ float: 'right', margin: '5px 12px' }} className="common " text="保存" />
                    </div>
                    <div style={{ padding: '16px', height: 'calc(100vh - 200px)' }} id={this.state.scrollId}>
                        <div>
                            {authListWeb}
                        </div>
                        <div>
                            {authListAdmin}
                        </div>
                    </div>
                </div>
            </div>
        );
        return <ScrollContainer init loading={this.state.pageloading} content={content} />;
    }
}


export default class extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <Reload {...this.props} component={AnthManage} />
    }
}