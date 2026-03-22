import * as cheerio from 'cheerio';
import type { ExternalNafdacPayload } from '../types/types.js';

const LABEL_MAP: Record<
  string,
  keyof ExternalNafdacPayload | 'ingredientText'
> = {
  'Product Name': 'name',
  'Product Category': 'category',
  'Product Source': 'source',
  Manufacturer: 'manufacturer',
  'Date Approved': 'approvedDate',
  'Expiry Date': 'expiryDate',
  'NAFDAC No': 'nafdac',
  'Active Ingredient': 'ingredientText',
};

function splitIngredients(text: string): string[] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseNafdacVerifyModalHtml(
  html: string,
): ExternalNafdacPayload | null {
  const $ = cheerio.load(html);
  const modal = $('#modalCenter');
  if (!modal.length) return null;

  const body = modal.find('.modal-body');
  if (!body.length) return null;

  const hasDanger = modal.find('.alert-danger').length > 0;
  const hasSuccess = modal.find('.alert-success').length > 0;
  // Active registration: green banner. Expired: red banner — same table layout either way.
  if (!hasDanger && !hasSuccess) return null;

  const out: ExternalNafdacPayload = {};
  let ingredientLine: string | undefined;

  const successAlertName = hasSuccess
    ? modal
        .find('.alert-success')
        .first()
        .text()
        .trim()
        .match(/Success,\s*Product found,\s*(.+)/i)?.[1]
        ?.trim()
    : undefined;

  body.find('table tr td span').each((_, el) => {
    const text = $(el).text().trim();
    const m = text.match(/^([^:]+):\s*(.*)$/);
    if (!m) return;

    const label = m[1].trim();
    const value = m[2].trim();

    const key = LABEL_MAP[label];

    if (!key) return;

    if (key === 'ingredientText') {
      ingredientLine = value;
      return;
    }

    (out as Record<string, string | undefined>)[key] = value;
  });

  if (!out.name && successAlertName) out.name = successAlertName;

  if (!out.name && !out.nafdac) return null;

  if (ingredientLine) {
    out.ingredients = splitIngredients(ingredientLine);
  }

  // Expired certification modal: danger alert only; product rows still list full details.
  out.approved = hasSuccess && !hasDanger;
  return out;
}
