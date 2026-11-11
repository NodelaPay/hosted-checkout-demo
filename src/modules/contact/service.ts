import type { ContactMessageInput } from "./contact.dto";
import type { ContactRepository } from "./repository.contract";
import { ContactRepositoryFactory } from "./repository.factory";

export interface ContactServiceContract {
  submit(input: ContactMessageInput): Promise<string>;
}

export class ContactService implements ContactServiceContract {
  constructor(private readonly repository: ContactRepository) {}

  submit(input: ContactMessageInput): Promise<string> {
    return this.repository.save(input);
  }
}

export const contactService: ContactServiceContract = new ContactService(
  ContactRepositoryFactory.create(),
);
