
import { describe, it, expect } from 'vitest';
import { getExpirationDate } from '../services/database';
import { SubscriptionPlan } from '../types';

describe('Subscription Logic', () => {
    it('should calculate 30 days expiration for FREE plan', () => {
        const now = new Date();
        const expiry = getExpirationDate(SubscriptionPlan.FREE);
        expect(expiry).toBeDefined();
        
        const expiryDate = new Date(expiry!);
        const diffInDays = Math.round((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        expect(diffInDays).toBe(30);
    });

    it('should calculate 30 days expiration for PRO plan', () => {
        const now = new Date();
        const expiry = getExpirationDate(SubscriptionPlan.PRO);
        expect(expiry).toBeDefined();
        
        const expiryDate = new Date(expiry!);
        const diffInDays = Math.round((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        expect(diffInDays).toBe(30);
    });

    it('should calculate 30 days expiration for ENTERPRISE plan', () => {
        const now = new Date();
        const expiry = getExpirationDate(SubscriptionPlan.ENTERPRISE);
        expect(expiry).toBeDefined();
        
        const expiryDate = new Date(expiry!);
        const diffInDays = Math.round((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        expect(diffInDays).toBe(30);
    });
});
