import express from 'express';

const app = express();
const PORT = 8000;

// Use json middleware
app.use(express.json());

// Root GET route returning a short message
app.get('/', (req, res) => {
  res.json({ message: 'Hello from the Classroom Backend!' });
});

// Start the server and log the URL when server starts
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
