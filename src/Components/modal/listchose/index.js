import React from 'react';
import ScrollBar from 'smooth-scrollbar';
import { Input, Tooltip, Collapse, Divider } from 'antd';
import Loading from '../../lib/loading';
import PropTypes from 'prop-types'
import Utils from 'utils/utils';
import './index.scss'



const Search = Input.Search;
const Panel = Collapse.Panel;
export default class ListChose extends React.Component {
    constructor(props) {
        super(props);
        this.scrollId = 'select-scrollbox-' + Utils.guid();
        this.state = {
            list: [],
            current: this.props.current || {},
            initialList: this.props.initialList
        }
        this.searchWord = '';
        this.page = {
            pageNum: 1,
            pageSize: 20,
            totalPage: 0,
            searchWord: ''
        }
    }

    componentDidMount() {
        if (!this.state.initialList) {
            this.getList()
            this.initScroll()
        }
    }

    initScroll() {
        let that = this;
        ScrollBar.init(document.getElementById(this.scrollId)).addListener(function (status) {
            if (status.offset.y === status.limit.y && !that.state.loading) {
                that.getList();
            }
        })
    }

    getList() {
        if (this.page.pageNum > this.page.totalPage && this.page.pageNum !== 1) {
            return
        }
        let that = this;
        Utils.request({
            api: this.props.api,
            params: {
                pageSize: this.page.pageSize,
                pageNum: this.page.pageNum,
                like1: this.page.searchWord,
                ...this.props.filters || {}
                // authStatus: '审核通过'
            },
            beforeRequest() {
                that.setState({
                    loading: true
                })
            },
            afterRequest() {
                that.setState({
                    loading: false
                })
            },
            success: function (data) {
                that.page.totalPage = data.totalPage;
                that.page.pageNum = that.page.pageNum + 1;
                that.setState({
                    list: that.state.list.concat(data.data)
                })
            }
        })
    }

    search() {
        this.page = {
            pageNum: 1,
            pageSize: 10,
            totalPage: 0
        }
        this.state.list = [];
        this.page.searchWord = this.searchWord;
        this.getList();
    }

    onSelected(item, stage) {
        this.props.onSelected(item);
        this.setState({
            current: item,
            stage: stage
        })
    }

