// ==UserScript==
// @name         Book Lister
// @namespace    neopets.books
// @version      2024-10-25
// @description  Grays out read books in Inventory, SDB, and player shops for active pet.
// @author       You
// @match        https://www.neopets.com/books_read.phtml?pet_name=*
// @match        https://www.neopets.com/moon/books_read.phtml?pet_name=*
// @match        https://www.neopets.com/safetydeposit.phtml*
// @match        https://www.neopets.com/browseshop.phtml*
// @match        https://www.neopets.com/inventory.phtml
// @match        https://items.jellyneo.net/tools/results/
// @match        https://www.neopets.com/gallery/index.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

const CONFIG = {
    // How to mark books that are read
    lowlight: {
        background: 'gray',
        opacity: '50%',
        border: '',
    },
    // How to mark books that are unread
    highlight: {
        background: 'yellow',
        opacity: '',
        border: '',
    },

    // Comment out to remove graying/highlighting of locations.
    enabledLocations: [
        '/safetydeposit.phtml', // Safety Deposit Box
        '/browseshop.phtml', // Player Shops
        '/inventory.phtml', // Player Inventory
        '/gallery/index.phtml', // Player Galleries
    ],
};

// Differentiators for the different types of books.
const BookSet = {
    read: 'READ',
    unread: 'UNREAD',
    readTastic: 'READT',
    unreadTastic: 'UNREADT', // Notably, this is calculated as a delta from (ALL booktastic) minus (readTastic)
};

function keyFor(petName, bookSet=BookSet.read) {
    return `${bookSet}_${petName}`;
}

// Since some pictures are actually divs with backgroundImage set to something.
function extractTasticSrc(src) {
    if (src.endsWith('")')) {
        src = src.substring(0, src.length - 2);
    }
    return src.match(/([^\/]*)\.\w+$/)[1];
}

function extractTastic(img) {
    return extractTasticSrc(img.src);
}

function getActivePetName() {
    // For more modern layouts, this is a more consistent way of getting Pet Name.
    const modern = document.getElementsByClassName('profile-dropdown-link')[0];
    if (modern) { return modern.innerText; }

    // For classic layouts like SDB.
    const quickrefA = [...document.getElementsByTagName('a')].filter((a) => a.href == "https://www.neopets.com/quickref.phtml" )[0].innerText;
    return quickrefA.trim();
}

