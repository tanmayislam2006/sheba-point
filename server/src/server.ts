import app from "./app";
import { prisma } from "./app/libs/prisma";

const port = 5000;
async function run() {
  try {
    await prisma.$connect();
    console.log("Database Connected");
    app.listen(port, () => {
      console.log(`Server is running on port http://localhost:${port}`);
    });
  } catch (error) {
    await prisma.$disconnect();
    process.exit(1);
    console.error(error);
  }
}
run();
