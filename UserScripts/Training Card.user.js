// ==UserScript==
// @name         Training Island Card Generator
// @namespace    http://tampermonkey.net/
// @version      2024-10-28
// @description  try to take over the world!
// @author       You
// @match        https://www.neopets.com/island/training.phtml?type=status*
// @match        https://www.neopets.com/pirates/academy.phtml?type=status*
// @match        https://www.neopets.com/island/fight_training.phtml?status*
// @match        https://www.neopets.com/safetydeposit.phtml?obj_name=&category=2
// @match        https://www.neopets.com/safetydeposit.phtml?obj_name=&category=3
// @match        https://www.neopets.com/island/process_training.phtml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @grant        none
// ==/UserScript==

const CONFIG = {
    columns: 5,
    shopWizardBtn: true,
    sdbBtn: true,
    statusColor: {
        notTraining: 'lightgray',
        needsPayment: 'indianred',
        inProgress: 'moccasin',
        complete: 'lightgreen',
    },
    borderColor: '1px solid gray',

    skipCompleteCourseScreen: true,
};

// Quickly navigate out of the Complete Course Screen
if (CONFIG.skipCompleteCourseScreen && location.pathname.includes('process_')) {
    window.open(window.location.pathname.replace('process_', '') + '?type=status', '_self');
}

function showCostsOnSdb() {
    const costs = JSON.parse(window.localStorage.trainingPayment);
    if (!costs) {
        return;
    }

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
}

function fillSdbForm() {
    const payment = JSON.parse(window.localStorage.trainingPayment);
    if (!payment) {
        delete window.localStorage.trainingPayment;
        window.close();
        return;
    }

    const removeInputs = [...document.getElementsByClassName('content')[0].getElementsByClassName('remove_safety_deposit')];
    for (const removeInput of removeInputs) {
        const nameTd = removeInput.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling;
        const name = nameTd.innerText.split('\n')[0].trim();
        if (name in payment) {
            removeInput.value = payment[name];
            removeInput.setAttribute('data-remove_val', 'y');
        }
    }
}

const Status = {
    NOT_TRAINING: 0,
    NEEDS_PAYMENT: 1,
    IN_PROGRESS: 2,
    COMPLETE: 3,
}

const CourseType = ['Level', 'Strength', 'Defence', 'Agility', 'Endurance'];
function signUpHref(name, course) {
    const path = `process_${window.location.pathname.split('/').pop()}`;
    const params = `?type=start&course_type=${course}&pet_name=${name}`;
    return path + params;
}

function createSwLink(item) {
    const a = document.createElement('a');
    a.href = 'https://www.neopets.com/shops/wizard.phtml?string=' + item.replace(/\s/g, '+');
    a.innerText = 'SW';
    return a;
}

function createSdbLink(item) {
    const a = document.createElement('a');
    a.href = 'https://www.neopets.com/safetydeposit.phtml?category=0&obj_name=' + item.replace(/\s/g, '+');
    a.innerText = 'SDB';
    return a;
}

class Pet {
    constructor(nameTd, statTd, statusTd) {
        // Information gleamed from nameTd
        this.name = nameTd.innerText.match(/^\w+/)[0];
        this.trainingStat = (nameTd.innerText.match(/studying (\w+)/) || [])[1];

        // Information from statTd
        this.img = statTd.getElementsByTagName('img')[0];
        const stats = [...statTd.getElementsByTagName('b')].map(b => b.innerText);
        this.lvl = Number(stats[0]);
        this.str = Number(stats[1]);
        this.def = Number(stats[2]);
        this.mov = Number(stats[3]);
        this.hp = Number(stats[4].split('/')[1]);
        this.curHp = Number(stats[4].split('/')[0]);
        const under2xLvl = [this.str, this.def, this.mov, this.hp].every((stat) => stat <= 2 * this.lvl);

        this.trainHref;
        if (location.pathname.includes('pirates') && this.lvl <= 40) {
            this.trainHref = [
                signUpHref(this.name, CourseType[0]),
                under2xLvl ? signUpHref(this.name, CourseType[1]) : undefined,
                under2xLvl ? signUpHref(this.name, CourseType[2]) : undefined,
                under2xLvl ? signUpHref(this.name, CourseType[3]) : undefined,
                under2xLvl ? signUpHref(this.name, CourseType[4]) : undefined,
            ];
        } else if (location.pathname.includes('fight') && this.lvl >= 250 || location.pathname == '/island/training.phtml') {
            this.trainHref = [
                signUpHref(this.name, CourseType[0]),
                under2xLvl ? signUpHref(this.name, CourseType[1]) : undefined,
                under2xLvl ? signUpHref(this.name, CourseType[2]) : undefined,
                under2xLvl ? signUpHref(this.name, CourseType[3]) : undefined,
                this.hp <= 3 * this.lvl ? signUpHref(this.name, CourseType[4]) : undefined,
            ];
        } else {
            // If Level > 40 at Krawk Island
            // If Level < 250 at Secret Ninja
            // Nothing is trainable
            this.trainHref = [];
        }

        // Information from statusTd
        this.status;
        this.costs = []; // Names of each resource cost, e.g. ['Lu Codestone', 'Lu Codestone']
        this.timeRemaining;
        this.timeRemainingDiscount;
        this.completeCourseBtn;
        this.payTbl;

        this.parseStatus(statusTd);
    }

