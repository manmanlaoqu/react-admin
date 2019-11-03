import VERSION from './version';

function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);//search,查询？后面的参数，并匹配正则
    if (r != null) return unescape(r[2]); return null;
}


export default class Constant extends VERSION {
    constructor(props){
        super(props)
    }
    static DEBUG = false;
    static PAGESIZE = 30;
    static HTTP = ('https:' == window.location.protocol) ? "https://" : "http://";
    static IMG_UPLOAD = Constant.API + '/api/static/img/upload';//
    static FILE_UPLOAD = Constant.API + '/api/static/img/upload';//
    static PWD_REG = new RegExp(/^((?!\d+$)(?![a-zA-Z]+$)(?!\W+$)[a-zA-Z\d\W].{7,19})+$/); //密码匹配规则
    static PWD_REG_TEXT = "Password must include a number, letter or special character"; //密码不匹配提示
    static EMAIL_REG = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]+$/);//邮箱匹配规则
    static IDCARD_REG = new RegExp(/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|[xX])$/);
    static PHONE_REG = new RegExp(/^[1][3,4,5,6,7,8,9][0-9]{9}$/);
    static PAY_PWD_REG = new RegExp(/[A-Za-z].*[0-9]|[0-9].*[A-Za-z]/);
    static VEHICLE_REG = new RegExp(/^(([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳使领]))$/);
    static PAY_JUMP_URL = 'https://h5utrailer.95155.com/statics2.0/consignor-web/static/transfer.html';
    static CONTRACT_TEMPLATE = 'https://utrailer-1.oss-cn-hangzhou.aliyuncs.com/kc-web/resource/contract_template.png'
    static CONTRACT_TEMPLATE1 = 'https://utrailer-1.oss-cn-hangzhou.aliyuncs.com/kc-web/resource/contract_template1.png'
    static ORDER_EXCEL_TEMPLATE = 'https://utrailer-1.oss-cn-hangzhou.aliyuncs.com/kc-web/resource/%E8%BF%90%E5%8D%95%E6%A8%A1%E6%9D%BF.xlsx'
    static mapStyle = 'whitesmoke'
    static amapkey = 'ea49e636488a64dbb06422eb2c2b578b'
    // static VERIFY_STATUS = [{
    //     status: null,
    //     text: '全部',
    //     filts: null,
    // },{
    //     status: '2',
    //     text: '认证成功',
    //     filts: '认证成功',
    // }, {
    //     status: '3',
    //     text: '认证拒绝',
    //     filts: '认证拒绝',
    // }]

    static VERIFY_STATUS = [{
        status: null,
        text: '全部',
        filts: null,
    }, {
        status: '0',
        text: '待认证',
        filts: '待审核',
    }, {
        status: '2',
        text: '认证中',
        filts: '审核中',
    }, {
        status: '1',
        text: '认证通过',
        filts: '审核通过',
    }, {
        status: '3',
        text: '认证失败',
        filts: '审核被拒',
    }]
    static LOC_STATUS = [{
        status: null,
        text: '全部',
        filts: null,
    }, {
        status: '0',
        text: '未授权',
        filts: '待确认',
    }, {
        status: '1',
        text: '已授权',
        filts: '已同意',
    }, {
        status: '2',
        text: '已拒绝',
        filts: '已拒绝',
    }]
    static TRADE_TYPE = [{
        status: null,
        text: '全部',
        filts: null,
    }, {
        status: '0',
        text: '充值',
        filts: '0',
    }, {
        status: '1',
        text: '支出',
        filts: '1',
    }]
    static TRADE_STATUS = [{
        status: null,
        text: '全部',
        filts: null,
    }, {
        status: '3',
        text: '已提交',
        filts: 'Created',
    }, {
        status: '0',
        text: '交易成功',
        filts: 'Succeed',
    }, {
        status: '1',
        text: '处理中',
        filts: 'Processing',
    }, {
        status: '2',
        text: '交易失败',
        filts: 'Failed',
    }]

    static PAY_TYPE = [{
        status: null,
        text: '全部',
        filts: null,
    }, {
        status: 'internetbank',
        text: '线上网银',
        filts: 'internetbank'
    }, {
        status: 'offlinetransfer',
        text: '线下转账',
        filts: 'offlinetransfer'
    }, {
        status: 'rebate',
        text: '平台返利',
        filts: 'rebate'
    }, {
        status: 'withdraw',
        text: '账户余额支付',
        filts: 'withdraw'
    }, {
        status: 'oilpay',
        text: '油卡支付',
        filts: 'oilpay'
    }, {
        status: 'balance',
        text: '系统自动扣费',
        filts: 'balance'
    }, {
        status: 'rebatebalance',
        text: '返利余额',
        filts: 'rebatebalance'
    }]

    static CUS_FEE = [{
        status: null,
        text: '全部',
        filts: null,
    }, {
        status: 'PRE_CASH',
        text: '预付现金',
        filts: 'PRE_CASH'
    }, {
        status: 'PRE_OIL',
        text: '预付油卡',
        filts: 'PRE_OIL'
        // }, {
        //     status: 'prepayEtc',
        //     text: '预付ETC',
        //     filts: 'prepayEtc'
    }, {
        status: 'REST_CASH',
        text: '尾款现金',
        filts: 'REST_CASH'
    }, {
        status: 'REST_OIL',
        text: '尾款油卡',
        filts: 'REST_OIL'
        // }, {
        //     status: 'restPayEtc',
        //     text: '到付ETC',
        //     filts: 'restPayEtc'
    }, {
        status: 'RECEIPT_CASH',
        text: '回单现金',
        filts: 'RECEIPT_CASH'
    }, {
        status: 'RECEIPT_OIL',
        text: '回单油卡',
        filts: 'RECEIPT_OIL'
        // }, {
        //     status: 'receiptPayEtc',
        //     text: '回单ETC',
        //     filts: 'receiptPayEtc'
    }, {
        status: 'TAX_CASH',
        text: '服务费',
        filts: 'TAX_CASH'
    }, {
        status: 'AGENT_CASH',
        text: '中介费',
        filts: 'AGENT_CASH'
    }]

    static INVOIVE_STATUS = [{
        status: null,
        text: '全部',
        filts: null,
    }, {
        status: '1',
        text: '审核中',
        filts: '1',
    }, {
        status: '2',
        text: '审核通过',
        filts: '2',
    }, {
        status: '3',
        text: '已开票',
        filts: '3',
    },
    //  {
    //     status: '4',
    //     text: '审核拒绝',
    //     filts: '4',
    // }
    {
        status: '4',
        text: '审核失败',
        filts: '4',
    }
    ]
    static PAY_STATE = [{
        status: null,
        text: '全部',
        filts: null,
    }, {
        status: '0',
        text: '待申请',
        filts: '0',
    }, {
        status: '1',
        text: '待审核',
        filts: '1'
    }, {
        status: '2',
        text: '待支付',
        filts: '2'
    }, {
        status: '3',
        text: '支付中',
        filts: '3'
    }, {
        status: '4',
        text: '已支付',
        filts: '4'
    }]

    static PAYMENT_STAGE = [{
        status: null,
        text: '全部',
        filts: null,
    }, {
        status: 'pre',
        filts: 'pre',
        text: '预付款'
    }, {
        status: 'rest',
        filts: 'test',
        text: '尾款'
    }, {
        status: 'receipt',
        filts: 'receipt',
        text: '回单款'
    }]

    static PAYMENT_TYPE = [{
        status: null,
        text: '全部',
        filts: null,
    }, {
        status: 'cash',
        filts: 'cash',
        text: '现金'
    }, {
        status: 'oil',
        filts: 'oil',
        text: '油卡'
    }]
    static AUDIT_STATUS = [{
        status: null,
        text: '全部',
        filts: null,
    }, {
        status: '1',
        text: '审核中',
        filts: '1',
    }, {
        status: '2',
        text: '审核通过',
        filts: '2',
    }, {
        status: '3',
        text: '审核失败',
        filts: '3',
    }]

    static FILT_TYPE = [{
        status: null,
        text: '全部',
        filts: null,
    }, {
        status: 'CASH',
        text: '现金',
        filts: 'CASH',
    }, {
        status: 'OIL',
        text: '油卡',
        filts: 'OIL',
    }]

    static FILT_STAGE = [{
        status: null,
        text: '全部',
        filts: null,
    }, {
        status: 'PRE',
        text: '预付款',
        filts: 'PRE',
    }, {
        status: 'REST',
        text: '尾款',
        filts: 'REST',
    }, {
        status: 'RECEIPT',
        text: '回单款',
        filts: 'RECEIPT',
    }, {
        status: 'TAX',
        text: '服务费',
        filts: 'TAX',
    }, {
        status: 'AGENT',
        text: '中介费',
        filts: 'AGENT',
    }]

    static INVOICE_STATE=[{
        status: null,
        text: '全部',
        filts: null,
    }, {
        status: '0',
        text: '待开票',
        filts: '0',
    }, {
        status: '1',
        text: '开票中',
        filts: '1',
    }]
}

