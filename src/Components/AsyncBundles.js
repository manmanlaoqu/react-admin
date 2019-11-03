import asyncComponent from "../lib/asyncComponent";

 const NewOrder = asyncComponent(()=> import('./page/newOrder'));//新建订单
 const CarList = asyncComponent(()=> import('./page/carManage'));//车辆管理
 const OrderManage = asyncComponent(()=> import('./page/orderManage'));
 const GroupList = asyncComponent(()=> import('./page/groupList'));//团队列表
 const RoleManage = asyncComponent(()=> import('./page/roleManage'));//角色管理
 const InvoiceList = asyncComponent(()=> import('./page/invoiceList'));//发票管理 
 const Home = asyncComponent(()=> import('./page/home'));//首页
 const ContactList = asyncComponent(()=> import('./page/contactList'));// 
 const Nopage = asyncComponent(()=> import('./page/404'));// 
 const DriverList = asyncComponent(()=> import('./page/driverManage'));//司机管理
 const PayeeList = asyncComponent(()=> import('./page/payeeManage'));
 const OrderDetail = asyncComponent(()=> import('./page/orderDetail'));
 const Pocket = asyncComponent(()=> import('./page/pocket'));
 const Safety = asyncComponent(()=> import('./page/safety'));
 const Config = asyncComponent(()=> import('./page/config'));
 const PersonalCenter = asyncComponent(()=> import('./page/personalCenter')); //个人信息
 const CompanyInfo = asyncComponent(()=> import('./page/companyInfo')); //企业信息
 const OilCardApplication = asyncComponent(()=> import('./page/oilCardApplication')); //油卡管理
 const ApplyManage = asyncComponent(()=> import('./page/applyManage')); //油卡管理
 const OrderPayManage = asyncComponent(()=> import('./page/orderPayManage')); //油卡管理
 const OrderPayHistory = asyncComponent(()=> import('./page/orderPayHistory')); //油卡管理
 const ApplyHistory = asyncComponent(()=> import('./page/applyHistory'));
 const InvoiceConfig = asyncComponent(()=> import('./page/invoiceConfig'))
 const InvoiceAddress = asyncComponent(()=> import('./page/invoiceAddress'))
 const OrderPayList = asyncComponent(()=> import('./page/orderPayList'))


// export const Example = asyncComponent(()=>import('./Home'));
export default {
    NewOrder,
    OrderDetail,
    Home,
    CarList,
    DriverList,
    OrderManage,
    User:GroupList,
    Role:RoleManage,
    Invoice:InvoiceList,
    Address:ContactList,
    Nopage,
    Pocket,
    PayeeList,
    Safety,
    Config,
    PersonalCenter,
    CompanyInfo,
    OilCard:OilCardApplication,
    ApplyManage,
    OrderPayManage,
    OrderPayHistory,
    ApplyHistory,
    InvoiceConfig,
    InvoiceAddress,
    OrderPayList
}