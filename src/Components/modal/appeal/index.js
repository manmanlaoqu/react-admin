import React from 'react'
import { Select, Input } from 'antd'
import MyUpLoad from '../../lib/upButton';
import ScrollBar from 'smooth-scrollbar'

const { TextArea } = Input;
const Option = Select.Option;

export default class extends React.Component {

    constructor(props) {
        super(props)
        this.scrollId = "appeal-" + Date.now()
        this.state = {
            exception: this.props.exception || {},
            data: [{}]
        }
    }

    refresh() {
        this.setState({
            ...this.state
        },function(){
            this.props.handler(this.state.data)
        })
    }

    componentDidMount() {
        ScrollBar.init(document.getElementById(this.scrollId))
    }

    render() {
        const { exception, data } = this.state
        return (
            <div>
                <div>异常订单会影响到您的正常操作，请您按照提示上传佐证照片，申诉审核通过后，订单会变更为正常订单！</div>
                <div style={{ position: 'relative', margin: '12px 0' }} className="exam-remark">
                    <span><i className="iconfont icon-gantanhao" style={{ top: 0, fontSize: '13px' }}></i>异常原因：{exception.occurRemark}</span>
                </div>
                <div style={{ maxHeight: '640px', overflow: 'auto' }} id={this.scrollId}>
                    <div>
                        {data.map((form, index) => {
                            return <div style={{
                                width: '100%',
                                marginBottom: '8px',
                                marginTop: index == 0 ? 0 : '8px',
                                borderBottom: (data.length == 1 || index == data.length - 1) ? 'none' : '1px solid #e2e2e3'
                            }}>
                                <table style={{ width: '100%' }}>
                                    <tbody>
                                        <tr style={{ height: '58px' }}>
                                            <td style={{ width: '10%' }}><span style={{ color: 'red' }}>*</span>凭证类型</td>
                                            <td>
                                                <Select placeholder="选择凭证类型"
                                                    value={form.voucherType}
                                                    onChange={(value) => {
                                                        form.voucherType = value
                                                        this.refresh()
                                                    }}
                                                    style={{ width: '73%' }}>
                                                    <Option value={'发车单/回单'}>发车单/回单</Option>
                                                    <Option value={'路桥费'}>路桥费</Option>
                                                    <Option value={'过磅单'}>过磅单</Option>
                                                    <Option value={'etc缴费记录'}>etc缴费记录</Option>
                                                    <Option value={'装卸货地点的带有车牌号的车头水印照片'}>装卸货地点的带有车牌号的车头水印照片</Option>
                                                </Select>
                                                {(index == 0 && data.length >= 5) ? null :
                                                    <div style={{ display: 'inline-block', width: '20%', textAlign: 'right' }}>
                                                        <span onClick={() => {
                                                            if (index == 0) {
                                                                this.state.data.push({})
                                                            } else {
                                                                this.state.data.splice(index, 1)
                                                            }
                                                            this.refresh()
                                                        }} className={"click-th-main " + (index != 0 ? 'blue' : '')}>{index == 0 ? '+增加凭证类型' : '-删除凭证类型'}</span>
                                                    </div>}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ width: '10%' }}><span style={{ color: 'red' }}>*</span>上传凭证</td>
                                            <td>
                                                <MyUpLoad handleChange={(fileList) => {
                                                    form.voucherImgs = (function () {
                                                        if (fileList.length == 0) {
                                                            return null;
                                                        } else {
                                                            return fileList.map((file) => {
                                                                return file.response.body.resUrls[0]
                                                            }).toString()
                                                        }
                                                    })()
                                                    this.refresh()
                                                }} className="recept" max={3} />
                                            </td>
                                        </tr>
                                        <tr style={{ height: '96px' }}>
                                            <td style={{ width: '10%' }}>填写备注</td>
                                            <td>
                                                <TextArea onChange={(e) => {
                                                    form.remark = e.target.value
                                                    this.refresh()
                                                }} style={{ width: 'calc(100% - 42px)' }} rows={3} />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        })}
                    </div>
                </div>
            </div>
        )
    }
}