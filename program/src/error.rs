use thiserror::Error;
use solana_program::program_error::ProgramError;

#[derive(Error, Debug, Copy, Clone)]
pub enum VotingError {
    /// Invalid instruction
    #[error("Invalid Instruction")]
    InvalidInstruction,

    /// Invalid agreement status
    #[error("Topic not open for voting")]
    VotingNotOpen,

    /// Invalid program instruction parameters
    #[error("Invalid program instruction parameters")]
    InvalidInstructionParameter,

    /// Invalid voting topic title
    #[error("Invalid voting topic title")]
    InvalidVotingTopic,

    /// Invalid voting option
    #[error("Invalid voting option")]
    UnknownVotingOption,
}

impl From<VotingError> for ProgramError {
    fn from(e: VotingError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
