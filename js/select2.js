function GetQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}
$(document).ready(function () {
    var bookId=parseInt(GetQueryString("book_id"));
    $.ajax({
        type:'POST',
        url:'http://ci.com/api_h5/book_class',
        data:{book_id:bookId},
        success: function (data) {
            console.log(data);
            var html="";
            var bookImgUrl="http://www.en8848.com.cn"+data.data.book_img_url;
            html+=`
                <header>
                   <div><img src="${bookImgUrl}" alt=""/></div>
                   <h2>${data.data.book_publisher}</h2>
                   <h3>${data.data.book_title}</h3>
                   <a class="changeBook" href="select.html">换课本</a>
                </header>
            `;
            var unit=data.data.book_unit;
            if( unit[0].lesson.length==0) {
                var lessonIdPre = unit[1].lesson[0].lession_id;
            }else{
                var lessonIdPre = unit[0].lesson[0].lession_id;
            }
            var lessonIdNext = unit[unit.length-1].lesson[unit[unit.length-1].lesson.length-1].lession_id;
            for(var i=0;i<data.data.book_unit.length;i++){
                var unit=data.data.book_unit[i];
                html+=`
                    <h4>${unit.unit_name}</h4>
                    <ul>
                `;
                for(var j=0;j<unit.lesson.length;j++){
                    var lesson=unit.lesson[j];
                    html+=`
                           <li><a href="diandu.html?book_pic=${lesson.lession_id}&&lesson_id_pre=${lessonIdPre}&&lesson_id_next=${lessonIdNext}&&book_id=${bookId}">第${lesson.lession_pic_index}页</a></li>
                    `;
                }
                html+=`</ul> `;
            }
            $("#menu").html(html);
        }
    })
});
