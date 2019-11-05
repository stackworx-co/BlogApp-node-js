const express     = require('express');
const router      =  new express.Router();
const Post        = require('../models/post');
const {ObjectID}  = require('mongodb');
const authenticate = require('./auth');
const Comment = require('../models/comment');

router.post('/posts',authenticate,async (req,res, next) => {
    const post =  new Post({
        ...req.body,
        author: req.user._id
    });
    if(!post.title){
        return next({statusCode : 204, message: 'Title Missing'});
    }else if(post.description===null){
        return next({statusCode : 204, message: 'Description Missing'});
    }else{
        try {
            await post.save();
            res.status(201).send(post);
        } catch (error) {
            res.status(400).send(error);
        }
    }
});

router.get('/posts/me', authenticate,async (req, res, next)=>{
    if(!req.user._id){
        return next({statusCode : 401, message: 'Unauthorized User'});
    }
    try {
        const posts= await Post.find({author: req.user._id});
        if(!posts){
            return next({statusCode : 204, message: 'No post of the user'});
        }
        res.send(posts);
    } catch (error) {
        res.status(500).send();
    }
    
});

router.get('/posts',async (req,res, next) => {
    try {
        const posts = await Post.find({});
        if(!posts){
            return next({statusCode : 204, message: 'No post'});
        }
        res.send(posts);
    } catch (error) {
        res.status(500).send();
    }
});

router.get('/posts/:id',authenticate, async (req,res) => {
    const _id =  req.params.id;
    if (!ObjectID.isValid(_id)) {
        return res.status(404).send();
    }
    try {
        const post = await Post.findOne({ _id, author: req.user._id });
        if(!post){
            return res.status(404).send();
        }
        res.send(post);
    } catch (error) {
        res.status(500).send();
    }
}); 

router.patch('/posts/:id',authenticate, async (req, res) => {
    const _id = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "title"];
    const isValidOperation  = updates.every((update) => allowedUpdates.includes(update));
    if(!isValidOperation){
        res.status(400).send({error:'Invalid updates'});
    }
    if (!ObjectID.isValid(_id)) {
        res.status(404).send();
    }
    try {
        const post = await Post.findOne({_id: req.params.id, author:req.user._id});
        
       if(!post){
        res.status(404).send();
       }

       updates.forEach((update) => post[update] = req.body[update]);
       await post.save();

       res.send(post);
    } catch (error) {
        res.status(400).send();
    }
});

router.delete('/posts/:id', authenticate,async (req,res) => {
    const _id = req.params.id;
    if (!ObjectID.isValid(_id)) {
        return res.status(404).send();
    }
    try {
        const deletepost = await Post.findOneAndDelete({_id:_id, author: req.user._id});
        if (!deletepost) {
            return res.status(404).send();
        }
        res.send(deletepost);
    } catch (error) {
        res.status(500).send();
    }
});

router.post('/posts/:id/comment',authenticate, async (req,res) => {   
    const _id = req.params.id;
    const userid = req.user._id;

    if (!ObjectID.isValid(_id)) {
        return res.status(404).send();
    }

    if (!ObjectID.isValid(userid)) {
        return res.status(404).send();
    }

    const comment = new Comment({
        ...req.body,
        author: userid,
        postId: _id
    });

    try {
        await comment.save();
        res.status(201).send(comment);
    } catch (error) {
        res.status(400).send(error);
    }

});

router.get('/posts/:id/comment', async (req,res) => {
    try {
        const post = await Post.findOne({_id: req.params.id});
        await post.populate('comments').execPopulate();
        res.send(post.comments);
    } catch (error) {
        res.status(500).send();
    }
});

module.exports = router;