var i = 0;
$(document).ready(function(){
    $("#sub_title").bind('keyup', function(event){ 
        if(event.keyCode === 13){ 
            event.preventDefault();
            getSub();
        }
    });

    $("#right_slider").css({"right":window.innerWidth / 4});

    document.getElementById("refresh_cache").addEventListener("click", function(){
        var modalContent = document.getElementById("cache_content");
        getCache(function(data) {
            buildCacheContent(modalContent, data);
        });
    });

    document.getElementById("open_cache").addEventListener("click", function(){
        var modalContent = document.getElementById("cache_content");
        $("#myModal2").modal("show");
        getCache(function(data){
            buildCacheContent(modalContent, data);
        });
    });
    
    //$("#mySecondModal").modal("show");
});

var getToGSI = function() {
     window.open('http://getsomeinternet.com','_blank');
};

var getCache = function(callback) {
    $.ajax({ 
        url: "/getcache/",
        success: function(data){
            var jsonData = [];

            try {
                jsonData = JSON.parse(data);
                callback(jsonData);
            } catch (err) {
                console.log(err);
            }
        },
        error:function (xhr, ajaxOptions, thrownError){
            console.log("Ajax request failed");
        }
    });
};


var buildCacheContent = function(root, data) {
    root.innerHTML = "";
    
    var text,
        newListItem,
        newList;
   
        newList = document.createElement("ul");
        newList.className = "list-group";
        root.appendChild(newList);
    
    data.forEach(function(el){
        text = el.key.replace(/\./g, " ");
        newListItem = document.createElement("li");
        newListItem.className = "list-group-item";
        newListItem.innerHTML = text;

        newList.appendChild(newListItem); 
    
    });
};

var getSub = function(){
    var title = document.getElementById("sub_title").value;
    $.ajax({
        url: "/get/?language="+ $("#language").val() +"&title="+title.replace(/_/g,"."),
        cache: false,
        timeout: 20000,
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
            if (Math.random() > 0.7){
                document.getElementById("slider").innerHTML = "Any thoughts or feedback? Contact us by clicking here";
                document.getElementById("slider").addEventListener("click", function(){$("#myModal").modal("show");});
            } else {
                document.getElementById("slider").innerHTML = "You may right click and save as to place the file in the right folder";
            }

            $("#slider").css({"left":window.innerWidth / 2});
        },
        error:function (xhr, ajaxOptions, thrownError){
            console.log("Ajax request failed " + i);
            $("#result").show(200);
            $("#image_loader").hide();
            $("#result").removeClass("btn-success");
            $("#result").addClass("btn-danger");
            document.getElementById("result").href = "#";
            document.getElementById("sub_title").value = "";
            if (++i > 2){
                //for questionaere
                $("#myModal").modal("show");
                document.getElementById("result").innerHTML = "Nothing could be found, sorry"; 
            } else if ($("#language").val() === "English"){
                document.getElementById("result").innerHTML = "Nothing found, maybe you need to be more specfic?";
            } else {
                document.getElementById("result").innerHTML = "No subtitle could be found, try selecting English instead!";
            }
        }
    });
}

var sendFeedback = function(){
    var answere = $("#feedback").val();

    if (answere){
        alert("Thank you for the feedback!");
    }

    $.ajax({
         url: "/feedback/?answere=" + answere,
            cache: false,
            success: function(data){
                console.log(data);
            },
            error:function (xhr, ajaxOptions, thrownError){
               console.log("Ajax request failed");
            }
    });
};
