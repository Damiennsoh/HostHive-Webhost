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

interface DeploySuccessEmailProps {
  projectName: string;
  projectUrl?: string;
  branchName?: string;
  commitMessage?: string;
  dashboardUrl?: string;
}

export const DeploySuccessEmail = ({
  projectName = 'Your Project',
  projectUrl = 'https://example.com',
  branchName = 'main',
  commitMessage = 'Initial commit',
  dashboardUrl = 'https://hosthive.app/dashboard',
}: DeploySuccessEmailProps) => (
  <Html>
    <Head />
    <Preview>Successfully deployed {projectName}</Preview>
    <Tailwind>
      <Body className="bg-[#020817] my-auto mx-auto font-sans text-white">
        <Container className="border border-white/5 rounded-2xl p-10 overflow-hidden shadow-2xl mt-10">
          <Section className="text-center mb-8">
            <Text className="text-3xl font-bold tracking-tight">LynxHost</Text>
          </Section>

          <Heading className="text-2xl font-bold text-center mb-4">
            Deployment Successful!
          </Heading>

          <Text className="text-slate-400 text-center mb-8">
            Your project <strong>{projectName}</strong> is now live and SSL protected.
          </Text>

          <Section className="bg-slate-900/50 rounded-xl p-6 border border-white/5 mb-8">
            <div className="mb-4">
              <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Project
              </Text>
              <Text className="m-0 text-sm font-semibold">{projectName}</Text>
            </div>
            <motionBlock label="Branch" value={branchName} />
            <motionBlock label="Commit" value={`"${commitMessage}"`} italic />
          </Section>

          <Section className="text-center">
            <Button
              className="bg-[#0ea5e9] rounded-lg text-white text-sm font-bold px-8 py-3 no-underline inline-block mr-4"
              href={projectUrl}
            >
              Visit Live Site
            </Button>
            <Button
              className="bg-transparent border border-[#1e293b] rounded-lg text-slate-400 text-sm font-bold px-8 py-3 no-underline inline-block"
              href={dashboardUrl}
            >
              View Dashboard
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

function motionBlock({
  label,
  value,
  italic,
}: {
  label: string;
  value: string;
  italic?: boolean;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
        {label}
      </Text>
      <Text className={`m-0 text-sm font-semibold ${italic ? 'italic text-slate-300' : ''}`}>
        {value}
      </Text>
    </div>
  );
}

export default DeploySuccessEmail;
