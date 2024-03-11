import "reflect-metadata";
import errorHandler from "errorhandler";
import App from "./app";
import { container, injectable } from "tsyringe";
import { registerDependencies } from "./dependency";

const app = container.resolve(App);
registerDependencies();

@injectable()
class Server {
  constructor(private readonly app: App) {
    this.app = app;

    if (process.env.NODE_ENV === "development") {
      this.app.use(errorHandler());
    }
  }

  public start(): void {
    const port = this.app.getPort();
    const env = this.app.getEnv();

    const server = this.app.listen(port, () => {
      console.log(`App is running at http://localhost:${port} in ${env} mode`);
      console.log("Press CTRL-C to stop\n");
    });
  }
}

const server = new Server(app);
server.start();

export default server;
//42   Best CryptocurrencyBTCSOL
