const { PrismaClient } = require("@prisma/client");
const { scryptSync, randomBytes } = require("crypto");

const prisma = new PrismaClient();

const SALT_LEN = 16;
const KEY_LEN = 64;
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1 };

async function main() {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: "demo@avalabs.com" },
    });

    if (existing) {
      console.log("Demo user already exists:", existing.email);
      return;
    }
  } catch (e) {
    // Table might not exist, continue
  }

  const salt = randomBytes(SALT_LEN).toString("hex");
  const hash = scryptSync("demo123", salt, KEY_LEN, SCRYPT_OPTS).toString("hex");
  const passwordHash = `${salt}.${hash}`;

  try {
    const user = await prisma.user.create({
      data: {
        username: "demo",
        email: "demo@avalabs.com",
        passwordHash,
      },
    });
    console.log("Demo user created:", user.email);
  } catch (e) {
    console.error("Error detail:", e.message);
    console.error("Code:", e.code);
    console.error("Meta:", JSON.stringify(e.meta));
  }
}

main()
  .finally(() => prisma.$disconnect());
