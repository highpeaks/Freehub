//harvard bridge: 690537
//cbb enjoy the view: 6985412
//Hawk Hill: 229781
//Unchained: 12126888
//Whiteface: 667415
//Cadillac Climb: 675331

//node modules
var strava = require('strava-v3');
var ss = require('simple-statistics');
var fs = require('fs');
var path = require('path');

//global variables
var leaderBoard = {
  name: [],
  id: [],
  loc: [],
  distance: [],
  map: [],
  entries: {
    moving_time: []
  },
  slowest: [],
  q1: [],
  median: [],
  q3: [],
  fastest: []
};
var count = 0;
var pageNumber = 1;
var segmentId;

// // initiate bot
// freehub(6985412);

//server
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});

app.get('/segment/:segment', newSegment);

function newSegment(request, response){

  freehub(Number(request.params.segment));

  function freehub(newId){

    segmentId = [newId];

  	let segment_params = {
  		id: segmentId,
  	}

    let leaderBoard_params = {
      id: segmentId,
      date_range: 'this_month',
      page: pageNumber,
      per_page: 200
    }

    strava.segments.get(segment_params, segment_callback);
    setTimeout(getLB, 10);
    function getLB (){
      strava.segments.listLeaderboard(leaderBoard_params, leaderBoard_callback);
    }
  }

  function nextPage(){

    pageNumber++;

    let leaderBoard_params = {
      id: segmentId,
      date_range: 'this_month',
      page: pageNumber,
      per_page: 200
    }
    strava.segments.listLeaderboard(leaderBoard_params, leaderBoard_callback);
  }

  function segment_callback(err, payload){
  	if(err){console.log(err);}
  	leaderBoard.name.push(payload.name);
  	leaderBoard.id.push(payload.id);
    leaderBoard.loc.push(payload.city + ", " + payload.state);
  	leaderBoard.distance.push(payload.distance);
  	leaderBoard.map.push(payload.map);

    count++;

    if (count == 2){
      count = 0;
      writeLeaderboard();
    }
  }

  function leaderBoard_callback(err, payload) {
  	if(err){console.log(err);}

    if (payload.entries.length > 0){

  		for (let i = 0; i < payload.entries.length; i++){
  			leaderBoard.entries.moving_time.push(payload.entries[i].moving_time);
  		}

      if (payload.entries.length >= 199){
        nextPage();
      }
  	}

    if (payload.entries.length < 199){
      count++;
    	if (count == 2){
        count = 0;
    		writeLeaderboard();
    	}
    }
  }

  function writeLeaderboard(){

    pageNumber = 1;

    leaderBoard.q1 = ss.quantile(leaderBoard.entries.moving_time, 0.75);
    leaderBoard.median = ss.median(leaderBoard.entries.moving_time);
    leaderBoard.q3 = ss.quantile(leaderBoard.entries.moving_time, 0.25);

    //remove outliers
    let slowOutliers = ((leaderBoard.q1 - leaderBoard.q3) * 1.5) + leaderBoard.q1;
    let fastOutliers = ((leaderBoard.q1 - leaderBoard.q3) * 1.5) - leaderBoard.q3;
    if (fastOutliers < 0){ fastOutliers = 0; }
    for (let i = 0; i < leaderBoard.entries.moving_time.length; i++){
      if (leaderBoard.entries.moving_time[i] >= slowOutliers){
        leaderBoard.entries.moving_time.splice(i, 1);
      } else if (leaderBoard.entries.moving_time[i] <= fastOutliers){
        leaderBoard.entries.moving_time.splice(i, 1);
      }
    }

    leaderBoard.slowest = ss.max(leaderBoard.entries.moving_time);
    leaderBoard.fastest = ss.min(leaderBoard.entries.moving_time);

  	let toJson = JSON.stringify(leaderBoard);
  	fs.writeFile('public/json/leaderBoards.json', toJson);
    console.log('json saved');
    response.redirect('back');
    leaderBoard = { name: [], id: [], loc: [], distance: [], map: [], entries: { moving_time: [] }, slowest: [], q1: [], median: [], q3: [], fastest: []};
  }
}
