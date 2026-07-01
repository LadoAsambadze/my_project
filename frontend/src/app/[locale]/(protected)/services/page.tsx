'use client'

import { VendorBrowse } from '@/components/vendor/vendor-browse'
import { OFFERINGS_CONFIG } from '@/components/vendor/vendor-configs'

export default function ServicesPage() {
  return <VendorBrowse config={OFFERINGS_CONFIG} />
}
