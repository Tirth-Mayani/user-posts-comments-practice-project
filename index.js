const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const errorHandler = require("./middlewares/errorMiddleware");

const PORT = process.env.PORT || 3000;

app.use(cors({origin: `http://localhost:${PORT}`}));
app.use(express.json({limit: "10mb"}));

app.use("/api/auth", authRoutes);


app.use(errorHandler);


app.get("/", (req, res) => {
    res.send("Server is running here.");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});