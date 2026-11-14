import { APP_NAME, emailSchema } from "@tasksathi/shared";

console.log(`${APP_NAME} API booting...`);
console.log("valid email ok:", emailSchema.safeParse("a@b.com").success);
console.log("bad email ok:", emailSchema.safeParse("nope").success);

