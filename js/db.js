/**
 * Created by steven on 17/6/1.
 */
var sqlite3 = require('sqlite3').verbose();
const path = require('path')
const dbPath = path.resolve(__dirname, 'local.db')
var db = new sqlite3.Database(dbPath);

db.serialize(function(){
  db.run("create table IF NOT EXISTS fileInfo(id INTEGER PRIMARY KEY NOT NULL,md5 TEXT,path TEXT, removeOrNot BOOLEAN, destination TEXT, cachePath TEXT, taskId char(100), status INT, createdAt TEXT, updatedAt TEXT)")
})

var insertFileInfo = function(value){
  db.get("SELECT * FROM fileInfo where md5='" + value.md5 + "'", function(err, row) {
    if(err){
      console.log("insert err==>", err.message);
      return;
    }
    if(row){
      console.log("insertFile"+ value.path+" already exists");
      return;
    }else{
      var stmt = db.prepare("INSERT INTO fileInfo VALUES (?,?,?,?,?,?,?,?,?,?)");
      stmt.run(null, value.md5, value.path, value.removeOrNot, value.destination, value.cachePath, value.taskId, value.status, new Date().getTime(), new Date().getTime());
      stmt.finalize();
    }
  });
}

var updateFileInfoById = function(id, taskId, status){
  db.run("UPDATE fileInfo SET taskId = ? , status = ? , updatedAt = ? WHERE id = ?", taskId, status, new Date().getTime(), id);
}

var getFileInfoByQuery = function(query, cb){
  db.all("SELECT * FROM fileInfo where " + query, function(err, rows) {
    if(err){
      console.log("getFileInfoByStatus err===>", err.message);
      return cb && cb(err.message);
    }

    return cb && cb(null, rows);
  })
}

var checkFileIsDealedByMd5 = function(md5){
  db.get("SELECT * FROM fileInfo where md5='" + md5 + "'", function(err, rows) {
    if(err){
      console.log("getFileInfoByStatus err===>", err);
      return false;
    }else{
      if(rows){
        console.log("dealed row==>", rows);
        return true;
      }else{
        return false;
      }
    }
  })
}

var getPaginationData = function(params, cb){
  var page = params.page * 1;
  var pageSize = params.pageSize * 1;
  var status = params.status * 1;
  console.log("status==>", status);
  var where = " 1 = 1 ";
  var data = {
    total: 0,
    rows: []
  }
  var skip = (page - 1) * pageSize;
  if(status !=0){
    where += " and status = " + status;
  }

  db.get("SELECT count(*) as count FROM fileInfo where " + where, function(err, row) {
    if(err){
      console.log(err);
      return cb && cb(err.message);
    }
    console.log("count==>",row);
    data.total = row.count;

    where += " limit " + pageSize + " offset " + (page - 1)*pageSize;
    getFileInfoByQuery(where, function(err, rows){
      if(err){
        console.log(err);
        return cb && cb(err);
      }
      console.log("where===>", where);
      console.log("rows===>", rows);

      data.rows = rows;
      return cb && cb(null, data);
    })
  })
}


//每小时清理一次本地数据库,把7天之前的清掉,把1天之前完成的删掉
setInterval(function(){
  var timestamps = new Date(new Date().setDate(new Date().getDate() - 7)).getTime();
  var timestamps1 = new Date(new Date().setDate(new Date().getDate() - 1)).getTime();
  console.log(timestamps, timestamps1);
  db.run("delete from fileInfo where createdAt < '" + timestamps + "'");
  db.run("delete from fileInfo where (status = 4 or status = 100) and createdAt < '" + timestamps1 + "'");
}, 1000 * 60 * 60);

var STATUS = {
  ADD_FILE_QUEEN: -2,     //加入文件队列
  CREATE_TASK: -1,        //创建上传任务
  COMPLETED: 4,           //传输完成
  FAILED: 5,              //传输异常,需要重传
  DELETED: 100            //本地文件已经删除
}