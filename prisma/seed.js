const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      username: "demo",
      email: "demo@example.com",
      passwordHash: "CHANGE_ME",
    },
  });

  const video = await prisma.video.create({
    data: {
      ownerId: user.id,
      storageProvider: "S3",
      filePath: "s3://example-bucket/uploads/demo.mp4",
      status: "PENDING",
      durationSeconds: null,
      originalFilename: "demo.mp4",
      mimeType: "video/mp4",
      sizeBytes: BigInt(0),
    },
  });

  await prisma.job.create({
    data: {
      videoId: video.id,
      type: "TRANSCRIBE",
      status: "QUEUED",
      priority: 10,
    },
  });

  // eslint-disable-next-line no-console
  console.log("Seed completed:", { userId: user.id, videoId: video.id });
}

main()
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

