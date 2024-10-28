// ==UserScript==
// @name         Training Reformatter
// @namespace    neopet.training
// @version      2024-10-27
// @description  Make Training Status page more condensed
// @author       mtkwock
// @match        https://www.neopets.com/island/training.phtml?type=status*
// @match        https://www.neopets.com/pirates/academy.phtml?type=status*
// @match        https://www.neopets.com/safetydeposit.phtml?category=0&obj_name=Codestone
// @match        https://www.neopets.com/safetydeposit.phtml?category=0&obj_name=Dubloon
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @grant        none
// ==/UserScript==

const CONFIG = {
    // Number of columns to show pets for.
    // 5 fits within the white border. 2-4 all work as well.
    columns: 5,
    // Show the SDB button along with the aggregated payments required.
    showAllSdbButton: true,
    // Enable search buttons for individual payment types.
    searchButton: {
        safetyDepositBox: true,
        shopWizard: true,
    },
    statusColor: {
        noTraining: 'lightgray',
        activeTraining: 'moccasin',
        courseCompletion: 'lightgreen',
        needPayment: 'indianred',
    },
    // TODO: Currently does nothing. Could be used to show stats on the Courses page
    storePetStats: false,
    // Border coloring for each pet.
    borderColor: '1px solid gray',
};

const ItemSource = {
    shopWizard: {
        name: 'SW',
        link: 'https://www.neopets.com/shops/wizard.phtml?string=',
    },
    safetyDepositBox: {
        name: 'SDB',
        link: 'https://www.neopets.com/safetydeposit.phtml?category=0&obj_name='
    },
};

const Location = {
    MYSTERY: 'mystery',
    KRAWK: 'krawk',
    SAFETY_DEPOSIT_BOX: 'sdb',
    UNKNOWN: '',
};

const WithdrawObj = {};
WithdrawObj[Location.MYSTERY] = 'Codestone';
WithdrawObj[Location.KRAWK] = 'Dubloon';

function createItemLink(itemName, source) {
    itemName = itemName.replace(/[\s]/g, '+');
    const res = document.createElement('a');
    res.innerText = source.name;
    res.href = source.link + itemName;
    res.target = '_blank';
    return res;
}

function getNameTds() {
  const content = document.getElementsByClassName('content')[0];
  const nameTds = [...content.getElementsByTagName('td')].filter(el => el.innerText.includes(' (Level '));
  return nameTds;
}

let location = Location.UNKNOWN;
if (window.location.href.includes('island')) {
    location = Location.MYSTERY;
} else if (window.location.href.includes('pirates')) {
    location = Location.KRAWK;
} else if (window.location.pathname == '/safetydeposit.phtml') {
    location = Location.SAFETY_DEPOSIT_BOX;
}

// To show what's needed to be withdrawn on SDB page.
function storeCosts(costs) {
    window.localStorage.trainingPayment = JSON.stringify(costs);
}

// Annotate search functions and determine total costs.
function handleCosts() {
    const costs = {};
    const nameTds = getNameTds();
    for (const nameTd of nameTds) {
        const td = nameTd.parentElement.nextElementSibling.children[1];
        let payTd;
        if (location == Location.MYSTERY && td.innerText.includes("This course has not been paid for yet")) {
            const codestoneEls = [...td.children].filter((b) => b.innerText.includes('Codestone'));
            for (const codestoneEl of codestoneEls) {
                const itemName = codestoneEl.innerText;

                if (CONFIG.searchButton.safetyDepositBox) {
                    const sdbButton = createItemLink(itemName, ItemSource.safetyDepositBox);
                    td.insertBefore(sdbButton, codestoneEl.nextSibling);
                    const sdbSpacer = document.createElement('span');
                    sdbSpacer.innerText = '\xa0';
                    td.insertBefore(sdbSpacer, sdbButton);
                }

                if (CONFIG.searchButton.shopWizard) {
                    const shopWizardButton = createItemLink(itemName, ItemSource.shopWizard);
                    const wizardSpacer = document.createElement('span');
                    wizardSpacer.innerText = '\xa0';
                    td.insertBefore(shopWizardButton, codestoneEl.nextSibling);
                    td.insertBefore(wizardSpacer, shopWizardButton);
                }

                if (costs[itemName]) {
                    costs[itemName] += 1;
                } else {
                    costs[itemName] = 1;
                }
            }
            payTd = td.getElementsByTagName('td')[0];
        } else if (location == Location.KRAWK && td.innerText.includes('Dubloon')){
            const dubloonEls = [...td.getElementsByTagName('b')].filter((b) => b.innerText.includes('Dubloon'));
            for (const dubloonEl of dubloonEls) {
                const itemName = dubloonEl.innerText;

                if (CONFIG.searchButton.safetyDepositBox) {
                    const sdbButton = createItemLink(itemName, ItemSource.safetyDepositBox);
                    const sdbSpacer =document.createElement('span');
                    sdbSpacer.innerText = '\xa0';
                    dubloonEl.parentElement.appendChild(sdbSpacer);
                    dubloonEl.parentElement.appendChild(sdbButton);
                }

                if (CONFIG.searchButton.shopWizard) {
                    const shopWizardButton = createItemLink(itemName, ItemSource.shopWizard);
                    const wizardSpacer = document.createElement('span');
                    wizardSpacer.innerText = '\xa0';
                    dubloonEl.parentElement.appendChild(wizardSpacer);
                    dubloonEl.parentElement.appendChild(shopWizardButton);
                }

                if (costs[itemName]) {
                    costs[itemName] += 1;
                } else {
                    costs[itemName] = 1;
                }
            }

            payTd = td.getElementsByTagName('td')[0];
        }
    }

    return costs;
}

