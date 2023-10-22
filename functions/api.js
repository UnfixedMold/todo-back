const express = require('express');
const serverless = require('serverless-http');
const app = express();
const router = express.Router();
const cors = require('cors');
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URI , { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const todoSchema = new mongoose.Schema({
  name: String,
  is_checked: Boolean
});

const Todo = mongoose.model('Todo', todoSchema);

router.get('/', (req, res) => {
  res.status(200).json("App is runnig...")
});

router.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET a single todo
router.get('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// POST a new todo
router.post('/todos', async (req, res) => {
  try {
    const newTodo = new Todo({
      name: req.body.name,
      is_checked: req.body.is_checked
    });
    await newTodo.save();
    res.json(newTodo);
  } catch (err) {
    res.status(400).json({ message: 'Bad request', error: err });
  }
});

// PUT (update) a todo
router.put('/todos/:id', async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTodo) return res.status(404).json({ message: 'Todo not found' });
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: 'Bad request', error: err });
  }
});

// DELETE a todo
router.delete('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});


app.use('/.netlify/functions/api', router);
app.use(cors());
app.use(express.json());

module.exports.handler = serverless(app);
