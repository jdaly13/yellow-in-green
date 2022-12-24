import { json } from "@remix-run/server-runtime";
import { createQuestion } from "~/models/game.server";
export async function action({ request }) {
  if (request.method !== "POST") {
    return json({ message: "Method not allowed" }, 405);
  }
  const body = await request.json();
  console.log("body", body);

  return createQuestion(body.questionText, body.answerText, body.gameId);
}
