/**
 * Builds the AI prompt for CRM field extraction.
 *
 * @param {string[]} headers  - Column headers from the CSV
 * @param {object[]} records  - Batch of raw CSV row objects
 * @returns {string} The complete prompt string
 */
function buildExtractionPrompt(headers, records) {
  return `You are an expert CRM data extraction specialist for GrowEasy, a real-estate and sales CRM platform.
Your task is to analyse raw CSV records from various sources (Facebook Lead Ads, Google Ads, Real Estate portals, Excel sheets, Sales reports, Marketing agency CSVs, etc.) and convert each record into GrowEasy's standardised CRM format.

═══════════════════════════════════════════
CRM FIELD DEFINITIONS
═══════════════════════════════════════════
| Field                        | Description                                                  |
|------------------------------|--------------------------------------------------------------|
| created_at                   | Lead creation timestamp. Must be parseable by new Date()     |
| name                         | Full name of the lead                                        |
| email                        | Primary email (one only)                                     |
| country_code                 | Calling code ONLY — e.g. "+91", "+1", "+44"                  |
| mobile_without_country_code  | Phone digits only, without the country code                  |
| company                      | Company / organisation name                                  |
| city                         | City                                                         |
| state                        | State or province                                            |
| country                      | Country name                                                 |
| lead_owner                   | Person or email responsible for this lead                    |
| crm_status                   | One of the EXACT allowed values listed below                 |
| crm_note                     | Aggregated notes, extra phones, extra emails, remarks        |
| data_source                  | One of the EXACT allowed values listed below (or "")         |
| possession_time              | Property possession timeline                                 |
| description                  | Additional description or free-text info                     |

═══════════════════════════════════════════
STRICT RULES
═══════════════════════════════════════════

1. CRM STATUS — must be EXACTLY one of these values (no variations):
   • "GOOD_LEAD_FOLLOW_UP"  → Interested / Warm / Follow-up needed / Demo scheduled / Callback requested
   • "DID_NOT_CONNECT"      → No answer / Busy / Voicemail / Could not reach / Unreachable
   • "BAD_LEAD"             → Not interested / Wrong number / Spam / Invalid / Duplicate / Junk
   • "SALE_DONE"            → Deal closed / Converted / Payment received / Onboarding / Purchase done
   • If status is ambiguous or missing → default to "GOOD_LEAD_FOLLOW_UP"

2. DATA SOURCE — must be EXACTLY one of these values (or leave ""):
   • "leads_on_demand"   → source mentions leads, demand, bulk leads
   • "meridian_tower"    → source mentions Meridian Tower project/property
   • "eden_park"         → source mentions Eden Park project/property
   • "varah_swamy"       → source mentions Varah Swamy project/property
   • "sarjapur_plots"    → source mentions Sarjapur plots/property
   • ""                  → use this if no clear match

3. PHONE HANDLING:
   • country_code = only the dialling code, e.g. "+91"
   • mobile_without_country_code = only the local digits, e.g. "9876543210"
   • If multiple phones: first → mobile field; rest → append to crm_note as "Extra phones: 98765, 91234"
   • If phone includes country code, split them correctly

4. EMAIL HANDLING:
   • If multiple emails: first → email field; rest → append to crm_note as "Extra emails: x@y.com"

5. SKIP RECORDS:
   • Return {"skip": true, "reason": "..."} for records that have NEITHER an email NOR a mobile number
   • Do NOT skip records that have at least one of them

6. CRM NOTE AGGREGATION:
   • Combine: remarks, comments, follow-up info, extra contacts, status context
   • Keep as single line — use literal \\n to separate items if needed (avoid real line breaks)
   • Do not duplicate info that already has its own CRM field

7. INTELLIGENT COLUMN MAPPING — map any column name to the right CRM field:
   • "Phone Number", "Mobile", "Cell", "Contact", "Tel", "Phone" → mobile
   • "Email Address", "E-mail", "Email ID", "Mail"               → email
   • "Full Name", "Customer Name", "Client Name", "Lead Name"    → name
   • "Organisation", "Business", "Employer", "Firm", "Company"   → company
   • "Date", "Created", "Submitted At", "Timestamp", "Time"      → created_at
   • "Source", "Lead Source", "Campaign", "Channel", "Medium"    → data_source
   • "Status", "Lead Status", "Stage", "Disposition"             → crm_status
   • "Remarks", "Comments", "Notes", "Note", "Feedback"          → crm_note
   • "Owner", "Assigned To", "Sales Rep", "Agent", "Manager"     → lead_owner
   • "Zip", "Postal Code", "PIN"                                 → append to crm_note
   • Columns that don't map to any field → append value to crm_note or description

8. DATE FORMAT:
   • Normalise created_at to ISO-like format: "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DD"
   • If only a date is available, use "YYYY-MM-DD"
   • If no date available, leave as ""

═══════════════════════════════════════════
INPUT
═══════════════════════════════════════════
CSV Headers: ${JSON.stringify(headers)}

Records (${records.length} total):
${JSON.stringify(records, null, 2)}

═══════════════════════════════════════════
OUTPUT REQUIREMENTS
═══════════════════════════════════════════
• Return ONLY a raw JSON array — no markdown, no code fences, no prose explanation
• The array must contain exactly ${records.length} elements (one per input record, in the same order)
• Each element is either a complete CRM object or {"skip": true, "reason": "..."}
• Every string field must be a string (use "" for missing values, never null or undefined)

Example of a valid CRM object:
{
  "created_at": "2026-05-13 14:20:48",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "country_code": "+91",
  "mobile_without_country_code": "9876543210",
  "company": "GrowEasy",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "lead_owner": "sales@groweasy.ai",
  "crm_status": "GOOD_LEAD_FOLLOW_UP",
  "crm_note": "Client asked to reschedule demo",
  "data_source": "",
  "possession_time": "",
  "description": ""
}

Output the JSON array now:`;
}

module.exports = { buildExtractionPrompt };
