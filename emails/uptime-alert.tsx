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
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

interface UptimeAlertEmailProps {
  projectName: string;
  projectUrl?: string;
  dashboardUrl?: string;
}

export const UptimeAlertEmail = ({
  projectName = 'Your Project',
  projectUrl = 'https://example.com',
  dashboardUrl = 'https://lynxhost.app/dashboard',
}: UptimeAlertEmailProps) => (
  <Html>
    <Head />
    <Preview>Downtime alert — {projectName} is unreachable</Preview>
    <Tailwind>
      <Body className="bg-[#020817] my-auto mx-auto font-sans text-white">
        <Container className="border border-amber-500/20 rounded-2xl p-10 overflow-hidden shadow-2xl mt-10">
          <Section className="text-center mb-8">
            <Text className="text-3xl font-bold tracking-tight">Lynx Host</Text>
          </Section>

          <Heading className="text-2xl font-bold text-center mb-4 text-amber-500">
            Downtime Detected
          </Heading>

          <Text className="text-slate-400 text-center mb-8">
            Our monitoring service has detected that <strong>{projectName}</strong> is currently
            unreachable at {projectUrl}.
          </Text>

          <Section className="bg-amber-500/5 rounded-xl p-6 border border-amber-500/20 mb-8">
            <Text className="text-xs text-slate-400 text-center">
              We are automatically attempting to restart the container. Check the service status and
              logs in your dashboard.
            </Text>
          </Section>

          <Section className="text-center">
            <Button
              className="bg-amber-500 rounded-lg text-white text-sm font-bold px-8 py-3 no-underline inline-block mr-4"
              href={dashboardUrl}
            >
              Check Status
            </Button>
            <Button
              className="bg-transparent border border-[#1e293b] rounded-lg text-slate-400 text-sm font-bold px-8 py-3 no-underline inline-block"
              href={projectUrl}
            >
              Visit URL
            </Button>
          </Section>

          <Hr className="border-white/5 my-10" />

          <Text className="text-xs text-slate-500 text-center">
            You received this notification because uptime monitoring is enabled for this project.
            <br />
            Lynx Host
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default UptimeAlertEmail;

