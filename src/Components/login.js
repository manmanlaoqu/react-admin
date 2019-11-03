import React from 'react';
import { Form, Input } from 'antd';
import Button from './lib/button';
import Utils from 'utils/utils';
import { Tabs } from 'antd';
import { Checkbox } from 'antd';
import { message } from 'antd';
import { Modal} from 'antd';
const { TabPane } = Tabs;

const FormItem = Form.Item;

class Login extends React.Component {

  state = {
    loginName: '',
    password: '',
    validateCode: '',
    type: '0',
    codeBtnText: '获取验证码',
    visible: false 
   
  }
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  
  hideModal = () => {
    this.setState({
      visible: false,
    });
  };
  st(key, val) {
    this.state[key] = val;
    this.setState({
      ...this.state
    })
  }

  login() {
    let that = this;
    /**
     * dev
     */
    if (!this.state.loginName || (!this.state.password && this.state.type === '0') || (!this.state.validateCode && this.state.type === '1')) {
      Utils.Message.warning('请输入登录手机号和密码！');
      return;
    }
    let p = {
      phone: this.state.loginName,
      password: Utils.md5(this.state.password),
      validateCode: this.state.validateCode,
      type: this.state.type
    };
    if (this.useCode) {
      delete p['password'];
    }
    Utils.request({
      api: '/api/web/me/login',
      params: p,
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
      onError() {
        that.setState({
          loading: false
        })
      },
      success: function (res) {
        localStorage.setItem('loginInfo', JSON.stringify(res));
        Utils.setCookie('tokenId', res.sessionId);
        that.props.history.push('/manage');
      }
    })
  }

  doCountDown() {
    let that = this, a = 61,
      timer = setInterval(function () {
        a--;
        if (a === 0) {
          clearInterval(timer);
          that.setState({
            codeBtnText: '获取验证码',
            countDown: false,
          })
          return;
        }
        that.setState({
          codeBtnText: a + 's'
        })
      }, 1000)
  }

  sendCode() {
    let that = this;
    if (!this.state.loginName || this.state.countDown) {
      return;
    }
    if (!Utils.PHONE_REG.test(this.state.loginName)) {
      Utils.Message.warning('请输入正确的手机号！');
      return
    }
    Utils.request({
      api: '/api/external/common/loginsms',
      params: {
        userPhone: this.state.loginName
      },
      beforeRequest() {
        that.setState({
          countDown: true
        })
      },
      onError() {
        that.setState({
          countDown: false
        })
      },
      success() {
        that.useCode = true;
        that.doCountDown()
      }
    })
  }

  keyLogin(e) {
    if (e.keyCode === 13) {
      this.login();
    }
  }
  forgetpassword(){
    message.success('忘记密码请先使用验证码登陆后再进行密码修改！');
  }
  /**
   * 登录tab切换
   */
  tabChange = (key) => { 
    this.setState({
      password: '',
      type: key,
      validateCode: ''
    })
  }
  render() {
    return (
      <div className="login-bg">
        <div className="login-head">
          <div className="yg-logo">
            <div className="logo">
              <div></div>
            </div>
            <div className="logo-text" >
              <div className="cn">优挂企业版</div>
              <div className="en">Utrailer For Enterprise</div>
            </div>
          </div>
        </div>
        <div className="login-form">
          <div className="lg-form">
            <Tabs defaultActiveKey={'0'} onChange={this.tabChange}>
              <TabPane tab="密码登录" key="0" >
                  <Form onSubmit={this.handleSubmit}>
                      <FormItem>
                        <Input onKeyDown={this.keyLogin.bind(this)} maxLength={11} value={this.state.loginName} onChange={(e) => this.st('loginName', e.target.value.toNum())} prefix={<i className="icon-jcf-phone iconfont" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="请输入手机号" />
                      </FormItem>
                    <FormItem style={{ position: 'relative' }} style={{ marginBottom:15 }}>
                          <Input onKeyDown={this.keyLogin.bind(this)} maxLength={20} value={this.state.password} onChange={(e) => this.st('password', e.target.value)} prefix={<i className="icon-jcf-phone iconfont" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="请输入密码" type="password" />
                    <Checkbox defaultChecked={true}>记住密码 </Checkbox>
                              <a style={{float:"right"}} onClick={this.showModal} >忘记密码</a>
                              <Modal
                                    title='提示'
                                    visible={this.state.visible}
                                    onOk={this.hideModal}
                                    onCancel={this.hideModal}
                                    okText="确认"
                                  >
                                    <p>忘记密码需先用验证码登陆然后再更改密码！</p>
                                  </Modal>
                      </FormItem>                               
                      <Button className="common" loading={this.state.loading} onClick={this.login.bind(this)} text="登录" />
                    </Form>
                </TabPane>
              <TabPane tab="验证码登录" key="1">
                <Form onSubmit={this.handleSubmit}>
                        <FormItem>
                          <Input onKeyDown={this.keyLogin.bind(this)} maxLength={11} value={this.state.loginName} onChange={(e) => this.st('loginName', e.target.value.toNum())} prefix={<i className="icon-jcf-phone iconfont" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="请输入手机号" />
                        </FormItem>
                        <FormItem style={{ position: 'relative' }}>
                          <span disabled={this.state.countDown} onClick={this.sendCode.bind(this)} className={"login-verify-btn " + (this.state.countDown ? 'disabled' : '')}>{this.state.codeBtnText}</span>
                          <Input onKeyDown={this.keyLogin.bind(this)} maxLength={4} onChange={(e) => this.st('validateCode', e.target.value)} prefix={<i className="icon-yanzhengma iconfont" style={{ color: 'rgba(0,0,0,.25)' }} />} type="text" placeholder="请输入密码" />
                        </FormItem>
                        <Button className="common" loading={this.state.loading} onClick={this.login.bind(this)} text="登录" />
                    </Form>
                </TabPane>
            </Tabs>
         
          </div>
        </div>
      </div>
    );
  }
}
export default Login;