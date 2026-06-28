import path from "path";
import { createRequire } from "node:module";
import { setDefaultResultOrder } from "node:dns";
import { createServer as createViteServer } from "vite";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { type HttpBindings } from "@hono/node-server";
import setup from "./lib/setup";
import { logger } from "./lib/utils";
import config from "./lib/config";

setDefaultResultOrder("ipv6first");

const require = createRequire(import.meta.url);
const webs = [
  { name: config.webTheme, publicPath: "/" },
  { name: "hotaru-admin", publicPath: "/admin" },
];

let { port } = config;
const createViteMiddleware = async (name: string, publicPath: string) => {
  const vite = await createViteServer({
    root: path.dirname(require.resolve(`${name}/package.json`)),
    server: {
      hmr: {
        port: ++port,
      },
      middlewareMode: true,
    },
  });

  return createMiddleware<{ Bindings: HttpBindings }>(async (c, next) => {
    const url = c.req.path;
    if (url.startsWith("/api") || !url.startsWith(publicPath)) {
      return next();
    }
    return new Promise<void>((resolve) => {
      vite.middlewares(c.env.incoming, c.env.outgoing, () => {
        resolve(next());
      });
    });
  });
};

const app = new Hono<{ Bindings: HttpBindings }>();

const adminMiddleware = await createViteMiddleware("hotaru-admin", "/admin");
const webMiddleware = await createViteMiddleware(config.webTheme, "/");

app.use("*", adminMiddleware);
app.use("*", webMiddleware);

const [server, ipc] = await setup(app);

server.listen(config.port, () =>
  logger.info(`🎉  NodeStatus is listening on http://127.0.0.1:${config.port}`),
);

ipc &&
  ipc.listen(config.ipcAddress, () =>
    logger.info(`🎉  NodeStatus Ipc is listening on ${config.ipcAddress}`),
  );
