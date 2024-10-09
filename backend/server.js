const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointment');
const peerCounselorRoutes = require('./routes/peerCounselor');
const clientRoutes = require('./routes/client');
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api', authRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', peerCounselorRoutes);
app.use('/api', clientRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
