import ProvidersClient from './providers.client';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ProvidersClient>{children}</ProvidersClient>;
}
