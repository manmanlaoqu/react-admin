import React from 'react'
// import './index.scss';
import ScrollContainer from '../index'
import FreshComponent from '../freshbind'
import Reload from '../reload'
import Button from '../../lib/button'
import Storage from 'gc-storage/es5'
import Utils from 'utils/utils'
import { Tabs } from 'antd';
const { TabPane } = Tabs;

class Safety extends FreshComponent {

    constructor(props) {
        super(props);
        this.state = {
            userPhone: Storage.get('userInfo').userPhone,
            validateCode: '',
            validateCodeLogin: '',
            isSetPayPwd: Storage.get('isSetPayPwd'),
            codeBtnText: '获取验证码',
            codeBtnTextLogin: '获取验证码',
            activeTab: '1',
            paypassword: '',
            loginPassword: '',
            timer1: null,
            timer0: null
        }
    }
 
    count() {
        let that = this;
        Utils.request({
            api: '/api/external/common/resetpaysms' ,
            params: {
                userPhone: this.state.userPhone
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
            success() {
                that.countDown()
            }
        })
        that.countDown()
    }
    countLogin() {
        let that = this;
        Utils.request({
            api: '/api/external/common/resetpwdsms',
            params: {
                userPhone: this.state.userPhone
            },
            beforeRequest() {
                that.setState({
                    loadingLogin: true
                })
            },
            afterRequest() {
                that.setState({
                    loadingLogin: false
                })
            },
            success() {
                that.countDownLogin()
            }
        })
        that.countDownLogin()
    }
    countDown() {
        this.setState({
            counting: true,
        })
        let that = this, a = 61, timer0;
        timer0 = setInterval(function () {
            a--;
            if (a < 0) {
                clearInterval(timer0);
                that.setState({
                    codeBtnText: '获取验证码',
                    counting: false
                })
                return;
            }
            that.setState({
                codeBtnText: a + '秒'
            })
        }, 1000)
        this.setState({
            timer0,
        })
    }
    
    countDownLogin() {
        this.setState({
            countingLogin: true,
        })
        let that = this, a = 61, timer1;
        timer1 = setInterval(function () {
            a--;
            if (a < 0) {
                clearInterval(timer1);
                that.setState({
                    codeBtnTextLogin: '获取验证码',
                    countingLogin: false
                })
                return;
            }
            that.setState({
                codeBtnTextLogin: a + '秒'
            })
        }, 1000)
        this.setState({
            timer1,
        })
    }

    save() {
        let that = this;
        Utils.request({
            api: Utils.getApi('账户安全', '支付修改密码'),
            params: {
                userPhone: this.state.userPhone,
                validateCode: this.state.validateCode,
                newPayPwd: Utils.md5(this.state.paypassword) 
            },
            beforeRequest() {
                that.setState({
                    saving: true
                })
            },
            afterRequest() {
                that.setState({
                    saving: false
                })
            },
            success() {
                Utils.Message.success('操作成功！');
                Storage.set('isSetPayPwd', true);
                that.setState({
                    isSetPayPwd: true
                })
                that.props.reload();
            }
        })
    }


    saveLogin() {
        let that = this;
        Utils.request({
            api: Utils.getApi('账户安全', '登录修改密码') ,
            params: {
                userPhone: this.state.userPhone,
                validateCode: this.state.validateCodeLogin,
                password:  Utils.md5(this.state.newLoginPassword)
            },
            beforeRequest() {
                that.setState({
                    savingLogin: true
                })
            },
            afterRequest() {
                that.setState({
                    savingLogin: false
                })
            },
            success() {
                Utils.Message.success('操作成功！');
                that.props.reload();
            }
        })
    }


    calcPwd () {
        let pwd = this.state.activeTab == '0' ? this.state.paypassword : this.state.loginPassword;
        let newPwd = this.state.activeTab == '0' ? this.state.newPwd : this.state.newLoginPassword;
        let len = this.state.activeTab == '0' ? 6 : 8;
        if (!pwd && !newPwd) {
            return 0;
        }
        if (pwd && pwd.length < len) {
            return 2;
        }
        if (!Utils.PAY_PWD_REG.test(pwd)) {
            return 2
        }
        if (pwd && newPwd && pwd !== newPwd) {
            return 3;
        }
        return -1
    }
    tabChange = (key) => { 
        this.setState({
            activeTab: key,
        })
      }
    render() {
        const content = <div style={{ padding: '60px' }}>
            <div style={{ padding: '12px', marginBottom: '16px' }}>
                点击<span style={{ color: '#ff7800' }}>“获取验证码”</span>按钮，获取手机号
                <span style={{ color: '#ff7800' }}>{this.state.userPhone.toStarEncrypt()}</span>
                的验证码
            </div>
            <div style={{ padding: '12px' }}>
                <span style={{ display: 'inline-block', width: '90px', textAlign: 'right', marginRight: '12px' }}>
                    验证码
                </span>
                <input style={{ width: '210px', padding: '6px 12px', borderRadius: '3px' }} placeholder="验证码" value={this.state.validateCode} onChange={(e) => { this.setState({ validateCode: e.target.value.toNum() }) }} maxLength={4} type="text" />
                <Button style={{ fontSize: '12px', marginLeft: '12px', height: '23px' }} className="common" loading={this.state.loading} disabled={this.state.counting} onClick={this.count.bind(this, 'resetpaysms')} text={this.state.codeBtnText} />
            </div>
            <div style={{ padding: '12px' }}>
                <span style={{ display: 'inline-block', width: '90px', textAlign: 'right', marginRight: '12px' }}>
                    支付密码
                </span>
                <input style={{ width: '210px', padding: '6px 12px', borderRadius: '3px' }}
                    placeholder="新密码" 
                    value={this.state.paypassword}
                    autoComplete="new-password"
                    onChange={(e) => { this.setState({ paypassword: e.target.value }) }}
                    maxLength={6} type="password" />
                {this.calcPwd() > 0 ? <span style={{ marginLeft: '24px', fontSize: '12px', color: 'red' }}>
                    <i style={{ fontSize: '12px', marginRight: '4px' }} className="iconfont icon-fail1f"></i>
                    {(function (status) {
                        switch (status) {
                            case 2:
                                return '设置6位支付密码，支付密码需为数字跟字母的组合';
                            case 3:
                                return '密码不一致'
                            default:
                                return ''
                        }
                    })(this.calcPwd())}
                </span> : null}
            </div>
            <div style={{ padding: '12px' }}>
                <span style={{ display: 'inline-block', width: '90px', textAlign: 'right', marginRight: '12px' }}>
                    确认支付密码
                </span>
                <input  autoComplete="new-password" style={{ width: '210px', padding: '6px 12px', borderRadius: '3px' }} placeholder="确认新密码" value={this.state.newPwd} onChange={(e) => { this.setState({ newPwd: e.target.value }) }} maxLength={6} type="password" />
            </div>
            <div style={{ margin: '36px 0 0 170px' }}>
                <Button text="保存" className="common" disabled={this.calcPwd() != -1 || this.state.validateCode.length !== 4} loading={this.state.saving} onClick={this.save.bind(this)} />
            </div>
        </div>
        const contentPwd = <div style={{ padding: '60px' }}>
                <div style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-block', width: '90px', textAlign: 'right', marginRight: '12px' }}>
                        手机号
                    </span>
                    {this.state.userPhone.toStarEncrypt()}
                </div>

                <div style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-block', width: '90px', textAlign: 'right', marginRight: '12px' }}>
                        验证码
                    </span>
                    <input style={{ width: '210px', padding: '6px 12px', borderRadius: '3px' }} placeholder="验证码" value={this.state.validateCodeLogin} onChange={(e) => { this.setState({ validateCodeLogin: e.target.value.toNum() }) }} maxLength={4} type="text" />
                    <Button style={{ fontSize: '12px', marginLeft: '12px', height: '23px' }} className="common" loading={this.state.loadingLogin} disabled={this.state.countingLogin} onClick={this.countLogin.bind(this, 'resetLoginsms')} text={this.state.codeBtnTextLogin} />
                </div>
                <div style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-block', width: '90px', textAlign: 'right', marginRight: '12px' }}>
                        新密码
                    </span>
                    <input style={{ width: '210px', padding: '6px 12px', borderRadius: '3px' }}
                        placeholder="新密码"
                        value={this.state.loginPassword}
                        autoComplete="new-password"
                        onChange={(e) => { this.setState({ loginPassword: e.target.value }) }}
                        maxLength={20} type="password" />
                    {this.calcPwd() > 0 ? <span style={{ marginLeft: '24px', fontSize: '12px', color: 'red' }}>
                        <i style={{ fontSize: '12px', marginRight: '4px' }} className="iconfont icon-fail1f"></i>
                        {(function (status) {
                            switch (status) {
                                case 2:
                                    return '设置8-20位登陆密码，登陆密码需为数字跟字母的组合';
                                case 3:
                                    return '密码不一致'
                                default:
                                    return ''
                            }
                        })(this.calcPwd())}
                    </span> : null}
                </div>
                <div style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-block', width: '90px', textAlign: 'right', marginRight: '12px' }}>
                        确认新密码
                    </span>
                    <input  autoComplete="new-password" style={{ width: '210px', padding: '6px 12px', borderRadius: '3px' }} placeholder="确认新密码" value={this.state.newLoginPassword} onChange={(e) => { this.setState({ newLoginPassword: e.target.value }) }} maxLength={20} type="password" />
                </div>
                <div style={{ margin: '36px 0 0 170px' }}>
                    <Button text="保存" className="common" disabled={this.calcPwd() != -1 || this.state.validateCodeLogin.length !== 4} loading={this.state.savingLogin} onClick={this.saveLogin.bind(this)} />
                </div>
                </div>
        return (
            <div className="safeSet" >
                <Tabs onChange={this.tabChange} >
                    {
                        Utils.getApi('账户安全', '登录修改密码') ?  <TabPane tab={'设置登录密码'} key="1" forceRender={true}> </TabPane> : ''
                    }
                    {
                        Utils.getApi('账户安全', '支付修改密码') ? <TabPane tab={this.props.find ? '找回支付密码' : (this.state.isSetPayPwd ? '修改支付密码' : '设置支付密码')} key="0"  forceRender={true}></TabPane> : ''
                    }
                </Tabs>
                { this.state.activeTab == '1' ?  (Utils.getApi('账户安全', '登录修改密码') ? contentPwd : '') : (Utils.getApi('账户安全', '支付修改密码') ? content : '')  }
            </div>
        )
    }
}
export default class extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <Reload {...this.props} component={Safety} />
    }
}