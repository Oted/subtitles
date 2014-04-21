var i = 0;
$(document).ready(function(){
    $("#sub_title").bind('keyup', function(event){ 
        if(event.keyCode === 13){ 
            event.preventDefault();
            getSub();
        }
    });

    $("#right_slider").css({"right":window.innerWidth / 4});
});

var getSub = function(){
    var title = document.getElementById("sub_title").value;
    $.ajax({
        url: "/get/?language="+ $("#language").val() +"&title="+title.replace(/_/g,"."),
        cache: false,
        timeout: 1000,
        beforeSend: function(){
            $("#result").hide();
            document.getElementById("result").innerHTML = "";
            $("#image_loader").show();
        },
        success: function(data){
            console.log(data);
            if (data.quality === "1"){
                $("#result").removeClass("btn-danger btn-warning");
                $("#result").addClass("btn-success");
            } else {
                $("#result").removeClass("btn-danger btw-success");
                $("#result").addClass("btn-warning");
            }
            $("#image_loader").hide();
            document.getElementById("result").href = "/output/"+data.filename;
            document.getElementById("result").innerHTML= data.filename;
            $("#result").show(200);

            $("#slider").css({"left":window.innerWidth / 2});
        },
        error:function (xhr, ajaxOptions, thrownError){
            console.log("Ajax request failed");
            $("#result").show(200);
            $("#image_loader").hide();
            $("#result").removeClass("btn-success");
            $("#result").addClass("btn-danger");
            document.getElementById("result").href = "#";
            document.getElementById("sub_title").value = "";
            if (i++ > 2){
                document.getElementById("result").innerHTML = "Nothing could be found, sorry"; 
            } else if ($("#language").val() === "English"){
                document.getElementById("result").innerHTML = "Nothing found, maybe you need to be more specfic?";
            } else {
                document.getElementById("result").innerHTML = "No subtitle could be found, try selecting English instead!";
            }
        }
    });
}
