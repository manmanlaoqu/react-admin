import React from 'react'
import Charge from '../Components/modal/charge';
import CertificationModal from '../Components/modal/certificate'
import Utils from '../lib/utils'

const Feedback = () => {
    let subject = '', msg = '', modal = Utils.modal({
        title: '意见反馈',
        width: 460,
        onOk: function () {
            if (!subject.trim() || !msg.trim()) {
                Utils.Message.warning('请完善您的宝贵意见！');
                return
            }
            Utils.request({
                api: '/api/web/enterprise/user/feedback',
                params: {
                    subject,
                    msg
                },
                beforeRequest() {
                    modal.update({
                        okButtonProps: {
                            loading: true
                        }
                    })
                },
                afterRequest() {
                    modal.update({
                        okButtonProps: {
                            loading: true
                        }
                    })

                },
                success: function (res) {
                    modal.destroy()
                    Utils.Message.success('提交成功！')
                }
            })
        },
        content: <div>
            <div style={{ marginBottom: '12px' }
            }> <span>主<span style={{ visibility: 'hidden' }}>主题</span>题</span>
                <input
                    onChange={(e) => { subject = e.target.value }}
                    style={{ width: '82%', marginLeft: '12px', padding: '4px', border: '1px solid #ccc' }}
                    maxLength={20}
                    placeholder="填写主题" />
            </div >
            <div>
                <span style={{ verticalAlign: 'top' }}>您的意见</span>
                <textarea
                    maxLength={100}
                    onChange={(e) => { msg = e.target.value }}
                    style={{ width: '82%', marginLeft: '12px', padding: '4px', border: '1px solid #ccc' }}
                    placeholder="填写0-100字符" />
            </div>
        </div >,
    })
}

const bankCharge = function () {
    return new Promise((resolve, reject) => {
        Utils.request({
            api: Utils.getApi('企业钱包', '网银列表'),
            success: function (data) {
                resolve(data)
            }
        })
    }).then((data) => {
        let modal, tempWindow, notifySuccess = function (data) {
            modal.destroy();
            tempWindow = window.open();
            setTimeout(() => {
                tempWindow.location = Utils.PAY_JUMP_URL + '?url=' + data.url;
            }, 100)
        };
        modal = Utils.modal({
            content: <Charge api={Utils.getApi('企业钱包', '网银充值')}
                notifySuccess={notifySuccess}
                bank={data} />,
            width: 804,
            noBtn: true,
            title: '充值',
            height: 400,
        });
    })
}



const uploadModal = (handler) => {
    // let modal, data = {}, ocrRes = '', handleChange = function (val, key) {
    //     data[key] = val;
    //     if (key === 'voucherUrl') {
    //         Utils.request({
    //             api: '/api/internal/common/ocr',
    //             params: {
    //                 ocrRecogType: 'PUBLISH_RECHARGE_VOUCHER_URL',
    //                 imgUrl: val
    //             },
    //             success(data) {
    //                 try {
    //                     ocrRes = JSON.stringify(data.publishRechargeVoucherResp);
    //                 } catch (e) {
    //                     ocrRes = '';
    //                 }
    //             }
    //         })
    //     }
    // };
    // modal = Utils.modal({
    //     content: <CertificationModal handleChange={handleChange} />,
    //     width: 520,
    //     title: '对公转账',
    //     height: 400,
    //     okText: '提交',
    //     cancelText: '取消',
    //     onOk() {
    //         if (!data.amount) {
    //             Utils.Message.error('请填写金额！')
    //             return
    //         }
    //         if (!data.voucherUrl) {
    //             Utils.Message.error('请上传凭证！')
    //             return
    //         }
    //         let p = Utils.deepclone(data);
    //         p.voucherUrl = p.voucherUrl + '?p=' + ocrRes;
    //         return Utils.request({
    //             api: Utils.getApi('企业钱包','对公转账'),
    //             params: p,
    //             success: function () {
    //                 Utils.Message.success("上传成功！等待人工审核")
    //                 handler&&handler()
    //             }
    //         })
    //     }
    // });
    const invName = Storage.get('companyConfig').invoiceTitleName
    const subAccount = Storage.get('subAccountNo')
    Utils.error({
        content: <div style={{ color: '#000000',lineHeight:'24px' }}>
            <div>
                <p style={{marginBottom:'6px'}}>1、充值方式</p>
                <p style={{ fontSize: '12px' }}>请您通过网银转账的形式，打款到收款账户，平台会自动将金额充值到企业钱包中。</p>
            </div>
            <div>
            <p style={{marginBottom:'6px'}}>2.收款账户信息</p>
                <p style={{ fontSize: '12px' }}>
                    <div>户名：{invName}</div>
                    <div>银行账号：{subAccount}</div>
                    <div>开户银行：浙江网商银行</div>
                </p>
            </div>
            <div>
                <p style={{marginBottom:'6px'}}>3.注意事项</p>
                <p style={{ fontSize: '12px' }}>
                    <div>1）建议在工作日08:30- 17:00时间段内进行，否则将于下个工作日到账。 </div>
                    <div>2）您的付款银行通知付款成功后两小时内，账户余额仍未更新，请及时联系客服为您处理。</div>
                </p>
            </div>
        </div>,
        width: 520,
        title: '对公转账提示',
        height: 400,
        okText: '知道了',
    });
}

export {
    Feedback,
    bankCharge,
    uploadModal
}