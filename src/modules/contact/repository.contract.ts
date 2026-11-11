import type { ContactMessageInput } from "./contact.dto";

export interface ContactRepository {
  save(input: ContactMessageInput): Promise<string>;
}
