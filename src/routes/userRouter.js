import { Router } from "express";
import { createUser, getRanking, getUser, getUserInfo } from "../controllers/userController.js";
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";
import { validateTokenMiddleware } from "../middlewares/validateTokenMiddleware.js";
import userSchema from "../schemas/userSchema.js";

const userRouter = Router();

userRouter.post('/users', validateSchemaMiddleware(userSchema), createUser);
userRouter.get('/users', validateTokenMiddleware, getUser);
userRouter.get('/user/:id', getUserInfo);
userRouter.get('/users/ranking', getRanking);

export default userRouter;