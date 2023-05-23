$(document).ready(function(){
    $('#load').on('click',function(){
        ajax.Load();
    })
    $('#save').on('click',function(e){
        ajax.Save();
    });


    // Add city
    $('#addCity').on('click',function(){
       $('#cities').append(cityHtml);
       var newCity= Object.assign({}, city)
       trip.cities.push(newCity);
    });

    $(document).on('click', '.deleteCity', function() {
        $(this).closest('tr').remove();
      //code here ....
    });

    $(document).on('keyup change', 'input', function() {
        if ($(this).attr('id') === "startDate") {
            let date = $(this).val();
            trip.startDate = parseInt(date);
            UpdateCalendar()
        }

        if ($(this).attr('class') === "city"){
            let row = $(this).closest('tr').index();
            trip.cities[row].name = $(this).val();             
            UpdateCalendar();
        }
        if ($(this).attr('class') === "numDays"){
            let row = $(this).closest('tr').index();
            trip.cities[row].days = parseInt($(this).val());   
            UpdateCalendar();
        }
    //    console.log('ch:'+$(this).val());
    });
});
var ajax ={ 
    Load(){
        $.ajax({
            type: 'POST',
            url: "load/",
            headers: {
                "X-CSRFToken" : csrf
            },
            success: function (e) {
                let tripJson = JSON.parse(e.trip_json);
                $('#loaded').text(tripJson); 
                console.log(tripJson);
                trip = tripJson;
                UpdateTripInputs(trip);
                UpdateCalendar();
            },
            error: function (e) {
                console.log("error:"+JSON.stringify(e));
            }
        });

    },

    Save(){
        console.log("starting save");
        data = {
           data : JSON.stringify({
                trip_name : $('#tripName').val(),
                trip_json : JSON.stringify(trip)
            })
        }
        $.ajax({
            type: 'POST',
            url: "save/",
            headers: {
                "X-CSRFToken" : csrf
            },
            data : data,
            success: function (e) {
                  console.log('settings save success:'+JSON.stringify(e).trim(0,200));
            },
            error: function (e) {
                console.log("setting save err: "+ JSON.stringify(e).trim(0,200));
//                $('html').html(JSON.stringify(e));
            }
        });

    },
}


// Add rows of boxes for the calendar
document.addEventListener("DOMContentLoaded", function() {

  for (var i = 1; i < 30; i++) {
    $('.calendar').append($('<div class="box" id="box'+i+'"><div class="num">'+i+'</div><div class="city"></div></div>'));
  }
});


var city = {
    name : "new city",
    days : 1
}

var cityHtml = '<tr><td><button class="deleteCity">Remove</button></td><td><input type="text" class="city"></td><td><input class="numDays" type="number" value="1" min="1"></td></tr> ';


var trip = {
    startDate : 1,
    cities : [
        {
            name : "empty",
            days : 1,
        },
    ],
}

var tripUtils = {
    getColorForCity(i) {
        return "hsl("+i*40+",20%,50%)";
    }
}


function UpdateTripInputs(tripData){
    // After loading the trip from the server, we need to update the trip inputs to match it
    
    $('#cities').html(''); // Clear all cities

    // Populate cities from trip data
    for(var i=0;i<tripData.cities.length;i++){
        let city = tripData.cities[i];
        let newCity = $(cityHtml);
        $('#cities').append(cityHtml);
        console.log("i+1:"+(i)+", city name:"+city.name);
        $('#cities tr:eq('+(i)+')').find('.city').val(city.name)
        $('#cities tr:eq('+(i)+')').find('.numDays').val(city.days)

    }

    
} 

function UpdateCalendar(){
    $('.box').css('background','#e0e0e0');
    $('#box'+trip.startDate).css('background','#abc');
    $('.box').each(function(){
        $(this).find('.city').text('');
    })
    var days = 0;
    for(let i=0;i<trip.cities.length;i++){
        //console.log("trip startdate:"+trip.startDate+", days:"+days+", sum:"+trip.startDate+days);
        let day = days + trip.startDate;
        let cityName = trip.cities[i].name;
//        console.log("updating "+day+" with "+cityName);
        $('#box'+day).find('.city').text(cityName);

        let cityStartDate = trip.startDate + days;
        // color the boxes
        
        for (let j=cityStartDate;j<cityStartDate+trip.cities[i].days;j++){
            let color = tripUtils.getColorForCity(i);
            $('#box'+j).css('background',color);
        }
        days += trip.cities[i].days;
    }

}
