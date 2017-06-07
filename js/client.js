/*!
 * jQuery-ajaxTransport-XDomainRequest - v1.0.4 - 2015-03-05
 * https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest
 * Copyright (c) 2015 Jason Moon (@JSONMOON)
 * Licensed MIT (/blob/master/LICENSE.txt)
 */
(function(a){if(typeof define==='function'&&define.amd){define(['jquery'],a)}else if(typeof exports==='object'){module.exports=a(require('jquery'))}else{a(jQuery)}}(function($){if($.support.cors||!$.ajaxTransport||!window.XDomainRequest){return $}var n=/^(https?:)?\/\//i;var o=/^get|post$/i;var p=new RegExp('^(\/\/|'+location.protocol+')','i');$.ajaxTransport('* text html xml json',function(j,k,l){if(!j.crossDomain||!j.async||!o.test(j.type)||!n.test(j.url)||!p.test(j.url)){return}var m=null;return{send:function(f,g){var h='';var i=(k.dataType||'').toLowerCase();m=new XDomainRequest();if(/^\d+$/.test(k.timeout)){m.timeout=k.timeout}m.ontimeout=function(){g(500,'timeout')};m.onload=function(){var a='Content-Length: '+m.responseText.length+'\r\nContent-Type: '+m.contentType;var b={code:200,message:'success'};var c={text:m.responseText};try{if(i==='html'||/text\/html/i.test(m.contentType)){c.html=m.responseText}else if(i==='json'||(i!=='text'&&/\/json/i.test(m.contentType))){try{c.json=$.parseJSON(m.responseText)}catch(e){b.code=500;b.message='parseerror'}}else if(i==='xml'||(i!=='text'&&/\/xml/i.test(m.contentType))){var d=new ActiveXObject('Microsoft.XMLDOM');d.async=false;try{d.loadXML(m.responseText)}catch(e){d=undefined}if(!d||!d.documentElement||d.getElementsByTagName('parsererror').length){b.code=500;b.message='parseerror';throw'Invalid XML: '+m.responseText;}c.xml=d}}catch(parseMessage){throw parseMessage;}finally{g(b.code,b.message,c,a)}};m.onprogress=function(){};m.onerror=function(){g(500,'error',{text:m.responseText})};if(k.data){h=($.type(k.data)==='string')?k.data:$.param(k.data)}m.open(j.type,j.url);m.send(h)},abort:function(){if(m){m.abort()}}}});return $}));

(function(_window, _document) {
  _window.MediaExpressCrypt = {};

  $.ajaxSetup({
    beforeSend: function(xhr) {
      xhr.setRequestHeader('token', require('electron').remote.getGlobal('sharedObject').token);
    }
  });

  var domain = "http://10.0.15.59";

  var MEC = _window.MediaExpressCrypt;

  var MEC_INSTALL_URL = "phoenix://initialize";
  var HTTP_PROTOCOL = 'https'; //window.location.protocol;
  var DEFAULT_SERVER = { "host": "10.0.15.52", "port": 36201 };
  var PLUGIN_SERVER = { "host": "localhost.cloudifeng.com", "port": 36101 };
  var UPLOAD_FILE_LIMIT = 6;
  var PLUGIN_LAUNCH_RETRY = 3;
  var MESSAGE_LOAD_INTERVAL = 10000; //10S
  var LOGGER_LEVEL = {
    ERROR: 1,
    WARNING: 2,
    INFO: 3,
    DEBUG: 4,
  };
  var LOGGER_TYPE = {
    CLIENT: 1,
    SERVER: 2,
    WEB: 3,
  };

  var OS_PLUGIN_SUPPORT = {
    win64: { download: 'http://www.cloudifeng.com/?page_id=1537', version: '2.1.2.1', requiredVersion: '2.1.2.1' },
    win32: { download: 'http://www.cloudifeng.com/?page_id=1537', version: '2.1.2.1', requiredVersion: '2.1.2.1' },
    macOS: { download: 'http://www.cloudifeng.com/?page_id=1537', version: '2.1.2.5', requiredVersion: '2.1.2.5' }
  };

  var BROWSER_PLUGIN_SUPPORT = {
    msie: true,//8,
    edge: true,
    chrome: 50,
    opera: false,
    safari: true,
    mozilla: false,
    konqueror: false
  };
  var LOGGER_MESSAGE_WEB = {
    SUCCESS_OPEN_UPLOAD_DIALOG: 'SUCCESS_OPEN_UPLOAD_DIALOG',
    BEFORE_CREATE_UPLOAD_TASK: 'BEFORE_CREATE_UPLOAD_TASK',
    BEFORE_CREATE_DOWNLOAD_TASK: 'BEFORE_CREATE_DOWNLOAD_TASK',
    CREATE_SHORTLINK_ID: 'CREATE_SHORTLINK_ID'
  };

  var CURRENT_PLUGIN_VERSION = ''; //当前用户安装的插件版本
  var ERROR_RETRY_LIMIT = 5;
  var ERROR_RETRY = 0;
  var IS_CONNECTED = false;
  var STOP_REQUEST = false;

  var classNames = {
    _styles: {
      'mec-ui-button': 'height: 30px; line-height: 30px; border: 1px solid #d77163; background: #D67264; color: #fff; border-radius: 2px; padding: 0 31px;',
      'mec-ui-cancel': 'background-color: #ccc; border-color: #ccc;',
      'mec-ui-dialog': 'position: fixed; left: 0; top: 0; right: 0; bottom: 0; z-index: 10000;',
      'mec-ui-dialog-bg': 'position: absolute; left: 0; top: 0; right: 0; bottom: 0; z-index: 1; background-color: #000; filter:alpha(opacity=50);  -moz-opacity:0.5;  -khtml-opacity: 0.5;  opacity: 0.5;',
      'mec-ui-dialog-main': 'padding: 36px 0 0px; margin: 12% auto 6%; width: 50%; background: #f2f5f6; border-radius: 4px; position: relative; z-index: 2; max-height: 80%; overflow: hidden;',
      'mec-ui-dialog-head': 'font-size: 14px; height: 36px; line-height: 36px; position: absolute; top: 0; left: 0; right: 0; padding-left: 10px; background-color: #f2f5f6; color: #bf726c;',
      'mec-ui-dialog-close': 'text-align: center; cursor: default; height: 36px; line-height: 36px; position: absolute; top: 0; right: 0px; color: #bf726c; width: 36px;',
      'mec-ui-dialog-body': 'height: 140px; padding: 4px; position: relative; overflow: auto;',
      'mec-ui-dialog-footer': 'padding: 0 12px; height: 40px; position: absolute; left: 0; bottom: 0px; right: 0;',
      'mec-ui-dialog-cancel': 'margin-left: 20px;',
      'mec-ui-process': 'position: fixed; left: 0; top: 0; z-index: 10001; height: 2px; width: 0; background-color: yellow; box-shadow: 0 5px 27px #000;',
      'mec-content': 'text-align: center; font-size: 14px;',
      'mec-title': 'text-align: center; font-size: 16px;',
      'mec-tools': 'padding-top: 12px',
      'mec-download-btn': 'height: 40px;',
      'mec-error': 'color: red;',
      'mec-normal-button': 'height: 40px; line-height: 40px; border: 1px solid #d77163; background: #D67264; color: #fff; border-radius: 2px; padding: 4px 31px;',
    },
    cx: function() {
      var styles = [];
      var cls = [];

      var _styles = this._styles;

      for(var i = 0, len = arguments.length; i < len; i++) {
        cls.push(arguments[i]);
        _styles[arguments[i]] && styles.push(_styles[arguments[i]]);
      }

      return 'class="'+ cls.join(' ') +'" style="'+ styles.join(' ') +'"';
    }
  };

  var Dialog = function(settings) {
    this.settings = $.extend({
      width: '50%',
      title: '确认信息',
      content: '',
      onClose: function() {}
    }, settings);

    var me = this;
    this.jo = $([
      '<div '+ classNames.cx('mec-ui-dialog') +'>',
      '<div '+ classNames.cx('mec-ui-dialog-bg') +'></div>',
      '<div '+ classNames.cx('mec-ui-dialog-main') +'>',
      '<div '+ classNames.cx('mec-ui-dialog-head') +'>',
      '<span>',
      me.settings.title,
      '</span>',
      '<div '+ classNames.cx('mec-ui-dialog-close') +'>X</div>',
      '</div>',
      '<div '+ classNames.cx('mec-ui-dialog-body') +'>',
      '<div '+ classNames.cx('mec-ui-dialog-content') +'></div>',
      '</div>',
      '</div>',
      '</div>'
    ].join(""));

    if(this.settings.width) {
      this.jo.find('.mec-ui-dialog-main').width(me.settings.width);
    };

    this.jo.find('.mec-ui-dialog-content').append(this.settings.content);
    this.jo.find('.mec-ui-dialog-close').click(function() {
      me.settings.onClose && me.settings.onClose();
      me.jo.remove();
      return false;
    }).mouseenter(function() {
      //f2f5f6
      $(this).css({
        'color': '#904c46',
        'backgroundColor': '#dbddde'
      });
    }).mouseout(function() {
      $(this).css({
        'color': '#bf726c',
        'backgroundColor': '#f2f5f6'
      });
    });
  };
  Dialog.prototype = {
    appendTo: function(jo) {
      this.jo.appendTo(jo);
    },
    show: function() {
      this.jo.show();
    },
    setContent: function(jo) {
      jo.appendTo(this.jo.find('.mec-ui-dialog-content').empty());
    },
    hide: function() {
      this.jo.hide();
    },
    destroy: function() {
      this.jo.remove();
    }
  };

  var Process = function(settings) {
    this.settings = $.extend({},  settings);
    this.jo = $([
      '<div '+ classNames.cx('mec-ui-process') +'></div>'
    ].join(''));
    this.isContinueRunning = true;
  };
  Process.prototype = {
    appendTo: function(jo) {
      this.jo.appendTo(jo);
    },
    start: function() {
      var me = this;
      var animate = function(p) {
        p = p + (95 - p) * 0.5;
        me.jo.animate({ width: p + '%' }, 2000);
        setTimeout(function() {
          if(!me.isContinueRunning) { return false; }
          animate(p);
        }, 1800);
      };

      animate(25);
    },
    destroy: function() {
      this.isContinueRunning = false;
      this.jo.remove();
    }
  };

  var getBrowserInfo = function() {
    var _browser = {};
    var sUserAgent = navigator.userAgent;
    var isOpera = sUserAgent.indexOf("Opera") > -1;
    if (isOpera) {
      //首先检测Opera是否进行了伪装
      if (navigator.appName == 'Opera') {
        //如果没有进行伪装，则直接后去版本号
        _browser.version = parseFloat(navigator.appVersion);
      } else {
        var reOperaVersion = new RegExp("Opera (\\d+.\\d+)");
        //使用正则表达式的test方法测试并将版本号保存在RegExp.$1中
        reOperaVersion.test(sUserAgent);
        _browser.version = parseFloat(RegExp['$1']);
      }
      _browser.name = 'opera';
    }

    var isEdge = sUserAgent.indexOf("Edge") > -1;
    if (isEdge) {
      var reEdge = new RegExp("Edge/(\\d+\\.\\d+)?");
      reEdge.test(sUserAgent);
      _browser.version = parseFloat(RegExp['$1']);
      _browser.name = 'edge';
      return _browser;
    }
    var isChrome = sUserAgent.indexOf("Chrome") > -1;
    if (isChrome) {
      var reChorme = new RegExp("Chrome/(\\d+\\.\\d+(?:\\.\\d+\\.\\d+))?");
      reChorme.test(sUserAgent);
      _browser.version = parseFloat(RegExp['$1']);
      _browser.name = 'chrome';
    }
    //排除Chrome信息，因为在Chrome的user-agent字符串中会出现Konqueror/Safari的关键字
    var isKHTML = (sUserAgent.indexOf("KHTML") > -1
      || sUserAgent.indexOf("Konqueror") > -1 || sUserAgent
        .indexOf("AppleWebKit") > -1)
      && !isChrome;
    if (isKHTML) {//判断是否基于KHTML，如果时的话在继续判断属于何种KHTML浏览器
      var isSafari = sUserAgent.indexOf("AppleWebKit") > -1;
      var isKonq = sUserAgent.indexOf("Konqueror") > -1;
      if (isSafari) {
        var reAppleWebKit = new RegExp("Version/(\\d+(?:\\.\\d*)?)");
        reAppleWebKit.test(sUserAgent);
        var fAppleWebKitVersion = parseFloat(RegExp["$1"]);
        _browser.version = parseFloat(RegExp['$1']);
        _browser.name = 'safari';
      } else if (isKonq) {
        var reKong = new RegExp(
          "Konqueror/(\\d+(?:\\.\\d+(?\\.\\d)?)?)");
        reKong.test(sUserAgent);
        _browser.version = parseFloat(RegExp['$1']);
        _browser.name = 'konqueror';
      }
    }
    // !isOpera 避免是由Opera伪装成的IE
    var isIE = sUserAgent.indexOf("compatible") > -1
      && sUserAgent.indexOf("MSIE") > -1 && !isOpera;
    if (isIE) {
      var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
      reIE.test(sUserAgent);
      _browser.version = parseFloat(RegExp['$1']);
      _browser.name = 'msie';
    }

    var isIE11 = new RegExp("Trident(.*)rv.(\\d+)\\.(\\d+)");
    if(isIE11.test(sUserAgent)) {
      console.log('isie11');
      _browser.version = 11;
      _browser.name = 'msie';
      return _browser;
    };

    // 排除Chrome 及 Konqueror/Safari 的伪装
    var isMoz = sUserAgent.indexOf("Gecko") > -1 && !isChrome && !isKHTML;
    if (isMoz) {
      var reMoz = new RegExp("rv:(\\d+\\.\\d+(?:\\.\\d+)?)");
      reMoz.test(sUserAgent);
      _browser.version = parseFloat(RegExp['$1']);
      _browser.name = 'mozilla';
    }
    return _browser;
  };
  var getOSPlatform = function () {
    var os = "";

    if(/Win/.test(navigator.platform)) {
      if(navigator.userAgent.indexOf("WOW64") != -1 || navigator.userAgent.indexOf("Win64") != -1 ) {
        os = "win64";
      } else {
        os = "win32";
      }
    }if (/Mac/.test(navigator.platform)) {
      os = "macOS";
    }

    return os;
  };
  var dialogInstance = null;
  var dialogDestroy = function() {
    if(dialogInstance) {
      dialogInstance.destroy();
      dialogInstance = null;
    }
  };
  var dialogFactory = function(title, content, width, closeFn) {
    dialogDestroy();
    dialogInstance = new Dialog({
      title: title,
      content: '<div '+ classNames.cx("mec-title") +'>'+ content +'</div>',
      width: width || '460px',
      onClose: function() {
        closeFn && closeFn();
      }
    });
    dialogInstance.appendTo($('body'));
    return dialogInstance;
  };
  var downloadPluginDialog = function(dialogTitle, contentTitle) {
    var osName = getOSPlatform();
    if(!osName || !OS_PLUGIN_SUPPORT[osName]) {
      dialogFactory('提示', '插件暂不支持此系统');
      return;
    }

    var downloadURL = OS_PLUGIN_SUPPORT[osName].download;

    var sheets = [
      '<div '+ classNames.cx('mec-content') +'>',
      '<p '+ classNames.cx('mec-title') +'>',
      contentTitle,
      '，更新后 ',
      '<a href="javascript: history.go(0);">刷新页面</a>',
      '</p>',
      '<ul '+ classNames.cx('mec-tools') +'>',
      '<li>',
      '<a '+ classNames.cx('mec-normal-button') +' href="'+ downloadURL +'" target="_blank">点击下载最新插件</a>',
      '</li>',
      '</ul>',
      '</div>'
    ].join('');

    dialogFactory(dialogTitle, sheets);
  };

  var sendLogger = function(info, cb) {
    $.post(domain + '/logger/createTaskLog', {
      level: info.level || LOGGER_LEVEL.INFO,
      content: info.content,
      serverUUId: info.serverUUId || '',
      shortLinkId: info.shortLinkId || '',
      type: info.type || LOGGER_TYPE.CLIENT,
      detail: info.detail || '',
      t: new Date().getTime()
    }, function(rs) {
      cb && cb(rs);
    }, 'json');
  };
  var taskFail = function(info, cb) {
    $.getJSON(domain + '/transfer/fail', {
      serverUUId: info.serverUUId,
      t: new Date().getTime()
    }, function(rs) {
      cb && cb(rs);
    });
  };
  var sendLoggerFromWeb = function(shortlinkId, content, serverUUId, level, detail) {
    sendLogger({
      level: level || LOGGER_LEVEL.INFO,
      content: content,
      shortLinkId: shortlinkId,
      serverUUId: serverUUId,
      type: LOGGER_TYPE.WEB,
      detail: detail || '',
      t: new Date().getTime()
    });
  };
  var addPoint = function(num) {
    var s = [];

    for(var i = 0; i < num; i++) {
      s.push('.');
    }

    return s.join('');
  };
  var isCurrentVersionBlowRequireVersion = function(currentVersion, requireVersion) {
    var cur = currentVersion.split('.');
    var rv = requireVersion.split('.');

    if(cur.constructor != Array || rv.constructor != Array || cur.length != rv.length) {
      dialogDestroy('提示', '版本格式不正确，客户端版本：' + currentVersion + ', 当前要求版本：' + requireVersion);
      return false;
    }

    var flag = false;
    for(var i = 0, len = cur.length; i < len; i++) {
      if(cur[i] * 1 < rv[i] * 1) {
        flag = true;
        break;
      }

      if(cur[i] * 1 > rv[i] * 1) {
        break;
      }
    }

    return flag;
  };
  var isValidVersion = function() {
    var isOSSupport = MEC.isOSSupport();
    var requireVersion = OS_PLUGIN_SUPPORT[isOSSupport.result].requiredVersion;
    var flag = true;

    if(CURRENT_PLUGIN_VERSION) {
      if(isCurrentVersionBlowRequireVersion(CURRENT_PLUGIN_VERSION, requireVersion)) {
        flag = false;
      }else {
        flag = true;
      }
    }

    return flag;
  };
  var httpRequest = function(command, params, callback, error) {
    var data =  JSON.stringify({
      "command": command,
      "params": params
    });

    $.ajax({
      url: HTTP_PROTOCOL + '://'+ PLUGIN_SERVER.host + ':' + PLUGIN_SERVER.port +'/sdk',
      data: data,
      contentType: 'application/json',
      type: 'POST',
      dataType: 'json',
      crossDomain: true,
      error: function(XMLHttpRequest, textStatus, errorThrown) { // textStatus ==> "timeout", "error", "notmodified" 和 "parsererror"
        error && error(textStatus);
      },
      success: function(data, textStatus, jqXHR) {
        callback && callback(data);
      }
    });
  };

  //事件监听
  var events = {
    needInstall: {},
    download: {},
    loading: {},
    loaded: {},
    disconnect: {},
    connected: {},
    heartBeat: {}
  };
  var execEvents = function(event, params) {
    var evs = events[event];
    if(!evs) { return false; }
    for(var key in evs) {
      evs[key] && evs[key](params);
    }
  };
  var isBindPluginMessageEvent = false;
  var onMessageCallback = {
    'heartBeat': function(message) {
      execEvents('heartBeat', message);
    },
    'error': function(message) {
      dialogFactory('异常信息', message);
    },
    'logger': function(message) {
      var len = message.length;
      var send = function(index) {
        if(index < len) {
          setTimeout(function() {
            sendLogger(message[index], function() {
              send(index + 1);
            });
          }, 1000);
        }
      };

      send(0);
    },
    'taskTimeout': function(message) { //任务超时
      var len = message.length;

      var send = function(index) {
        if(index < len) {
          setTimeout(function() {
            taskFail(message[index], function() {
              send(index + 1);
            });
          }, 1000);
        }
      };

      send(0);
    },
    'taskError': function(message) { //任务超时
      var len = message.length;

      var send = function(index) {
        if(index < len) {
          setTimeout(function() {
            taskFail(message[index], function() {
              send(index + 1);
            });
          }, 1000);
        }
      };

      send(0)
    }
  };
  var bindListenFromPlugin = function() {
    if(isBindPluginMessageEvent) { return; }
    isBindPluginMessageEvent = true;

    var post = function() {
      postMessage('message', "", function(rs) {
        console.log('== post result ==>', rs);
        if(rs.status == 0) {
          var cb = onMessageCallback[rs.result.type];
          cb && cb(rs.result.message);
        }else {
          dialogFactory('异常信息', rs.result);
        }

        setTimeout(function() {
          post();
        }, MESSAGE_LOAD_INTERVAL);

      }, function() {
        setTimeout(function() {
          post();
        }, MESSAGE_LOAD_INTERVAL);
      });
    };

    post();
  };
  //事件监听

  var checkPluginInstall = function(cb) {
    httpRequest('getPluginInfo', '', function success(data) {
      if(data.status == 0) {
        CURRENT_PLUGIN_VERSION = data.result.version;
        IS_CONNECTED = true;
        execEvents('connect');
        cb && cb(true, data.result.version);
      }else {
        cb && cb(true, data.result);
      }
    }, function error(err) {
      cb && cb(false, err);
    });
  };
  var createLaunchDialog = function() {
    var ins = dialogFactory('提示', [
      '连接插件超时，请确认插件已打开',
      '<div style="text-align: center; padding: 8px 0;">',
      '<a '+  classNames.cx('mec-normal-button') +' href="'+ MEC_INSTALL_URL +'">启动插件</a>',
      '</div>',
      '</div>'
    ].join(''));
    ins.jo.find('a').click(function() {
      ins.destroy();
    });
  };

  var ensurePluginAvailable = function(connectedFn) {
    //在检查完所有状态之前，不进行其它请求的响应
    STOP_REQUEST = true;

    //检测是否支持当前系统
    var isOSSupport = MEC.isOSSupport();
    if(isOSSupport.status != 0) {
      STOP_REQUEST = false;
      dialogFactory('提示', isOSSupport.result);
      return false;
    }

    //检测是否支持当前浏览器
    var st = MEC.isBrowserSupport();
    if(st.status != 0) {
      STOP_REQUEST = false;
      dialogFactory('提示', st.result);
      return false;
    }

    var pluginLaunchRetry = 0;
    var linkJO = null;

    var loop = function() {
      checkPluginInstall(function(isInstall, message) {
        if(isInstall && IS_CONNECTED) {
          STOP_REQUEST = false;

          if(linkJO) {
            linkJO.remove();
            linkJO = null;
          }

          dialogDestroy();
          //检查版本是否为最低要求版本
          if(!isValidVersion()) {
            downloadPluginDialog('提示', '插件版本('+ message +')过低，请更新插件');
            CURRENT_PLUGIN_VERSION = '';
            return false;
          }

          bindListenFromPlugin();
          connectedFn && connectedFn();
        }else {
          if(!linkJO) {
            linkJO = $('<a href="'+ MEC_INSTALL_URL +'"></a>').appendTo('body');
            linkJO[0].click();
          };

          if(pluginLaunchRetry < PLUGIN_LAUNCH_RETRY + 1) {
            dialogFactory('提示', '正在启动凤云快传插件，请等待' + addPoint(pluginLaunchRetry * 1 + 1));

            setTimeout(function() {
              pluginLaunchRetry++;
              loop();
            }, 3000);
          }else {
            IS_CONNECTED = false;
            STOP_REQUEST = false;

            if(linkJO) {
              linkJO.remove();
              linkJO = null;
            }

            execEvents('disconnect');
            dialogDestroy();

            if(!isInstall) {
              MEC.showPluginInstallPanel();
            }else {
              createLaunchDialog();
            }

            pluginLaunchRetry = 0;
          }
        }
      });
    };

    loop();
  };

  var getError = function(err) {
    return typeof err == 'string' ? err : JSON.stringify(err);
  };

  var postMessage = function(command, params, cb, errorFn) {
    if(STOP_REQUEST) { return false; }

    var _request = function() {
      httpRequest(command, params, function(data) {
        ERROR_RETRY = 0;

        if(!IS_CONNECTED) {
          IS_CONNECTED = true;
          execEvents('connect');
        }

        cb && cb(data);
      }, function error(err) {
        if(ERROR_RETRY > ERROR_RETRY_LIMIT) {
          ERROR_RETRY = 0;
          IS_CONNECTED = false;

          execEvents('disconnect');
          postMessage(command, params, cb, errorFn);
        }else {
          if(command == 'message') { //定时获取的请求，添加兼容策略
            console.log('心跳异常', err);
            errorFn && errorFn(getError(err));
          }else {
            if(errorFn) {
              errorFn(err == 'error' ? '连接插件超时，请确认插件已打开。<a href="'+ MEC_INSTALL_URL +'">打开插件</a>' : getError(err));
            }else {
              createLaunchDialog();
            }
          }

          ERROR_RETRY++;
        }
      });
    };

    if(!IS_CONNECTED) { //如果是处于非连接状态，需要进行相关的检测
      ensurePluginAvailable(function connected() {
        _request();
      });
    }else {
      _request();
    }
  };

  MEC.register = function(event, key, fn) {
    if(events[event]) {
      events[event][key] = fn;
    }
  };
  MEC.unRegister = function(event, key) {
    if(events[event] && events[event][key]) {
      events[event][key] = null;
      delete events[event][key];
    }
  };
  MEC.getPluginInfo = function(callback) {
    postMessage('getPluginInfo', "", function(rs) {
      callback && callback(rs);
    });
  };
  MEC.openUploadDialog = function(shortLinkId, callback, errorFn) {
    sendLoggerFromWeb(shortLinkId, LOGGER_MESSAGE_WEB.SUCCESS_OPEN_UPLOAD_DIALOG, '', LOGGER_LEVEL.INFO, '浏览器信息: ' + navigator.userAgent + ', 客户端版本: ' + CURRENT_PLUGIN_VERSION);
    postMessage('openUploadDialog', "", function(rs) {
      callback && callback(rs);
    }, errorFn);
  };

  var _postUploadDataToClient = function(tasks, isNew, successFn, errorFn) {
    if(tasks.constructor !== Array) {
      tasks = [tasks];
    }

    var _transfers = [];
    var t = null;

    for(var i = 0, len = tasks.length; i < len; i++) {
      t = tasks[i];
      _transfers.push({
        "task": { "_id": t._id, "serverUUId": t.serverUUId, 'shortLinkId': t.shortLinkId, "host": t.host, "port": t.port, cryptoType: t.cryptoType, cryptoKey: t.cryptoKey, isNew: isNew },
        "file": { "size": t.fileSize, "name": t.originalPath, currentCount: t.currentCount }
      });
      sendLoggerFromWeb(t.shortLinkId, LOGGER_MESSAGE_WEB.BEFORE_CREATE_UPLOAD_TASK, t.serverUUId, LOGGER_LEVEL.INFO, '浏览器信息: ' + navigator.userAgent + ', 客户端版本: ' + CURRENT_PLUGIN_VERSION);
    }

    postMessage('upload', {
      "defaultServer": DEFAULT_SERVER,
      "transfers": _transfers
    }, function(rs) {
      if(rs.status == 0) {
        successFn && successFn(rs.result);
      }else {
        if(errorFn) {
          errorFn(rs.result);
        }else {
          window.alert(rs.result);
        }
      }
    });
  };
  var _postDownloadDataToClient = function(tasks, downloadPath, isNew, successFn, errorFn) {
    if(tasks.constructor !== Array) {
      tasks = [tasks];
    }

    var _transfers = [];
    var t = null;

    for(var i = 0, len = tasks.length; i < len; i++) {
      t = tasks[i];
      _transfers.push({
        "task": { "_id": t._id, "serverUUId": t.serverUUId, 'shortLinkId': t.shortLinkId, "host": t.host, "port": t.port, cryptoType: t.cryptoType, cryptoKey: t.cryptoKey, isNew: isNew },
        "file": { "size": t.fileSize, "name": t.fileName, currentCount: t.currentCount }
      });
      sendLoggerFromWeb(t.shortLinkId, LOGGER_MESSAGE_WEB.BEFORE_CREATE_DOWNLOAD_TASK, t.serverUUId, LOGGER_LEVEL.INFO, '浏览器信息: ' + navigator.userAgent + ', 客户端版本: ' + CURRENT_PLUGIN_VERSION);
    };

    postMessage('download', {
      "defaultServer": DEFAULT_SERVER,
      "downloadPath": downloadPath,
      "transfers": _transfers
    }, function(rs) {
      if(rs.status == 0) {
        successFn && successFn(tasks, rs.result);
      }else {
        if(errorFn) {
          errorFn(rs.result);
        }else {
          window.alert(rs.result);
        }
      }
    });
  };
  var letMeKnowWhichTasksIsNotInLocal = function(tasks, responseTaskStatus) {
    var len = tasks.length;
    var hasTaskNotInLocal = false;

    if(len == 0) { return false; }

    var sheets = [
      '<div style="text-align: left; padding: 0 12px; font-size: 12px;">',
      '<ul>',
    ];

    var noInlocalTaskIds = [];

    for(var k in responseTaskStatus) {
      if(responseTaskStatus[k] * 1 == 1) {
        noInlocalTaskIds.push(k);
        hasTaskNotInLocal = true;
      }
    }

    noInlocalTaskIds = noInlocalTaskIds.join(',');

    for(var i = 0; i < len; i++) {
      if(tasks[i]._id.indexOf(noInlocalTaskIds) != -1) {
        sheets.push('<li style="padding: 4px 0; color: #666;">'+ tasks[i].taskName +'</li>');
      }
    }

    sheets.push('</ul></div>');

    if(hasTaskNotInLocal) {
      dialogFactory('提示: 以下任务不在此电脑上，不能进行续传操作', sheets.join(''));
      return false;
    }

  };

  /**
   * 开始上传任务, 假设上传两个文件，文件信息见2.2接口, 返回两个task信息分别为：

   [
   { "_id": "task-1", "serverUUId": 100 },
   { "_id": "task-2", "serverUUId": 100 }
   ]
   {
       "command": "upload",
       "params": {
           "defaultServer": { "host": "192.0.15.1", "port": 8000 }
           "transfers": [
               {
                   "task": { "_id": "task-1", "serverUUId": 100, "host": "192.0.15.1", "port": 8000 },
                   "file": { "size": 1024, "name": "aa.png" }
               },
               {
                   "task": { "_id": "task-2", "serverUUId": 100 },
                   "file": { "size": 1024, "name": "bb.png"}
               }
           ]
       }
   }
   返回值：

   {
    "status": "0",
    "result": {
            "task-1": 0,
            "task-2": 1 //task is not in local
            "task-3": -1 //cancel
         }
    }
   */
  /**
   * 开始上传文件
   * @param info {
   *  filesInfo {Object} openUploadDialog返回的文件据 return Array，格式如下：
   *  [
       { "_id": "task-1", "serverUUId": 100 },
       { "_id": "task-2", "serverUUId": 100 }
      ]
      packageName {String} 主题名称
      hasCaptcha {String} 提取码 (option)
   * }
   *
   * @param successFn {Function} 上传文件后成功 (taskResult, pluginResult) => { ... }
   * taskResult, 创建任务后返回的任务列表
   * pluginResult 插件返回信息
   *
   * @param errorFn 失败调用方法 (errorMessage) => { ... }
   */
  MEC.upload = function(info, successFn, errorFn) {
    if(!info || $.isEmptyObject(info)) {
      errorFn && errorFn('请输入上传参数');
      return false;
    }

    if(!info.shortlinkId) {
      errorFn && errorFn('请填写shortlinkId');
      return false;
    }

    if(!info.filesInfo) {
      errorFn && errorFn('请先选择上传的文件');
      return false;
    }

    if(info.filesInfo.length > UPLOAD_FILE_LIMIT) {
      errorFn && errorFn('上传文件超过最大限制，一次最多上传' + UPLOAD_FILE_LIMIT + '个文件');
      return false;
    }

    var hasCaptcha = false;
    if(info.captcha) {
      if(info.captcha.length !== 6) {
        errorFn && errorFn('安全码长度不正确，须为6位');
        return false;
      }else {
        hasCaptcha = true;
      }
    };

    sendLoggerFromWeb(info.shortlinkId, LOGGER_MESSAGE_WEB.BEFORE_CREATE_UPLOAD_TASK, '', LOGGER_LEVEL.INFO, 'shortlinkId: ' + info.shortlinkId);

    $.ajax({
      type: "POST",
      url: domain + "/transfer/createTask",
      data: {
        receiver: info.receiver || '',
        filesInfo: JSON.stringify(info.filesInfo),
        packageName: info.packageName,
        transferType: 'send',
        transferMode: info.transferMode || 'inDirect',
        captcha: info.captcha || '',
        hasCaptcha: hasCaptcha ? 'true' : 'false',
        remark: info.remark || '',
        receiverName: info.receiverName || '',
        debug: info.debug ? '1' : '0',
        shortlinkId: info.shortlinkId,
        invited:info.invited,
        resourceId: info.resourceId || '',
        cryptoType: info.cryptoType || '',
        removeAfterRead: info.removeAfterRead || '',
        downloadLimit: info.downloadLimit || '',
        clientVersion: CURRENT_PLUGIN_VERSION
      },
      dataType: 'json',
      cache: false,
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        var err = textStatus || errorThrown;
        if(errorFn) {
          errorFn(err);
        }else {
          window.alert(err);
        }
      },

      success: function(taskResult) {
        if(taskResult.status == 0) {
          _postUploadDataToClient(taskResult.result, 1, function(pluginResult) {
            successFn && successFn(taskResult.result, pluginResult);
          }, errorFn);
        }else {
          if(errorFn) {
            errorFn(taskResult.result);
          }else {
            window.alert(taskResult.result);
          }
        }
      }
    });
  };
  MEC.resumeUpload = function(groupTaskIdsOrChildTaskInfos, successFn, errorFn) {
    if(!groupTaskIdsOrChildTaskInfos) {
      errorFn && errorFn('groupTaskIdsOrChildTaskInfos is null');
      return false;
    }

    if(typeof groupTaskIdsOrChildTaskInfos == 'string') {
      $.ajax({
        type: "GET",
        url: domain + "/transfer/listTaskByGroupIds",
        data: {
          groupTaskIds: groupTaskIdsOrChildTaskInfos,
          fields: [
            '_id',
            'serverUUId',
            'shortlinkId',
            'host',
            'port',
            'cryptoType',
            'cryptoKey',
            'fileSize',
            'originalPath',
            'currentCount',
            'shortLinkId',
            'taskName'
          ].join(","),
        },
        dataType: 'json',
        cache: false,
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          var err = textStatus || errorThrown;
          if(errorFn) {
            errorFn(err);
          }else {
            window.alert(err);
          }
        },
        success: function(taskResult){
          if(taskResult.status == 0) {
            var docs = taskResult.result;
            if(docs.length == 0) {
              errorFn && errorFn('没有找到需要重传的任务');
              return false;
            }
            _postUploadDataToClient(docs, 0, function(pluginResult) {
              letMeKnowWhichTasksIsNotInLocal(docs, pluginResult);
              successFn && successFn(docs, pluginResult);
            }, errorFn);
          }else {
            if(errorFn) {
              errorFn(taskResult.result);
            }else {
              window.alert(taskResult.result);
            }
          }
        }
      });
    }else {
      _postUploadDataToClient(groupTaskIdsOrChildTaskInfos, 0, function(pluginResult) {
        letMeKnowWhichTasksIsNotInLocal(groupTaskIdsOrChildTaskInfos, pluginResult);
        successFn && successFn(groupTaskIdsOrChildTaskInfos, pluginResult);
      }, errorFn);
    }
  };

  /**
   *
   *
   {
    "command": "stop",
    "params": [
        { "taskId": "task-1", "serverUUId": 100 },
        { "taskId": "task-2", "serverUUId": 100 }
      ]
    }

   return

   {
    "status": "0",
    "result": {
            "task-1": 0,
            "task-2": 1 //task is not in local
            "task-3": -1 //cancel
         }
    }
   */
  MEC.stop = function(tasks, callback, errorFn) {
    if(!tasks) { errorFn && errorFn('没有收到停止任务参数') }
    var _tasks = [];
    var t = null;
    var ts = [];

    if(tasks.constructor !== Array) {
      ts.push(tasks);
    }else {
      ts = tasks;
    }

    for(var i = 0, len = ts.length; i < len; i++) {
      t = ts[i];
      _tasks.push({ "taskId": t._id, "serverUUId": t.serverUUId });
    }

    postMessage('stop', _tasks, function(rs) {
      callback && callback(rs);
    }, errorFn);
  };
  MEC.cancel = function(tasks, callback) {
    var _tasks = [];
    var t = null;

    for(var i = 0, len = tasks.length; i < len; i++) {
      t = tasks[i];
      _tasks.push({ "taskId": t._id, "serverUUId": t.serverUUId });
    }

    postMessage('cancel', _tasks, function(rs) {
      callback && callback(rs);
    });
  };
  /**
   * {
    "command": "openDownloadDialog",
    "params": {
        "defaultServer": { "host": "192.0.15.1", "port": 8000 },
        "transfers": [
            { "_id": "task-1", "serverUUId": 100, "host": "192.0.15.1", "port": 8000 },
            { "_id": "task-1", "serverUUId": 100, "host": "192.0.15.1", "port": 8000 }
        ]
      }
    }

   return

   {
    "status": "0",
    "result": {
            "task-1": 0,
            "task-2": 1, //task is not in local
            "task-3": -1 //cancel
         }
    }
   */
  MEC.openDownloadDialog = function(successFn, errorFn) {
    postMessage('openDownloadDialog', "", function(rs) {
      console.log('openDownloadDialog ==>', rs);
      if(rs.status == 0) { // rs.result == 'cancel' is close the dialog
        successFn && successFn(rs.result || (rs.params == 'open error' ? 'cancel' : rs.params)); // plugin bug
      }else {
        if(errorFn) {
          errorFn(rs.result);
        }else {
          window.alert(rs.result);
        }
      }
    });
  };
  MEC.download = function(info, downloadPath, successFn, errorFn) {

    sendLoggerFromWeb(info.shortlinkId, LOGGER_MESSAGE_WEB.BEFORE_CREATE_DOWNLOAD_TASK, '', LOGGER_LEVEL.INFO, 'shortlinkId: ' + info.shortlinkId);

    $.ajax({
      type: "POST",
      url: domain + "/transfer/createTask",
      data: {
        filesInfo: JSON.stringify(info.filesInfo),
        packageId: info.packageId,
        packageName: info.packageName,
        transferType: 'receive',
        transferMode: 'indirect',
        captcha: info.captcha || '',
        hasCaptcha: info.hasCaptcha || false,
        remark: info.remark || '',
        sender: info.sender,
        receiver: info.receiver,
        storageId: info.storageId,
        shortlinkId: info.shortlinkId,
        resourceId: info.resourceId,
        debug: info.debug ? '1' : '0',
        cryptoType: info.cryptoType || '',
        cryptoKey: info.cryptoKey,
        invited: info.invited,
        clientVersion: CURRENT_PLUGIN_VERSION
      },
      dataType: 'json',
      cache: false,
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        var err = textStatus || errorThrown;
        if(errorFn) {
          errorFn(err);
        }else {
          window.alert(err);
        }
      },
      success: function(taskResult) {
        if(taskResult.status == 0) {
          _postDownloadDataToClient(taskResult.result, downloadPath, 1, successFn, errorFn);
        }else {
          if(errorFn) {
            errorFn(taskResult.result);
          }else {
            window.alert(taskResult.result);
          }
        }
      }
    });

  };
  MEC.resumeDownload = function(groupTaskIdsOrChildTaskInfos, successFn, errorFn) {
    if(!groupTaskIdsOrChildTaskInfos) {
      errorFn && errorFn('groupTaskIdsOrChildTaskInfos is null');
      return false;
    }

    if(typeof groupTaskIdsOrChildTaskInfos == 'string') {
      $.ajax({
        type: "GET",
        url: domain + "/transfer/listTaskByGroupIds",
        data: {
          groupTaskIds: groupTaskIdsOrChildTaskInfos,
          fields: [
            '_id',
            'serverUUId',
            'shortlinkId',
            'host',
            'port',
            'cryptoType',
            'cryptoKey',
            'fileSize',
            'originalPath',
            'currentCount',
            'shortLinkId',
            'taskName'
          ].join(",")
        },
        dataType: 'json',
        cache: false,
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          var err = textStatus || errorThrown;
          if(errorFn) {
            errorFn(err);
          }else {
            window.alert(err);
          }
        },
        success: function(taskResult) {
          if(taskResult.status == 0) {
            var docs = taskResult.result;
            if(docs.length == 0) {
              errorFn && errorFn('没有找到需要重新下载的任务');
              return false;
            }

            _postDownloadDataToClient(docs, '', 0, function(pluginResult) {
              letMeKnowWhichTasksIsNotInLocal(docs, pluginResult);
              successFn && successFn(docs, pluginResult);
            }, errorFn);
          }else {
            if(errorFn) {
              errorFn(taskResult.result);
            }else {
              window.alert(taskResult.result);
            }
          }
        }
      });
    }else {
      _postDownloadDataToClient(groupTaskIdsOrChildTaskInfos, '', 0, function(pluginResult) {
        letMeKnowWhichTasksIsNotInLocal(groupTaskIdsOrChildTaskInfos, pluginResult);
        successFn && successFn(groupTaskIdsOrChildTaskInfos, pluginResult);
      }, errorFn);
    }
  };
  MEC.isOSSupport = function() {
    var osName = getOSPlatform();
    if(!osName || !OS_PLUGIN_SUPPORT[osName]) {
      return { status: 1, result: '插件暂不支持此系统' };
    }

    return { status: 0, result: osName };
  };
  MEC.isBrowserSupport = function() {
    var browser = getBrowserInfo();
    var isSupportOrVersion = BROWSER_PLUGIN_SUPPORT[browser.name];

    if(!isSupportOrVersion) {
      return { status: 1, result: '暂不支持 '+ browser.name +' 浏览器' };
    }

    if(browser.version < isSupportOrVersion) {
      return { status: 1, result: browser.name + '（当前版本浏览器版本：'+ browser.version +'） 版本过低' };
    }

    return { status: 0, result: browser };
  };
  MEC.dnd = function(el, events) {
    var evt = $.extend({
      dragenter: function(e) {},
      drag: function(e) {},
      dragleave: function(e) {}
    }, events);

    function handleFileDragEnter(e) {
      e.stopPropagation();
      e.preventDefault();
      this.classList.add('hovering');
      evt.dragenter && evt.dragenter(e);
    }

    function handleFileDragLeave(e) {
      e.stopPropagation();
      e.preventDefault();
      this.classList.remove('hovering');
      evt.dragleave && evt.dragleave(e);
    }

    function handleFileDragOver(e) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }

    function handleFileDrop(e) {
      e.stopPropagation();
      e.preventDefault();
      this.classList.remove('hovering');

      var files = e.dataTransfer.files;
      // var data = {};
      // data.dataTransfer = {};
      // data.dataTransfer.files = [];
      // for (var i = 0; i < files.length; i++) {
      //   var fileObject  = {
      //     'lastModifiedDate' : files[i].lastModifiedDate,
      //     'name'             : files[i].name,
      //     'size'             : files[i].size,
      //     'type'             : files[i].type
      //   };
      //   data.dataTransfer.files.push(fileObject);
      // }
      // console.log(files, data);

      evt.drag && evt.drag(e, files);
    }

    el.addEventListener('dragenter', handleFileDragEnter, false);
    el.addEventListener('dragleave', handleFileDragLeave, false);
    el.addEventListener('dragover', handleFileDragOver, false);
    el.addEventListener('drop', handleFileDrop, false);
  };
  MEC.listTasks = function(params, callback) {
    var opt = {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      status: params.status || -1
    };

    postMessage('listTasks', opt, function(rs) {
      callback && callback(rs);
    });
  };
  MEC.info = function() {
    return {
      browser: BROWSER_PLUGIN_SUPPORT,
      os: OS_PLUGIN_SUPPORT
    }
  };
  MEC.showPluginInstallPanel = function() {
    var osName = getOSPlatform();
    if(!osName || !OS_PLUGIN_SUPPORT[osName]) {
      dialogFactory('提示', '插件暂不支持此系统。');
      return;
    }
    downloadPluginDialog('提示', '请先安装插件');
    execEvents('needInstall');
  };
  _window.MEC = MEC;

})(window, document);
