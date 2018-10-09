const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

//Load models
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route    GET api/profile/test
//@desc     Test route
//@access   public
router.get('/test', (req, res) => {
    res.json({msg: 'Profile Works'});
});

//@route    GET api/profile
//@desc     Get the current user profile
//@access   private
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};

    Profile.findOne({user: req.user.id})
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if(!profile){
            errors.noprofile = 'There is no profile found for this user'
            return res.status(400).json(errors);

        }

        res.json(profile);
    })
    .catch(err => {
        res.status(400).json(err)
    });
});

//@route    GET api/profile/all
//@desc     Get all profiles
//@access   prublic
router.get('/all', (req, res) => {
    const errors = {}

    Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
        if(!profiles){
            errors.noprofiles = 'There are no profiles found';
            return res.status(404).json(errors)
        }

        res.json(profiles);
    })
    .catch(err => res.status(404).json({errmsg: 'There are no profiles found'}))
});

//@route    GET api/profile/handle/:handle
//@desc     Get profile by handle
//@access   prublic
router.get('/handle/:handle', (req, res) => {
    const errors = {};

    Profile.findOne({handle: req.params.handle})
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if(!profile){
            errors.noprofile = 'There is no profile found for this user';
            res.status(400).json(errors);
        }

        res.json(profile);
    }).catch(err => res.status(404).json(err));
});

//@route    GET api/profile/user/:user_id
//@desc     Get profile by ID
//@access   prublic
router.get('/user/:user_id', (req, res) => {
    const errors = {};

    Profile.findOne({user: req.params.user_id})
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if(!profile){
            errors.noprofile = 'There is no profile found for this user';
            res.status(400).json(errors);
        }

        res.json(profile);
    }).catch(err => res.status(404).json({errmsg: 'There is no profile for this user'}));
});


//@route    GET api/profile/
//@desc     Post request to create or edit user profile
//@access   PRIVATE
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid} = validateProfileInput(req.body);

    //Check validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    //Get profile fields
    const profileFields = {};
    profileFields.user = req.user.id;
    profileFields.social = {};

    //Skills split into an array
    if(typeof req.body.skills !== 'undefinded') profileFields.skills = req.body.skills.split(',');

    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.handle = req.body.website;
    if(req.body.location) profileFields.handle = req.body.location;
    if(req.body.bio) profileFields.bio = req.body.bio;
    if(req.body.status) profileFields.status = req.body.status;
    if(req.body.githubUsername) profileFields.githubUsername = req.body.githubUsername;

    //Social
    if(req.body.youtube) profileFields.social.youtube = req.body.social;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({user: req.user.id})
    .then(profile => {
        if(profile){
            //Update the user profile
            Profile.findOneAndUpdate(
                {user: req.user.id}, 
                {$set: profileFields}, 
                {new: true}
                ).then(profile => res.json(profile));
            profile
        }else{
            //Create a user profile

            //Check if there is a handle
            Profile.findOne({handle: profileFields.handle})
            .then(profile => {
                if(profile){
                    errors.handle = 'that handle already exists';
                    res.status(400).json(errors);
                }
            });

            //Save new user profile
            new Profile(profileFields).save().then(profile => res.json(profile));
        }
    })

});

//@route    POST api/profile/experience
//@desc     Add experience to profile
//@access   PRIVATE
router.post('/experience', passport.authenticate('jwt', {session: false}), (req, res) => {

    const {errors, isValid} = validateExperienceInput(req.body);

    //Check validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    Profile.findOne({user: req.user.id})
    .then(profile => {
        const newExp = {
            title: req.body.title,
            company: req.body.company,
            location: req.body.location,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        }

        // Add to experience array
        profile.experience.unshift(newExp);

        profile.save().then(profile => res.json(profile));
    })
})

//@route    POST api/profile/education
//@desc     Add education to profile
//@access   PRIVATE
router.post('/education', passport.authenticate('jwt', {session: false}), (req, res) => {

    const {errors, isValid} = validateEducationInput(req.body);

    //Check validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    Profile.findOne({user: req.user.id})
    .then(profile => {
        const newEdu = {
            school: req.body.school,
            degree: req.body.degree,
            fieldofstudy: req.body.fieldofstudy,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        }

        // Add to experience array
        profile.education.unshift(newEdu);

        //Save the profile
        profile.save().then(profile => res.json(profile));
    })
})

//@route    DELETE api/profile/experience/:exp_id
//@desc     Delete experience from profile
//@access   PRIVATE
router.delete('/experience/:exp_id', passport.authenticate('jwt', {session: false}), (req, res) => {

    Profile.findOne({user: req.user.id})
    .then(profile => {
        //Get remove index
        const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

        //Spile it from the array
        profile.experience.splice(removeIndex, 1);

        //Save the profile
        profile.save().then(profile => res.json(profile));
    })

    
});

//@route    DELETE api/profile/education/:edu_id
//@desc     Delete education from profile
//@access   PRIVATE
router.delete('/education/:edu_id', passport.authenticate('jwt', {session: false}), (req, res) => {

    Profile.findOne({user: req.user.id})
    .then(profile => {
        //Get remove index
        const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

        //Spile it from the array
        profile.education.splice(removeIndex, 1);

        //Save the profile
        profile.save().then(profile => res.json(profile));
    })

    
});

//@route    DELETE api/profile/
//@desc     Delete user and profile
//@access   PRIVATE
router.delete('/', passport.authenticate('jwt', {session: false}), (req, res) => {

    Profile.findOneAndRemove({ user: req.user.id})
    .then(() => {
        User.findOneAndRemove({_id: req.user.id})
        .then(() => {
            res.json({success: true});
        });
    });
    
});

module.exports = router;