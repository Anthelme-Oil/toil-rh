// import type { ComponentType } from "react";

// export type MailRecipient =
//   | string
//   | string[];

// export interface SendMailOptions<TProps = unknown> {
//   to?: MailRecipient;
//   cc?: MailRecipient;
//   bcc?: MailRecipient;

//   subject: string;

//   template: ComponentType<TProps>;

//   props: TProps;

//   replyTo?: string;
// }



import type { ReactElement } from "react";

export type MailRecipient =
  | string
  | string[];

export interface SendMailOptions<TProps = unknown> {
  to?: MailRecipient;
  cc?: MailRecipient;
  bcc?: MailRecipient;

  subject: string;

  template: (props: TProps) => ReactElement;

  props: TProps;

  replyTo?: string;
}