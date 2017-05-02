$('#selectInner').on('click', function () {
    if ($("#gradelist").hasClass('down')) {
        $('#selectInner img').attr('src', 'images/slidedown.png');
        $("#gradelist").removeClass('down')
    } else {
        $('#selectInner img').attr('src', 'images/slideup.png');
        $("#gradelist").addClass('down')
    }
});
$('#gradelist').on('click', 'li', function () {
    var choseGrade = $(this).data("value");
    var choseInner = $(this).html();
    getDATA(choseGrade, choseInner);
    $("#gradelist").removeClass('down');
    $('#selectInner img').attr('src', 'images/slidedown.png');


});
function getDATA(grade, inner) {
    //console.log(grade);
    var choseIcon = '<span class="chosed-icon"></span>';
    $('#gradelist li span.chosed-icon').remove();
    $('#gradelist li[data-value="' + grade + '"]').addClass('chosed').append(choseIcon).siblings().removeClass('chosed');

    $('#selectInner span').data('value', grade);
    $('#selectInner span').html(inner);
    $.ajax({
        type: 'POST',
        url: 'http://ci.com/api_h5/book_grade',
        data: {book_grade: grade},
        success: function (list) {
            var html = "";
            for (var i = 0; i < list.data.length; i++) {
                var publisher = list.data[i];
                html += `
                    <dl>
                        <h3><span></span>${publisher.book_publisher}</h3>
                `;
                for (var j = 0; j < publisher.book_list.length; j++) {
                    var book = publisher.book_list[j];
                    var book_url = "http://www.en8848.com.cn" + book.book_img;
                    html += `
                            <a href="select2.html?book_id=${book.book_id}">
                                <dt><img src="${book_url}" alt=""/></dt>
                                <dd>${book.book_name}</dd>
                            </a>
                    `;
                }
                html += `</dl>`;
            }
            $('#booklist').html(html);
        }
    })
}
$(document).ready(function () {
    //$("#default").click();
    getDATA(3, '三年级');
});