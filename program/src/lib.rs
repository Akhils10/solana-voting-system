mod error;
mod instruction;
mod processor;
mod state;

use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, pubkey::Pubkey,
};

// Program's entry point
entrypoint!(process_instruction);
fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    processor::process(program_id, accounts, instruction_data)
}

#[cfg(test)]
mod tests {
    use borsh::{BorshDeserialize, BorshSerialize};
    use solana_program::{account_info::AccountInfo, clock::Epoch, msg, pubkey::Pubkey};

    use crate::{
        instruction::VotingInstruction,
        process_instruction,
        state::{VotingStatus, VotingTopic},
    };

    #[test]
    fn test_instructions() {
        let program_id = Pubkey::default();

        let key = Pubkey::default();
        let mut lamports = 0;
        let mut data = vec![0; 1024]; // Larger storage to accommodate data
        let owner = program_id; // Ensure the account is owned by the program
        let account_info = AccountInfo::new(
            &key,
            false,
            true,
            &mut lamports,
            &mut data,
            &owner,
            false,
            Epoch::default(),
        );

        // Test Create topic
        let title = "Best Crypto".to_string();
        let options = vec!["BTC".to_string(), "ETH".to_string(), "SOL".to_string()];
        let create_topic_instruction: VotingInstruction = VotingInstruction::CreateVoteTopic {
            title: title.clone(),
            options,
        };
        let mut serialized_data = Vec::new();
        create_topic_instruction
            .serialize(&mut serialized_data)
            .unwrap();

        let result_1 = process_instruction(&program_id, &[account_info.clone()], &serialized_data);
        assert!(
            result_1.is_ok(),
            "Instruction processing failed: {:?}",
            result_1
        );

        // Test casting vote on topic
        let cast_vote_instruction: VotingInstruction = VotingInstruction::CastVote {
            title: title.clone(),
            option: "BTC".to_string(),
        };
        serialized_data.clear();
        cast_vote_instruction
            .serialize(&mut serialized_data)
            .unwrap();
        let result_2 = process_instruction(&program_id, &[account_info.clone()], &serialized_data);
        assert!(
            result_2.is_ok(),
            "Instruction processing failed: {:?}",
            result_2
        );

        // Test vote counts and summarize all tests
        let get_votes_instruction: VotingInstruction = VotingInstruction::GetVoteCount {
            title: title.clone(),
        };
        serialized_data.clear();
        get_votes_instruction
            .serialize(&mut serialized_data)
            .unwrap();
        let result_3 = process_instruction(&program_id, &[account_info.clone()], &serialized_data);
        msg!("Result 3:: {:?}", result_3);
        assert!(
            result_3.is_ok(),
            "Getting vote counts failed: {:?}",
            result_3
        );

        let voting_topic_data: VotingTopic =
            VotingTopic::deserialize(&mut &account_info.data.borrow()[..]).unwrap();

        assert_eq!(voting_topic_data.title, title); // Best Crypto
        assert_eq!(voting_topic_data.status, VotingStatus::Open as u8); // Voting status should be open to voting
        assert_eq!(voting_topic_data.options.len(), 3); // Options length should be 3
        assert_eq!(voting_topic_data.options[0].label, "BTC");
        assert_eq!(voting_topic_data.options[1].label, "ETH");
        assert_eq!(voting_topic_data.options[2].label, "SOL");
        assert_eq!(voting_topic_data.options[0].votes, 1); // BTC has 1 vote
        assert_eq!(voting_topic_data.options[1].votes, 0); // ETH has 0 vote
        assert_eq!(voting_topic_data.options[2].votes, 0); // SOL has 0 vote
    }
}
