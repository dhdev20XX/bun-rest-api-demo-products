import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { db } from "./db/connection";
import { Database } from "bun:sqlite";

export const auth = betterAuth({
    trustedOrigins: ["http://localhost:5173"],
    database: db,
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        username()
    ]
});
