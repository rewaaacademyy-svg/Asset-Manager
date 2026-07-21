import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import studentsRouter from "./students";
import teachersRouter from "./teachers";
import classesRouter from "./classes";
import achievementsRouter from "./achievements";
import notificationsRouter from "./notifications";
import attendanceRouter from "./attendance";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(studentsRouter);
router.use(teachersRouter);
router.use(classesRouter);
router.use(achievementsRouter);
router.use(notificationsRouter);
router.use(attendanceRouter);
router.use(statsRouter);

export default router;
