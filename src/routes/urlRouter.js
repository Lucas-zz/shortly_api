import { Router } from "express";
import { createUrl, deleteUrl, getUrl } from "../controllers/urlController.js";
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";
import { validateTokenMiddleware } from "../middlewares/validateTokenMiddleware.js";
import urlSchema from "../schemas/urlSchema.js";

const urlRouter = Router();
urlRouter.post('/urls/shorten', validateSchemaMiddleware(urlSchema), validateTokenMiddleware, createUrl);
urlRouter.get('/urls/:shortUrl', getUrl);
urlRouter.delete('/urls/:id', validateTokenMiddleware, deleteUrl);

export default urlRouter;