async function getPetBooks(petName, set) {
    if (set == BookSet.unreadTastic) {
        // Only 180 Booktastic Books so we'll hardcode it...
        const unreadTastic = new Set([
            "boo_10001_chocolate_cake_recip", "bvb_101stalebread", "boo_tyrannian_omelettes", "boo_orangegrundo2", "bvb_4millionpierecipes", "bbo_ace_adventures", "bbo_achyfi_recipes", "bbo_book6", "bbo_book2", "book_stamps",
            "boo_slothy_recipies","boo_y21haltot_book_grundo_lit","bbo_antigravity_games","bbo_astro_beginner","bbo_krelattack","boo_avocado_cook","boo_orangegrundo1","bbo_book5","boo_bbbcbtbahtjtbbbboiywt","bbo_beverage_recipes",
            "bbo_beyond_neopia","bbo_binarystars_andyou","boo_ufo_book","bbo_bbookvalueguide","bbo_boxofbolts","bbo_build_yourown_tele","bbo_building_tech","bbo_collmoonrock","bbo_computing","bbo_constspot",
            "bbo_crater_dwellings","bbo_cratersofkreludor","bbo_creatures_afar","boo_y17haltot_insdkrldnmines","bbo_defendyour","boo_defenders_comic","bbo_defend_neohome","bbo_derlyn_bio","bbo_diary_babyspacefungus","bbo_moon_bounce",
            "bbo_pushbutton","bbo_easydecor_lowgravitysit","boo_elephante_fashion","bbo_shuttle_procedure","boo_freaky_handbook","bbo_galadv","bbo_galactic_adventures","bbo_gamesonkreludor","bbo_organized","bbo_grundo_beauty",
            "bbo_phrases_grundo","bbo_grundo_brainwash","bbo_grundos_inspace","bbo_guide_orangefurn","book_stargazingconstellations","bbo_krel_neocola","bbo_halfmoon","bbo_book12","book_ucmaraq_skeith","bbo_earn_np_easy",
            "bbo_howtoescape","book_ucmaraq_hissi","boo_howl","bbo_meteorite_identify","boo_insignificantquests","bbo_book4","bbo_book3","bbo_from_the_mine","bbo_noteasybeingpurple","bbo_book8",
            "bbo_kreating_angles","bbo_kreluberry","bbo_kreludor_architecture","bbo_krelbedtime","kbo_christmas_carols", "bbo_krelcookies","bbo_cookie_book","bbo_kreludan_crossword","bbo_krelencyc","bbo_book7",
            "bbo_krelfacts","bbo_krelfash","bbo_krelgames","bbo_home_decor","bbo_kreludan_life","boo_space_mystery","bbo_krel_physics","bbo_krel_poems","boo_orangegrundo4","bbo_krel_sundaes",
            "bbo_kreludorcolour","bbo_lb_corridormaps","bbo_kreludor_budget","bbo_kreludorrainyday_activity","bbo_book10","bbo_kreludor_places_intrest","bbo_lazerenergy","bbo_krel_learning","bbo_lennies_space","boo_lightspeed",
            "bbo_lowgravity_rock","bvb_madeofstars","bbo_krel_maths","bbo_shower_protection","bbo_meteor_sites","bbo_meteorite_craftbk","boo_mind_control_dummies","bbo_minoptechmanual","bbo_moonmissions","bbo_rock_formations",
            "boo_moonotonous","bbo_memory_dr_sloth_quote","bbo_alienaisha_mythandlegend","bbo_neocola_book","bbo_zerog","boo_nephrites_notes","bbo_nerkmid_values","boo_orangegrundo10","boo_orangegrundo6","boo_orangegrundo8",
            "bbo_lb_oxygenandyou","bbo_picnicing_onkreludor","boo_polarchuck_pastimes","bbo_book1","bbo_programming","bbo_purple_truth","boo_orangegrundo5","boo_returning_to_neopia","bbo_roboticcareand","bbo_robot_fashion",
            "bbo_lenny_repair","bbo_robot_rock","bbo_rbffandp","boo_defenderrobottellall","bbo_book11","boo_scoops_of_friendship_run","boo_secretsofsloth","bbo_universe_secrets","bbo_situational_gravity","bbo_slime_and_you",
            "bbo_exploration","bbo_spacefashion","book_gmc_space_fashion","bbo_spacerockencyclop","bbo_spacestationholi","bbo_station_schematics","bbo_lb_spyders","bbo_stairway","boo_stuck_in_space","bbo_lag_taleof",
            "bbo_bigintermediate_evilplots","bbo_thecode","boo_all_sloth","bbo_great_betrayal","bbo_book9","boo_world_domination","bbo_orange_happy","bbo_krelflag","boo_magic_prank","bbo_the_space_ace","boo_sunandyou",
            "boo_orangegrundo9","boo_timemanagement","bbo_scouting_tips","boo_orangegrundo3","bbo_underthesurface1","bbo_underthesurface2","boo_orangegrundo7","boo_virtupets_delivery_train","book_waleincare101","bbo_meteor_crash",
            "book_auroraborealis","boo_wintery_petpet_compan","bbo_wishstar","boo_outside_neopia","bbo_yesterdays_future","bbo_lb_zarexdiary","bbo_zenor_bio","bbo_zerogravity","bbo_grundo_zurroball"
        ]);
        const readString = await GM.getValue(keyFor(petName, BookSet.readTastic), '[]');
        const readTastic = JSON.parse(readString);
        for (const read of readTastic) {
            unreadTastic.delete(read);
        }
        return unreadTastic;
    }
    const readString = await GM.getValue(keyFor(petName, set), '[]');
    return new Set(JSON.parse(readString));
}

