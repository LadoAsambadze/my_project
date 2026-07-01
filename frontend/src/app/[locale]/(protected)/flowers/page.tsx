'use client'

import { VendorBrowse } from '@/components/vendor/vendor-browse'
import { FLORIST_CONFIG } from '@/components/vendor/vendor-configs'

export default function FlowersPage() {
  return <VendorBrowse config={FLORIST_CONFIG} />
}