    parseStatus(statusTd) {
        if (statusTd.innerText.includes('Course Finished!')) {
            this.status = Status.COMPLETE;
            this.completeCourseBtn = statusTd.getElementsByTagName('form')[0];
        } else if (statusTd.innerText.includes('Dubloon')) {
            this.status = Status.NEEDS_PAYMENT;
            for (const paymentB of statusTd.getElementsByTagName('b')) {
                this.costs.push(paymentB.innerText);
            }
            this.payTbl = statusTd.getElementsByTagName('table')[1];
        } else if (statusTd.innerText.includes('Codestone')) {
            this.status = Status.NEEDS_PAYMENT;
            for (const paymentB of statusTd.getElementsByTagName('b')) {
                this.costs.push(paymentB.innerText);
            }
            this.payTbl = statusTd.getElementsByTagName('table')[0];
        } else if (statusTd.innerText.includes('Time till course finishes')) {
            const [timeRemainingMatch, maybeDiscountMatch] = [...statusTd.innerText.matchAll(/(\d+)[^\d]+(\d+)[^\d]+(\d+)/g)];
            const [m, hr, min, sec] = timeRemainingMatch;
            this.timeRemaining = hr + ':' + min.padStart(2, '0') + ':' + sec.padStart(2, '0');
            if (maybeDiscountMatch) {
                const [m, hr, min, sec] = maybeDiscountMatch;
                this.timeRemainingDiscount = hr + ':' + min.padStart(2, '0') + ':' + sec.padStart(2, '0');
            }
            this.status = Status.IN_PROGRESS;
        } else {
            this.status = Status.NOT_TRAINING;
        }
    }

    generateNameCard() {
        const nameCard = document.createElement('td');
        nameCard.innerHTML = `<b>${this.name}</b>` + (this.trainingStat ? `<div>training ${this.trainingStat}</div>` : '');
        nameCard.style.borderTop = CONFIG.borderColor;
        nameCard.style.borderLeft = CONFIG.borderColor;
        nameCard.style.borderRight = CONFIG.borderColor;
        return nameCard;
    }

    generateStatCard() {
        const statTable = document.createElement('table');
        statTable.innerHTML = `<tbody>
  <tr>
    <td><a>Lv:</a></td>
    <td><b>${this.lvl}</b></td>
    <td><a>Str:</a></td>
    <td><b>${this.str}</b></td>
  </tr>
  <tr>
    <td><a>Def:</a></td>
    <td><b>${this.def}</b></td>
    <td><a>Mov:</a></td>
    <td><b>${this.mov}</b></td>
  </tr>
  <tr>
    <td><a>HP:</a></td>
    <td colspan='3'><b>${this.curHp} / ${this.hp}</b></td>
  </tr>
</tbody>`;
        statTable.style.width = '100%';
        const anchors = [...statTable.getElementsByTagName('a')];
        if (this.status == Status.NOT_TRAINING) {
            for (const idx in anchors) {
                const a = anchors[idx];
                if (this.trainHref[idx]) {
                    a.href = this.trainHref[idx];
                    a.innerText = '+' + a.innerText;
                }
            }
        }
        const tds = [...statTable.getElementsByTagName('td')];
        for (let i = 0; i < tds.length; i += 2) {
            tds[i].style.padding = '0 1px';
            tds[i+1].style.padding = '0 1px';
            tds[i+1].style.textAlign = 'right';
        }

        const result = document.createElement('td');
        result.appendChild(this.img);
        result.appendChild(statTable);
        result.style.borderLeft = CONFIG.borderColor;
        result.style.borderRight = CONFIG.borderColor;
        return result;
    }

