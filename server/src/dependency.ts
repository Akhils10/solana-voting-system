import { container } from "tsyringe";
import VoteService from "./services/vote.service";
import VoteController from "./controllers/vote.controller";

export function registerDependencies(): void {
  container.register<VoteService>("VoteService", { useClass: VoteService });
  container.register<VoteController>("VoteController", { useClass: VoteController });
}
