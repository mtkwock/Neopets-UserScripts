// ==UserScript==
// @name         Five Finger Hider
// @namespace    neopets
// @version      2024-12-19
// @description  Remove the eye-sore formatting of Five Finger Discount
// @author       You
// @match        https://www.neopets.com/objects.phtml?*type=shop*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @run-at       document-body
// @grant        none
// ==/UserScript==

const CONFIG = {
    // Whether or not to hide the original price of the item before FFF.
    hideOriginalPrice: true,

    // Color to set discount price to. This is normally red
    // Use an empty string to set it to black.
    discountPriceColor: '',
};

function removeFiveFingerStyle() {
    for (const item of document.getElementsByClassName('shop-item')) {
        if (CONFIG.hideOriginalPrice) {
            // The original item price
            item.getElementsByTagName('span')[0].style.display = 'none';
            // The break after the item price. Removing its display makes it seamless.
            item.getElementsByTagName('br')[0].style.display = 'none';
        }

        // The discounted price.
        item.getElementsByTagName('b')[1].style.color = CONFIG.discountPriceColor;
    }
}

// Simply determines if the perk bar has listed Five Finger.
function hasFiveFingerPerk() {
    const perkBarName = document.getElementsByClassName('perkBarName')[0];
    return perkBarName && perkBarName.style.background.includes('fivefinger');
}

(function() {
    'use strict';

    if (hasFiveFingerPerk()) {
        removeFiveFingerStyle();
    }
})();