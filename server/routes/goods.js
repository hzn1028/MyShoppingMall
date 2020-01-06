var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods'); //拿到商品模型

//连接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/dumall');

mongoose.connection.on("connected", function () {
  console.log("MongoDB connected success.")
});

mongoose.connection.on("error", function () {
  console.log("MongoDB connected fail.")
});

mongoose.connection.on("disconnected", function () {
  console.log("MongoDB connected disconnected.")
});

//查询商品列表数据
router.get("/list", function (req,res,next) {
  let page = parseInt(req.param("page")); // 页码
  let pageSize = parseInt(req.param("pageSize"));// 一页几条数据
  let priceLevel = req.param("priceLevel"); //价格区间
  let sort = req.param("sort"); //价格升序/降序
  let skip = (page-1)*pageSize;
  var priceGt = '',priceLte = '';
  let params = {}; //参数
  if(priceLevel!='all'){
    switch (priceLevel){
      case '0':priceGt = 0;priceLte=100;break;
      case '1':priceGt = 100;priceLte=500;break;
      case '2':priceGt = 500;priceLte=1000;break;
      case '3':priceGt = 1000;priceLte=5000;break;
    }
    params = { //salePrice>priceGt且salePrice<=priceLte
      salePrice:{
        $gt:priceGt,
        $lte:priceLte
      }
    }
  }
  let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
  goodsModel.sort({'salePrice':sort});
  goodsModel.exec(function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message
      });
    }else{
      res.json({
        status:'0',
        msg:'',
        result:{
          count:doc.length,
          list:doc
        }
      });
    }
  })
});

//加入到购物车
router.post("/addCart", function (req,res,next) {
  var userId = '100000077' //用户id
  var productId = req.body.productId //商品id
  var User = require('../models/user') //拿到用户模型
  User.findOne({userId:userId}, function (err,userDoc) {//查询用户信息
    if(err){ // 如果出错，打印错误信息
      res.json({
        status:"1",
        msg:err.message
      })
    }else{
      console.log("userDoc:"+userDoc);
      if(userDoc){
        var goodsItem = '';
        userDoc.cartList.forEach(function (item) {// 判断购物车中是否有这件商品
          if(item.productId == productId){// 如果购物车中有这件商品，则商品数量++即可
            goodsItem = item;
            item.productNum ++;
          }
        });
        if(goodsItem){// 如果购物车中有这件商品
          userDoc.save(function (err2,doc2) {//保存到数据库
            if(err2){
              res.json({
                status:"1",
                msg:err2.message
              })
            }else{
              res.json({
                status:'0',
                msg:'',
                result:'suc'
              })
            }
          })
        }else{// 如果购物车中没有这件商品
          Goods.findOne({productId:productId}, function (err1,doc) {//在商品列表中找到这个商品
            if(err1){//如果没找到/出错
              res.json({
                status:"1",
                msg:err1.message
              })
            }else{//如果找到了，把商品信息保存到购物车
              if(doc){
                doc.productNum = 1;//商品数量为1
                doc.checked = 1; //商品默认为选中
                userDoc.cartList.push(doc);
                userDoc.save(function (err2,doc2) { //将商品信息保存进去购物车
                  if(err2){
                    res.json({
                      status:"1",
                      msg:err2.message
                    })
                  }else{
                    res.json({
                      status:'0',
                      msg:'',
                      result:'suc'
                    })
                  }
                })
              }
            }
          });
        }
      }
    }
  })
});

module.exports = router;
