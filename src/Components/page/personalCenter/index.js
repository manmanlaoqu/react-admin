import React from 'react';

import { Upload } from 'antd';
import Avatar from '../../lib/avatar';
import FreshComponent from '../freshbind';
import Reload from '../reload';
import Utils from 'utils/utils'
import Storage from 'gc-storage/es5'
import Events from 'gc-event/es5'

class PersonalCenter extends FreshComponent {
    constructor(props) {
        super(props);
        this.state = {
            user: Storage.get('userInfo')
        }
        let that = this;
        this.uploadProps = {
            name: 'files',
            action: Utils.API + '/api/static/img/upload',
            headers: {
                authorization: 'authorization-text',
            },
            accept: "image/jpg,image/jpeg,image/png,image/bmp",
            data: {
                meta: JSON.stringify({
                    companyId: Storage.get('userInfo').companyId.toString(),
                    userId: Storage.get('userInfo').id.toString(),
                })
            },
            beforeUpload(currentFile, files) {
                window.URL = window.URL || window.webkitURL;
                var url = window.URL.createObjectURL(currentFile);
                return new Promise((resolve, reject) => {
                    Utils.cropper({
                        url: url,
                        aspectRatio: 1 / 1
                    }, (data) => {
                        if (data) {
                            let b = Utils.dataURLtoBlob(data)
                            // let b = Utils.dataURLtoBlob(data)
                            // b = Utils.blobToFile(b,'img.png')
                            Object.defineProperty(b, 'uid', {
                                value: 'rc-upload-' + Date.now() + '-2',
                                writable: false,
                                configurable: true,
                                enumerable: true
                            })
                            Object.defineProperty(b, 'thumbUrl', {
                                value: data,
                                writable: false,
                                configurable: true,
                                enumerable: true
                            })
                            resolve(b)
                        } else {
                            reject()
                        }
                    })
                });
            },
            showUploadList: false,
            onChange(info) {
                if (info.file.status === 'done') {
                    let url = info.file.response.body.resUrls[0];
                    // Utils.Message.success('上传成功！');
                    // that.setState({
                    //     avatarUrl:url
                    // })
                    // that.props.onChange('avatarUrl',url)
                    Utils.request({
                        api: '/api/web/enterprise/user/update',
                        params: {
                            avatarUrl: url,
                        },
                        success: function (data) {
                            Utils.Message.success('修改成功！');
                            that.setState({
                                user: {
                                    ...that.state.user,
                                    avatarUrl: url,
                                }
                            })
                            //派发头像更新的事件
                            Events.emit('onHeadModify', { ...that.state.user, avatarUrl: url })
                            // that.props.onUserInfoChange({
                            //     ...that.state.user,
                            //     ...d
                            // })
                        }
                    })
                } else if (info.file.status === 'error') {
                    Utils.Message.error('上传失败！');
                }
            },
        }
    }

    render() {
        const { avatarUrl } = this.state.user;

        const user = { ...this.state.user };
        return <div style={{ background: "#fff", height: 'calc(100vh - 135px)' }}>

            <div style={{ padding: "20px", paddingTop: '18px', fontSize: "18px", boxShadow: ' 1px 1px 6px rgba(100, 100, 100, 0.2)' }}>
                个人信息
            </div>
            <div >
                <div className="userinfo_wrap">
                    <div style={{ marginBottom: '16px', marginLeft: '104px' }}>
                        <div style={{ display: 'inline-block', position: 'relative', padding: '12px', borderRadius: '3px', textAlign: 'center' }}>

                            <Upload {...this.uploadProps}>
                                <Avatar {...this.uploadProps} width={68} height={68} src={avatarUrl} style={{ marginLeft: '108px' }} />
                                <div style={{ color: '#4bb6fe', cursor: 'pointer' }}>修改头像</div>
                                {/* <i style={{position:'absolute',right:'0',top:'0',fontSize:'10px'}} className="iconfont clickable icon-edit"></i> */}
                            </Upload>
                        </div>
                    </div>

                    <div style={{ fontSize: '14px', }}>
                        <span className="inlineBlock">姓名：</span>{user.userName}
                    </div>
                    <div style={{ padding: "20px 0", fontSize: '14px' }}>
                        <span className="inlineBlock">手机号：</span>{user.userPhone}
                    </div>
                    <div style={{ fontSize: '14px' }}>
                        <span className="inlineBlock">身份证：</span>{user.idCardNo}
                    </div>
                </div>
            </div>


        </div>
    }
}

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: { ...this.props.user }
        };
    }

    render() {
        return <Reload {...this.props} component={PersonalCenter} />
    }

}