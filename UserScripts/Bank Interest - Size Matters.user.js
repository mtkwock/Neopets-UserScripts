// ==UserScript==
// @name         Bank Interest - Size Matters
// @namespace    neopets.bank
// @version      2024-10-19
// @description  Makes Collecting Interest a Big Button prevents Withdrawal/Deposit if you haven't collected interest
// @author       mtkwock
// @match        https://www.neopets.com/bank.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @grant        none
// ==/UserScript==

const Size = {
    standard: { width: 120, height: 32, fontSize: 14, columns: '40% 60%', },
    medium: { width: 300, height: 100, fontSize: 50, columns: '40% 60%', },
    large: { width: 500, height: 200, fontSize: 75, columns: '30% 70%', },
    huge: { width: 700, height: 300, fontSize: 125, columns: '20% 80%', },
};

const Beating = {
    none: false, // For no beating at all.
    heartBeat: { bpm: 100, beatFrac: 0.3, amplitude: 7, },
    breathe: { bpm: 12, beatFrac: 1, amplitude: 14, },
};

const CONFIG = {
    // Choose what size you want the interest button to be
    size: Size.large,
    beat: Beating.none,

    // Disabling the Withdraw and Deposit Buttons if the Interest Button is available.
    // Set to false to prevent this disabling from happening.
    disableWithdrawDeposit: true,
    // Message to put on disabled inputs and buttons if Interest is shown.
    disabledMessage: '?!INTEREST?!',
};

function getInterestButton() {
    return document.getElementsByClassName('bank-interest-btn')[0];
}

/**
Approximately the following
+1.5    /\
   0   /  \   ................
-0.5       '-'
      0      0.3             1
 */
function beat(cfg) {
    let frac = ((new Date()).valueOf() / (60000) * cfg.bpm) % 1;
    let y = 0;
    if (frac && frac < cfg.beatFrac) {
        const x = frac / cfg.beatFrac;
        y = cfg.amplitude * Math.sin(x * 2 * Math.PI) * (1.5 - x);
    }
    console.log(y);
    return y;
}

function styleInterestButton(btn) {
    const {width, height, fontSize, columns} = CONFIG.size;
    btn.style.maxWidth = '2560px';
    const surroundDiv = btn.parentElement.parentElement;
    surroundDiv.style.maxWidth = '2560px';

    btn.style.width = `${width}px`;
    btn.style.height = `${height}px`;
    btn.style.fontSize = `${fontSize}px`;

    surroundDiv.style.gridTemplateColumns = columns;

    if (CONFIG.beat) {
        const beatInterval = setInterval(
            () => {
                if (!btn) {
                    clearInterval(beatInterval);
                    return;
                }

                const add = beat(CONFIG.beat);

                btn.style.width = `${width + add}px`;
                btn.style.height = `${height + add}px`;
            }, 30);
    }
}

function disableDepositWithdrawBtns() {
    let inputs = [...document.getElementsByClassName('bank-action-container')[0].getElementsByTagName('input')];
    inputs = [inputs[2], inputs[3], inputs[6], inputs[7]];

    for (const input of inputs) {
        input.disabled = 'true';
        input.value = CONFIG.disabledMessage;
    }

    const interestBox = document.getElementsByClassName('frmCollectInterest')[0];
    interestBox.onclick = () => {
        for (const input of inputs) {
            input.disabled = '';
        }
        const [depositInput, depositBtn, withdrawInput, withdrawBtn] = inputs;
        depositInput.value = '';
        depositBtn.value = 'Deposit';
        withdrawInput.value = '';
        withdrawBtn.value = 'Withdraw';
        interestBox.onclick = () => {};
    }
}

(function() {
    'use strict';

    const btn = getInterestButton();
    if (!btn) {
        console.log('No Interest Button, not continuing');
        return;
    }
    styleInterestButton(btn);

    if (CONFIG.disableWithdrawDeposit) {
        disableDepositWithdrawBtns();
    }
})();