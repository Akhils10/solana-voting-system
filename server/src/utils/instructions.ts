class VoteOption {
  label: string;
  votes: number;

  constructor(args: { label: string; votes: number }) {
    this.label = args.label;
    this.votes = args.votes;
  }
}

export class VotingTopicAccountArgs {
  title: string;
  status: number;
  options: VoteOption[];

  constructor(args: { title: string; status: number; options: VoteOption[] }) {
    this.title = args.title;
    this.status = args.status;
    this.options = args.options;
  }
}

enum Instructions {
  CreateVoteTopic = 0,
  CastVote = 1,
  GetVoteCount = 2,
}

export class CreateVoteTopicArgs {
  instruction: Instructions = Instructions.CreateVoteTopic;
  title: string;
  options: string[];

  constructor(args: { title: string; options: string[] }) {
    this.title = args.title;
    this.options = args.options;
  }
}

export class CastVoteArgs {
  instruction: Instructions = Instructions.CastVote;
  title: string;
  option: string;

  constructor(args: { title: string; option: string }) {
    this.title = args.title;
    this.option = args.option;
  }
}

export class GetVoteCountArgs {
  instruction: Instructions = Instructions.GetVoteCount;
  title: string;

  constructor(args: { title: string }) {
    this.title = args.title;
  }
}

export function votingSchema() {
  return new Map<Function, any>([
    [
      CreateVoteTopicArgs,
      {
        kind: "struct",
        fields: [
          ["instruction", "u8"],
          ["title", "string"],
          ["options", ["string"]],
        ],
      },
    ],
    [
      CastVoteArgs,
      {
        kind: "struct",
        fields: [
          ["instruction", "u8"],
          ["title", "string"],
          ["option", "string"],
        ],
      },
    ],
    [
      GetVoteCountArgs,
      {
        kind: "struct",
        fields: [
          ["instruction", "u8"],
          ["title", "string"],
        ],
      },
    ],
  ]);
}

export const votingTopicAccountSchema = {
  struct: {
    title: "string",
    status: "u8",
    options: {
      array: { type: { struct: { label: "string", votes: "u32" } } },
    },
  },
};

// { enum: [ { struct: { className1: structSchema1 } }, { struct: { className2: structSchema2 } }, ... ] }

export const newVotingInstructionSchema = {
  enum: [
    {
      struct: {
        CreateVoteTopicArgs: {
          struct: {
            title: "string",
            options: { array: { type: "string" } },
          },
        },
      }
    },
    {
        struct: {
            CastVoteArgs: {
                struct: {
                  title: "string",
                  option: "string",
                },
              },
        }
      },
      {
        struct: {
            GetVoteCountArgs: {
                struct: {
                  title: "string",
                },
              },
        }
      },
  ],
};
