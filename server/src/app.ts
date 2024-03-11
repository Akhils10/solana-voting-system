import "reflect-metadata";
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import voteRoutesV1 from "./routes/vote.route";
import { injectable } from "tsyringe";
import cors from 'cors';

dotenv.config();

@injectable()
class App {
  private expressApp: Express;
  private port: number;
  private env: string;

  constructor(private readonly voteRoutesV1: voteRoutesV1) {
    this.expressApp = express();
    this.expressApp.use(express.json())
    this.expressApp.use(cors({
      origin: '*',
      allowedHeaders: '*'
    }))
    this.port = Number(process.env.PORT) || 3000;
    this.env = process.env.NODE_ENV || "development";
    this.voteRoutesV1 = voteRoutesV1;
    this.configureRoutes();
  }

  private configureRoutes(): void {
    this.expressApp.get("/", this.handleRootRequest);
    this.expressApp.get("/health", this.handleHealthRequest);
    this.expressApp.use("/api/v1/vote", this.voteRoutesV1.getRouter());
  }

  private handleRootRequest(req: Request, res: Response): void {
    res.json({ message: "Welcome to Voting system" });
  }

  private handleHealthRequest(req: Request, res: Response): void {
    res.json({ status: "OK" });
  }

  public start(port: number): void {
    this.expressApp.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }

  public getExpressApp(): Express {
    return this.expressApp;
  }

  public getPort(): number {
    return this.port;
  }

  public getEnv(): string {
    return this.env;
  }

  public use(...args: any[]): void {
    this.expressApp.use(...args);
  }

  public listen(port: number, callback?: () => void): void {
    this.expressApp.listen(port, callback);
  }
}

export default App;
