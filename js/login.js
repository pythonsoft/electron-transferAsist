/**
 * Created by steven on 17/5/25.
 */
console.log(require('electron').remote.getGlobal('sharedObject').token);
$.ajaxSetup({
  beforeSend: function(xhr) {
    xhr.setRequestHeader('token', require('electron').remote.getGlobal('sharedObject').token);
  }
});
var isLogin = function(){
  getAccountInfo({}, function(err, result){
    if(err){
      console.log(err);
      window.location.href = './login.html';
    }
  })
}
isLogin();