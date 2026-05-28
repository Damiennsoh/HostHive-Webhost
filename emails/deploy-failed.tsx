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

interface DeployFailedEmailProps {
  projectName: string;
  errorMessage?: string;
  branchName?: string;
  commitMessage?: string;
  dashboardUrl?: string;
}

export const DeployFailedEmail = ({
  projectName = 'Your Project',
  errorMessage = 'Build failed unexpectedly during nixpacks execution',
  branchName = 'main',
  commitMessage = 'Refactor types',
  dashboardUrl = 'https://hosthive.app/dashboard',
}: DeployFailedEmailProps) => (
  <Html>
    <Head />
    <Preview>Deployment failed — {projectName}</Preview>
    <Tailwind>
      <Body className="bg-[#020817] my-auto mx-auto font-sans text-white">
        <Container className="border border-red-500/20 rounded-2xl p-10 overflow-hidden shadow-2xl mt-10">
          <Section className="text-center mb-8">
            <Text className="text-3xl font-bold tracking-tight">LynxHost</Text>
          </Section>

          <Heading className="text-2xl font-bold text-center mb-4 text-red-500">
            Deployment Failed
          </Heading>

          <Text className="text-slate-400 text-center mb-8">
            Something went wrong while building <strong>{projectName}</strong>. Your previous
            deployment is still running.
          </Text>

          <Section className="bg-red-500/5 rounded-xl p-6 border border-red-500/20 mb-8">
            <Text className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest mb-2">
              Error Message
            </Text>
            <Text className="m-0 text-sm font-mono text-red-400 bg-black/40 p-3 rounded">
              {errorMessage}
            </Text>
          </Section>

          <Section className="text-center">
            <Button
              className="bg-red-500 rounded-lg text-white text-sm font-bold px-8 py-3 no-underline inline-block"
              href={dashboardUrl}
            >
              Review Build Logs
            </Button>
          </Section>

          <Hr className="border-white/5 my-10" />

          <Text className="text-xs text-slate-500 text-center">
            You received this notification because you have email alerts enabled for deployment
            status.
            <br />
            LynxHost
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default DeployFailedEmail;
