const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const { app, runServer, closeServer } = require('../server');

const should = chai.should();

const {BlogPost} = require('../models')
const {TEST_DATABASE_URL} = require('../config')

chai.use(chaiHttp);

function seedBlogpostData(){
  console.info('seeding blogpost data')
  const seedData = []
  for (var i = 0; i < 5; i++) {
    seedData.push(generateBlogpostData())
  }
  return BlogPost.insertMany(seedData)
}

function generateBlogpostData(){
  return{
    title: faker.lorem.word(),
    content: faker.lorem.sentence(),
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    }
  }
}

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

describe('Blog Posts API tests', function(){
  before(function(){
    return runServer(TEST_DATABASE_URL)
  })

  beforeEach(function(){
    return seedBlogpostData()
  })

  afterEach(function(){
    return tearDownDb()
  })

  after(function(){
    return closeServer()
  })

  describe('List posts on GET', function(){
    it('should list all existing posts', function(){
      let res;
      return chai.request(app)
        .get('/posts')
        .then(function(_res) {
          res = _res
          res.should.have.status(200)
          res.body.should.have.lengthOf.at.least(5);
          return BlogPost.count()
        })
        .then(function(count) {
          res.body.should.have.lengthOf(count)
        })
    })

    it('should return posts with the correct fields', function(){
      let resBlogpost;
      return chai.request(app)
        .get('/posts')
        .then(function(res){
          res.should.have.status(200)
          res.should.be.json
          res.body.should.be.an('array')
          res.body.should.have.lengthOf.at.least(5)

          res.body.forEach(function(post){
            post.should.be.an('object')
            post.should.include.keys('title', 'content', 'author')
          })
          resBlogpost = res.body[0]
          return BlogPost.findById(resBlogpost.id)
        })
        .then(function(post){
          resBlogpost.id.should.equal(post.id)
          resBlogpost.title.should.equal(post.title)
          resBlogpost.author.should.equal(post.authorName)
          resBlogpost.content.should.equal(post.content)
        })
    })
  })

  describe('POST endpoint', function(){
    it('should send a blogpost on POST', function(){
      const newPost = generateBlogpostData()
      return chai.request(app)
        .post('/posts')
        .send(newPost)
        .then(function(res){
          res.should.have.status(201)
          res.should.be.json
          res.body.should.be.an('object')
          res.body.should.include.keys('title', 'content', 'author')
          return BlogPost.findById(res.body.id)
        })
        .then(function(post){
          post.title.should.equal(newPost.title)
          post.content.should.equal(newPost.content)
          post.author.firstName.should.equal(newPost.author.firstName)
          post.author.lastName.should.equal(newPost.author.lastName)
        })
    })
  })

  describe('PUT endpoint', function(){
    it('should update a post on PUT', function(){
      const toUpdate = {
        title: 'updated title for test',
        content: 'updated content for test'
      }
      return BlogPost.findOne()
        .then(function(post){
          toUpdate['id'] = post.id
          return chai.request(app)
            .put(`/posts/${post.id}`)
            .send(toUpdate)
        })
        .then(function(res){
          res.should.have.status(204)
          return BlogPost.findById(toUpdate.id)
        })
        .then(function(post){
          post.title.should.equal(toUpdate.title)
          post.content.should.equal(toUpdate.content)
        })
    })
  })

  describe('DELETE endpoint', function(){
    it('should delete a post by ID on DELETE', function(){
      let postToDelete;
      return BlogPost.findOne()
        .then(function(post){
          postToDelete = post
          return chai.request(app)
            .delete(`/posts/${postToDelete.id}`)
        })
        .then(function(res){
          res.should.have.status(204)
          return BlogPost.findById(postToDelete.id)
        })
        .then(function(deletedPost){
          should.not.exist(deletedPost)
        })
    })
  })
})
