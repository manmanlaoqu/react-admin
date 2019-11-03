const OrderPayType={
    DRIVER:0,
    AGENT:1,
    INTER:2
}

const PaymentStage={
    PRE:"PRE",
    REST:"REST",
    RECEIPT:"RECEIPT",
    INVOICE:"INVOICE",
    TAX:"TAX",
    AGENT:"AGENT",
    ABNORMAL:"ABNORMAL",
    AGENCYFEE:"AGENCYFEE",
}

const PaymentType={
    CASH:"CASH",
    OIL:"OIL",
    ETC:"ETC",
}

export default {
    OrderPayType:OrderPayType,
    PaymentStage:PaymentStage,
    PaymentType:PaymentType
}