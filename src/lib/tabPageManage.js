import React from 'react';
import Page from '../Components/AsyncBundles';

export default function (opts, ext, onRoute) {
    const listener = 'on' + opts + 'Refresh';
    if (opts.indexOf('订单详情') > -1) {
        return onRoute ? ('orderDetail/' + opts.split('-')[1]) : <Page.OrderDetail listener={listener} {...ext} apikey="新建订单" />
    }
    if (opts.indexOf('复制订单') > -1) {
        return onRoute ? 'newOrder' : <Page.NewOrder listener={listener} {...ext} apikey="新建订单" />
    }
    try {
        switch (opts) {
            case '首页':
                return onRoute ? 'home' : <Page.Home />
            case '订单管理':
                return onRoute ? 'orderManage' : <Page.OrderManage listener={listener} {...ext} apikey="订单管理" />
            // case '创建订单':
            //     return <Page.NewOrder listener={listener} {...ext} />
            case '新建订单':
                return onRoute ? 'newOrder' : <Page.NewOrder listener={listener} {...ext} apikey="新建订单" />
            // case 'financialSettle':
            //     return <Page.FinancialSettle listener={listener} />
            // case 'companyAccount':
            //     return <Page.CompanyAccount listener={listener} />
            case '团队列表':
                return onRoute ? 'user' : <Page.User listener={listener} apikey="团队列表" />
            case '角色管理':
                return onRoute ? 'role' : <Page.Role listener={listener} apikey="角色管理" />
            case '常用联系人':
                return onRoute ? 'address' : <Page.Address listener={listener} {...ext} apikey="常用联系人" />
            case '企业钱包':
                return onRoute ? 'pocket' : <Page.Pocket listener={listener} apikey="企业钱包" />
            case '账户安全':
                return onRoute ? 'safety' : <Page.Safety listener={listener} {...ext} apikey="账户安全" />
            case '策略配置':
                return onRoute ? 'config' : <Page.Config listener={listener} apikey="策略配置" />
            case '个人中心':
                return onRoute ? 'personalCenter' : <Page.PersonalCenter listener={listener} apikey="个人中心" />
            case '企业信息':
                return onRoute ? 'companyInfo' : <Page.CompanyInfo listener={listener} apikey="企业信息" />
            /*******************************************运力管理*********************************************/
            case '车辆管理':
                return onRoute ? 'newOrder' : <Page.CarList listener={listener} {...ext} apikey="车辆管理" />
            case '司机管理':
                return onRoute ? 'newOrder' : <Page.DriverList listener={listener} {...ext} apikey="司机管理" />
            case '收款人管理':
                return onRoute ? 'newOrder' : <Page.PayeeList listener={listener} {...ext} apikey="收款人管理" />
            case '油卡管理':
                return onRoute ? 'oilCard' : <Page.OilCard listener={listener}  {...ext} apikey="油卡管理" />
            /*******************************************发票管理*********************************************/
            case '申请开票':
                return onRoute ? 'invoice' : <Page.OrderManage listener={listener} {...ext} type="WAIT_BILLING" hideTab apikey="申请开票" />
            case '开票记录':
                return onRoute ? 'invoice' : <Page.Invoice listener={listener} apikey="开票记录" />
            case '发票信息管理':
                return onRoute ? 'invoiceConfig' : <Page.InvoiceConfig listener={listener} apikey="发票信息管理" />
            case '邮寄地址管理':
                return onRoute ? 'invoiceAddress' : <Page.InvoiceAddress listener={listener} apikey="邮寄地址管理" />
            /*******************************************运费支付*********************************************/
            case '付款申请':
                return onRoute ? 'orderPayList' : <Page.OrderPayList listener={listener}  {...ext} apikey="付款申请" />
            case '付款审核':
                return onRoute ? 'applyManage' : <Page.ApplyManage listener={listener}  {...ext} apikey="付款审核" />
            case '运费支付':
                return onRoute ? 'orderPayManage' : <Page.OrderPayManage listener={listener}  {...ext} apikey="运费支付" />
            case '支付记录':
                return onRoute ? 'orderPayHistory' : <Page.OrderPayHistory listener={listener}  {...ext} apikey="支付记录" />
            default:
                return onRoute ? 'nopage' : <Page.Nopage />
        }
    } catch (e) {
        return <Page.Nopage />
    }

}