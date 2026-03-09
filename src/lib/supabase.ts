/**
 * ═══════════════════════════════════════════════════════════════
 *  Supabase Compatibility Wrapper
 * ═══════════════════════════════════════════════════════════════
 * This file is now a thin wrapper around the Unified Database Bridge (/lib/db).
 * It ensures that existing hardcoded 'await supabase.' calls remain
 * functional while allowing the underlying provider to be swapped
 * globally via PLATFORM_CONFIG.
 */

import { db } from './db';

export const supabase = db;
export default db;