    generateStatusCard() {
        const td = document.createElement('td');
        td.style.textAlign = 'center';
        switch (this.status) {
            case Status.NOT_TRAINING:
                td.innerText = 'Not Training';
                td.style.backgroundColor = CONFIG.statusColor.notTraining;
                break;
            case Status.NEEDS_PAYMENT:
                td.style.backgroundColor = CONFIG.statusColor.needsPayment;
                for (const payment of this.costs) {
                    // const amt = this.costs[payment];
                    const paymentShort = payment.split(' ')[0];
                    const paymentB = document.createElement('b');
                    paymentB.innerText = paymentShort;
                    td.appendChild(paymentB);
                    if (CONFIG.shopWizardBtn) {
                        td.appendChild(createSwLink(payment));
                    }
                    if (CONFIG.sdbBtn) {
                        td.appendChild(createSdbLink(payment));
                    }
                    td.appendChild(document.createElement('br'));
                }
                td.appendChild(this.payTbl);
                break;
            case Status.IN_PROGRESS:
                td.style.backgroundColor = CONFIG.statusColor.inProgress;

                // Affected by Fortune Cookie.
                if (this.timeRemainingDiscount) {
                    const timeRemainingB = document.createElement('b');
                    timeRemainingB.innerText = this.timeRemaining;
                    timeRemainingB.style.textDecoration = 'line-through';
                    td.appendChild(timeRemainingB);
                    td.appendChild(document.createElement('br'));

                    const discountB = document.createElement('b');
                    discountB.innerText = this.timeRemainingDiscount;
                    td.appendChild(discountB);
                } else {
                    const timeRemainingB = document.createElement('b');
                    timeRemainingB.innerText = this.timeRemaining;
                    td.appendChild(timeRemainingB);
                }
                break;
            case Status.COMPLETE:
                td.style.backgroundColor = CONFIG.statusColor.complete;
                td.appendChild(this.completeCourseBtn);
                break;
        }
        td.style.borderBottom = CONFIG.borderColor;
        td.style.borderLeft = CONFIG.borderColor;
        td.style.borderRight = CONFIG.borderColor;
        return td;
    }
}

class TrainingTable {
    constructor(baseTable) {
        const rows = [...baseTable.children[0].children];
        let tds = [];
        for (const row of rows) {
            tds = tds.concat([...row.children]);
        }
        this.pets = [];

        for (let i = 0; i < tds.length; i += 3) {
            const nameTd = tds[i];
            const statTd = tds[i + 1];
            const statusTd = tds[i + 2];
            this.pets.push(new Pet(nameTd, statTd, statusTd));
        }
    }

    getAllCosts() {
        const result = {};
        for (const pet of this.pets) {
            for (const payment of pet.costs) {
                if (payment in result) {
                    result[payment] += 1;
                } else {
                    result[payment] = 1;
                }
            }
        }
        return result;
    }

    storeCosts() {
        window.localStorage.trainingPayment = JSON.stringify(this.getAllCosts());
    }

    render() {
        const rendered = document.createElement('table');

        const rowCount = Math.ceil(this.pets.length / CONFIG.columns) * 3;
        rendered.appendChild(document.createElement('tbody'));
        const rows = [];
        for (let i = 0; i < rowCount; i++) {
            const row = document.createElement('tr');
            rows.push(row);
            rendered.firstChild.appendChild(row);
        }

        for (let i = 0; i < this.pets.length; i++) {
            const pet = this.pets[i];
            const baseRowIdx = Math.floor(i / CONFIG.columns) * 3;
            rows[baseRowIdx].appendChild(pet.generateNameCard());
            rows[baseRowIdx + 1].appendChild(pet.generateStatCard());
            rows[baseRowIdx + 2].appendChild(pet.generateStatusCard());
        }

        return rendered;
    }

    renderCostTable() {
        const costs = this.getAllCosts();
        const tbl = document.createElement('table');
        const tds = tbl.getElementsByTagName('td');
        const ul = document.createElement('ul');
        let paymentType = '';
        let category = 0;
        for (const payment in costs) {
            const cost = costs[payment];
            const li = document.createElement('li');
            li.innerText = `${payment} x${cost}`;
            ul.appendChild(li);
            if (payment.includes('Codestone')) {
                paymentType = 2
            } else {
                paymentType = 3;
            }
        }
        if (!paymentType) {
            return tbl;
        }
        tbl.innerHTML = '<tbody><tr><td><button id="link-sdb"></button></td><td></td></tr></tbody>';
        tds[1].appendChild(ul);

        const sdbBtn = tbl.getElementsByTagName('button')[0];
        sdbBtn.innerText = 'Open SDB';
        sdbBtn.onclick = () => {
            this.storeCosts();
            window.open('/safetydeposit.phtml?obj_name=&category=' + paymentType, '_blank');
        }

        return tbl;
    }
}

(function() {
    'use strict';

    if (location.pathname == "/safetydeposit.phtml") {
        fillSdbForm();
        showCostsOnSdb();
        return;
    }

    const content = document.getElementsByClassName('content')[0];
    content.removeChild(content.children[0]);

    const tbl = [...content.getElementsByTagName('table')].filter(tbl => tbl.width == '500')[0];

    const trainingTable = new TrainingTable(tbl);

    const final = trainingTable.render();
    tbl.parentElement.insertBefore(final, tbl);
    tbl.parentElement.insertBefore(trainingTable.renderCostTable(), final);

    tbl.parentElement.removeChild(tbl);

})();