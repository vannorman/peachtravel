const zeroPad = (num, places) => String(num).padStart(places, '0')
function daysInMonth (month, year) {
    return new Date(year, month, 0).getDate();
}
var daysInCurrentMonth = 28;

$(document).ready(function(){

    // Initialize start date as toda'ys date
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    let stringDate = year + '-' + zeroPad(month,2) + '-' + zeroPad(day,2); 
    $('#startDate').val(stringDate);
    trip.startDate = dateObj;
    OnDateWasChanged();    
    

    $('#load').on('click',function(){
        ajax.Load();
    })
    $('#save').on('click',function(e){
        ajax.Save();
    });


    // Add city
    $('#addCity').on('click',function(){
       var newCity= Object.assign({}, city)
       trip.cities.push(newCity);
       UpdateCalendar();
       UpdateGUI(trip);

    });

    $(document).on('click', '.deleteCity', function() {
        let rowToDelete = $(this).parent().parent().index();
        trip.cities.splice(rowToDelete,1);
        UpdateCalendar();
        UpdateGUI(trip);
        // $(this).closest('tr').remove();
        
      //code here ....
    });

    $(document).on('keyup change', 'input', function() {


        // DATE CHANGE 
        if ($(this).attr('id') === "startDate") {
            OnDateWasChanged(); 
       }

        if ($(this).attr('id') === "monthStartDate") {
            let date = $(this).val();
            trip.monthStartDate = parseInt(date);
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

    $(document).on('click', '.up', function() {
        let row = $(this).closest('tr').index();
        let a = trip.cities[row];
        let b = trip.cities[row-1];
        trip.cities[row] = b;
        trip.cities[row-1] = a;
        UpdateCalendar();
        UpdateGUI(trip);
    });

    $(document).on('click', '.down', function() {
        let row = $(this).closest('tr').index();
        let a = trip.cities[row];
        let b = trip.cities[row+1];
        trip.cities[row] = b;
        trip.cities[row+1] = a;
        UpdateCalendar();
        UpdateGUI(trip);
    });


});

function OnDateWasChanged(){
    // YEAR - MONTH - DAY
    var parts =$('#startDate').val().split('-');
    // Please pay attention to the month (parts[1]); JavaScript counts months from 0:
    // January - 0, February - 1, etc.
    let year = parts[0];
    let month = parts[1];
    let day = parts[2];
    let tripStartDate = new Date(year,month-1,day);
    trip.startDay = parseInt(day); // only need the integer start date here
    trip.startDate = tripStartDate;
    let firstDayOfMonth = new Date(year,month-1,1);

    // Move the first day of month to the appropriate day of week column
    let dayOfWeek = firstDayOfMonth.getDay(); // 0 => Sunday, 1 => monday, 6 => Saturday
    trip.monthStartDate = parseInt(dayOfWeek); 

    // Fill the month to the appropriate # days for that month
    daysInCurrentMonth = daysInMonth(month,year);
    UpdateCalendar()


}

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
                trip.startDate = new Date(trip.startDate);
                UpdateGUI(trip);
                UpdateCalendar();
            },
            error: function (e) {
                console.log("error:"+JSON.stringify(e));
            },
        });

    },

    Save(){
        console.log("starting save");
        
        $.ajax({
            type: 'POST',
            url: "/save",
            headers: {
                "X-CSRFToken" : csrf,
                "Content-Type": "application/json"
            },
            data : JSON.stringify({ trip_name : $('#tripName').val(), trip_json : JSON.stringify(trip) }),
            success: function (e) {
                  console.log('settings save success:'+JSON.stringify(e).trim(0,200));
            },
            error: function (e) {
                console.log("setting save err: "+ JSON.stringify(e).trim(0,200));
//                $('html').html(JSON.stringify(e));
            },
        });
        event.preventDefault();
    },
}



var city = {
    name : "new city",
    days : 1
}

var cityHtml = '<tr><td><button class="deleteCity">Remove</button></td><td><input type="text" class="city"></td><td><input class="numDays" type="number" value="1" min="1"></td><td><div class="up">^</div><div class="down">v</div></tr> ';


