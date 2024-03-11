use crate::instruction::{self, VotingInstruction};
use borsh::BorshDeserialize;
use instruction::{cast_vote, create_vote_topic, get_vote_count};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

 /// Function that will be called by the program's entry point
pub fn process(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Voting system program!");
    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;

    if account.owner != program_id {
        msg!("Account is not owned by this program!");
        return Err(ProgramError::IncorrectProgramId);
    }

    let instruction: VotingInstruction = VotingInstruction::try_from_slice(instruction_data)?;

    match instruction {
        VotingInstruction::CreateVoteTopic { title, options } => {
            create_vote_topic(account, &title, options)
        }
        VotingInstruction::CastVote { title, option } => cast_vote(account, &title, &option),
        VotingInstruction::GetVoteCount { title } => get_vote_count(account, &title),
    }
}