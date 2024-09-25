import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from "@remix-run/react";
import { CAPTCHA_ID } from "./utils";

import tailwindStylesheetUrl from "./styles/tailwind.css";

export const links = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta = () => ({
  charset: "utf-8",
  title: "Yellow in Green Trivia",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  const matches = useMatches();
  const isFaucetUser = matches.find(
    (m) => m.pathname.indexOf("/faucet") !== -1
  );
  return (
    <html
      lang="en"
      data-theme="lemonade"
      className="h-full bg-base-200 font-mono"
    >
      <head>
        <Meta />
        <Links />
      </head>
      <body className=" ">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        {isFaucetUser && (
          <>
            <script
              src={`https://www.google.com/recaptcha/enterprise.js?render=${CAPTCHA_ID}`}
              async
              defer
            ></script>
          </>
        )}
      </body>
    </html>
  );
}
