/**
 * Created by steven on 17/5/31.
 */
var clientVersion = "2.1.2.8";
var fs = require('graceful-fs');
var sqlite3 = require('sqlite3').verbose();
const path = require('path')
const dbPath = path.resolve(__dirname, 'local.db')
var db = new sqlite3.Database(dbPath);
const md5 = require("md5");
const uuidV4 = require('uuid/v4');

db.serialize(function(){
  db.run("create table IF NOT EXISTS fileInfo(id INTEGER PRIMARY KEY NOT NULL,md5 TEXT,path TEXT, removeOrNot BOOLEAN, destination TEXT, cachePath TEXT, taskId char(100), status INT, createdAt TEXT, updatedAt TEXT)")
  db.run("create table IF NOT EXISTS device(deviceId TEXT)")
})

var getPackageName = function(filePath){
  let arr = filePath.split(path.sep);
  let fileName = arr[arr.length - 1];
  return fileName + timeStamp2String(new Date().getTime());
}

var getFileMd5 = function(filePath){
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  const modifiedTime = stats.mtime;
  return md5(filePath + fileSizeInBytes + modifiedTime);
}


var generateDeviceId = function(cb){
 db.get("select deviceId from device", function(err, row){
    if(err){
      return cb && cb(err);
    }else{
      if(row){
        return cb && cb(null, row.deviceId);
      }else{
        var deviceId = uuidV4();
        console.log("deviceId==>", deviceId)
        var stmt = db.prepare("INSERT INTO device VALUES (?)");
        stmt.run(deviceId);
        stmt.finalize();
        return cb && cb(null, deviceId);
      }
    }
 })
}

var timeStamp2String = function(time){
  var datetime = new Date();
  datetime.setTime(time);
  var year = datetime.getFullYear();
  var month = datetime.getMonth() + 1;
  var date = datetime.getDate();
  var hour = datetime.getHours();
  var minute = datetime.getMinutes();
  var second = datetime.getSeconds();
  var mseconds = datetime.getMilliseconds();
  return year + "-" + formatNumber(month) + "-" + formatNumber(date) +" " + formatNumber(hour) +":"+formatNumber(minute)+":"+formatNumber(second);
};

var formatNumber = function(number){
  if(number < 10){
    return "0" + number;
  }else{
    return number;
  }
}