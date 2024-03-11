use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    program_pack::IsInitialized
};

use crate::{
    error::VotingError,
    state::{VoteOption, VotingStatus, VotingTopic},
};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum VotingInstruction {
    CreateVoteTopic { title: String, options: Vec<String> },
    CastVote { title: String, option: String },
    GetVoteCount { title: String },
}

pub fn create_vote_topic(
    account: &AccountInfo,
    title: &str,
    options: Vec<String>,
) -> ProgramResult {
    let topic_data: VotingTopic = VotingTopic::deserialize(&mut &account.data.borrow()[..])?;
    // Validations
    // Ensure accounts are correct
    if topic_data.is_initialized() {
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    if title.is_empty() || options.is_empty() {
        return Err(VotingError::InvalidInstructionParameter.into());
    }

    // Create a new voting topic
    let voting_topic: VotingTopic = VotingTopic {
        title: title.to_string(),
        status: VotingStatus::Open as u8,
        options: options
            .iter()
            .map(|label: &String| VoteOption {
                label: label.to_string(),
                votes: 0,
            })
            .collect(),
    };

    voting_topic.serialize(&mut &mut account.data.borrow_mut()[..])?;

    msg!("Voting topic: {} created successfully", title);
    Ok(())
}

pub fn cast_vote(account: &AccountInfo, title: &str, option: &str) -> ProgramResult {
    let mut topic_data: VotingTopic = VotingTopic::deserialize(&mut &account.data.borrow()[..])?;

    // Validations
    // Ensure accounts are correct
    if !topic_data.is_initialized() {
        return Err(ProgramError::UninitializedAccount);
    }

    if topic_data.title != title {
        return Err(VotingError::InvalidVotingTopic.into());
    }

    // Ensure accounts are correct
    if !topic_data.is_voting_open() {
        return Err(VotingError::VotingNotOpen.into());
    }

    let mut found_option = false;
    for opt in topic_data.options.iter_mut() {
        if opt.label == option {
            opt.votes += 1;
            found_option = true;
            break;
        }
    }

    if !found_option {
        return Err(VotingError::UnknownVotingOption.into());
    }

    topic_data.serialize(&mut &mut account.data.borrow_mut()[..])?;

    Ok(())
}

pub fn get_vote_count(account: &AccountInfo, title: &str) -> ProgramResult {
    let topic_data: VotingTopic = VotingTopic::deserialize(&mut &account.data.borrow()[..])?;

    // Validations
    // Ensure accounts are correct
    if !topic_data.is_initialized() {
        return Err(ProgramError::UninitializedAccount);
    }

    if topic_data.title != title {
        return Err(VotingError::InvalidVotingTopic.into());
    }

    let mut total_votes = 0;
    let mut votes_per_option: Vec<(String, u32)> = Vec::new();

    for opt in topic_data.options.iter() {
        total_votes += opt.votes;
        votes_per_option.push((opt.label.clone(), opt.votes));
    }

    // Log total votes
    msg!("Total Votes for {}: {}", title, total_votes);

    Ok(())
}
