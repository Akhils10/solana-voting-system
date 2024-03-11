import { newVotingInstructionSchema, votingTopicAccountSchema } from "./instructions";
import * as Borsh from 'borsh'

export function serialize(args: any){
    const instruction = Borsh.serialize(newVotingInstructionSchema as any, args);
    return Buffer.from(instruction)
}

export function deserialize(data: Buffer) {
    const d = Borsh.deserialize(votingTopicAccountSchema, data)
    return d
}

