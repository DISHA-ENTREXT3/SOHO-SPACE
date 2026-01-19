
import { db } from './database';
import { supabase } from './supabaseClient';

const APP_VERSION = '1.0.4'; // Current Version
const STABLE_VERSION = '1.0.3'; // Last known stable

export const MonitoringService = {
    async reportBug(error: Error, componentStack?: string) {
        console.error('[Monitoring] Reporting Bug:', error.message);
        
        try {
            // Log to console for dev
            const errorDetails = {
                message: error.message,
                stack: error.stack,
                componentStack,
                version: APP_VERSION,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };

            // In a real production app, you'd send this to Sentry or a backend endpoint
            // For now, we will notify the Admin user if they exist
            const { data: admins } = await supabase.from('users').select('id').eq('role', 'ADMIN');
            
            if (admins && admins.length > 0) {
                for (const admin of admins) {
                    await db.notifications.create(
                        admin.id,
                        `🚨 CRITICAL BUG REPORTED (v${APP_VERSION}): ${error.message.substring(0, 50)}...`,
                        '/admin/logs'
                    );
                }
            }

            // Also log to a conceptual 'error_logs' bucket/table if available
            // For now, we'll store it in localStorage for 'revert' logic
            const logs = JSON.parse(localStorage.getItem('app_error_logs') || '[]');
            logs.push(errorDetails);
            localStorage.setItem('app_error_logs', JSON.stringify(logs.slice(-10))); // Keep last 10

        } catch (reportError) {
            console.error('[Monitoring] Failed to send bug report:', reportError);
        }
    },

    getCrashCount(): number {
        return parseInt(localStorage.getItem('crash_count') || '0');
    },

    incrementCrashCount() {
        const count = this.getCrashCount() + 1;
        localStorage.setItem('crash_count', count.toString());
        localStorage.setItem('last_crash_time', Date.now().toString());
    },

    resetCrashCount() {
        localStorage.setItem('crash_count', '0');
    },

    shouldRevert(): boolean {
        const count = this.getCrashCount();
        const lastCrash = parseInt(localStorage.getItem('last_crash_time') || '0');
        const tenMinutes = 10 * 60 * 1000;
        
        // If more than 3 crashes in 10 minutes, suggest revert
        return count >= 3 && (Date.now() - lastCrash) < tenMinutes;
    },

    async revertToStable() {
        console.log('[Monitoring] Reverting to stable version...');
        this.resetCrashCount();
        
        // Logic to "revert" in a client-side app:
        // 1. Clear sensitive problematic cache
        // 2. Clear localStorage (except auth)
        const token = localStorage.getItem('supabase.auth.token');
        localStorage.clear();
        if (token) localStorage.setItem('supabase.auth.token', token);
        
        // 3. Mark as reverted to disable experimental features
        localStorage.setItem('is_reverted', 'true');
        
        // 4. Reload
        window.location.href = '/?mode=safety';
    }
};
