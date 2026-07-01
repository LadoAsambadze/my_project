'use client'

import { VendorBrowse } from '@/components/vendor/vendor-browse'
import { DESIGNS_CONFIG } from '@/components/vendor/vendor-configs'

export default function DesignsPage() {
  return <VendorBrowse config={DESIGNS_CONFIG} />
}