// Determine pet stats from the page.
function getPetStats() {
    function extractNameFromTd(td) {
        return td.innerText.match(/[\w\d]+/)[0];
    }

    const stats = [];
    for (const nameTd of getNameTds()) {
        const statTd = nameTd.parentElement.nextElementSibling.children[0];
        const statBs = [...statTd.getElementsByTagName('b')];
        const [Lvl, Str, Def, Mov, Hp] = statBs.map((b) => Number(b.innerText.match(/\d+$/)));
        const petName = extractNameFromTd(nameTd);

        stats.push({
            name: petName,
            Lvl, Str, Def, Mov, Hp,
        });

        if (nameTd.innerText.includes('is currently studying')) {
            continue;
        }
        const baseDisable = Math.max(Str, Def, Mov, Hp) > (Lvl * 2);
        const enduranceDisable = Hp > 3 * Lvl;
        const disables = [
            false,
            baseDisable,
            baseDisable,
            baseDisable,
            enduranceDisable,
        ];
        for (const idx in statBs) {
            if (disables[idx]) {
                continue;
            }
            const statB = statBs[idx];
            const trainable = document.createElement('span');
            trainable.innerText = '\xa0Trainable';
            statB.parentElement.insertBefore(trainable, statB.nextElementSibling);
        }
    }

    return stats
}

// Intended to be able to show stats on the Course Selection Page.
function storeStats(stats) {
    const statString = stats.map((stat) => [stat.name, stat.Lvl, stat.Str, stat.Def, stat.Mov, stat.Hp].join(',')).join('|');
    window.localStorage.petStats = statString;
}

// Show costs on the SDB page.
function showCosts() {
    const costs = JSON.parse(window.localStorage.trainingPayment);
    if (!costs) {
        delete window.localStorage.trainingPayment;
        return;
    }

    const sdbTitle = [...document.getElementsByTagName('b')].filter(b => b.innerText == 'Your Safety Deposit Box')[0];
    for (const cost in costs) {
        const itemNameB = [...document.getElementsByTagName('b')].filter(b => b.innerText.includes(cost))[0];
        if (!itemNameB) {
            console.warn('None of item included', cost);
            continue;
        }
        const neededEl = document.createElement('b');
        neededEl.innerText = `Need x${costs[cost]}`;
        const removeCountTd = itemNameB.parentElement.parentElement.children[5];
        removeCountTd.appendChild(document.createElement('br'));
        removeCountTd.appendChild(neededEl);
    }
    sdbTitle.parentElement.insertBefore(makeCostTable(costs), sdbTitle.nextElementSibling);
}

function styleNameRow(row) {
    const nameTd = row.children[0];
    nameTd.setAttribute('colspan', 1);
    const nameEl = nameTd.children[0];
    const studyVal = nameEl.innerText.match(/studying \w+/);
    nameEl.innerText = nameEl.innerText.replace(/\s\(Level \d+\).*$/, '');
    if (studyVal) {
        const studyDiv = document.createElement('div');
        studyDiv.innerText = studyVal[0];
        nameTd.appendChild(studyDiv);
    }
    nameTd.style.borderTop = CONFIG.borderColor;
    nameTd.style.borderLeft = CONFIG.borderColor;
    nameTd.style.borderRight = CONFIG.borderColor;
}

