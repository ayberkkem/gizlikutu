/**
 * Checkout Location Controller
 * Handles Province/District selection and conditional payment methods.
 * Kapıda Ödeme is ONLY available for Manisa + Akhisar.
 */
(function () {
    'use strict';

    const KAPIDA_ALLOWED = { province: 'Manisa', district: 'Akhisar' };

    let citiesData = {};

    // DOM Elements
    const provinceSelect = document.getElementById('provinceSelect');
    const districtSelect = document.getElementById('districtSelect');
    const paymentMethodsContainer = document.getElementById('paymentMethods');
    const kapidaOption = document.getElementById('paymentKapida');

    // Initialize
    async function init() {
        if (!provinceSelect || !districtSelect) {
            console.warn('Location selectors not found');
            return;
        }

        try {
            const res = await fetch('./data/turkey-cities.json');
            citiesData = await res.json();
            populateProvinces();

            // Set Defaults
            provinceSelect.value = 'Manisa';
            populateDistricts('Manisa');
            districtSelect.value = 'Akhisar';
            updatePaymentMethods();

            bindEvents();
        } catch (err) {
            console.error('Failed to load cities:', err);
            // Fallback: just enable manual input
            provinceSelect.innerHTML = '<option value="">Yüklenemedi</option>';
        }
    }

    function populateProvinces() {
        const provinces = Object.keys(citiesData).sort((a, b) => a.localeCompare(b, 'tr'));

        provinceSelect.innerHTML = '';
        provinces.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            opt.textContent = p;
            provinceSelect.appendChild(opt);
        });

        // Initially disable district
        districtSelect.disabled = true;
        districtSelect.innerHTML = '';
    }

    function populateDistricts(province) {
        const districts = citiesData[province] || [];

        districtSelect.innerHTML = '';
        districts.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            districtSelect.appendChild(opt);
        });

        districtSelect.disabled = districts.length === 0;
    }

    function updatePaymentMethods() {
        // Since Kapıda Ödeme is the ONLY payment method now, we always keep it visible and checked.
        if (kapidaOption) {
            kapidaOption.style.display = 'flex';
            const kapidaInput = kapidaOption.querySelector('input');
            if (kapidaInput) kapidaInput.checked = true;
        }
    }

    function bindEvents() {
        provinceSelect.addEventListener('change', () => {
            const province = provinceSelect.value;
            if (province) {
                populateDistricts(province);
            } else {
                districtSelect.disabled = true;
                districtSelect.innerHTML = '<option value="">Önce il seçiniz</option>';
            }
            updatePaymentMethods();
        });

        districtSelect.addEventListener('change', () => {
            updatePaymentMethods();
        });
    }

    // Validate before checkout submission
    function validateLocation() {
        const province = provinceSelect?.value || '';
        const district = districtSelect?.value || '';

        if (!province) {
            alert('Lütfen il seçiniz.');
            provinceSelect?.focus();
            return false;
        }

        if (!district) {
            alert('Lütfen ilçe seçiniz.');
            districtSelect?.focus();
            return false;
        }

        return true;
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose validation for checkout form
    window.CheckoutLocation = {
        validate: validateLocation
    };
})();

