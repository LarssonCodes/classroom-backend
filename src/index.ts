import cors from "cors";
import express from "express";
import subjectsRouter from "./routes/subjects.js";
import securityMiddleware from "./middleware/security.js";
import {toNodeHandler} from "better-auth/node";
import {auth} from "./lib/auth.js";

const app = express();
const PORT = 8000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (origin && allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    credentials: true, // allow cookies
  }),
);
app.all('/api/auth/*spat',toNodeHandler(auth));
app.use(express.json());

app.use(securityMiddleware);

app.use("/api/subjects", subjectsRouter);

app.get("/", (req, res) => {
    res.send("Backend server is running!");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});