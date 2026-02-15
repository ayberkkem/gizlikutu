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
     */
    function calculate(items) {
        // 1. Calculate Subtotal
        let subtotalKurus = items.reduce((sum, item) => {
            const priceKurus = toKurus(item.price);
            return sum + (priceKurus * (item.qty || 1));
        }, 0);

        // 2. Base Shipping
        let shippingKurus = subtotalKurus >= FREE_SHIP_THRESHOLD_KURUS ? 0 : SHIP_FEE_KURUS;

        // 3. Final Total
        const totalKurus = subtotalKurus + shippingKurus;

        return {
            subtotalKurus,
            shippingKurus,
            totalKurus,
            subtotalStr: format(subtotalKurus),
            shippingStr: format(shippingKurus),
            totalStr: format(totalKurus)
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
