import React from 'react'
import { Upload, Button } from 'antd'
import Utils from 'utils/utils';
import './index.scss'
import ScrollBar from 'smooth-scrollbar';
import Chat from '../../../lib/chat'
import Events from 'gc-event/es5'

const { Dragger } = Upload;
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.protoUploadText = <div className="desc">将文件拖到此处，或<span className="click-th-main">点击上传</span></div>
        this.state = {
            total: 0,
            succeed: [],
            faild: [],
            disabled: false,
            ended: false,
            uploadText: this.protoUploadText
        }
        const that = this
        window.OrderImport = this
        this.uploadProps = {
            name: 'file',
            action: Utils.API + '/api/web/order/upload',
            headers: {
                'authorization': 'authorization-text',
                'tokenId': Utils.getCookie('tokenId')
            },
            accept: ".xlsx",
            data: JSON.stringify(Utils.getParam({})),
            beforeUpload() {
                that.setState({
                    total: 0,
                    succeed: [],
                    faild: [],
                    disabled: true,
                    ended: false,
                    uploadText: <div className="desc">正在上传，请稍后...</div>
                })
            },
            showUploadList: false,
            onChange(info) {
                if (info.file.status === 'done') {
                    that.setState({
                        disabled: true,
                        uploadText: <div className="desc">上传完成，请耐心等待订单导入...</div>
                    })
                } else if (info.file.status === 'error') {
                    Utils.Message.error(`文件上传失败！`);
                    that.setState({
                        total: 0,
                        succeed: [],
                        faild: [],
                        disabled: false,
                        ended: false,
                        uploadText: that.protoUploadText
                    })
                }
            },
        }
    }

    componentDidMount() {
        this.scrollInstance = ScrollBar.init(this.refs['scroll-list'])
        window.socket = Chat.open()
        let that = this
        Chat.on({
            message: function (data) {
                if (data.type != Chat.MessageType.SUCCESS) {
                    return
                }
                let msg
                if (data.ext) {
                    try {
                        msg = JSON.parse(data.ext)
                    } catch (e) {
                        msg = {}
                    }
                }
                switch (msg.type) {
                    case 0://start
                        that.setState({
                            total: msg.total,
                            succeed: [],
                            faild: [],
                            ended: false,
                        })
                        break
                    case 1://pending
                        that.state.faild.push(msg)
                        that.setState({
                            faild: that.state.faild
                        }, function () {
                            that.scrollInstance.scrollTo(0, 5000)
                        })

                        break;
                    case 2://end
                        that.setState({
                            disabled: false,
                            ended: true,
                            uploadText: that.protoUploadText
                        })
                        that.downLoadKey = msg.batchKey
                        Events.emit('initOrderList');
                        Utils.Message.success('导入完成！');
                        break;
                    default:
                        break;
                }
            }
        })
    }

    downLoadFaildFiles() {
        let that = this
        Utils.request({
            api: '/api/web/order/exportFaildOrders',
            beforeRequest() {
                that.setState({
                    downLoading: true
                })
            },
            afterRequest() {
                that.setState({
                    downLoading: false
                })
            },
            download: true,
            fileName: '导入失败订单.xlsx',
            params: {
                batchKey: that.downLoadKey
            }
        })
    }

    render() {
        return <div className="order-import">
            <div className="title">
                <span>只能上传xlsx格式文件，单次不能超过1000条。</span><span onClick={() => {
                    Utils.downloadSource(Utils.ORDER_EXCEL_TEMPLATE, '运单模板.xlsx')
                }} className="click-th-main">点击下载Excel模板</span>
            </div>
            <Dragger {...this.uploadProps} disabled={this.state.disabled}>
                <div className="upload">
                    <div className='circle'>
                        <i className="iconfont icon-shangchuan"></i>
                    </div>
                    {this.state.uploadText}
                </div>
            </Dragger>
            <div className="result" ref="scroll-list" style={{ overflow: 'auto' }}>
                <div>
                    {this.state.faild.length > 0 ? <div className="faild-list">
                        {this.state.faild.map((item, index) => {
                            return <div className="faild-item" key={index}>
                                <span className="number">{item.number}行</span>
                                <span className="msg">{item.msg}</span>
                            </div>
                        })}
                    </div> : null}
                </div>
            </div>
            {
                this.state.ended ?
                    <React.Fragment>
                        <div className="footer">录入成功{this.state.total - this.state.faild.length}单，录入失败{this.state.faild.length}单，合计{this.state.total}单</div>
                        {this.state.faild.length > 0 ? <Button className="faild-download" loading={this.state.downLoading} onClick={() => {
                            this.downLoadFaildFiles()
                        }}>
                            <i className="iconfont icon-xiazai1"></i><span>下载导入失败订单信息</span>
                        </Button> : null}
                    </React.Fragment>
                    : null
            }
        </div>
    }
}