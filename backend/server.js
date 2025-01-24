const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointment');
const peerCounselorRoutes = require('./routes/peerCounselor');
const clientRoutes = require('./routes/client');
const notesRouter = require('./routes/notes');
const eventRoutes = require('./routes/event');
const notificationsRoutes = require('./routes/notifications');
const sessionHistoryRoutes = require('./routes/sessionHistory');
const schoolsRouter = require('./routes/schools');
const adminRoutes = require('./routes/admin');
const cors = require('cors');
const corsOptions = require('./config/cors.config');

require('./services/schedulerService');

app.use(cors(corsOptions));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/admin', adminRoutes);
app.use('/api', schoolsRouter);

app.use('/api', authRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', peerCounselorRoutes);
app.use('/api', clientRoutes);
app.use('/api', notesRouter);
app.use('/api', eventRoutes);
app.use('/api', notificationsRoutes);
app.use('/api', sessionHistoryRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
