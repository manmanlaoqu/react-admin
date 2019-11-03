var template ={
    New:{
        name:'创建订单',
        btns:{
            DriverList:'选择司机',
            VehicleList:'选择车辆',
            ContactList:'选择常用联系人',
            
        }
    }
	
}

// "创建订单": {
//     "查询订单选择司机": "/api/web/order/driver/list",
//     "查询订单选择车辆": "/api/web/order/vehicle/list",
//     "添加常用联系人": "/api/admin/enterprise/address/upsert",
//     "查询常用联系人": "/api/admin/enterprise/address/list",
//     "添加": "/api/web/order/saveOrderRecord",
//     "指派司机": "/api/web/order/updateEnterpriseOrderDriver"
// },
// "订单管理": {
//     "预付款支付": "/api/web/payment/pay",
//     "尾款支付": "/api/web/payment/pay",
//     "回单支付": "/api/web/payment/pay",
//     "查询订单选择车辆": "/api/web/order/vehicle/list",
//     "查询订单选择司机": "/api/web/order/driver/list",
//     "查询常用联系人": "/api/admin/enterprise/address/list",
//     "查询": "/api/web/order/getOrderRecordList",
//     "详情": "/api/web/order/getOrderInfo",
//     "上传合同": "/api/web/order/updateOrderContract",
//     "申请支付": "/api/web/order/applyOrderPay",
//     "支付审批": "/api/web/order/auditOrderPay",
//     "取消订单": "/api/web/order/cancelOrder",
//     "上传回单": "/api/web/order/uploadOrderReceipt",
//     "指派司机": "/api/web/order/updateEnterpriseOrderDriver",
//     "运费支付": "/api/web/payment/pay",
//     "批量申请": "/api/web/order/applyOrderPay",
//     "批量审核": "/api/web/order/auditOrderPay",
//     "批量支付": "/api/web/payment/pay",
//     "申请开票": "/api/admin/finance/invoice/upsert",
//     "修改订单": "/api/web/order/updateOrderInfo"
// },
// "司机管理": {
//     "查询司机手机号信息": "/api/admin/resource/driver/phoneinfo",
//     "添加车辆": "/api/admin/resource/vehicle/upsert",
//     "查询": "/api/web/resource/driver/list",
//     "详情": "/api/web/resource/driver/detail",
//     "添加": "/api/admin/resource/driver/upsert",
//     "修改": "/api/admin/resource/driver/upsert",
//     "启用禁用": "/api/admin/resource/driver/abandon"
// },
// "车辆管理": {
//     "查询": "/api/web/resource/vehicle/list",
//     "详情": "/api/web/resource/vehicle/detail",
//     "添加": "/api/admin/resource/vehicle/upsert",
//     "修改": "/api/admin/resource/vehicle/upsert",
//     "启用禁用": "/api/admin/resource/vehicle/abandon"
// },
// "企业钱包": {
//     "充值": "/api/web/payment/recharge",
//     "刷新": "/api/web/payment/account",
//     "查询": "/api/web/payment/trade/list",
//     "导出": "/api/web/payment/trade/export",
//     "银行列表": "/api/web/payment/bank/list",
//     "线下转账充值": "/api/web/payment/rechargepublic"
// },
// "油卡管理": {
//     "查询": "/api/web/oilCard/list"
// },
// "开票记录": {
//     "查询": "/api/admin/finance/invoice/list",
//     "详情": "/api/admin/finance/invoice/detail"
// },
// "角色管理": {
//     "添加": "/api/admin/role/upsert",
//     "查询": "/api/admin/role/list",
//     "修改": "/api/admin/role/upsert",
//     "启用禁用": "/api/admin/role/abandon",
//     "详情": "/api/admin/role/detail"
// },
// "团队列表": {
//     "查询角色列表": "/api/admin/role/list",
//     "添加": "/api/admin/user/upsert",
//     "查询": "/api/admin/user/list",
//     "修改": "/api/admin/user/upsert",
//     "启用禁用": "/api/admin/user/abandon"
// },
// "常用联系人": {
//     "查询": "/api/admin/enterprise/address/list",
//     "添加": "/api/admin/enterprise/address/upsert",
//     "修改": "/api/admin/enterprise/address/upsert",
//     "删除": "/api/admin/enterprise/address/abandon"
// },
// "账户安全": {
//     "重置支付密码": "/api/web/me/resetpaypwd"
// },
// "策略配置": {
//     "更新": "/api/admin/enterprise"
// }