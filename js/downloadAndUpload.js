var TASK_LIMIT = 6;
var TASK_RUNNING_AT_SAME_TIME = 2;
var TRANSFER_STATUS_MAP = {
  0: { key: 'WAITING', value: 0, text: '等待中' },
  1: { key: 'CONNECTING', value: 1, text: '连接中' },
  2: { key: 'CONNECTED', value: 2, text: '开始传输' },
  3: { key: 'TRANSFERRING', value: 3, text: '传输中' },
  4: { key: 'COMPLETED', value: 4, text: '传输完成' },
  5: { key: 'FAILED', value: 5, text: '传输失败' },
  6: { key: 'STOPPING', value: 6, text: '暂停中' },
  7: { key: 'STOPPED', value: 7, text: '已暂停' },
  8: { key: 'ERROR', value: 8, text: '传输异常' },
  9: { key: 'CANCELING', value: 9, text: '取消中' },
  10: { key: 'CANCELED', value: 10, text: '已取消' },
  11: { key: 'RECOVERING', value: 11, text: '恢复中' },
  12: { key: 'RECOVERED', value: 12, text: '已恢复' },
  13: { key: 'CLIENT_EXIT', value: 13, text: '应用退出'},
  14: { key: 'DELETING', value: 14, text: '删除中' },
  15: { key: 'DELETED', value: 15, text: '已删除' },
  16: { key: 'PUSHING', value: 16, text: '正在保存' },
  17: { key: 'PUSHED', value: 17, text: '保存完成' }
};
var TRANSFER_STATUS = {};
var LOGGER_TYPE = {
  '1': '插件',
  '2': '服务端',
  '3': '浏览器',
  '4': '其它',
};

for(var k in TRANSFER_STATUS_MAP) {
  TRANSFER_STATUS[TRANSFER_STATUS_MAP[k].key] = TRANSFER_STATUS_MAP[k];
}

Date.prototype.format = function(format) {
  var _ = this;
  var o = {
    "M+": _.getMonth() + 1,
    "d+": _.getDate(),
    "h+": _.getHours(),
    "m+": _.getMinutes(),
    "s+": _.getSeconds(),
    "q+": Math.floor((_.getMonth() + 3) / 3),  //quarter
    "S": _.getMilliseconds() //millisecond
  };

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (_.getFullYear() + "").substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return format;
};
Date.from = function(str) {
  if(!str) { return '' }
  var strs = str.split('T');
  var date = strs[0].split('-');
  var hs = strs[1].split('.');
  var time = hs[0].split(':');
  var ms = hs[1].replace('Z', '') * 1;
  var d = new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2], ms);
  var offset = d.getTime() - new Date().getTimezoneOffset()* 60 * 1000;
  return new Date(offset);
};

