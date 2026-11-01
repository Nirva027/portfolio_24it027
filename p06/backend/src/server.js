import mongoose from 'mongoose';
import app from './app.js';

const port = Number(process.env.PORT) || 5000;
const mongoUri =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_portfolio_p06';

try {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  app.listen(port, () => {
    console.log(`Task API listening at http://localhost:${port}`);
  });
} catch (error) {
  console.error(`Unable to connect to MongoDB: ${error.message}`);
  console.error('Set MONGO_URI to a reachable MongoDB connection string and try again.');
  process.exitCode = 1;
}
