import express, { Router } from "express";
import { injectable } from "tsyringe";
import VoteController from "../controllers/vote.controller";

@injectable()
class VoteRouter {
  private router: Router;

  constructor(private readonly voteController: VoteController) {
    this.router = express.Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/create", this.voteController.createVoteTopic.bind(this.voteController));
    this.router.post("/cast", this.voteController.castVotes.bind(this.voteController));
    this.router.get("/fetch-vote-count/:topicPubKey", this.voteController.fetchVotesCount.bind(this.voteController));
    this.router.get("/fetch-all-topics", this.voteController.fetchAllTopics.bind(this.voteController));
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default VoteRouter;
