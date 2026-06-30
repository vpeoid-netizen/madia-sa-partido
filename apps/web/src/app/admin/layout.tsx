import { StaffGate } from '@/components/StaffGate';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <StaffGate roles={['admin', 'validator', 'owner']}>{children}</StaffGate>;
}
