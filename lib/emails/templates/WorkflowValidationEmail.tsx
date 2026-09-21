import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface WorkflowValidationEmailProps {
  recipientName: string;

  workflowName: string;
  stepName: string;
  requestReference: string;

  requesterName: string;
  requesterEmail?: string;

  submittedAt?: string | Date;
  deadline?: string | Date;

  message?: string;

  actionUrl: string;
  actionLabel?: string;

  companyName?: string;
  applicationName?: string;
}

const formatDate = (
  value?: string | Date,
): string | null => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date
    ? value
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
};

export default function WorkflowValidationEmail({
  recipientName,
  workflowName,
  stepName,
  requestReference,
  requesterName,
  requesterEmail,
  submittedAt,
  deadline,
  message,
  actionUrl,
  actionLabel = "Consulter la demande",
  companyName = "T-OIL",
  applicationName = "INTRANET",
}: WorkflowValidationEmailProps) {
  const formattedSubmittedAt = formatDate(submittedAt);
  const formattedDeadline = formatDate(deadline);

  return (
    <Html lang="fr">
      <Head />

      <Preview>
        Action requise — {workflowName} — {requestReference}
      </Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* ================================
              HEADER
          ================================= */}

          <Section style={styles.header}>
            <Text style={styles.brand}>
              {companyName}
            </Text>

            <Text style={styles.application}>
              {applicationName}
            </Text>
          </Section>

          {/* ================================
              CONTENT
          ================================= */}

          <Section style={styles.content}>

            <Text style={styles.greeting}>
              Bonjour {recipientName},
            </Text>

            <Heading style={styles.title}>
              Une action est requise de votre part
            </Heading>

            <Text style={styles.introduction}>
              Une demande soumise dans le cadre du workflow{" "}
              <strong>{workflowName}</strong>{" "}
              nécessite votre intervention afin de poursuivre
              son traitement.
            </Text>

            {/* ================================
                REQUEST INFORMATION
            ================================= */}

            <Section style={styles.informationBox}>

              <Text style={styles.sectionTitle}>
                Informations de la demande
              </Text>

              <Hr style={styles.innerDivider} />

              <Section style={styles.row}>
                <Text style={styles.label}>
                  Référence
                </Text>

                <Text style={styles.value}>
                  {requestReference}
                </Text>
              </Section>

              <Section style={styles.row}>
                <Text style={styles.label}>
                  Workflow
                </Text>

                <Text style={styles.value}>
                  {workflowName}
                </Text>
              </Section>

              <Section style={styles.row}>
                <Text style={styles.label}>
                  Étape concernée
                </Text>

                <Text style={styles.value}>
                  {stepName}
                </Text>
              </Section>

              <Section style={styles.row}>
                <Text style={styles.label}>
                  Demandeur
                </Text>

                <Text style={styles.value}>
                  {requesterName}
                </Text>
              </Section>

              {requesterEmail && (
                <Section style={styles.row}>
                  <Text style={styles.label}>
                    Adresse e-mail
                  </Text>

                  <Text style={styles.value}>
                    {requesterEmail}
                  </Text>
                </Section>
              )}

              {formattedSubmittedAt && (
                <Section style={styles.row}>
                  <Text style={styles.label}>
                    Soumise le
                  </Text>

                  <Text style={styles.value}>
                    {formattedSubmittedAt}
                  </Text>
                </Section>
              )}

              {formattedDeadline && (
                <Section style={styles.row}>
                  <Text style={styles.label}>
                    Échéance
                  </Text>

                  <Text style={styles.value}>
                    {formattedDeadline}
                  </Text>
                </Section>
              )}

            </Section>

            {/* ================================
                MESSAGE
            ================================= */}

            {message && (
              <Section style={styles.messageSection}>

                <Text style={styles.sectionTitle}>
                  Information
                </Text>

                <Text style={styles.message}>
                  {message}
                </Text>

              </Section>
            )}

            {/* ================================
                ACTION
            ================================= */}

            <Section style={styles.actionSection}>

              <Button
                href={actionUrl}
                style={styles.button}
              >
                {actionLabel}
              </Button>

            </Section>

            <Text style={styles.actionHint}>
              Cliquez sur le bouton ci-dessus pour accéder à
              la demande et effectuer l'action attendue.
            </Text>

            {/* ================================
                FALLBACK URL
            ================================= */}

            <Section style={styles.fallbackSection}>

              <Text style={styles.fallbackTitle}>
                Accès direct
              </Text>

              <Text style={styles.fallbackText}>
                Si le bouton ci-dessus ne fonctionne pas,
                copiez et collez le lien suivant dans votre
                navigateur :
              </Text>

              <Text style={styles.url}>
                {actionUrl}
              </Text>

            </Section>

          </Section>

          {/* ================================
              FOOTER
          ================================= */}

          <Hr style={styles.divider} />

          <Section style={styles.footer}>

            <Text style={styles.footerText}>
              Cet e-mail a été généré automatiquement par{" "}
              {applicationName}.
            </Text>

            <Text style={styles.footerText}>
              Merci de ne pas répondre directement à ce message.
            </Text>

            <Text style={styles.footerCopyright}>
              © {new Date().getFullYear()} {companyName}
            </Text>

          </Section>

        </Container>
      </Body>
    </Html>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = {
  body: {
    margin: 0,
    padding: "32px 16px",
    backgroundColor: "#f4f6f8",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#17202a",
  },

  container: {
    maxWidth: "640px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e6ea",
  },

  header: {
    padding: "24px 32px",
    borderBottom: "1px solid #e2e6ea",
  },

  brand: {
    margin: 0,
    fontSize: "18px",
    lineHeight: "24px",
    fontWeight: "700",
    color: "#17365d",
    letterSpacing: "0.2px",
  },

  application: {
    margin: "3px 0 0",
    fontSize: "12px",
    lineHeight: "18px",
    color: "#68737d",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
  },

  content: {
    padding: "32px",
  },

  greeting: {
    margin: "0 0 20px",
    fontSize: "15px",
    lineHeight: "24px",
    color: "#34404a",
  },

  title: {
    margin: "0 0 16px",
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: "700",
    color: "#17202a",
  },

  introduction: {
    margin: "0 0 28px",
    fontSize: "15px",
    lineHeight: "24px",
    color: "#4d5963",
  },

  informationBox: {
    padding: "20px",
    backgroundColor: "#f8fafb",
    border: "1px solid #e2e6ea",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: "700",
    color: "#263746",
  },

  innerDivider: {
    margin: "14px 0 4px",
    borderColor: "#e2e6ea",
  },

  row: {
    display: "block",
    margin: 0,
    padding: "10px 0",
    borderBottom: "1px solid #edf0f2",
  },

  label: {
    margin: "0 0 3px",
    fontSize: "12px",
    lineHeight: "18px",
    fontWeight: "600",
    color: "#71808c",
  },

  value: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "21px",
    fontWeight: "500",
    color: "#263746",
  },

  messageSection: {
    marginTop: "28px",
  },

  message: {
    margin: "10px 0 0",
    padding: "14px 16px",
    backgroundColor: "#fafbfc",
    borderLeft: "3px solid #7b8791",
    fontSize: "14px",
    lineHeight: "22px",
    color: "#4d5963",
  },

  actionSection: {
    marginTop: "32px",
    textAlign: "center" as const,
  },

  button: {
    display: "inline-block",
    padding: "12px 24px",
    backgroundColor: "#17365d",
    color: "#ffffff",
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: "600",
    textDecoration: "none",
    borderRadius: "4px",
  },

  actionHint: {
    margin: "12px 0 0",
    textAlign: "center" as const,
    fontSize: "12px",
    lineHeight: "18px",
    color: "#7a858e",
  },

  fallbackSection: {
    marginTop: "28px",
    paddingTop: "20px",
    borderTop: "1px solid #e2e6ea",
  },

  fallbackTitle: {
    margin: "0 0 8px",
    fontSize: "13px",
    lineHeight: "19px",
    fontWeight: "700",
    color: "#34404a",
  },

  fallbackText: {
    margin: "0 0 8px",
    fontSize: "12px",
    lineHeight: "18px",
    color: "#7a858e",
  },

  url: {
    margin: 0,
    fontSize: "11px",
    lineHeight: "17px",
    color: "#52606d",
    wordBreak: "break-all" as const,
  },

  divider: {
    margin: 0,
    borderColor: "#e2e6ea",
  },

  footer: {
    padding: "20px 32px 24px",
    textAlign: "center" as const,
  },

  footerText: {
    margin: "3px 0",
    fontSize: "11px",
    lineHeight: "17px",
    color: "#89939b",
  },

  footerCopyright: {
    margin: "12px 0 0",
    fontSize: "11px",
    lineHeight: "17px",
    fontWeight: "600",
    color: "#68737d",
  },
};