import React from 'react';
import { Tabs, List, Modal, notification } from 'antd';
import Home from '../../page/home';
import './index.scss';
import Events from 'gc-event/es5'

const TabPane = Tabs.TabPane;
export default class extends React.Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 1;
  }

  componentWillMount() {
    let that = this
    const panes = [
      { title: '首页', content: <Home />, key: 'newTab0', unclosable: true, module: '首页' },
    ];
    this.setState({
      activeKey: panes[0].key,
      panes,
      full: false
    })
    window.oncontextmenu = function (e) {
      if (e.target.className.indexOf('ant-tabs-tab-def') > -1) {
        that.tabMenu({
          left: e.pageX - 10,
          top: e.pageY + 10
        }, e.target)
        e.preventDefault();
      }
    }
    Events.on('fullScreen', function (call) {
      that.setState({
        full: !that.state.full
      });
    });
    window.onkeydown = function (e) {
      if (that.state.full && (e.code === 'Escape' || e.key === 'Esc')) {
        Events.emit('fullScreen')
      }
    }
  }

  /**
   * tab右键操作
   * @param {*} target 
   */
  tabMenu(pos, target) {
    let that = this, modal =
      Modal.info({
        icon: null,
        mask: false,
        maskClosable: true,
        title: null,
        width: 168,
        className: 'tab-contextmenu',
        content: (
          <List
            itemLayout="horizontal"
            dataSource={[{
              text: '刷新',
              fn() {
                that.refresh(target.innerText)
                modal.destroy()
              }
            },
            // {
            //   text:'新窗口打开',
            //   fn(){
            //     window.open('/#/'+TransFrom(target.innerText,{},true))
            //     modal.destroy()
            //   }
            // },
            {
              text: '关闭这个',
              disabled: target.innerText === '首页',
              fn() {
                let pane = that.state.panes.find(item => {
                  return item.module === target.innerText
                })
                that.tryClose(pane.key, pane.module)
                modal.destroy()
              }
            }, {
              text: '关闭右侧',
              disabled: (function () {
                return that.state.panes.findIndex(item => {
                  return item.module === target.innerText
                }) === that.state.panes.length - 1
              })(),
              fn() {
                let index = that.state.panes.findIndex(item => {
                  return item.module === target.innerText
                })
                that.state.panes = that.state.panes.slice(0, index + 1);
                let current = that.state.panes.find(item => {
                  return item.key == that.state.activeKey
                })
                let activeKey
                if (!current) {
                  activeKey = that.state.panes[index].key
                } else {
                  activeKey = current.key
                }
                that.setState({
                  panes: that.state.panes,
                  activeKey: activeKey
                })
                modal.destroy()
              }
            }, {
              text: '关闭其它',
              disabled: that.state.panes.length === 1 || that.state.panes.length === 2 && target.innerText !== '首页',
              fn() {
                let pane = that.state.panes.find(item => {
                  return item.module === target.innerText
                })
                that.setState({
                  panes: target.innerText === '首页' ? [pane] : [that.state.panes[0], pane],
                  activeKey: pane.key
                })
                modal.destroy()
              }
            }, {
              text: '全屏操作',
              fn() {
                let pane = that.state.panes.find(item => {
                  return item.module === target.innerText
                })
                that.setState({
                  activeKey: pane.key
                }, function () {
                  if (!localStorage.getItem('full-tip')) {
                    setTimeout(() => {
                      notification.info({
                        message: '小提示',
                        description: <span>按<span style={{ fontWeight: 'bold', margin: '0 4px', color: '#000' }}>Esc</span>退出全屏</span>
                      })
                    }, 600)
                    localStorage.setItem('full-tip', 1)
                  }
                })
                Events.emit('fullScreen')
                modal.destroy()
              }
            }]}
            renderItem={item => (
              <List.Item onClick={() => { item.fn() }} className={item.disabled ? 'disabled' : ''}>
                {item.text}
              </List.Item>
            )}
          />
        ),
        style: {
          position: 'absolute',
          ...pos
        },
        footer: 'null',
      })
  }

  onChange = (activeKey) => {
    this.setState({ activeKey });
  }

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  }

  add = (opts, event) => {
    const panes = this.state.panes;
    let pane = panes.find(item => {
      return item.module === opts.module
    })
    if (!pane) {
      const activeKey = `newTab${this.newTabIndex++}`;
      panes.push({ title: opts.title, content: opts.content, key: activeKey, module: opts.module });
      this.setState({ panes, activeKey }, function () {
        if (event) {
          // event,params
          setTimeout(function () {
            Events.emit(event.event, ...(event.params || []));
          }, 500)
        }
      });
    } else {
      this.setState({
        activeKey: pane.key
      }, function () {
        if (event) {
          // event,params
          if (event.event.indexOf('Open') > -1) {
            setTimeout(function () {
              Events.emit(event.event, ...(event.params || []));
            }, 500)
          } else {
            Events.emit(event.event, ...(event.params || []));
          }
        }
      })
    }
  }

  tryClose = (targetKey, hash) => {
    let activeKey = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = panes[lastIndex].key;
    }
    this.setState({ panes }, function () {
      this.setState({ activeKey })
    });
  }

  refresh(_module) {
    Events.emit('on' + _module + 'Refresh')
  }

  render() {
    const tabs = this.state.panes.map((pane) => {
      const tab = (<span className="ant-tabs-tab-def">
        <span className="tab-btn refresh">
          <i style={{marginRight:'8px'}} onClick={this.refresh.bind(this, pane.module)} className="iconfont icon-shuaxin-copy-copy"></i>
        </span>
        <span className="ant-tabs-tab-def">{pane.title}</span>
        {pane.unclosable ? null : <span className="tab-btn" style={{marginLeft:'8px'}}>
          <i onClick={this.tryClose.bind(this, pane.key, pane.module)} className="iconfont icon-guanbi"></i>
        </span>}
      </span>)
      return (
        <TabPane
          tab={tab}
          key={pane.key}
          closable={false}
        >
          {pane.content}
        </TabPane>)
    })
    return (
      <Tabs
        className={"yg-tab-list " + (this.state.full ? 'full' : '')}
        style={{ height: '100%' }}
        hideAdd
        onChange={this.onChange}
        activeKey={this.state.activeKey}
        type="editable-card"
        onEdit={this.onEdit}
      >
        {tabs}
      </Tabs>
    );
  }
}
