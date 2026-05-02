import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Nav from "~/components/nav";
import "./app.css";

export default function App() {
  return (
    <Router
      root={props => (
        <>
          <Nav />
          <div class="mx-auto max-w-5xl px-4">
            <Suspense>{props.children}</Suspense>
          </div>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
