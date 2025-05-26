import express from 'express';
import 'express-async-errors';
import { errorHandler } from '@thasup-dev/common';

import { createProductRouter } from './routes/create-product';
import { updateProductRouter } from './routes/update-product';
import { deleteProductRouter } from './routes/delete-product';

const app = express();
app.use(express.json());

app.use(createProductRouter);
app.use(updateProductRouter);
app.use(deleteProductRouter);

app.use(errorHandler);

export { app };