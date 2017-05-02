function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)return unescape(r[2]);
    return null;
}

var lessonIdPre = parseInt(GetQueryString('lesson_id_pre'));
var lessonIdNext = parseInt(GetQueryString('lesson_id_next'));
$('#pre').click(function () {
    var picID = parseFloat($('#imgShow').data('picId'));
    if (picID > lessonIdPre) {
        getData(picID - 1);
    }

});
$('#next').click(function () {
    var picID = parseFloat($('#imgShow').data('picId'));
    if (picID < lessonIdNext) {
        getData(picID + 1);
    }

});
var firsTime = true;
var getData = function (picID) {
    if (firsTime) {
        firsTime = false;
    } else {
        MyPlay.review();
    }
    if (picID <= lessonIdPre) {
        $('#pre').css('background-image', 'url(images/pre-black.png)');
    } else {
        $('#pre').css('background-image', 'url(images/pre-blue.png)');
    }

    if (picID >= lessonIdNext) {
        $('#next').css('background-image', 'url(images/next-black.png)');
    } else {

        $('#next').css('background-image', 'url(images/next-blue.png)');
    }
    if (picID >= lessonIdPre && picID <= lessonIdNext) {
        $.ajax({
            type: "POST",
            url: 'http://ci.com/api_h5/book_pic',
            data: {book_pic: picID},
            success: function (data) {
                if (data.status == 100) {
                    //var rect = data.data.pic_rec;
                    var picSrc = "http://www.en8848.com.cn" + data.data.pic_url;
                    $("#imgShow").attr('src', picSrc);
                    $('#imgShow').data('picId', picID);
                    MyPlay.init('audio', data.data.pic_rec);
                }
            }
        });
    }
};
$(function () {
    var bookID=parseInt(GetQueryString("book_id"));
    $(".backList").attr('href','select2.html?book_id='+bookID);
    var bookPic = parseInt(GetQueryString("book_pic"));
    getData(bookPic);
});
var MyPlay = {
    _pool: [],//当前播放的数据
    _index: 0,
    _text: '',
    _url: '',
    _length: 1,
    pindex: 0,
    lindex: 0,
    scale: 1,
    flag: 1, //1为普通的读  2 为连读
    source: null,
    audio: null,//当前播放的音频
    alltext: [],
    allurl: [],
    tmptext: [],
    tmpurl: [],
    data_hot: {text: [], url: [], key: []},//储存所有文字数组和url数组
    data_mp3: {},//以坐标值为名存储文字和url
    data_area: [],  //存点击区域的坐标和宽高
    init: function (id, data) {
        this.audio = document.getElementById(id);
        this.init_data(data);

        this.audio.addEventListener('ended', MyPlay.count)
    },
    count: function () {

        if (MyPlay.flag == 2) {
            $("#diandu div").css("display", "none");
            MyPlay._index++;
            //console.log(MyPlay._index, MyPlay._pool.length);
            if (MyPlay._index == MyPlay._pool.length) {
                Operate.doreset();
                $("#diandu div").css("display", "none");
                return;
            }
        } else if (MyPlay.flag == 1) {
            //console.log(MyPlay._index);
            if(MyPlay._pool.length>1&&MyPlay._index<MyPlay._pool.length-1){
                MyPlay._index++;
                //return;
                //Operate.play();
            }else{
                MyPlay._index = 1;
                $("#diandu div").css("display", "none");
                return;
            }
        }
        //console.log('播放的是当前第' + MyPlay._index + '个音频');
        MyPlay.play();
    },
    review: function () {
        this.audio.removeEventListener('ended', MyPlay.count);
        this.audio.pause();
        $("#diandu div").css("display", "none");
        this._pool = [];//当前播放的数据
        this._index = 0;
        this._text = '';
        this._url = '';
        this._length = 1;
        this.pindex = 0;
        this.lindex = 0;
        this.scale = 1;
        this.flag = 1; //1为普通的读  2 为连读
        this.source = null;
        this.audio = null;//当前播放的音频
        this.alltext = [];
        this.allurl = [];
        this.tmptext = [];
        this.tmpurl = [];
        this.data_hot = {text: [], url: [], key: []};//储存所有文字数组和url数组
        this.data_mp3 = {};//以坐标值为名存储文字和url和文字
        this.data_area = [];//存点击区域的坐标和宽高
        $("#mytext").html("");
        $('#page-load').show();
        $('#page-load span').html('0%');
        Operate.doreset();
    },
    init_data: function (data) {
        var x, y, x2, y2, k = 0, k2 = 0, key, tmp = {}, cntext, mp3_url;
        for (k in data) {
            x = parseFloat(data[k].recx);
            y = parseFloat(data[k].recy);
            x2 = x + parseFloat(data[k].recw);
            y2 = y + parseFloat(data[k].rech);
            this.data_area.push([x, y, x2, y2]);
            cntext = data[k].cntext;
            mp3_url = data[k].mp3_url;
            key = x + '_' + y;
            //Jason中可能有多段文字或音频，所以再在内层遍历一次
            for (k2 in cntext) {
                this.data_hot.text.push(cntext[k2]);
            }
            var url = [];
            for (k2 in mp3_url) {
                this.data_hot.url.push("http://www.en8848.com.cn" + mp3_url[k2]);
                url.push("http://www.en8848.com.cn" + mp3_url[k2]);
                MyPlay.allurl.push("http://www.en8848.com.cn" + mp3_url[k2]);
            }
            this.data_hot.key.push(key);
            //var url = "http://www.en8848.com.cn" + mp3_url;
            tmp = {text: data[k].cntext, url: url, key: key};
            //console.log(tmp);
            this.data_mp3[key] = tmp;//将当前遍历的数据存入data_mp3对象中，key是对象名，以x_y坐标值命名
            //this.data_hot.url.push(url);
        }
        MyPlay.init_preload(MyPlay.allurl);
        this.get_scale(function () {
            MyPlay.init_hotarea();

        });
    },
    init_preload:function(audioArray){
        var audioLoad = 0;
        if(audioArray.length>0){
            var audioTotal = audioArray.length;
            var percent = 0;
            var audio = [];
            for(var i = 0;i<audioArray.length;i++){
                audio[i] = new Audio();
                audio[i].src=audioArray[i];
                audio[i].preload = 'auto';
                audio[i].load();
                audio[i].addEventListener('loadeddata',function(){
                    audioLoad++;
                    percent = parseInt(audioLoad/audioTotal*100);
                    $('#page-load span').html(percent+'%');
                    if(percent >= 100) {
                        $('#page-load').fadeOut();
                    }
                });

            }
        }
    },
    init_hotarea: function (mapid) {
        var data_area = this.data_area;
        var x1, y1, x2, y2, one, hot_key;
        var html = '';
        var div = '';
        for (var k in data_area) {//遍历点读区域，计算缩放后的比例，生成area加到map中
            one = data_area[k];
            x1 = Math.round(one[0] * this.scale);
            y1 = Math.round(one[1] * this.scale);
            x2 = Math.round(one[2] * this.scale);
            y2 = Math.round(one[3] * this.scale);
            hot_key = one[0] + '_' + one[1];
            html += this.format_area(x1, y1, x2, y2, hot_key);
            div += this.show_area(x1, y1, x2, y2, hot_key);
        }
        $("#img_map").html(html);
        $("#diandu").append(div);
    },
    show_area: function (x1, y1, x2, y2, hot_key) {
        return '<div id="' + hot_key + '" style="display:none; position: absolute;top:' + y1 + 'px;left:' + x1 + 'px;width:' + (x2 - x1) + 'px;height:' + (y2 - y1) + 'px;border:3px solid #f00"></div>';
    },
    format_area: function (x1, y1, x2, y2, hot_key) {
        return '<area onfocus="blur(this);" shape="rect" coords="' + x1 + ',' + y1 + ',' + x2 + ',' + y2 + '" href="javascript:;" onclick="MyPlay.read(\'' + hot_key + '\')">';
    },
    get_scale: function (callback) {
        var image = new Image();
        image.src = $('.diandu img').attr('src');
        image.onload = function () {
            var realw = image.width;
            var w = $('.diandu').width();
            MyPlay.scale = w / realw;
            callback();
        };


    },
    splay: function (data) {
        //this._pool is the source play now
        this._pool = data;
        this._pool.length = data.url.length;

        this._index = 0;
    },
    read: function (key) {
        this.splay(this.data_mp3[key]);
        //console.log(this.data_mp3[key]);
        this.flag = 1;
        this.play();
        $("#" + key).css("display", "block").siblings().css("display", "none");
        Operate.doreset();
    },
    read_all: function () {
        this.splay(this.data_hot);
        this.flag = 2;
        this.play();
    },
    play: function () {
        //console.log(this._pool);
        this.audio.src = this._pool.url[this._index];
        this.show_text(this._pool.text[this._index]);
        var key = this._pool.key[this._index];
        $("#" + key).css('display', 'block');
        //console.log(this._index);
        MyPlay.audio.play();
    },
    do_pause: function () {
        this.audio.pause();
    },
    show_text: function (showtext) {
        $("#mytext").html(showtext);
    },
    do_play: function () {
        this.audio.play();
    }

};

var Operate = {
    start: function () {
        $("#diandu div").css("display", "none");
        MyPlay.read_all();
        $("#pstart").hide();
        $("#ppause").show();
    },
    play: function () {
        MyPlay.do_play();
        $("#pplay").hide();
        $("#ppause").show();
    },
    pause: function () {
        MyPlay.do_pause();
        $("#pplay").show();
        $("#ppause").hide();
    },
    doreset: function () {
        $("#pstart").show();
        $("#pplay").hide();
        $("#ppause").hide();
    }
};
