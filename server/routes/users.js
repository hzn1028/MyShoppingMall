var express = require('express');
var router = express.Router();
require('./../util/util')
var User = require('./../models/user');//获取user模型

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/test', function(req, res, next) {
  res.send('test');
});

// 登录login接口
router.post("/login", function (req,res,next) {
  var param = {
      userName:req.body.userName,//拿到前端传过来的用户名
      userPwd:req.body.userPwd//拿到前端传过来的密码
  }
  User.findOne(param, function (err,doc) {
      if(err){
          res.json({
              status:"1",
              msg:err.message
          });
      }else{
          if(doc){
              //把数据存储到cookie中
              res.cookie("userId",doc.userId,{
                  path:'/',
                  maxAge:1000*60*60
              });
              res.cookie("userName",doc.userName,{
                  path:'/',
                  maxAge:1000*60*60
              });

              //把数据存储到session中
              //req.session.user = doc;

              //返回给前端的数据
              res.json({
                  status:'0',
                  msg:'',
                  result:{
                      userName:doc.userName//登录成功返回用户名
                  }
              });
          }
      }
  });
});


// 登出接口
router.post("/logout", function (req,res,next) {
  // 清掉cookie
  res.cookie("userId","",{
    path:"/",
    maxAge:-1
  });

  // 返回给前端的数据
  res.json({
    status:"0",
    msg:'',
    result:''
  })
});

// 检查是否登录-----刷新时通过cookie来检查用户是否已经登录
router.get("/checkLogin", function (req,res,next) {
  //通过查看cookie中有没有这个userId来检查是否登录
  if(req.cookies.userId){//如果有，说明已经登录
      res.json({//返回给前端的
        status:'0',
        msg:'',
        result:req.cookies.userName || ''
      });
  }else{
    res.json({
      status:'1',
      msg:'未登录',
      result:''
    });
  }
});

//获取某用户购物车里商品数量
router.get("/getCartCount", function (req,res,next) {
  if(req.cookies && req.cookies.userId){
    console.log("userId:"+req.cookies.userId);
    var userId = req.cookies.userId;
    User.findOne({"userId":userId}, function (err,doc) {
      if(err){
        res.json({
          status:"0",
          msg:err.message
        });
      }else{
        let cartList = doc.cartList;
        let cartCount = 0;
        cartList.map(function(item){
          cartCount += parseFloat(item.productNum);
        });
        res.json({
          status:"0",
          msg:"",
          result:cartCount
        });
      }
    });
  }else{
    res.json({
      status:"0",
      msg:"当前用户不存在"
    });
  }
});


//查询当前用户的购物车数据
router.get("/cartList", function (req,res,next) {
  var userId = req.cookies.userId;//先拿到用户id
  User.findOne({userId:userId}, function (err,doc) {//获取该用户的购物车数据
      if(err){//如果报错
        res.json({//返回给前端的数据
          status:'1',
          msg:err.message,
          result:''
        });
      }else{//如果获取成功
          if(doc){
            res.json({//返回给前端的数据
              status:'0',
              msg:'',
              result:doc.cartList
            });
          }
      }
  });
});

//购物车删除某个商品
router.post("/cartDel", function (req,res,next) {
  //通过cookie来拿用户id，通过前端的传参来拿商品id
  var userId = req.cookies.userId,productId = req.body.productId;

  //通过update删除数据
  User.update({
    userId:userId//条件
  },{
    $pull:{//删除cartList下productId为productId的元素
      'cartList':{
        'productId':productId
      }
    }
  }, function (err,doc) {
    if(err){//如果删除失败返回给前端的信息
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{//如果删除成功返回给前端的信息
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      });
    }
  });
});

//修改商品数量以及商品是否选中
router.post("/cartEdit", function (req,res,next) {
  //通过cookie来拿用户id，通过前端的传参来拿商品id，商品数量，商品选中与否
  var userId = req.cookies.userId,
      productId = req.body.productId,
      productNum = req.body.productNum,
      checked = req.body.checked;
  User.update({"userId":userId,"cartList.productId":productId},{//更新条件
    //更新子文档的方法：cartList.$.productNum、cartList.$.checked
    "cartList.$.productNum":productNum,//更新商品数量
    "cartList.$.checked":checked,//更新商品是否选中
  }, function (err,doc) {
    if(err){//更新失败
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{//更新成功
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      });
    }
  })
});

//购物车全选/全不选接口
router.post("/editCheckAll", function (req,res,next) {
  //通过cookie来拿用户id，通过前端的传参来拿商品全选与否
  var userId = req.cookies.userId,
      checkAll = req.body.checkAll?'1':'0';
  User.findOne({userId:userId}, function (err,user) {//先找到用户
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      if(user){
        user.cartList.forEach((item)=>{//更新每一件商品的选中与否
          item.checked = checkAll;
        })
        user.save(function (err1,doc) {//将更改后的保存起来
            if(err1){
              res.json({
                status:'1',
                msg:err1,message,
                result:''
              });
            }else{
              res.json({
                status:'0',
                msg:'',
                result:'suc'
              });
            }
        })
      }
    }
  });
});


