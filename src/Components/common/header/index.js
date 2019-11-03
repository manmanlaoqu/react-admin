import React from 'react';
import { Popover, Upload, Input, Icon } from 'antd';
import Avatar from '../../lib/avatar';
import Events from 'gc-event/es5'
import Utils from 'utils/utils';
import {Feedback} from '../../../rd/common'
import Storage from 'gc-storage/es5';
import './index.scss';

class Modify extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...props.user
        };
        let that = this;
        this.uploadProps = {
            name: 'files',
            action: Utils.API + '/api/static/img/upload',
            headers: {
                authorization: 'authorization-text',
            },
            // accept:"image/*",
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
                    let url = info.file.response.body.resUrls[0];
                    Utils.Message.success('上传成功！');
                    that.setState({
                        avatarUrl: url
                    })
                    that.props.onChange('avatarUrl', url)
                } else if (info.file.status === 'error') {
                    Utils.Message.error('上传失败！');
                }
            },
        }
    }
    render() {
        const { avatarUrl, userName, userPhone, nickName, idCardNo } = { ...this.state }
        return (
            <div>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'inline-block', position: 'relative', padding: '12px', border: '1px solid #ccc', borderRadius: '3px' }}>
                        <Avatar width={68} height={68} src={avatarUrl} />
                        <Upload {...this.uploadProps}>
                            <i style={{ position: 'absolute', right: '0', top: '0', fontSize: '10px' }} className="iconfont clickable icon-edit"></i>
                        </Upload>
                    </div>
                </div>
                <Input maxLength={20} readOnly disabled style={{ margin: '3px 0' }} onChange={(e) => { this.setState({ userName: e.target.value }); this.props.onChange('userName', e.target.value) }} addonBefore={<span style={{ width: '80px', display: 'inline-block' }}>用户名</span>} value={userName} />
                <Input maxLength={11} readOnly disabled style={{ margin: '3px 0' }} onChange={(e) => { this.setState({ userPhone: e.target.value.toNum() }); this.props.onChange('userPhone', e.target.value.toNum()) }} addonBefore={<span style={{ width: '80px', display: 'inline-block' }}>手机号</span>} value={userPhone} />
                {/* <Input maxLength={20} style={{ margin: '3px 0' }} onChange={(e) => { this.setState({nickName:e.target.value});this.props.onChange('nickName', e.target.value) }} addonBefore={<span style={{ width: '80px', display: 'inline-block' }}>昵称</span>} value={nickName} /> */}
                <Input maxLength={20} readOnly disabled style={{ margin: '3px 0' }} addonBefore={<span style={{ width: '80px', display: 'inline-block' }}>身份证号</span>} value={idCardNo} />
            </div>
        )
    }
}

class UserCenter extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user: Storage.get('userInfo')
        }
    }

    logout() {
        Utils.request({
            api: '/api/web/me/logout',
            success: function (data) {

            }
        })
        window.location.href = window.location.origin + window.location.pathname + '#/login?v=' + Utils.gethashcode();
    }

    userModify() {
        const user = Storage.get('userInfo');
        let d = {}, that = this;
        let change = function (key, value) {
            d[key] = value
        };
        Utils.modal({
            title: '用户信息修改',
            okText: '保存',
            width: 400,
            cancelText: '取消',
            onOk: function (fn) {
                if (JSON.stringify(d) === '{}') {
                    return;
                }
                return Utils.request({
                    api: '/api/web/me/update',
                    params: d,
                    success: function (data) {
                        Utils.Message.success('修改成功！');
                        that.props.onUserInfoChange({
                            ...that.state.user,
                            ...d
                        })
                    }
                })
            },
            onCancel: function () {

            },
            content: <Modify onChange={change} user={user} />
        })
    }

    goPage(page) {
        Events.emit('addTab', { moduleText: page, module: page })
    }

    render() {
        const user = { ...this.state.user };
        return (
            <div className="user-center-pop">
                <div style={{ width: '120px', textAlign: 'center', position: 'relative' }}>
                    <div className="user-center-item" onClick={this.goPage.bind(this, '个人中心')} >个人信息</div>
                    {/* <div className="user-center-item" onClick={this.goPage.bind(this,'企业信息')} >企业信息</div> */}
                </div>
                <div className="user-center-logout" onClick={this.logout.bind(this)}>
                    退出 <i style={{ position: 'absolute', right: '0' }} className="iconfont icon-tuichu"></i>
                </div>
            </div>

            // <div>
            //     <div style={{ width: '260px', padding: '12px', position: 'relative' }}>
            //         <div>
            //             姓名：{user.userName}
            //         </div>
            //         <div>
            //             手机号：{user.userPhone}
            //         </div>
            //         <div>
            //             身份证：{user.idCardNo}
            //         </div>
            // <i onClick={this.userModify.bind(this)} className="iconfont clickable icon-bianji" style={{ position: 'absolute', right: '6px', top: '12px', fontSize: '16px' }}></i>
            //     </div>
            //     <div onClick={this.logout.bind(this)} style={{ padding: '6px 12px', cursor: 'pointer', textAlign: 'center', borderTop: '1px solid #ccc' }}>
            //         退出 <i style={{ float: 'right' }} className="iconfont icon-tuichu"></i>
            //     </div>
            // </div>
        )
    }
}

export default class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            height: 56,
            user: { ...this.props.user }
        };
    }

    componentWillMount() {
        let that = this;
        this.trigger = function () {
            Events.emit('toggleMenu', (status) => {
                that.setState({
                    collapsed: status
                })
            })
        }
        Events.on('onHeadModify', function (user) {
            that.onUserInfoChange(user);
        })
        Events.on('fullScreen', function (call) {
            that.setState({
                height: that.state.height > 0 ? 0 : 56
            });
        });
    }

    onUserInfoChange(user) {
        this.setState({
            user: { ...user }
        })
    }

    render() {
        return (
            <div className="yg-head-container" style={{ height: this.state.height }}>
                <div className="yg-header">
                    <div className="yg-logo">
                        <div className="menu-toggle">
                            <i onClick={this.trigger} className={"iconfont icon-zhankai-copy " + (this.state.collapsed ? 'collapsed' : '')}></i>
                        </div>
                    </div>
                    <div className="user-center">
                        <div className="service-tell">
                            <Popover placement="bottom" content={<div style={{ padding: '0px 12px', textAlign: 'center', color: '#000' }}>010-50822482</div>} trigger="hover">
                                <span><i className="iconfont icon-telephone"></i>客服</span>
                            </Popover>
                        </div>
                        <div className="service-tell" onClick={Feedback}>
                            <span><i className="iconfont icon-fankui"></i>反馈</span>
                        </div>
                        <Popover placement="bottomRight" content={<UserCenter onUserInfoChange={this.onUserInfoChange.bind(this)} />} trigger="click">
                            <div className="user-ctrl">
                                <div className="user-head">
                                    <Avatar circle width={30} height={30} src={this.state.user.avatarUrl} />
                                </div>
                                <div className="info">
                                    <span style={{ marginRight: '12px' }} className="yg-color">您好！{this.state.user.nickName || this.state.user.userName}</span>
                                    <Icon type="caret-down" />
                                </div>
                            </div>
                        </Popover>
                    </div>
                </div>
                <div className="header-line"></div>
            </div >
        )
    }
}