/**
 * 钢材招标项目
 * @ author： liweitao
 * @ datetime: 2016/9/30
 * @ dec: 每个页面对应不同的组件，通过路由加载运行。
 * @ dec: 每个组件有自己的data和处理函数，可以自由组合
 * @
 */
$(function(){
/**
 * 招标首页组件
 * @ author： liweitao
 * @ datetime: 2016/9/30
 * @ dec: 循环列出所有的招标项目
 * @
 */
  var Tender = Vue.extend({
    template:"#tpl_steeltender",
    data:function () {
      return {
        items: []
      }
    },
    ready:function () {
      var self = this;
      $.ajax({
          cache: true,
          type: "get",
          url:"data.json",
          async: false,
          error: function(request) {
            alert("Connection error");
          },
          success: function(data) {
            self.items = data.data;
          }
      });
    }
  })

/**
 * Dialog弹出层组件
 * @ author： liweitao
 * @ datetime: 2016/9/30
 * @ dec: 一个子组件，需要的时候需要在父组件里components内部注册，弹出提示语，点击按钮关闭
 * @
 */
  var Dialog = Vue.extend({
    template:"#tpl_dialog",
    methods: {
      hidedialog : function () {
        $("#dialog").fadeOut(10);
      }
    }
  })

/**
 * 报名模块组件
 * @ author： liweitao
 * @ datetime: 2016/9/30
 * @ dec: 一个子组件，需要的时候需要在父组件里components内部注册
 * @      因为招标和资源用的报名窗口都一样，所以这里我做成了一个独立的组件，可重复使用
 */
  var Baoming = Vue.extend({
    data:function () {
      return {
        isSend:false
      }
    },
    template:"#tpl_baoming",
    methods: {
      // 如果输入框有值则提交按钮解除锁定
      inputFocus : function () {
        var _this = this;
        console.log(_this.isDisable);
        if(_this.formValue.buess !=""){
          _this.$set("isDisable", false);
        }
      },
      //获得验证码
      getCode : function (event) {
        phone = $("#userphone").val(),
        el = event.currentTarget,
        self= $(el),_this = this;
        if (this.isSend){
            return false;
        }
        if($.trim(phone) == "") {
            $(".weui-dialog__bd").html("手机号码不能为空");
            $("#dialog").fadeIn(10);
            return false;
        }else if(!(/^1[3|4|5|7|8][0-9]\d{8}$/.test(phone))) {
            $(".weui-dialog__bd").html("手机号码格式不正确");
            $("#dialog").fadeIn(10);
            return false;
        }else{
        var time=60;
          if (!_this.isSend) {
              self.html("60秒");
              this.$set("isSend",true);
            var t=setInterval(function  () {
                time--;
                self.html(time+"秒");
                if (time==0) {
                    clearInterval(t);
                self.html("重新发送");
                _this.$set("isSend",false)
                }
            },1000)
          }
        }
      this.ajaxMarkCode();
    },
    //ajax MarkCode 验证码请求
    ajaxMarkCode : function () {
        $.ajax({
          cache: true,
          type: "get",
          url:"code.js",
          async: false,
          error: function(request) {
            alert("Connection error");
          },
          success: function(data) {
            if (data!=1) {
              $(".weui-dialog__bd").html("验证码发送失败");
              $("#dialog").fadeIn(10);
            }
          }
        });
      }
    }
  })
/**
 * 报名单独页模块组件
 * @ author： liweitao
 * @ datetime: 2016/9/30
 * @ dec: 这里接受资源的id，写入隐藏表单
 * @ 
 */
  var BaomingPage = Vue.extend({
    data:function(){
      return {
        resourceid:"",
        isDisable:false
      }
    },
    template:"#tpl_baomingpage",
    components:{
      "Baoming":Baoming,
      "Dialog": Dialog
    },
    route:{
      data(to){
        var to = to.to, _this = this
        var resource = to.query.resource;
        _this.$set("resourceid",resource);
      }
    },
    methods:{
      //提交发布数据
      submitData : function () {
        var markcode = $("#markcode").val(),userphone = $("#userphone").val(),username = $("#username").val(),buess = $("#buess").val(),_this = this;
        if(_this.isDisable){
          return;
        }
        if(buess == ""){
          $("#dialog").fadeIn(10);
          $(".weui-dialog__bd").html("公司不能为空");
          return
        }else if (username == ""){
          $(".weui-dialog__bd").html("姓名不能为空");
          $("#dialog").fadeIn(10);
          return
        }else if (userphone == ""){
          $(".weui-dialog__bd").html("手机号码不能为空");
          $("#dialog").fadeIn(10);
          return
        }else if (markcode == ""){
          $(".weui-dialog__bd").html("验证码不能为空");
          $("#dialog").fadeIn(10);

          return
        }
        this.ajaxdata();
      },
      //ajaxdata
      ajaxdata : function () {
        $.ajax({
            cache: true,
            type: "POST",
            url:"b.js",
            data:$('#form').serialize(),
            async: false,
            error: function(request) {
              alert("Connection error");
            },
            success: function(data) {
              alert("数据提交成功");
            }
        });
      }

 }
  })
/**
 * 招标内页组件
 * @ author： liweitao
 * @ datetime: 2016/9/30
 * @ dec: 这里接受招标项目的id,因为用到了报名和弹出层，所以这里需要内部注册两个组件
 * @ 
 */
  var Yb = Vue.extend({
    data:function () {
      return {
        items: {},
        delivery: "",
        tenderDetails:[],
        isSend:false
      }
    },
    template:"#tpl_yb",
    components: {
      "Dialog" : Dialog,
      "Baoming" : Baoming
    },
    route: {
      data(to){
        var to = to.to; //Android不支持{to}写法，所以这里进行了分离
        var id = to.query.id;
        var self = this;
        $.ajax({
          cache: true,
          type: "get",
          url:"data2.json",
          async: false,
          error: function(request) {
            alert("Connection error");
          },
          success: function(data) {
           self.delivery = data.delivery; 
           self.items = data.tenderDetail; 
          }
        });
        
      }
    },
    methods:{
      //提交发布数据
      submitData : function () {
        var markcode = $("#markcode").val(),userphone = $("#userphone").val(),username = $("#username").val(),buess = $("#buess").val();
        if(buess == ""){
          $("#dialog").fadeIn(10);
          $(".weui-dialog__bd").html("公司不能为空");
          return
        }else if (username == ""){
          $(".weui-dialog__bd").html("姓名不能为空");
          $("#dialog").fadeIn(10);
          return
        }else if (userphone == ""){
          $(".weui-dialog__bd").html("手机号码不能为空");
          $("#dialog").fadeIn(10);
          return
        }else if (markcode == ""){
          $(".weui-dialog__bd").html("验证码不能为空");
          $("#dialog").fadeIn(10);

          return
        }
        this.ajaxdata();
      },
      //ajaxdata
      ajaxdata : function () {
        $.ajax({
            cache: true,
            type: "POST",
            url:"b.js",
            data:$('#form').serialize(),
            async: false,
            error: function(request) {
              alert("Connection error");
            },
            success: function(data) {
              alert("数据提交成功");
            }
        });
      }

 }
})

/**
 * 资源首页组件
 * @ author： liweitao
 * @ datetime: 2016/9/30
 * @ dec: 循环列出所有资源，绑定每个资源的复选框，实现选择赋值和清空所有选择功能，通过计算属性计算选择的总数
 * @ 
 */
var Resource = Vue.extend({
  template:"#tpl_resource",
  data:function () {
    return {
      items:[],
      resource:[]
    }
  },
  ready:function(){
    var self = this;
    $.ajax({
      type: "get",
      url:"resource.json",
      error: function(request) {
        alert("Connection error");
      },
      success: function(data) {
        if (data.code!=200) {
          $(".weui-dialog__bd").html(data.message);
          $("#dialog").fadeIn(10);
          return;
        }
        self.items = data.data;
      }
    });
  },
  methods:{
    resource_submit : function () {
      var self = this;
      if(this.resource.length ===0){
          $(".weui-dialog__bd").html("您未选择资源");
          $("#dialog").fadeIn(10);
          return;
      }
      this.$router.go("/bm?resource="+self.resource)
    },
    emptyCheckbox : function () {
      this.resource = [];
    }
  },
  computed: {
    countSum : function () {
      var resource_length = 0;
      resource_length = this.resource.length;
      return resource_length;
    }
  },
  components: {
    "Dialog": Dialog
  }
})

  var App = Vue.extend({});

  var router = new VueRouter();
  router.map({
    '/':{
      component:Tender
    },
    '/yb':{
      component:Yb
    },
    '/resource':{
      component:Resource
    },
    '/bm':{
      component:BaomingPage
    }
   })
  router.redirect({
  '*': '/'
  })

  router.start(App,'#app')
})