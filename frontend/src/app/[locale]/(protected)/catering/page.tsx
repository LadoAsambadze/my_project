'use client'

import { VendorBrowse } from '@/components/vendor/vendor-browse'
import { CATERING_CONFIG } from '@/components/vendor/vendor-configs'

export default function CateringPage() {
  return <VendorBrowse config={CATERING_CONFIG} />
}
