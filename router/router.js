
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
// var path = require('path');

var router = express.Router();
var userController = require('../controllers/userControllers.js');
//*Requirerd by server.js*

console.log('using router...')

//////////////////
//users  ---------------------------------------------------------------------------------------
//////////////////

//get all users. not usually useful
router.route('/users')
  .get(function (req, res) {
    console.log('user get')
    userController.getAll(function(err, person){
      if (err) {
        return res.json({err: err})
      }
      res.json(person)
    });
  });

//create user
router.route('/users')
  .post(function (req, res) {
    
    console.log("post to /users", req.body.username,req.body.password);
    var newuser = {
      username: req.body.username,
      password: req.body.password,
      createdRaces: []
    }

    //When adding user to the controller, returns the empty created races array
    userController.addUser(newuser, function(err, createdRaces){
       if (err) {
        console.log(err);
        return res.json({err: err});
      }
      res.status(201).json(createdRaces);
    });
  });

//delete user
router.route('/users')
  .delete(function (req, res) {
    userController.removeUser({username: req.body.username}, function(err, user){
       if (err) {
        return res.json({err: err});
      }
      res.json(user);
    });
  });

//////////////////
//Races ---------------------------------------------------------------------------------------
//////////////////


router.route('/users/:user_id/races')
  //create new race  
  .post(function (req, res) {
    var newRace = {
      creator: req.params.user_id,
      waymarks: req.body.waymarks,
      start_location: req.body.waymarks[0],
      racers: [], //users participating in race
      results: [], // result of race
      date: req.body.date,
      time: req.body.time
    }

    //when you create the race, the user needs all of the user's races
    raceController.addOne(newRace, function(err, createdRace){
      if (err) {
        return res.json({err: err});
      }
      res.json(createdRace);
    })
  });

  //get races created by user || get races by proximity
  .get(function (req, res) {
    var dbQueryParams = {};
    dbQueryParams.creator = req.params.user_id;

    if(req.query.lat) {
      dbQueryParams.lat = req.query.lat;
      dbQueryParams.lng = req.query.lng;
      dbQueryParams.proximity = req.query.proximity;  
    }
    
    raceController.find(dbQueryParams, function(err, usersRaces) {
      if (err) {
        res.json({err: err});
      }
      res.json(usersRaces);
    });
  });

//get one race by ID
router.route('/users/:user_id/races/:race_id')
  
  //find race by race ID, return the found race
  .get(function(req, res) {
    var race_id = req.params.race_id;
    
    raceController.findOne({race_id: race_id}, function(err, race){
      if (err) {
        res.json({err:err});
      }
      res.json(race);
    });
  })

  //User has added themselves to the racers on client side, and now editing the race model
  .put(function(req, res) {
    var race_id = req.params.race_id;
    var newRace = req.body;

    raceController.updateRace({race_id: race_id}, newRace, function (err, updatedRace) {
      if (err) {
        res.json({err: err});
      }
      res.json(updatedRace);
    })
  })


router.route('/users/:user_id/races')
  .get(function(req, res) {
    

    raceController.findByProximity({}, function(err, closeRaces) {
      if (err) {
        res.json({err: err});
      }
      res.json(closeRaces);
    })

  });











//get array of pins for single user
router.route('/maps/:username')
  .get(function (req, res) {
    var username = req.params.username;

    userController.findOne({username: username}, function(err, person){
      if (err) {
        return res.json({err: err})
      }
      //sends back entire person object currently. refactor to only the pins array
      res.json(person)
    });
  });

//insert new pin in pins array on user obj
router.route('/maps/:username')
  .put(function (req, res) {
    var username = req.params.username;
    var newpin = req.body;

    if(JSON.stringify(newpin) !== JSON.stringify({})){  
      userController.updatePins({username: username}, newpin, function(err, pins){
         if (err) {
          return res.json({err: err});
        }
        res.json(pins)

      });
    } else {
      res.json({})
    }


  });

// delete last pin from array
// router.route('/maps/:username')
//   .delete(function (req, res) {
//     var username = req.params.username;
//     userController.removeLastPin({userName: username}, function(err, pins){
//        if (err) {
//         return res.json({err: err});
//       }
//       res.json(pins);
//     });
//   });

//delete a spcific pin
router.route('/maps/:username')
  .delete(function (req, res) {
    var username = req.params.username;
    var pinId = req.body._id;
    userController.deletePin({username: username}, pinId, function(err, doc) {
      if (err) {
        return res.json({err: err});
      }
      res.json(doc);
    });
  });



module.exports = router;