function styleStatusRow(row) {
    const statTd = row.children[0];
    const statusTd = row.children[1];
    const timeRemainingBs = statusTd.getElementsByTagName('b');
    for (const b of timeRemainingBs) {
        if (!b.innerText.includes('minutes,')) {
            continue;
        }
        b.innerText = b.innerText.replace(/\s?(hrs,|minutes,)\s?/g, ':').replace('seconds', '');
    }
    statTd.removeChild(statTd.lastChild); // Remove last break...
    statTd.style.textAlign = 'left';
    statTd.style.borderLeft = CONFIG.borderColor;
    statTd.style.borderRight = CONFIG.borderColor;

    // Handle different statuses.
    statusTd.style.borderLeft = CONFIG.borderColor;
    statusTd.style.borderRight = CONFIG.borderColor;
    statusTd.style.borderBottom = CONFIG.borderColor;
    if (!statusTd.firstChild) {
        // No training status
        const b = document.createElement('b');
        b.innerText = 'NOT TRAINING';
        statusTd.style.background = CONFIG.statusColor.noTraining;
        statusTd.appendChild(b);
    } else if (statusTd.firstChild.data && statusTd.firstChild.data.includes('Time till course finishes')) {
        // Training in Progress
        statusTd.firstChild.data = 'Remaining:'
        const [del1, keep, del2] = statusTd.getElementsByTagName('br');
        statusTd.removeChild(del1);
        if (del2) {
            statusTd.removeChild(del2);
        }
        statusTd.style.background = CONFIG.statusColor.activeTraining;
    } else {
        statusTd.style.background = CONFIG.statusColor.needPayment;
        if (statusTd.innerText.includes('not been paid')) {
            // Unpaid Mystery Island
            for (const image of [...statusTd.getElementsByTagName('img')]) {
                statusTd.removeChild(image);
            }
            statusTd.firstChild.data = 'Payment';
            const brs = [...statusTd.getElementsByTagName('br')];
            for (let i = brs.length - 1; i >= 1; i--) {
                // Remove all last breaks along with any breaks where there are multiple in a row.
                if (i >= brs.length - 2 || brs[i].previousElementSibling == brs[i - 1]) {
                    statusTd.removeChild(brs[i]);
                }
            }
            for (const b of statusTd.getElementsByTagName('b')) {
                b.innerText = b.innerText.replace('Codestone', '');
            }
        } else if (statusTd.innerText.includes('Dubloon Coin')) {
            // Unpaid Krawk Island
            const coinTd = statusTd.getElementsByTagName('td')[0];
            coinTd.parentElement.removeChild(coinTd);

            for (const spacerEl of [...statusTd.getElementsByTagName('br'), ...statusTd.getElementsByTagName('p')]) {
                spacerEl.parentElement.removeChild(spacerEl);
            }
        } else {
            // Complete Course
            statusTd.style.background = CONFIG.statusColor.courseCompletion;
        }
    }
}

// Main function to condense all of the pets into a much smaller table.
function condenseTable() {
    const tblBody = [...document.getElementsByTagName('table')].filter((tbl) => tbl.width == '500')[0].children[0];
    const rows = [...tblBody.children];
    const petCols = CONFIG.columns;
    for (let i = 0; i < rows.length; i+= petCols * 2) {
        const petRowsToAdd = rows.slice(i, i + petCols * 2);
        let [nameRow, statRow, statusRow] = petRowsToAdd;
        if (!statusRow) {
            statusRow = document.createElement('tr');
            statRow.parentElement.appendChild(statusRow);
        }

        const nameTds = [];
        const statTds = [];
        const statusTds = [];

        for (let j = 0; j < petRowsToAdd.length - 1; j += 2) {
            const [nextNameRow, nextStatusRow] = petRowsToAdd.slice(j, j+2);
            styleNameRow(nextNameRow);
            styleStatusRow(nextStatusRow);
            nameTds.push(nextNameRow.children[0]);
            statTds.push(nextStatusRow.children[0]);
            statusTds.push(nextStatusRow.children[1]);
        }

        for (const nameTd of nameTds) {
            nameRow.appendChild(nameTd);
        }
        for (const statTd of statTds) {
            statRow.appendChild(statTd);
        }
        for (const statusTd of statusTds) {
            statusRow.appendChild(statusTd);
        }
    }

    // Clean up the newly empty rows
    for (const row of rows) {
        if (!row.children) {
            tblBody.removeChild(row);
        }
    }

    const contentEl = document.getElementsByClassName('content')[0];
    contentEl.removeChild(contentEl.firstElementChild);
}

function makeCostTable(costs) {
    const tbl = document.createElement('table');
    const tbody = document.createElement('tbody');
    tbl.appendChild(tbody);
    for (const cost in costs) {
        const row = document.createElement('tr');
        const val = `<td><b>${cost}</b>:</td><td>${costs[cost]}</td>`;
        row.innerHTML = val;
        tbody.appendChild(row);
    }
    return tbl;
}

function showPaymentChecklist(costs, location) {
    const area = [...document.getElementsByTagName('b')].filter(b => b.innerText == 'Current Course Status')[0].parentElement;

    const tbl = makeCostTable(costs);
    area.parentElement.insertBefore(tbl, area.nextElementSibling);

    // Open SDB Button
    const sdbBtn = document.createElement('button');
    sdbBtn.innerText = 'Open SDB: ' + WithdrawObj[location];
    sdbBtn.onclick = () => {
        storeCosts(costs); // For potentially listing values in Safety Deposit Box.
        window.open('https://www.neopets.com/safetydeposit.phtml?category=0&obj_name=' + WithdrawObj[location], '_blank');
    };

    tbl.parentElement.insertBefore(sdbBtn, tbl);
}

(function() {
    'use strict';
    // Quickly handle SDB annotations and return.
    if (location == Location.SAFETY_DEPOSIT_BOX && (
        window.location.search.includes('Codestone') || window.location.search.includes('Dubloon')
    ) && window.localStorage.trainingPayment) {
        showCosts();
        return;
    }

    const costs = handleCosts();
    if (CONFIG.showAllSdbButton) {
        showPaymentChecklist(costs, location);
    }

    if (CONFIG.storePetStats) {
        const stats = getPetStats();
        storeStats(stats);
    }

    condenseTable();
})();
