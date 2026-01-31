(function () {
    /**
     * GKPricing - Single Source of Truth for Calculations
     * Zero-tolerance for float errors. Global kuruş math.
     */

    const SHIP_FEE_KURUS = 7900; // 79.00 TRY
    const FREE_SHIP_THRESHOLD_KURUS = 50000; // 500.00 TRY

    /**
     * Convert TRY float/string to Kurus integer
     */
    function toKurus(amount) {
        if (typeof amount === 'string') amount = parseFloat(amount.replace(',', '.'));
        return Math.round((amount || 0) * 100);
    }

    /**
     * Convert Kurus integer to TRY string
     */
    function format(kurus) {
        return (kurus / 100).toLocaleString('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2
        });
    }

    /**
     * Main calculation function
     * @param {Array} items - Cart items
     * @param {Object} coupon - Applied coupon object {code, type, value, expiresAt}
     */
    function calculate(items, coupon = null) {
        // 1. Calculate Subtotal
        let subtotalKurus = items.reduce((sum, item) => {
            const priceKurus = toKurus(item.price);
            return sum + (priceKurus * (item.qty || 1));
        }, 0);

        // 2. Base Shipping
        let shippingKurus = subtotalKurus >= FREE_SHIP_THRESHOLD_KURUS ? 0 : SHIP_FEE_KURUS;

        // 3. Discount Logic
        let discountKurus = 0;
        let appliedCouponInfo = null;

        if (coupon) {
            // Check expiry
            const now = Date.now();
            if (coupon.expiresAt && now > coupon.expiresAt) {
                console.warn("Coupon expired:", coupon.code);
            } else {
                if (coupon.type === 'percentage') {
                    // Discount applies to subtotal only
                    discountKurus = Math.floor(subtotalKurus * (coupon.value / 100));
                    appliedCouponInfo = { code: coupon.code, type: 'percentage', value: coupon.value };
                } else if (coupon.type === 'free_shipping') {
                    // Discount equals the shipping fee to offset it
                    discountKurus = shippingKurus;
                    appliedCouponInfo = { code: coupon.code, type: 'free_shipping' };
                }
            }
        }

        // 4. Final Total
        const totalKurus = Math.max(0, subtotalKurus + shippingKurus - discountKurus);

        return {
            subtotalKurus,
            shippingKurus,
            discountKurus,
            totalKurus,
            subtotalStr: format(subtotalKurus),
            shippingStr: format(shippingKurus),
            discountStr: format(discountKurus),
            totalStr: format(totalKurus),
            coupon: appliedCouponInfo
        };
    }

    window.GKPricing = {
        calculate,
        toKurus,
        format,
        CONSTANTS: {
            SHIP_FEE_KURUS,
            FREE_SHIP_THRESHOLD_KURUS
        }
    };
})();
