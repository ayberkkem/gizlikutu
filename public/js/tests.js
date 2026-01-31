(function () {
    console.log("%c--- GK PRICING TEST SUITE ---", "color: #be185d; font-weight: bold; font-size: 16px;");

    const tests = [
        {
            name: "Subtotal 499 TRY => Shipping Applied (79 TRY)",
            items: [{ price: 499.00, qty: 1 }],
            coupon: null,
            expect: { subtotalKurus: 49900, shippingKurus: 7900, totalKurus: 57800 }
        },
        {
            name: "Subtotal 500 TRY => Free Shipping (0 TRY)",
            items: [{ price: 500.00, qty: 1 }],
            coupon: null,
            expect: { subtotalKurus: 50000, shippingKurus: 0, totalKurus: 50000 }
        },
        {
            name: "Subtotal 1000 TRY + 20% Coupon => Correct Discount (200 TRY)",
            items: [{ price: 1000.00, qty: 1 }],
            coupon: { code: "TEST20", type: "percentage", value: 20 },
            expect: { subtotalKurus: 100000, discountKurus: 20000, totalKurus: 80000 }
        },
        {
            name: "Subtotal 300 TRY + Free Shipping Coupon => Total 300 TRY",
            items: [{ price: 300.00, qty: 1 }],
            coupon: { code: "FREE", type: "free_shipping", value: 0 },
            expect: { subtotalKurus: 30000, shippingKurus: 7900, discountKurus: 7900, totalKurus: 30000 }
        },
        {
            name: "Float Precision Test: 19.99 * 3",
            items: [{ price: 19.99, qty: 3 }],
            coupon: null,
            expect: { subtotalKurus: 5997 }
        }
    ];

    let passed = 0;
    tests.forEach(t => {
        const res = window.GKPricing.calculate(t.items, t.coupon);
        let match = true;
        for (let key in t.expect) {
            if (res[key] !== t.expect[key]) {
                console.error(`FAILED: ${t.name} | ${key} expected ${t.expect[key]} but got ${res[key]}`);
                match = false;
            }
        }
        if (match) {
            console.log(`%cPASSED: ${t.name}`, "color: #10b981;");
            passed++;
        }
    });

    console.log(`%c--- RESULT: ${passed}/${tests.length} tests passed ---`, "font-weight: bold;");
})();
