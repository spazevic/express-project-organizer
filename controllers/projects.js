let express = require('express')
let db = require('../models')
let async = require('async')
let router = express.Router()

// POST /projects - create a new project
router.post('/', (req, res) => {
  let categories = []
  if (req.body.categoryName) {
    categories = req.body.categoryName.split(',')
  }
  db.project.create({
    name: req.body.name,
    githubLink: req.body.githubLink,
    deployLink: req.body.deployedLink,
    description: req.body.description
  })
  .then((project) => {
    async.forEach(categories, (category, done) => {
      db.category.findOrCreate({
        where: {
          name: category.trim()
        }
      })
      .then(([category, wasCreated]) => {
        project.addCategory(category)

        .then(() => {
          done()
        })
        .catch((error) => {
          console.log(error)
          done()
          res.status(400).render('main/404')
        })
      })
      .catch((error) => {
        console.log(error)
        done()
        res.status(400).render('main/404')
      })
      
    }, () => {
      res.redirect('/')
    }) //end of async
  })//close then project create
  .catch((error) => {
    console.log(error)
    res.status(400).render('main/404')
  })
})

// GET /projects/new - display form for creating a new project
router.get('/new', (req, res) => {
  res.render('projects/new')
})

// GET /projects/:id - display a specific project
router.get('/:id', (req, res) => {
  db.project.findOne({
    where: { id: req.params.id },
    include: [db.category]
  })
  .then((project) => {
    console.log(project.categories)
    if (!project) throw Error()
    res.render('projects/show', { project})
  })
  .catch((error) => {
    res.status(400).render('main/404')
  })
})

module.exports = router