    render() {
        let that = this, { stage, initialList } = this.state;
        return (
            <div className="listchose">
                {that.state.loading ?
                    <div style={{ position: 'absolute', left: 0, top: initialList ? 175 : 52, width: '100%', zIndex: 10 }}>
                        <div style={{ height: '370px', backgroundColor: 'rgba(0,0,0,0)' }}><Loading /></div>
                    </div> : null
                }
                {initialList ?
                    <div style={{ marginBottom: '24px' }}>
                        {initialList.length > 0 ? (initialList.map((item, index) => {
                            let disabled = that.props.disable && that.props.disable(item);
                            return (
                                <div key={index} className={that.props.className || 'driver-select-item-box'}>
                                    {disabled && that.props.disabledInfo ?
                                        <Tooltip placement="topRight" title={typeof (that.props.disabledInfo) == 'function' ? that.props.disabledInfo(item) : that.props.disabledInfo} mouseEnterDelay={0.6}>
                                            <div
                                                key={index}
                                                className={"driver-select-item" + (that.props.test(item, that.state.current) && (stage == 1 || !stage) ? ' curr' : '') + (disabled ? ' item-disabled' : '')}>
                                                {that.props.template(item)}
                                                <div className="selected">
                                                    <div className="pos"><i className="iconfont icon-wancheng"></i></div>
                                                </div>
                                            </div>
                                        </Tooltip> :
                                        <div
                                            key={index}
                                            className={"driver-select-item" + (that.props.test(item, that.state.current) && (stage == 1 || !stage) ? ' curr' : '') + (disabled ? ' item-disabled' : '')}
                                            onClick={() => {
                                                if (disabled) {
                                                    return
                                                }
                                                that.onSelected.bind(that, item, 1)()
                                            }} >
                                            {that.props.template(item)}
                                            <div className="selected">
                                                <div className="pos"><i className="iconfont icon-wancheng"></i></div>
                                            </div>
                                        </div>}
                                </div>
                            )
                        })) : <div style={{ textAlign: 'center', height: '130px', display: 'table', width: '100%' }}>
                                <div style={{ display: 'table-cell', verticalAlign: 'middle' }}>
                                    <p style={{ color: '#ced3df', position: 'relative', top: '-6px' }}>{that.props.initialEmptyText}</p>
                                    {that.props.initialEmpty ? null : that.props.initialEmptyTemplate}
                                </div>
                            </div>
                        }
                    </div> : null}
                {(function () {
                    let content = <div>
                        {that.props.noSearch ? null :
                            <Search
                                placeholder={that.props.placeholder}
                                onChange={(e) => { that.searchWord = e.target.value }}
                                onSearch={value => that.search()}
                                style={{ width: 200 }}
                            />}
                        <div id={that.scrollId} style={{ height: '310px', overflow: 'auto', marginTop: '12px' }}>
                            <div >
                                {that.state.list.length > 0 ? (that.state.list.map((item, index) => {
                                    let disabled = that.props.disable && that.props.disable(item);
                                    return (
                                        <div key={index} className={that.props.className || 'driver-select-item-box'}>
                                            {disabled && that.props.disabledInfo ?
                                                <Tooltip placement="topRight"
                                                    title={typeof (that.props.disabledInfo) == 'function' ?
                                                        that.props.disabledInfo(item) :
                                                        that.props.disabledInfo} mouseEnterDelay={0.6}>
                                                    <div
                                                        key={index}
                                                        className={"driver-select-item" + (that.props.test(item, that.state.current) && (stage == 2 || !stage) ? ' curr' : '') + (disabled ? ' item-disabled' : '')}>
                                                        {that.props.template(item)}
                                                        <div className="selected">
                                                            <div className="pos"><i className="iconfont icon-wancheng"></i></div>
                                                        </div>
                                                    </div>
                                                </Tooltip> :
                                                <div
                                                    key={index}
                                                    className={"driver-select-item" + (that.props.test(item, that.state.current) && (stage == 2 || !stage) ? ' curr' : '') + (disabled ? ' item-disabled' : '')}
                                                    onClick={() => {
                                                        if (disabled) {
                                                            return
                                                        }
                                                        that.onSelected.bind(that, item, 2)()
                                                    }} >
                                                    {that.props.template(item)}
                                                    <div className="selected">
                                                        <div className="pos"><i className="iconfont icon-wancheng"></i></div>
                                                    </div>
                                                </div>}

                                        </div>
                                    )
                                })) : <div style={{ textAlign: 'center', height: '300px', display: 'table', width: '100%' }}>
                                        <div style={{ display: 'table-cell', verticalAlign: 'middle' }}>
                                            <p style={{ color: '#ced3df', position: 'relative', top: '-6px' }}>暂无相关数据</p>
                                            {that.props.empty ? null : that.props.emptyTemplate}
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    if (initialList) {
                        return (
                            <Collapse bordered={false} onChange={(keys) => {
                                that.setState({
                                    activeKey: keys,
                                    collapse: keys.length > 0 ? 'on' : ''
                                }, function () {
                                    if (!that.listInited) {
                                        that.getList()
                                        that.initScroll()
                                    }
                                })
                            }} activeKey={that.state.activeKey}>
                                <Panel header={<Divider><span>查看全部<i className={"icon-zuojiantou iconfont " + that.state.collapse}></i></span></Divider>} key="1">
                                    {content}
                                </Panel>
                            </Collapse>
                        )
                    } else {
                        return content
                    }
                })()}
            </div>
        );
    }
}

ListChose.propTypes = {
    api: PropTypes.string,
    current: PropTypes.object,
    empty: PropTypes.bool,
    test: PropTypes.func,
    placeholder: PropTypes.string,
    onSelected: PropTypes.func,
    disabledInfo: PropTypes.string,
    disable: PropTypes.func
}