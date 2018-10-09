const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

// Validation
const validatePostInput = require('../../validation/post');

//@route    GET api/posts/test
//@desc     Test route
//@access   public
router.get('/test', (req, res) => {
    res.json({msg: 'Posts Works'});
})

//@route    GET api/posts
//@desc     Get all posts
//@access   Public
router.get('/', (req, res) => {
    Post.find().
    sort({date: -1})
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({noPostsFound: 'No posts found'}));

})

//@route    GET api/posts/:id
//@desc     Get post by id
//@access   Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({noPostFound: 'No post found with that ID'}));

})


//@route    POST api/posts
//@desc     Create post
//@access   PRIVATE
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid} = validatePostInput(req.body);

    //Check validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post => res.json(post));
});

//@route    DELETE api/posts/:id
//@desc     Get post by id
//@access   PRIVATE
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id})
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            //Check for post owner
            if(post.user.toString() !== req.user.id){
                return res.status(401).json({ notAuthorized: 'User is not authorized' });
            }

            //Delete post
            post.remove().then(() => res.json({succes: 'Post deleted'}));
        })
        .catch(err => res.status(404).json({ postNotFound: 'No post found'}));
    })
});


//@route    POST api/posts/like/:id
//@desc     Like post
//@access   PRIVATE
router.post('/like/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id})
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
                return res.status(400).json({ alreadyLiked: 'User aleady liked this post' });
            }

            //Add user id to the likes array
            post.likes.unshift({user: req.user.id});

            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postNotFound: 'No post found'}));
    })
});

//@route    POST api/posts/unlike/:id
//@desc     Like post
//@access   PRIVATE
router.post('/unlike/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id})
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
                return res.status(400).json({ notLiked: 'You have not yet liked this post' });
            }

            //Get the remove index
            const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

            //Splice the user out of the likes array
            post.likes.splice(removeIndex, 1);

            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postNotFound: 'No post found'}));
    })
});

//@route    POST api/posts/comment/:id
//@desc     Add comments to post
//@access   PRIVATE
router.post('/comment/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid} = validatePostInput(req.body);

    //Check validation
    if(!isValid){
        return res.status(400).json(errors);
    }
    
    Post.findById(req.params.id)
    .then(post => {
        const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
        }

        //Add to comments array
        post.comments.unshift(newComment);

        post.save().then(post => res.json(post));

    })
    .catch(err => res.status(404).json({ postNotFound: 'No post found' }))
});

//@route    Delete api/posts/comment/:id/:comment_id
//@desc     Remove comment from post
//@access   PRIVATE
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid} = validatePostInput(req.body);

    //Check validation
    if(!isValid){
        return res.status(400).json(errors);
    }
    
    Post.findById(req.params.id)
    .then(post => {
        //Check if the comment exists
        if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0){
            return res.status(404).json({noCommet: 'This comments does not exsist'});
        }

        //Get the remove index
        const removeIndex = post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id);

        //Splice comment out of the array
        post.comments.splice(removeIndex, 1);

        post.save().then(post => res.json(post));

    })
    .catch(err => res.status(404).json({ postNotFound: 'No post found' }))
});

module.exports = router;