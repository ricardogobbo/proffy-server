import express from "express";

// Swagger UI Express imports
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";

// App Controllers
import ClassesController from "./controllers/ClassesController";
import ConnectionsController from "./controllers/ConnectionsController";

// Router object
const router = express.Router();

// Routes for Swagger UI
router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(swaggerDocument));

// Routes for ClassesController
const classesController = new ClassesController();
router.get("/classes", classesController.index);
router.post("/classes", classesController.create);

// Routes for ConnectionsController
const connectionsController = new ConnectionsController();
router.get("/connections", connectionsController.index);
router.post("/connections", connectionsController.create);

export default router;