var trip = {
    monthStartDate : 0,
    startDay : null, //Date(), // returns the current local day
    startDate : null,
    cities : [
    ],
}

var tripUtils = {
    getColorForCity(i) {
        return "hsl("+i*40+",20%,50%)";
    }
}


function UpdateGUI(tripData){
    // After loading the trip from the server, we need to update the trip inputs to match it
    
    $('#cities').html(''); // Clear all cities
    
    // set start date
    var month = trip.startDate.getUTCMonth() + 1; //months from 1-12
    var day = trip.startDate.getUTCDate();
    var year = trip.startDate.getUTCFullYear();
    let stringDate = year + '-' + zeroPad(month,2) + '-' + zeroPad(day,2); 
    $('#startDate').val(stringDate);
 

    // Populate cities from trip data
    for(var i=0;i<tripData.cities.length;i++){
        let city = tripData.cities[i];
        let newCity = $(cityHtml);
        $('#cities').append(cityHtml);
//        console.log("i+1:"+(i)+", city name:"+city.name);
        $('#cities tr:eq('+(i)+')').find('.city').val(city.name)
        $('#cities tr:eq('+(i)+')').find('.numDays').val(city.days)
        if (i == 0) {
            $('#cities tr:eq('+(i)+')').find('.up').addClass('disabled');
        }
        if (i == tripData.cities.length - 1){
            $('#cities tr:eq('+(i)+')').find('.down').addClass('disabled');

        }
    }

    
} 

function UpdateCalendar(){

    // Repaint empty calendar
    $('.calendar').text('');

    // Add first month
    let monthString = trip.startDate.toLocaleString('default', { month: 'long' });
    $('.calendar').append('<div class="monthTitle">'+monthString+"</div>");
    for(let i=0; i<trip.monthStartDate; i++){
        $('.calendar').append($('<div class="box"></div>'));
        
    }
    for (var i = 1; i < daysInCurrentMonth+1; i++) {
        $('.calendar').append($('<div class="box" id="box'+i+'"><div class="num">'+i+'</div><div class="city"></div></div>'));
    }

    // Add second month if needed
    let tripLength = 0;
    trip.cities.forEach(x => tripLength += x.days);
    if (tripLength > daysInCurrentMonth - trip.startDay){

        // Add month
        let tempDate = new Date(trip.startDate.getTime());
        tempDate.setMonth(tempDate.getMonth() + 1); // next month
        let monthString = tempDate.toLocaleString('default', { month: 'long' });
        $('.calendar').append('<div class="monthTitle">'+monthString+"</div>");
        for(let i=0; i<trip.monthStartDate; i++){
            $('.calendar').append($('<div class="box"></div>'));
            
        }
        let daysInNextMonth = daysInMonth(tempDate.getMonth()+1,tempDate.getYear())
        ;for (var i = 1; i < daysInNextMonth+1; i++) {
            $('.calendar').append($('<div class="box" id="box'+i+'"><div class="num">'+i+'</div><div class="city"></div></div>'));
        }

         
    }


    $('.box').css('background','#e0e0e0');
    $('#box'+trip.startDay).css('background','#abc');
    $('.box').each(function(){
        $(this).find('.city').text('');
    })
    var days = 0;
    for(let i=0;i<trip.cities.length;i++){
        //console.log("trip startdate:"+trip.startDay+", days:"+days+", sum:"+trip.startDay+days);
        let day = days + trip.startDay;
        let cityName = trip.cities[i].name;
//        console.log("updating "+day+" with "+cityName);
        $('#box'+day).find('.city').text(cityName);

        let cityStartDate = trip.startDay + days;
        // color the boxes
        
        for (let j=cityStartDate;j<cityStartDate+trip.cities[i].days;j++){
            let color = tripUtils.getColorForCity(i);
            $('#box'+j).css('background',color);
        }
        days += trip.cities[i].days;
    }

    // Repaint the GUI
//    $('#cities').text('');
//    for(let i=0;i<trip.cities.length;i++){
//        let $newCity = $(cityHtml);
//        $('#cities').append($newCity);
//        $newCity.find('.city').val(trip.cities[i].name);
//    }
    

}
