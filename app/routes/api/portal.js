import { json } from "@remix-run/server-runtime";
import { checkAccount } from "~/utils";

export async function loader({ request }) {
  const urlToSearch = new URL(request.url);
  const address = urlToSearch.searchParams.get("address");
  const match = checkAccount(address);
  return json({
    match,
  });
}
