import { Response, Request } from "express";
import { injectable } from "tsyringe";
import logger from "../utils/logger";
import VoteService from "../services/vote.service";
import { Cluster, clusterApiUrl } from "@solana/web3.js";
import { CLUSTER, PROGRAM_ID } from "../config/constants";

@injectable()
class VoteController {
  private logPrefix: string;
  private readonly voteService: VoteService;

  constructor() {
    this.logPrefix = "[VOTE_CONTROLLER]";
    this.voteService = new VoteService(
      clusterApiUrl(CLUSTER as Cluster),
      PROGRAM_ID
    );
  }

  public async createVoteTopic(req: Request, res: Response): Promise<void> {
    try {
      const { title, options } = req.body;
      const data = await this.voteService.createVoteTopic(title, options);

      res
        .status(200)
        .json({ message: "Successfully created vote topic", data });
    } catch (error: any) {
      logger.error(`${this.logPrefix} ${error.message}`);
      res.status(500).json({ message: error?.message || "Something went wrong" });
    }
  }

  public async castVotes(req: Request, res: Response): Promise<void> {
    try {
      const { title, option, pubKey } = req.body;
      const data = await this.voteService.castVote(title, option, pubKey);
      res.status(200).json({ message: "Successfully casted your vote", data });
    } catch (error: any) {
      logger.error(`${this.logPrefix} ${error.message}`);
      res.status(500).json({ message: error?.message || "Something went wrong" });
    }
  }

  public async fetchVotesCount(req: Request, res: Response): Promise<void> {
    try {
      const topicPubKey: string = req.params.topicPubKey;
      const data = await this.voteService.fetchVotesCount(topicPubKey);

      res.status(200).json({ message: "Successfully fetched votes data", data });
    } catch (error: any) {
      logger.error(`${this.logPrefix} ${error.message}`);
      res.status(500).json({ message: error?.message || "Something went wrong" });
    }
  }

  public async fetchAllTopics(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.voteService.fetchAllTopics();

      res.status(200).json({ message: "Successfully fetched topics", data });
    } catch (error: any) {
      logger.error(`${this.logPrefix} ${error.message}`);
      res.status(500).json({ message: error?.message || "Something went wrong" });
    }
  }
}

export default VoteController;
