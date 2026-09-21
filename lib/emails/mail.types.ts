import type { ComponentType } from "react";

export type MailRecipient =
  | string
  | string[];

export interface SendMailOptions<TProps = unknown> {
  to?: MailRecipient;
  cc?: MailRecipient;
  bcc?: MailRecipient;

  subject: string;

  template: ComponentType<TProps>;

  props: TProps;

  replyTo?: string;
}