const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildExtractionPrompt } = require('../prompts/crmExtraction');

const BATCH_SIZE = 5;       // Records per AI call (small = reliable JSON output)
const MAX_RETRIES = 3;      // How many times to retry a failed batch
const BASE_DELAY_MS = 2000; // Base delay between retries (doubles each time)

/** Pause execution for ms milliseconds */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Cleans the AI response text and parses it as JSON.
 * Handles markdown code fences and recovers from truncated responses.
 */
function parseAIResponse(text) {
  let cleaned = text.trim();

  // Strip markdown code fences if present
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');

  // Extract just the JSON array from the response
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    cleaned = arrayMatch[0];
  }

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (firstErr) {
    // Recovery: response may be truncated — find last complete object
    try {
      const lastBrace = cleaned.lastIndexOf('}');
      if (lastBrace > 0) {
        const recovered = cleaned.substring(0, lastBrace + 1) + ']';
        const result = JSON.parse(recovered);
        console.warn('  ⚠️  Recovered truncated AI response — some records may be missing');
        return result;
      }
    } catch (_) { /* fall through */ }
    throw firstErr;
  }
}

/**
 * Sends a single batch to Gemini and returns extracted CRM records.
 * Retries up to MAX_RETRIES times with exponential backoff.
 */
async function extractBatch(model, headers, records, batchIndex) {
  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.log(
        `  ↩  Retry ${attempt}/${MAX_RETRIES - 1} for batch ${batchIndex + 1} (waiting ${delay / 1000}s)...`
      );
      await sleep(delay);
    }

    try {
      const prompt = buildExtractionPrompt(headers, records);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = parseAIResponse(text);

      if (!Array.isArray(parsed)) {
        throw new Error('AI did not return a JSON array.');
      }

      console.log(`  ✅ Batch ${batchIndex + 1}: extracted ${parsed.length} records`);
      return parsed;
    } catch (err) {
      console.error(`  ❌ Batch ${batchIndex + 1} attempt ${attempt + 1} failed: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(
    `Batch ${batchIndex + 1} failed after ${MAX_RETRIES} attempts: ${lastError.message}`
  );
}

/**
 * Main extraction function.
 * Splits records into batches, processes each through Gemini,
 * and returns categorised results.
 *
 * @param {object[]} records - Raw CSV rows
 * @returns {{ success: object[], skipped: object[], errors: object[] }}
 */
async function extractCRMRecords(records) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add it to your backend/.env file and restart the server.'
    );
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel(
    {
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1,       // Low temp = consistent, factual extraction
        maxOutputTokens: 8192,
      },
    },
    { apiVersion: 'v1' }  // Use v1 endpoint
  );

  const headers = records.length > 0 ? Object.keys(records[0]) : [];

  // Chunk records into batches
  const batches = [];
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    batches.push(records.slice(i, i + BATCH_SIZE));
  }

  console.log(
    `\n🤖 AI Extraction: ${records.length} records → ${batches.length} batch(es) of up to ${BATCH_SIZE}`
  );

  const results = { success: [], skipped: [], errors: [] };

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`\n📦 Batch ${i + 1}/${batches.length} — ${batch.length} records`);

    try {
      const extracted = await extractBatch(model, headers, batch, i);

      for (const record of extracted) {
        if (record && record.skip === true) {
          results.skipped.push({ reason: record.reason || 'No email or mobile number' });
        } else if (record) {
          results.success.push(record);
        }
      }
    } catch (err) {
      console.error(`  💥 Batch ${i + 1} permanently failed: ${err.message}`);
      results.errors.push({
        batch: i + 1,
        error: err.message,
        affectedRecords: batch.length,
      });
      // Mark all records in this failed batch as skipped
      batch.forEach(() => results.skipped.push({ reason: 'AI batch processing failed' }));
    }
  }

  console.log(
    `\n🎉 Done — ${results.success.length} imported, ${results.skipped.length} skipped, ${results.errors.length} batch error(s)\n`
  );

  return results;
}

module.exports = { extractCRMRecords, BATCH_SIZE };
