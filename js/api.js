/**
 * Created by steven on 17/5/22.
 */
var domain = "http://10.0.15.59";
var generateShortLinkId = function (cb) {
  $.ajax({
    url: domain + "/shortlink/generate?_=" + new Date(),
    type: "GET",
    async: true,
    data: {
    },
    timeout: 5000,
    dataType: 'json',
    success:function(data){
      if(data.status == 0) {
        return cb && cb(null, data.result.id)
      }else{
        return cb && cb(data.result);
      }
    },
    error: function(xhr){
      return cb && cb(xhr);
    },
    complete: function(){

    }
  })
}

var createTask = function(data, cb){
  $.ajax({
    url: domain + "/transfer/createTask",
    type: "POST",
    async: true,
    data: data,
    timeout: 5000,
    dataType: 'json',
    beforeSend: function(request) {
      request.setRequestHeader("token", "Chenxizhang");
    },
    success:function(data){
      if(data.status == 0) {
        return cb && cb(null, data.result);
      }else{
        return cb && cb(data.result);
      }
    },
    error: function(xhr){
      return cb && cb(xhr);
    },
    complete: function(){

    }
  })
}

var getAccountInfo = function(data, cb){
  $.ajax({
    url: domain + "/account/info",
    type: "GET",
    async: true,
    data: data,
    timeout: 5000,
    dataType: 'json',
    success:function(data){
      if(data.status == 0) {
        return cb && cb(null, data.result);
      }else{
        return cb && cb(data.result);
      }
    },
    error: function(xhr){
      return cb && cb(xhr);
    },
    complete: function(){

    }
  })
}

var getToken = function(data, cb){
  $.ajax({
    url: domain + "/get_token",
    type: "POST",
    async: true,
    data: data,
    timeout: 5000,
    dataType: 'json',
    success:function(data){
      console.log(data);
      if(data.status == 0) {
        return cb && cb(null, data.result);
      }else{
        return cb && cb(data.result);
      }
    },
    error: function(xhr){
      return cb && cb(xhr);
    },
    complete: function(){

    }
  })
}

var logout = function(data, cb){
  $.ajax({
    url: domain + "/logout",
    type: "GET",
    async: true,
    data: data,
    timeout: 5000,
    dataType: 'html',
    success:function(data){
      return cb && cb(null, "ok");
    },
    error: function(xhr){
      return cb && cb(xhr);
    },
    complete: function(){

    }
  })
}

var getAtaList = function(data, cb){
  $.ajax({
    url: domain + "/ata/list",
    type: "GET",
    async: true,
    data: data,
    timeout: 5000,
    dataType: 'json',
    success:function(data){
      if(data.status == 0){
        var newData = {
          total: data.result.total,
          rows: data.result.docs
        }
        return cb && cb(null, newData);
      }else{
        return cb && cb(data.result);
      }
    },
    error: function(xhr){
      return cb && cb(xhr);
    },
    complete: function(){

    }
  })
}

var ataUpdateDetail = function(data, cb){
  $.ajax({
    url: domain + "/ata/updateDetail",
    type: "POST",
    async: true,
    data: data,
    timeout: 5000,
    dataType: 'json',
    success:function(data){
      console.log(data);
      if(data.status == 0) {
        return cb && cb(null, data.result);
      }else{
        return cb && cb(data.result);
      }
    },
    error: function(xhr){
      return cb && cb(xhr);
    },
    complete: function(){

    }
  })
}

var ataListConfig = function(data, cb){
  $.ajax({
    url: domain + "/ata/listConfig",
    type: "get",
    async: true,
    data: data,
    timeout: 5000,
    dataType: 'json',
    success:function(data){
      console.log(data);
      if(data.status == 0) {
        return cb && cb(null, data.result);
      }else{
        return cb && cb(data.result);
      }
    },
    error: function(xhr){
      return cb && cb(xhr);
    },
    complete: function(){

    }
  })
}

var ataListConfig = function(data, cb){
  $.ajax({
    url: domain + "/ata/listConfig",
    type: "get",
    async: true,
    data: data,
    timeout: 5000,
    dataType: 'json',
    success:function(data){
      console.log(data);
      if(data.status == 0) {
        return cb && cb(null, data.result);
      }else{
        return cb && cb(data.result);
      }
    },
    error: function(xhr){
      return cb && cb(xhr);
    },
    complete: function(){

    }
  })
}

var getAtaDetail = function(data, cb){
  $.ajax({
    url: domain + "/ata/getDetail",
    type: "get",
    async: true,
    data: data,
    timeout: 5000,
    dataType: 'json',
    success:function(data){
      if(data.status == 0) {
        return cb && cb(null, data.result);
      }else{
        return cb && cb(data.result);
      }
    },
    error: function(xhr){
      return cb && cb(xhr);
    },
    complete: function(){

    }
  })
}

var getTaskStatus = function(data, cb){
  $.ajax({
    url: domain + "/transfer/getTask",
    type: "get",
    async: true,
    data: data,
    timeout: 5000,
    dataType: 'json',
    success:function(data){
      if(data.status == 0) {
        return cb && cb(null, data.result);
      }else{
        return cb && cb(data.result);
      }
    },
    error: function(xhr){
      return cb && cb(xhr);
    },
    complete: function(){

    }
  })
}