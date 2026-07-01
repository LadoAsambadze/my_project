'use client'

import { VendorBrowse } from '@/components/vendor/vendor-browse'
import { WORKS_CONFIG } from '@/components/vendor/vendor-configs'

export default function WorksPage() {
  return <VendorBrowse config={WORKS_CONFIG} />
}
