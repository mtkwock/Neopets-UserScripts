# Neopets-UserScripts
Fun or Small QoL scripts to improve Neopets Browsing Experience

## ABOUT

These are UserScripts that I've made for myself, but believe some others can make use of. Ideally, these scripts will still fall under the rules and guidelines set by TNT along with the mods of the Neopets Subreddit/Subreddit Discord. I will attempt to remove or edit scripts that have been rejected to keep compliance.

I currently make these scripts to be used in TamperMonkey. I also primarily use FireFox to do my development. If there are issues with other browsers, please raise an issue.

Do note that this is a personal project! It's a game after all, and this is merely to satiate my desire to improve my experience within Neopets while still having fun doing some programming.

## The scripts

### Bank Interest - Size Matters

**Status:** `APPROVED` - Deemed Safe to use by r/Neopets Mods, See [Discord Message Link](https://discord.com/channels/123668853698854913/1194010372173213697/1297201465965940746)


This script is a small one that makes the `Collect Interest` Button on the Bank Page far larger than usual, with optional animations. This also (optionally) makes the Deposit and Withdraw inputs completely disabled. This script is 30% to prevent losing your daily interest and 70% just to have fun with messing around with the button size and making animations.

There are a few things you can do to adjust your interactions, all available by changing the CONFIG object.

```js
const CONFIG = {
    // Choose what size you want the interest button to be
    size: Size.large,
    beat: Beating.none,

    // Disabling the Withdraw and Deposit Buttons if the Interest Button is available.
    disableWithdrawDeposit: true,
    // Message to put on the inputs and buttons if Interest is shown.
    disabledMessage: '?!INTEREST?!',
};
```

By changing the above object's values, you can adjust the interaction to your preferences. You can see some presets above in the `Size` object along with the `Beating` object.  Play around with it to find a combination that you like.

You can always adjust the actual variables within the options to make it very custom, but I find these good enough at the moment.


### Book Library

**Status:** `PENDING APPROVAL` - Rough Guidelines for implementation determined. Submitting Script for approval by r/Neopets mods.

This script keeps an internal memory of your books read for each of your pets. It also grays-out books that you have read in your SDB, Inventory, and Shop Stock/Gallery.

To update your pet's read-book list, visit `https://www.neopets.com/books_read.phtml?pet_name=[PETNAME]` along with the Booktastic page. Additionally, go to [JN's Book Checklist](https://items.jellyneo.net/tools/book-checklist/) and follow directions to set up your pet's unread checklist. You only need to go to JN's checklist once per pet (or if new books come out). However, in order to update your read list (e.g. after reading a dozen books), you will still need to visit your pet lookup page(s) again.

Updatae the CONFIG object at the beginning of the script to customize the script to change how highlights and lowlights are shown along with disabling of locations.

```js
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
```

#### Critical Features

Mainline features

1. [DONE] On visiting Pet Lookup, stores all of your pet's read books locally.

   Regular Books: `https://www.neopets.com/books_read.phtml?pet_name=`

   Booktastic: `https://www.neopets.com/moon/books_read.phtml?pet_name=`
2. [DONE] In your (Inventory, SDB, Shop Stock, Item Gallery) books your ACTIVE PET has read are grayed out
3. [DONE] Customizability of the GRAYING effect. e.g. Opacity, bg color
4. [DONE] Able to toggle the graying effect in different locations (e.g. Do not display in Shop Stock)
5. [DONE] Books in available locations which your pet has NOT READ are highlighted (e.g. yellow outline, light yellow BG).
6. [DONE] Parses Unread Books from Jelly Neo's Book Checklist page after user loads into it (Requires full manual input of the Page Source). This is then kept up to date for that pet whenever viewing the Read Books page.

#### Potential Features

These are features that are not critical and may not be implemented.

The below have relatively difficult impementations thata

1. [Low Priority - Not doing] Remember books in your Inventory, SDB, Shop Stock, Gallery and highlight these books differently (e.g. Books that your pet has not read but is in inventory are YELLOW instead of GRAY)
2. [REJECTED] ~~Automated/Manual list of ALL books. Potentially opens a link to JellyNeo's most recent books and updates it?~~ Full automation rejected due to potential automated web-scraping.

  Instead, electing to have it store remaining books when the user MANUALLY uses [JN's Book Checklist](https://items.jellyneo.net/tools/book-checklist/) - See Mainline Features [6]

4. [Low Priority - Not Doing] In your Pet Lookup, able to list UNREAD books, along with links to JellyNeo, Shop Wizard, Trading Post.

These might be considered unfair for other players

1. [DONE] In PLAYER SHOPS, books your ACTIVE PET has read are grayed out. - No notable time-based advantage since player shops are already the market competition.
2. [Low priority - Not Doing] In the TRADING POST, books your ACTIVE PET has read are grayed out.
3. [Low Priority - Not Doing] In Auction House, books your ACTIVE PET has read are grayed out.
4. [REJECTED] ~~In NPC SHOPS, books your ACTIVE PET has read are grayed out.~~ This gives potential timing-based advantage if the player chooses only "cheap/common" books as their active pet.

