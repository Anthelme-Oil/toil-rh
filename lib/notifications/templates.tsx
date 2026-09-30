import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';

export interface NotificationTemplateInput {
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}

export function notificationEmailTemplate({
  title,
  message,
  actionUrl,
  actionLabel = 'Consulter',
}: NotificationTemplateInput) {
  return (
    <Html>
      <Head />

      <Preview>{title}</Preview>

      <Body
        style={{
          margin: 0,
          padding: '24px',
          backgroundColor: '#f5f7fa',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            padding: '32px',
            borderRadius: '8px',
          }}
        >
          <Section>
            <Text
              style={{
                margin: '0 0 20px',
                fontSize: '22px',
                fontWeight: '600',
                color: '#1f2937',
              }}
            >
              {title}
            </Text>

            <Text
              style={{
                margin: '0 0 24px',
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#374151',
              }}
            >
              {message}
            </Text>

            {actionUrl && (
              <Button
                href={actionUrl}
                style={{
                  display: 'inline-block',
                  padding: '10px 16px',
                  backgroundColor: '#0f766e',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '6px',
                }}
              >
                {actionLabel}
              </Button>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}