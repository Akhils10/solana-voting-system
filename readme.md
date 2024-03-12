## Voting system

/programs
/server

### Implementation considerations

A get_vote_count("Best Crypto")’ function is required from reqested task specifications to return the current count of votes for each option.

Solana programs entrypoints should return the ProgramResult (ResultGeneric<(), ProgramError>). The data stored is fetching directly from the storage account's data property. However, I wrote the function but instead of returning, log the vote count to program logs. On the nodejs backend, an api and test is provided to implement this function. 

Program's entry point
Instructions sent to the program triggers the `process_instruction` function
The processor deserializes the instruction to get the actual instruction and then route the execution to the neccessary function. 
The accounts array holds the account the program will write data to and should be marked as writable.
Each voting topic is stored in it's own account.

Also, please note that this program is only a simple voting program and some other factors need to be put in place for a robust and comprehensive voting program. Each voting topic is created on it's own account which is a better structure for the voting system. So, a single topic represents an account. To vote on the topic, the program will be passed the account in the [accounts].

To close a topic, we simply just need to close the account

### Imorovement considerations
To futher improve on the program, the `VotingTopic` state should track the duration for the vote, pubKey of the owner, etc. The owner will be able to reemove or add more options, temporarily pause the voting and be able to schedule when voting begins.

Also, while a few edge cases have been handled in the program and the error abstracted, a proper error handling can be implemented in the NodeJS backend. I didn't do much besides regular validation because of time and my health. 


# Program.
The solana program code lives in /program folder.
You can build and deploy the program either locally or in [Solana Playground: https://beta.solpg.io/65efdd2ecffcf4b13384cf98](https://beta.solpg.io/65efdd2ecffcf4b13384cf98).
The lib.rs code also contains a test mod for running unit test on the program's functionalities.

# Server

```bash
cd server
yarn
```

create .env file and paste contents of .env.example (copy .env ./env.example). This is a required step

```bash
yarn dev
```

To run the test suite, run 

```bash
yarn test
```

# Client
See readme in [https://github.com/akhils/voting-system-ui](https://github.com/akhils/voting-system-ui).

For a full executionflow, first deploy the program, change the PROGRAM_ID variable in .env file in the server, then start the server and the client