async function getActivePetBooks(set) {
    return getPetBooks(getActivePetName(), set);
}

function setPetBooks(pet, bookString, set, showAlert) {
    GM.setValue(keyFor(pet, set), bookString).then((resolve, reject) => {
        if (showAlert) {
            alert(`Read list updated for ${pet}`);
        }
    });
}

class ReadBooksHandler {
    constructor() {
        const tables = [...document.getElementById('content').getElementsByTagName('table')];
        this.bookTable = tables.filter((tbl) => tbl.align == 'center')[0];
        this.isTastic = false;
    }

    getAllBookNames() {
        const descriptionTds = [...this.bookTable.getElementsByTagName('td')].filter((td, idx) => idx > 2 && idx % 2);
        return descriptionTds.map((td) => {
            const d = td.childNodes[0].data;
            return d.substring(0, d.length-5);
        });
    }

    getPetName() {
        const params = new URLSearchParams(window.location.search);
        return params.get('pet_name');
    }

    setUp() {
        const allBooks = this.getAllBookNames();
        const books = JSON.stringify(allBooks);
        const bookSet = this.isTastic ? BookSet.readTastic : BookSet.read;
        setPetBooks(this.getPetName(), books, bookSet);

        getPetBooks(this.getPetName(), BookSet.unread).then((unreadBooks) => {
            for (const readBook of allBooks) {
                unreadBooks.delete(readBook);
            }

            setPetBooks(this.getPetName(), JSON.stringify([...unreadBooks]), BookSet.unread, true);
        });
    }
}

class UnreadBooksHandler {
    constructor() {
        this.petName;
        const bookListHeaderMatch = document.getElementsByTagName('h2')[0].innerText.match(/(\w+) has \d+ books to read:/);
        if (!bookListHeaderMatch) {
            console.log('Results do not match book list');
            return;
        }
        this.petName = bookListHeaderMatch[1];
        console.log('Match book list for', this.petName);
    }

    setUp() {
        if (!this.petName) {
            return;
        }

        const anchors = document.getElementsByClassName('mall-block-grid-1')[0].getElementsByTagName('a');
        const unreadBooks = new Set();
        for (const anchor of anchors) {
            unreadBooks.add(anchor.innerText);
        }
        const books = JSON.stringify([...unreadBooks]);
        setPetBooks(this.petName, books, BookSet.unread);
    }
}

class ReadTasticHandler extends ReadBooksHandler {
    constructor() {
        super();
        this.isTastic = true;
    }

    getAllBookNames() {
        const imgTds = [...this.bookTable.getElementsByTagName('td')].filter((td, idx) => idx > 1 && !(idx % 2));
        return imgTds.map((imgTd) => {
            const img = imgTd.getElementsByTagName('img')[0];
            return extractTastic(img);
        });
    }
}

class AbstractBookHighlighter {
    constructor(doCalc=true) {
        this.activePetBooks;
        this.activePetTastic;
        this.activePetUnread;
        this.activePetUnreadTastic;
        this.calc = doCalc;
    }

    setUp() {
        if (!this.calc) {
            return;
        }
        Promise.all([
            getActivePetBooks(BookSet.read),
            getActivePetBooks(BookSet.readTastic),
            getActivePetBooks(BookSet.unread),
            getActivePetBooks(BookSet.unreadTastic),
        ]).then(
            ([readBooks, readTastic, unread, unreadTastic]) => {
                this.activePetBooks = readBooks;
                this.activePetTastic = readTastic;
                this.activePetUnread = unread;
                this.activePetUnreadTastic = unreadTastic;
                this.highlightBooks();
            }
        );
    }

    async getBooks() { return []; }

    async highlightBooks() {
        const books = await this.getBooks();
        for (const {name, imgName, highlightLocation} of books) {
            if (this.activePetBooks.has(name) || this.activePetTastic.has(imgName)) {
                this.lowlight(highlightLocation);
            } else if (this.activePetUnread.has(name) || this.activePetUnreadTastic.has(imgName)) {
                this.highlight(highlightLocation);
            }
        }
    }

