import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { enquiry_id, district } = req.body

  // 1. Find approved vendors in same district
  const { data: vendors, error } = await sb
    .from('vendors')
    .select('*')
    .eq('district', district)
    .eq('is_approved', true)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  // 2. Create leads
  if (vendors && vendors.length > 0) {
    const leads = vendors.map(v => ({
      enquiry_id,
      vendor_id: v.id,
      status: 'sent'
    }))

    await sb.from('leads').insert(leads)
  }

  return res.status(200).json({ success: true })
}
