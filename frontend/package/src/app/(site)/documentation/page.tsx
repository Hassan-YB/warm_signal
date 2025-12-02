import { Documentation } from '@/app/components/Documentation/Documentation'
import { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Documentation | Signal Trace',
}

export default function Page() {
  return (
    <>
      <Documentation />
    </>
  )
}
