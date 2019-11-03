var MessageType = {
    TEXT: 'TEXT',
    PIC: "PIC",
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
    WARNING: "WARNING",
    HEART_BEAT: 'HEART_BEAT'
}

var ChatUser = function (phone, headImg, name) {
    this.phone = phone;
    this.headImg = headImg;
    this.name = name;
}

var WebMessage = function (from, to, type, text, url, ext) {
    this.from = from;
    this.to = to;
    this.type = type;//TEXT 文本消息 PIC 贴图消息 SUCCESS 成功通知 FAILED 失败通知 WARNING 警告通知
    this.text = text;//文本消息
    this.url = url;//图片 贴图 base64
    this.ext = ext;//扩展消息 json string
    this.toString = function () {
        return JSON.stringify(this);
    }
}


class Chat {
    static getInstance() {
        if (!this.instance) {
            this.instance = (() => {
                var user, group
                var websocket;
                var socketServer
                var messageHandler
                var onKill = false
                var connect = function () {
                    if (!user || !group || !socketServer) {
                        throw ('user auth failed!')
                    }
                    onKill = false
                    websocket = new WebSocket(`${socketServer}?phone=${user}&group=${group}`);
                    //监听连接打开
                    websocket.onopen = function (evt) {
                        console.log("The connection is open")
                        heartCheck.reset().start(); //传递信息
                    };

                    //监听服务器数据推送
                    websocket.onmessage = function (evt) {
                        console.log(`receive data`)
                        let data = JSON.parse(evt.data)
                        if (data.type === MessageType.HEART_BEAT) {
                            heartCheck.reset().start();
                        } else {
                            if (messageHandler) {
                                messageHandler(data)
                            }
                        }
                    };

                    //监听连接关闭
                    websocket.onclose = function (evt) {
                        console.log(`disconnected, try reconnect`)
                        if(onKill){
                            return
                        }
                        connect()
                    };
                }
                var heartCheck = {
                    timeout: 60000, //60秒
                    timeoutObj: null,
                    serverTimeoutObj: null,
                    reset: function () {
                        clearTimeout(this.timeoutObj);
                        clearTimeout(this.serverTimeoutObj);
                        return this;
                    },
                    start: function () {
                        var self = this;
                        this.timeoutObj = setTimeout(function () {
                            //这里发送一个心跳，后端收到后，返回一个心跳消息，
                            //onmessage拿到返回的心跳就说明连接正常
                            websocket.send(new WebMessage(new ChatUser(13291829199, null, '赵纯政'),
                                null, MessageType.HEART_BEAT, 'heart-beat', null, null).toString())
                            self.serverTimeoutObj = setTimeout(function () { //如果超过一定时间还没重置，说明后端主动断开了
                                websocket.close(); //如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
                            }, self.timeout)
                        }, this.timeout)
                    }
                }
                return {
                    init(options) {
                        if (options.user)
                            user = options.user
                        if (options.group)
                            group = options.group
                        if (options.socketServer)
                            socketServer = options.socketServer
                    },
                    open() {
                        connect()
                        return websocket
                    },
                    on(options) {
                        if(options.message){
                            messageHandler = options.message
                        }
                    },
                    kill(){
                        onKill = true
                        websocket.close()
                    },
                    MessageType: MessageType,
                    ChatUser: ChatUser,
                    WebMessage: WebMessage
                }
            })();
        }
        return this.instance;
    }
}

export default Chat.getInstance();