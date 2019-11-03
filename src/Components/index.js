import React from 'react';
import Route from "react-router-dom/Route";
import Redirect from "react-router-dom/Redirect";
import Switch from "react-router-dom/Switch"
// import BrowerHistory from 'react-router-dom/BrowserRouter'
import Login from './login';
import App from './app'
import Help from '../Components/page/help'
import { LocaleProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import 'moment/locale/zh-cn'
import Dynamics from './dynamics'
import Utils from '../lib/utils'
import Storage from 'gc-storage/es5'
export default class extends React.Component {
    componentDidMount() {
        Utils.hasPage = function (page) {
            return Storage.get('apiMap')[page] ? true : false
        };
        Utils.getApi = function (page, btn) {
            if (!Storage.get('apiMap')[page]) {
                return null;
            }
            return Storage.get('apiMap')[page][btn]
        };
        Utils.updatePocket = function () {
            Utils.request({
                api: '/api/web/enterprise/info',
                success: function (res) {
                    Storage.set('usableAmount', res.usableAmount)
                    Storage.set('balanceAmount', res.balanceAmount)
                    Storage.set('rebateAmount', res.rebateAmount)
                }
            })
        }
        Utils.getInvoiceModel = function() {
            let config = Storage.get('companyConfig') || {}
            config.invoiceTitleName = config.invoiceTitleName || ''
            if (config.invoiceTitleName.indexOf('浙江') > -1) {
                return {
                    bank: '中国建设银行嘉兴分行营业部',
                    company: '浙江优挂供应链管理有限公司',
                    account: '3305 0163 8047 0000 1368',
                    contractTemplate: this.CONTRACT_TEMPLATE
                }
            } else {
                return {
                    bank: '建设银行中关村软件园支行',
                    company: '安徽优挂供应链管理有限公司',
                    account: '1105 0188 3800 0000 2662',
                    contractTemplate: this.CONTRACT_TEMPLATE1
                }
            }
        }
    }

    render() {
        return (
            <LocaleProvider locale={zh_CN}>
                <Switch history>
                        <Route path="/" exact render={() => <Redirect to="/manage" />} />
                        <Route path="/login" exact component={Login} />
                        <Route path="/manage" exact render={() => { return <App/> }} />
                        <Route path="/help" exact render={() => <Redirect to="/help/new" />} />
                        <Route path="/help/:path" component={Help} />
                        <Route path={"/:path"} component={Dynamics} />
                    </Switch>
            </LocaleProvider>
        );
    }
}