    lowlight(location) {
        if (CONFIG.lowlight.background) {
            location.style.background = CONFIG.lowlight.background;
        }
        if (CONFIG.lowlight.opacity) {
            location.style.opacity = CONFIG.lowlight.opacity;
        }
        if (CONFIG.lowlight.border) {
            location.style.border = CONFIG.lowlight.border;
        }
    }

    highlight(location) {
        if (CONFIG.highlight.background) {
            location.style.background = CONFIG.highlight.background;
        }
        if (CONFIG.highlight.opacity) {
            location.style.opacity = CONFIG.highlight.opacity;
        }
        if (CONFIG.highlight.border) {
            location.style.border = CONFIG.highlight.border;
        }
    }
}

class SdbBookHighlighter extends AbstractBookHighlighter {
    getBooks() {
        const allTrs = [...[...document.getElementById('content').getElementsByTagName('table')].filter((tbl) => tbl.cellPadding == '4')[0].getElementsByTagName('tr')];
        const trs = allTrs.slice(1, allTrs.length - 1);

        return trs.map((tr) => {
            const name = tr.children[1].children[0].innerText.split('(')[0].trim();
            const highlightLocation = tr.children[1];
            const imgName = extractTastic(tr.children[0].getElementsByTagName('img')[0]);
            return {name, highlightLocation, imgName};
        });
    }
}

class PlayerShopHighlighter extends AbstractBookHighlighter {
    getBooks() {
        const buyAnchors = [...document.getElementsByTagName('a')].filter((a) => a.href.includes('buy_item.phtml?'));
        return buyAnchors.map(
            (a) => {
                return {
                    name: a.parentElement.getElementsByTagName('b')[0].innerText,
                    imgName: extractTastic(a.children[0]),
                    highlightLocation: a.parentElement,
                };
            });
    }
}

const BOOK_TYPES = new Set([
    'Book',
    'Booktastic Book',
    'Faerie Book',
    'Brightvale Books',
    'Moltaran Books',
    'Neovian Press',
    'Desert Scroll',
    'Qasalan Tablets',
]);

class InventoryHighlighter extends AbstractBookHighlighter {
    static isBook(gridItem) {
        return BOOK_TYPES.has(gridItem.children[0].getAttribute('data-itemtype'));
    }

    async getBooks() {
        let gridItems = [...document.getElementsByClassName('grid-item')];
        while(gridItems.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 200));
            gridItems = [...document.getElementsByClassName('grid-item')];
        }
        const bookItems = gridItems.filter(InventoryHighlighter.isBook);
        return bookItems.map((bookItem) => {
            return {
                name: bookItem.getElementsByClassName('item-name')[0].innerText,
                imgName: extractTasticSrc(bookItem.children[0].style.backgroundImage),
                highlightLocation: bookItem,
            };
        });
    }
}

class GalleryHighlighter extends AbstractBookHighlighter {
    getBooks() {
        const form = document.getElementById('gallery_form');
        const items = [...form.getElementsByTagName('td')].filter(item => item.children.length > 1 && item.width == '140');
        return items.map((item) => {
            return {
                name: item.children[2].innerText,
                imgName: extractTastic(item.children[0]),
                highlightLocation: item,
            };
        });
    }
}

const pathToHandlers = {
    '/books_read.phtml': ReadBooksHandler,
    '/moon/books_read.phtml': ReadTasticHandler,
    '/tools/results/': UnreadBooksHandler,

    '/safetydeposit.phtml': SdbBookHighlighter,
    '/browseshop.phtml': PlayerShopHighlighter,
    '/inventory.phtml': InventoryHighlighter,
    '/gallery/index.phtml': GalleryHighlighter,
};

(function() {
    'use strict';
    const path = window.location.pathname;

    if (!CONFIG.enabledLocations.includes(path)) {
        console.log('Path not enabled');
        return;
    }

    if (path in pathToHandlers) {
        const handler = new pathToHandlers[path]();
        handler.setUp();
    } else {
        console.warn('Unhandled Path:', path);
    }
})();