import React from 'react'
import { Upload, Icon, LocaleProvider } from 'antd'
import Sortd from 'sortablejs'
import ImageViewer from '../imageViewer'
import Utils from 'utils/utils'
import Storage from 'gc-storage/es5';
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import PropTypes from 'prop-types'


export default class UpButton extends React.Component {
    constructor(props) {
        super(props);
        this.uploadId = this.props.id || ('upload_' + Utils.guid())
        if (this.props.max && this.props.max > 1 && this.props.cropper) {
            console.error('cropper only work when the props "max" is 1')
        }
        this.onCropper = this.props.max == 1 && this.props.cropper
        this.state = {
            previewVisible: false,
            previewImage: '',
            fileList: this.props.fileList || [],
        };
        this.disabled = false;
    }

    getPicData() {
        let p = this.state.fileList.map((file) => {
            return file.response ? file.response.key : false;
        });
        return p;
    }

    setPicData(list) {
        this.setState({
            fileList: list
        })
    }

    componentDidMount() {
        let that = this
        let el = document.getElementById(this.uploadId).getElementsByClassName("ant-upload-list");
        Sortd.create(el[0], {
            group: "words",
            animation: 150,
            onAdd: function (evt) { },
            onUpdate: function (evt) {
                let oldI = evt.oldIndex, newI = evt.newIndex;

                var o1 = that.state.fileList.splice(oldI, 1)[0];
                that.state.fileList.splice(newI, 0, o1);
                that.setState({
                    fileList: that.state.fileList
                });
                that.props.handleChange ? that.props.handleChange() : null;
            },
            onRemove: function (evt) { },
            onStart: function (evt) { },
            onEnd: function (evt) { },
            onMove: function (evt) { },
            onSort: function (a, b) {

            },
        });
    }


    handleCancel = () => this.setState({ previewVisible: false })

    handlePreview = (file) => {
        this.setState({
            previewList: [file.url || file.thumbUrl],
            previewShow: true
        })
    }

    beforeUpload(currentUp, files) {
        // 验证、压缩大小以base64上传等操作 在这里实现 base64上传需验证token以表单提交的可行性 原项目是在header中提交
        if (files.length + this.state.fileList.length > this.props.max) {
            Utils.Message.warning('还能上传' + (this.props.max - this.state.fileList) + '张图片!');
            this.disabled = true;
            return false;
        } else {
            this.disabled = false;
        }
        let that = this
        window.URL = window.URL || window.webkitURL;
        var url = window.URL.createObjectURL(currentUp);
        if (this.onCropper) {
            return new Promise((resolve, reject) => {
                Utils.cropper({
                    url: url,
                    aspectRatio: this.props.aspectRatio
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
        } else {
            return true
        }
    }

    handleChange = (info) => {

        if (this.disabled) {
            return;
        }
        let fileList = info.fileList;
        this.setState({ fileList });
        if (info.file.status === 'done' || info.file.status === 'removed') {
            this.props.handleChange ? this.props.handleChange(fileList) : null;
        }
    }

    render() {
        const { previewVisible, previewImage, fileList } = this.state;
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text"></div>
            </div>
        );
        // const data = {token:this.state.token};
        return (
            <LocaleProvider locale={zh_CN}>
                <div className={'clearfix ' + this.props.middle} style={this.props.style || {}}
                    id={this.uploadId} >
                    <Upload
                        accept={"image/jpg,image/jpeg,image/png,image/bmp"}
                        action={Utils.IMG_UPLOAD}
                        name={'files'}
                        listType="picture-card"
                        fileList={fileList}
                        onPreview={this.handlePreview}
                        onChange={this.handleChange}
                        headers={{
                            authorization: 'authorization-text',
                        }}
                        className={this.props.className}
                        disabled={this.props.disabled}
                        accept="image/jpg,image/jpeg,image/png,image/bmp"
                        // customRequest={this.customRequest}
                        beforeUpload={this.beforeUpload.bind(this)}
                        multiple={this.props.multiple ? this.props.multiple : false}
                        data={{
                            meta: JSON.stringify({
                                companyId: Storage.get('userInfo').companyId.toString(),
                                userId: Storage.get('userInfo').id.toString()
                            }),
                            ...this.props.ext || {}
                        }}
                    >
                        {fileList.length >= this.props.max ? null : uploadButton}
                    </Upload>
                    {/* <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal> */}
                    <ImageViewer handleCancel={() => this.setState({ previewShow: false })} list={this.state.previewList} show={this.state.previewShow} index={0} />
                </div>
            </LocaleProvider>
        );
    }
}


UpButton.propTypes = {
    cropper: PropTypes.bool,
    fileList: PropTypes.array,
    max: PropTypes.number,
    ext: PropTypes.object,
    handleChange: PropTypes.func,
    aspectRatio: PropTypes.number
}