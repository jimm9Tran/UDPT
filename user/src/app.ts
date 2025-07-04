import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { NotFoundError, errorHandler } from '@jimm9tran/common';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { getUsersRouter } from './routes/get-users';
import { updateUserRouter } from './routes/update-user';
import { deleteUserRouter } from './routes/delete-user';
import { createAdminRouter } from './routes/create-admin';
import { healthRouter } from './routes/health';

const app = express();
app.set('trust proxy', true);
app.use(express.json());

// Health check first (no auth required)
app.use(healthRouter);

app.use(
  cookieSession({
    signed: false,
    // secure: process.env.NODE_ENV === 'production'
    secure: false, // For local development, set to false
    httpOnly: true,
  })
);

app.use(currentUserRouter);
app.use(getUsersRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);
app.use(updateUserRouter);
app.use(deleteUserRouter);
app.use(createAdminRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
