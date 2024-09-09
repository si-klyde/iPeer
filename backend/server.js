const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const authRoutes = require('./routes/auth');

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api', authRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
