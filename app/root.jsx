import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

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
      </body>
    </html>
  );
}