var formatSize = function(size) {
  var str = '';
  if (size < 1000) {
    str = size + ' B';
  } else if (size < 1000 * 1000) {
    str = Math.round(100 * (size / 1024)) / 100 + ' KB';
  } else if (size < 1000 * 1000 * 1000) {
    str = Math.round(100 * (size / (1024 * 1024))) / 100 + ' MB';
  } else {
    str = Math.round(100 * (size / (1024 * 1024 * 1024))) / 100 + ' GB';
  }
  return str;
};
var transferStringToObject = function(info) {
  return (new Function('return ' + info.replace(/&#34;/g, "\"").replace(/\\/g, '\\\\')))()
};
var getFileName = function(filePath) {
  var reg = /[^\\\/]*[\\\/]+/g;
  if(filePath) {
    filePath = filePath.replace(reg,'');
  }
  return filePath;
};
var setTheme = function(bg, theme, logo, company) {
  var sendJO = $('.send');
  var mainJO = $('.login');
  var imgJO = $('.sendLogo img');
  var beforeJO = $('.before');
  var companyJO = $('.company');
  var backgroundImage = bg ? bg[0] : '/img/sendBg.jpg';
  var themeClass = theme ? theme : 'default';
  var logoSrc = logo ? logo : '/img/phoenix.png';

  mainJO.addClass(themeClass);
  sendJO.css('background', 'url('+ backgroundImage +') 0 / cover fixed');
  beforeJO.css('background', 'url('+ backgroundImage +') 0 / cover fixed');
  imgJO.attr('src', logoSrc);
  companyJO.html(company);
  mainJO.show();
  sendJO.show();
};
var errorDialog = function(errorMessage, title) {
  var dialog = new UI.Dialog({
    title: '出错了',
    content: [
      '<div class="errorContent">',
      '<div class="errorTitle">',
      (title ? title : '出错了 <a href="javascript: history.go(0);">刷新页面</a> 重试.'),
      '</div>',
      '<div>',
      '<textarea readonly>'+ errorMessage +'</textarea>',
      '</div>',
      '</div>'
    ].join('')
  });
  dialog.appendTo($('body'));
};
var infoDialog = function(msg, title) {
  var dialog = new UI.Dialog({
    title: '提示',
    content: [
      '<div class="errorContent">',
      '<div class="errorTitle">'+ (title || '') +'</div>',
      '<div>',
      '<textarea readonly>'+ msg +'</textarea>',
      '</div>',
      '</div>'
    ].join('')
  });
  dialog.appendTo($('body'));
};

var isTaskQueueFull = function(tasks, pluginResult) {
  //看看是否有任务在队列中，如果运行任务少于2（TASK_LIMIT）个，那么将给用户提示
  var waitingTasks = [];

  for(var t in pluginResult) {
    if(pluginResult[t] == 2) {
      waitingTasks.push(t);
    }
  }

  var wl = waitingTasks.length;
  if(wl != 0 && tasks.length - wl < TASK_RUNNING_AT_SAME_TIME) {
    infoDialog('当前任务队列已满，已将 ' + waitingTasks.length + ' 个任务添加到队列中');
  }
};

var TaskItem = function(settings) {
  this.settings = $.extend({
    task: '',
    isHideBottomLine: false
  }, settings)
  this.task = this.settings.task;
  this.isHideBottomLine = !!this.settings.isHideBottomLine;
  this.tpl = [];
  this.jo = null;
  this.errorMessage = '';

  this.init();
};
TaskItem.prototype = {
  init: function() {
    var me = this;
    var tpl = [
      '<div class="sendingViewItem">',
      (this.isHideBottomLine ? '' : '<div class="sendingItemBorder"></div>'),
      '<input type="button" class="actionBtn playOrPause iconPlay" />',
      '<div class="sendingItemContent">',
      '<div class="clearfix">',
      '<p class="sendingItemInfo" title="{taskName}">{formatTaskName}</p>',
      '<p class="speedItem">0/秒</p>',
      '</div>',
      '<div class="sendingProgress">',
      '<div class="progressBar"></div>',
      '</div>',
      '<div class="clearfix">',
      '<span class="progressStatus">初始化</span>',
      '<span class="errorMessage"></span>',
      '<p class="progressTip">',
      '0%&nbsp;&nbsp;0/{fileSize}',
      '</p>',
      '</div>',
      '</div>',
      '</div>'
    ];

    this.tpl = tpl.join('');
    this.tpl = this.tpl.replace('{taskName}', this.task.taskName);
    this.tpl = this.tpl.replace('{formatTaskName}', this.formatTaskName(this.task.taskName));
    this.tpl = this.tpl.replace('{fileSize}', formatSize(this.task.fileSize));
    this.jo = $(this.tpl);
    this.speedJO = this.jo.find('.speedItem');
    this.ItemContentJO = this.jo.find('.sendingItemContent');
    this.processBarJO = this.jo.find('.progressBar');
    this.statusJO = this.jo.find('.progressStatus');
    this.tipJO = this.jo.find('.progressTip');
    this.playOrPauseJO = this.jo.find('.playOrPause');
    this.errorJO = this.jo.find('.errorMessage');
    this.isEnable = true;

    // 续传
    var play = function(thisJO) {

      thisJO.removeClass('iconPause');
      me.ItemContentJO.removeClass('stopped');

      MEC.resumeDownload(me.task, function(task, pluginResult) {
        me.isEnable = true;
        for(var r in pluginResult) {
          if(pluginResult[r] == 2) {
            infoDialog('上传下载任务已满(同一时间只能执行两个任务), 如需优先启动此任务，请先暂停其它任务.');
            thisJO.addClass('iconPause');
            me.ItemContentJO.addClass('stopped');
          }
        }
      }, function(err) {
        me.isEnable = true;
        thisJO.addClass('iconPause');
        me.ItemContentJO.addClass('stopped');
        errorDialog('续传任务' + me.task.taskName + '失败，原因：' + err);
      });
    };
    //暂停
    var pause = function(thisJO) {

      if(!thisJO.hasClass('iconPause')) {
        thisJO.addClass('iconPause');
      }

      if(!me.ItemContentJO.hasClass('stopped')) {
        me.ItemContentJO.addClass('stopped');
      }

      MEC.stop(me.task, function(rs) {
        me.isEnable = true;
        if(rs.status == 0) {

        }else {
          thisJO.removeClass('iconPause');
          me.ItemContentJO.removeClass('stopped');
          errorDialog('停止任务' + me.task.taskName + '失败，原因：' + rs.result);
        }
      }, function(err) {
        me.isEnable = true;
        thisJO.removeClass('iconPause');
        me.ItemContentJO.removeClass('stopped');
        errorDialog('停止任务' + me.task.taskName + '失败，原因：' + err);
      });
    }

    this.errorJO.click(function() {
      if(!me.errorMessage) {
        return false;
      }
      errorDialog(me.errorMessage, '日志信息');
      return false;
    });

    this.playOrPauseJO.mousedown(function() {
      if(!me.isEnable) { return false; }
      var thisJO = $(this);
      thisJO.addClass('active');
    }).mouseup(function() {
      if(!me.isEnable) { return false; }
      var thisJO = $(this);
      thisJO.removeClass('active');

      me.isEnable = false;
      if(thisJO.hasClass('iconPause')) {
        pause(thisJO);
      }else {
        play(thisJO);
      }
    }).mouseout(function() {
      $(this).removeClass('active');
    });
  },
  formatTaskName: function(name) {
    var newName = name;

    var count = function(str) {
      var len = 0;
      for(var i = 0; i < str.length; i++) {
        len += str.substr(i, 1).charCodeAt() > 1000 ? 2 : 1;
      }
      return len;
    }

    var limit = 50;
    var splitIndex = 30;
    if(count(name) > limit) {
      newName = name.slice(0, splitIndex / 2) + '...' + name.slice(splitIndex / 2 + 3);
    }

    return newName;
  },
  update: function(task) {
    var me = this;
    var speed = task.processStatus == TRANSFER_STATUS['TRANSFERRING'].value ? task.transferSpeed : task.transferAvgSpeed;
    this.speedJO.html(formatSize(speed) + '/秒');

    var st = TRANSFER_STATUS_MAP[task.processStatus];
    if(st) {
      this.statusJO.html(st.text);
    }else {
      this.statusJO.html('请等待任务更新');
    }

    var percent = Math.round(task.percent * 100 * 100) / 100;

    if(percent > 100) {
      percent = 100;
    }

    this.processBarJO.css('width', percent + '%');

    this.tipJO.html(percent + '%&nbsp;&nbsp;'+ formatSize(task.currentCount) +'/' + formatSize(task.fileSize))

    if(task.processStatus == TRANSFER_STATUS['COMPLETED'].value) {
      this.isEnable = false;
      this.playOrPauseJO.removeClass('iconPause');
      this.playOrPauseJO.addClass('iconDone');
      return false;
    };

    if(this.isInStatus(task.processStatus, ['CONNECTING', 'CONNECTED', 'TRANSFERRING', 'PUSHING', 'PUSHED'])) {
      if(!this.playOrPauseJO.hasClass('iconPause')) {
        this.playOrPauseJO.addClass('iconPause');
      }
    }else {
      this.playOrPauseJO.removeClass('iconPause');
    }

    if(task.processStatus == TRANSFER_STATUS['ERROR'].value) {
      if(!this.ItemContentJO.hasClass('error')) {
        this.ItemContentJO.addClass('error');
      }

      if(!me.errorMessage) {
        me.getTaskErrorLog(task);
      }

    }else {
      me.errorJO.html('');
      me.errorMessage = '';
    }
  },
  getTaskErrorLog: function(task) {
    if(!task) { return false; }
    var me = this;
    me.errorJO.html('正在获取错误信息...');
    $.getJSON('/logger/getTaskLog', {
      id: task.serverUUId,
      shortLinkId: task.shortLinkId,
      levels: 1,
      t: new Date().getTime()
    }, function(rs) {
      if(rs.status == 0) {
        if(rs.result.length > 0) {
          me.errorJO.html('错误代码：'+ task.errorCode +', 查看详情');
          me.errorMessage = me.renderErrorMessage(rs.result);
        }
      }else {
        var refreshJO = $('<span>获取错误信息失败，点击重新获取</span>').appendTo(me.errorJO.empty());
        refreshJO.click(function() {
          me.getTaskErrorLog(task);
          return false;
        });
      }
    });
  },
  renderErrorMessage: function(messages) {
    var sheets = [];
    var item = null;

    for(var i = 0, len = messages.length; i < len; i++) {
      item = messages[i];
      sheets.push('['+ Date.from(item.createdAt).format('yyyy-MM-dd hh:mm:ss') +'] ['+ (LOGGER_TYPE[item.type] || '未知') +'] ' + item.content + '');
    }
    return sheets.join('/r/n');
  },
  isInStatus: function(st, statusNames) {
    var flag = false;

    for(var i = 0, len = statusNames.length; i < len; i++) {
      if(st == TRANSFER_STATUS[statusNames[i]].value) {
        flag = true;
        break;
      }
    }

    return flag;
  },
  appendTo: function(jo) {
    this.jo.appendTo(jo);
  }
};

var ProcessView  = function(settings) {
  this.settings = $.extend({
    email: '',
    packageName: '',
    taskId: '',
    childTasks: '',
    company: '',
    logo: '',
    downloadURL: '',
    abort: function() {}
  }, settings);

  var me = this;

  var saveSheet = this.settings.downloadURL ? '<p>保存路径：' + me.settings.downloadURL + '</p>' : '<p style="padding: 10px 0 4px 12px; background: none;"></p>';

  this.jo = $([
    '<div class="uploadContent sendingContent">',
    '<div class="before"></div>',
    '<div class="after"></div>',
    '<div class="sendHead">',
    '<div class="sendLogo">',
    '<img src="'+ me.settings.logo +'" height="50px"/>',
    '</div>',
    '<div class="sendLogoTitle">',
    '<span>'+ me.settings.company +'</span>',
    '</div>',
    '</div>',
    '<div class="sendBody">',
    '<div class="sendingViewHeader">',
    '发件人：' + me.settings.email,
    '</div>',
    '<div class="sendingViewHeader" style="padding-bottom: 14px;">',
    '主&nbsp;&nbsp;&nbsp;&nbsp;题：' + me.settings.packageName,
    '</div>',
    '<div class="btnGroupWrapper">',
    '<input type="button" class="sendingBtn abort" value="取消本次任务"/>',
    '</div>',
    '<div class="items"></div>',
    '<div class="locationWrapper">',
    saveSheet,
    '</div>',
    '</div>',
    '</div>'
  ].join(""));

  var tasks = this.settings.childTasks;
  var itemsJO = this.jo.find('.items');
  var sendBodyJO = this.jo.find('.sendBody');
  this.ins = {};
  this.childTaskIds = [];

  for(var i = 0, len = tasks.length; i < len; i++) {
    me.childTaskIds.push(tasks[i]._id);
    (function(index) {
      var t = tasks[index];
      me.ins[t._id] = new TaskItem({
        task: t,
        isHideBottomLine: index == len - 1 ? true : false
      });
      me.ins[t._id].appendTo(itemsJO);
    })(i);
  }

  var patch = TASK_LIMIT - len;

  if(patch > 0) {
    for(var i = 0; i < patch; i++) {
      sendBodyJO.append('<div class="sendingViewItem"></div>');
    }
  }
};
ProcessView.prototype = {
  start: function() {
    var me = this;
    var abortJO = this.jo.find('.abort');
    var timeId = 0;

    var id = this.settings.taskId;
    var ids = this.childTaskIds;
    ids.push(id);

    abortJO.click(function() {
      clearTimeout(timeId);
      var confirm = new UI.Confirm({
        title: '取消任务',
        content: '确定取消这个任务吗？',
        width: '460px',
        height: '100px',
        sureFn: function() {
          me.settings.abort && me.settings.abort();
        }
      });
      confirm.appendTo($('body'));
    });

    var render = function() {
      timeId = setTimeout(function() {
        $.getJSON('/transfer/listTask', { ids: ids.join(','), t: new Date().getTime() }, function(rs) {
          if(rs.status == 0) {
            var docs = rs.result.docs;
            var mainTask = null;

            for(var i = 0, len = docs.length; i < len; i++) {
              if(docs[i]._id == id) {
                mainTask = docs[i];
                continue;
              }

              if(me.ins[docs[i]._id]) {
                me.ins[docs[i]._id].update(docs[i]);
              }

            }

            if(!mainTask || mainTask.processStatus != TRANSFER_STATUS['COMPLETED'].value) {
              render();
            }
          }else {
            render();
          }
        });
      }, 3000);
    };

    render();
  },
  destroy: function() {
    this.jo.remove();
  },
  appendTo: function(jo) {
    this.jo.appendTo(jo);
  }
};