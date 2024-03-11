use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::program_pack::IsInitialized;

#[derive(Debug, BorshDeserialize, BorshSerialize)]
pub struct VoteOption {
    /// Option label
    pub label: String,

    /// Vote count for the option
    pub votes: u32,
}

/// Voting account state
#[derive(Debug, BorshDeserialize, BorshSerialize)]
pub struct VotingTopic {
    /// Voting topic title
    pub title: String,

    /// Current proposal state
    pub status: u8,

    /// Voting options
    pub options: Vec<VoteOption>,
}

#[derive(Clone, Debug)]
pub enum VotingStatus {
    /// uninitialized
    Uninitialized = 0,

    /// Taking votes
    Open
}

/// Is the `Voting Account` initialized?
impl IsInitialized for VotingTopic {
    fn is_initialized(&self) -> bool {
        self.status != VotingStatus::Uninitialized as u8
    }
}

impl VotingTopic {
    /// Is the voting topic open for voting?
    pub fn is_voting_open(&self) -> bool {
        self.status == VotingStatus::Open as u8
    }
}