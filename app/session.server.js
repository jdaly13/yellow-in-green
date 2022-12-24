import { createCookieSessionStorage, json } from "@remix-run/node";
import invariant from "tiny-invariant";

import { getUserById } from "~/models/monday-morning.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "admin_session",
    httpOnly: true,
    path: "/monday-morning",
    sameSite: "lax",
    maxAge: 60,
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "userId";

export async function getSession(request) {
  const cookie = request.headers.get("Cookie");
  console.log({ cookie });
  return sessionStorage.getSession(cookie);
}

export async function getUserId(request) {
  const session = await getSession(request);
  console.log({ session });
  const userId = session.get(USER_SESSION_KEY);
  return userId;
}

export async function getUser(request) {
  const userId = await getUserId(request);
  if (userId === undefined) return null;

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function createUserSession({ request, userId }) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  return json(
    { test: "test" },
    {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session, {
          maxAge: 60,
        }),
      },
    }
  );
}

export async function logout(request) {
  const session = await getSession(request);
  return json(
    { logout: true },
    {
      headers: {
        "Set-Cookie": await sessionStorage.destroySession(session),
      },
    }
  );
}