//查询用户地址列表接口
router.get("/addressList", function (req,res,next) {
  var userId = req.cookies.userId;
  User.findOne({userId:userId}, function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:doc.addressList
      });
    }
  })
});


//设置默认地址接口
router.post("/setDefault", function (req,res,next) {
  var userId = req.cookies.userId,
      addressId = req.body.addressId;
  if(!addressId){//如果没有地址id，则告知前端
    res.json({
      status:'1003',
      msg:'addressId is null',
      result:''
    });
  }else{
    User.findOne({userId:userId}, function (err,doc) {//先找到用户
      if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        });
      }else{
        var addressList = doc.addressList;//找到用户的地址列表
        addressList.forEach((item)=>{//遍历用户的地址列表，找到地址
          if(item.addressId ==addressId){//设置默认地址
             item.isDefault = true;
          }else{//其他改为非默认地址
            item.isDefault = false;
          }
        });

        doc.save(function (err1,doc1) {
          if(err){
            res.json({
              status:'1',
              msg:err.message,
              result:''
            });
          }else{
              res.json({
                status:'0',
                msg:'',
                result:''
              });
          }
        })
      }
    });
  }
});

//删除地址接口
router.post("/delAddress", function (req,res,next) {
  var userId = req.cookies.userId,addressId = req.body.addressId;
  User.update({
    userId:userId
  },{
    $pull:{//删除
      'addressList':{
        'addressId':addressId
      }
    }
  }, function (err,doc) {
      if(err){
        res.json({
            status:'1',
            msg:err.message,
            result:''
        });
      }else{
        res.json({
          status:'0',
          msg:'',
          result:''
        });
      }
  });
});


//创建订单
router.post("/payMent", function (req,res,next) {
  var userId = req.cookies.userId,//用户id
    addressId = req.body.addressId,//用户地址id
    orderTotal = req.body.orderTotal;//用户订单总金额
  User.findOne({userId:userId}, function (err,doc) {
     if(err){
        res.json({
            status:"1",
            msg:err.message,
            result:''
        });
     }else{
       var address = '',goodsList = [];

       //获取当前用户的地址信息
       doc.addressList.forEach((item)=>{
          if(addressId==item.addressId){
            address = item;//记录用户选中的地址
          }
       })

       //获取用户购物车的购买商品
       doc.cartList.filter((item)=>{
         if(item.checked=='1'){
           goodsList.push(item);//记录用户选中的商品
         }
       });

       var platform = '622';
       var r1 = Math.floor(Math.random()*10);
       var r2 = Math.floor(Math.random()*10);

       //生成订单信息
       var sysDate = new Date().Format('yyyyMMddhhmmss');
       var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
       var orderId = platform+r1+sysDate+r2;//订单id
       var order = {
          orderId:orderId,
          orderTotal:orderTotal,
          addressInfo:address,
          goodsList:goodsList,
          orderStatus:'1',
          createDate:createDate
       };

       doc.orderList.push(order);

       //将订单信息保存到数据库
       doc.save(function (err1,doc1) {
          if(err1){
            res.json({
              status:"1",
              msg:err.message,
              result:''
            });
          }else{
            res.json({
              status:"0",
              msg:'',
              result:{
                orderId:order.orderId,
                orderTotal:order.orderTotal
              }
            });
          }
       });
     }
  })
});


//根据订单Id查询订单信息
router.get("/orderDetail", function (req,res,next) {
  var userId = req.cookies.userId,orderId = req.param("orderId");
  User.findOne({userId:userId}, function (err,userInfo) {
      if(err){
          res.json({
             status:'1',
             msg:err.message,
             result:''
          });
      }else{
         var orderList = userInfo.orderList;
         if(orderList.length>0){
           var orderTotal = 0;
           orderList.forEach((item)=>{
              if(item.orderId == orderId){//找到该订单
                orderTotal = item.orderTotal;//计算订单总金额
              }
           });
           if(orderTotal>0){//如果订单总金额大于0
             res.json({
               status:'0',
               msg:'',
               result:{
                 orderId:orderId,
                 orderTotal:orderTotal
               }
             })
           }else{//如果订单总金额<=0
             res.json({
               status:'120002',
               msg:'无此订单',
               result:''
             });
           }
         }else{
           res.json({
             status:'120001',
             msg:'当前用户未创建订单',
             result:''
           });
         }
      }
  })
});


module.exports = router;
