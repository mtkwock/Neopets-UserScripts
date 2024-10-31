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


### Training Card/Reformatter

NOTE: Training Card is the newer of the two after realizing that building the table constructively instead of modifying the existing table is far more stable and flexible. I suggest using that one as it's probably more stable and fully featured.

**STATUS:** `APPROVED` - Reformatter has been APPROVED for sharing and usage by Neopets moderators.

NOTE: Training Card(v2) and Training Center(v2.1) have not yet been approved, but are more stable as I will be updating those.

Highly condenses the Training Status Page into a smaller (slightly configurable) grid. This also aggregates payments and shows it on the Safety Deposit Box when you navigate there. This is very useful if you have more than 6+ pets since the page was designed with only 4 pets in mind.

Note that this has only been tested on Mystery Island Training and Krawk Island and NOT the Secret Ninja Training Academy because I don't yet have any level 250 Neopets...

There are THREE different versions of this script. Currently only v1 (Training Reformatter) is approved for use. I am now sending in v2.1 for review.

#### Features

* Neopets are compressed into a table (3-5 columns looks pretty good)
* Removes unnecessary text and whitespace from each area to conserve more space
* Aggregates currently needed payments, allowing you to easily determine how many of each Dubloon/Codestone you need.
* (v2) Color coded states of training. This is configurable.
* (v2) When opening SDB from this page, fills the Codestones/Dubloon counts with required counts (similar to Auto-filling the Til value)
* (v2) Allows training initialization from the Status Page
* (v2) Immediately navigates you out of the Complete Co20urse page back to the Status Page.
* (v2.1) All updates to pet training status can be done without reloading the page. This uses fetches to update the page so we can avoid the excess page reloads! Updates are "Complete Course", "Start Course", "Pay", and "Cancel"
* (v2.1) Added a Log Area so players can see what has occurred!
* (v2.1) Ability to censor names using arbitrary function. Example censors `MyPetName` into `MyPe*******`

TODO-list

* Test Secret Ninja Training Academy (Probably supported in 2.0 and 2.1)
* Consider navigating straight to status page from the main/courses page.

#### Customization

At the top of the file, you can edit the `CONFIG` object to more appropriately change it to your liking.

```js
const CONFIG = {
    // Number of Columns. 5 is the max that fits "nicely". 3-5 all work well.
    columns: 5,
    // Whether to add Shop Wizard button next to Codestone/Dubloons
    shopWizardBtn: true,
    // Whether to add Safety Deposit Box button next to Codestone/Dubloons
    sdbBtn: true,
    // Background Colors to apply to the status area depending on context.
    // Must be CSS colors.
    statusColor: {
        notTraining: 'lightgray',
        needsPayment: 'indianred',
        inProgress: 'moccasin',
        complete: 'lightgreen',
    },

    // Border of each Pet Card.
    borderColor: '1px solid gray',

    // Quickly Navigate back to Status Page after Course Completion.
    skipCompleteCourseScreen: true,
};
```

### Book Library

**Status:** `FEEDBACK RECEIVED, UPDATE PENDING APPROVAL` - Implementation done. Certain JN features and Player Shop features required changing. Updated with new propals, re-submitting Script for approval by r/Neopets mods.

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
6. [DONE]  Changed to accessing a GitHub file which will calculate the unread books for your pet. This was changed because JellyNeo scraping is not allowed as per their policy (Even if it would actually decrease their traffic because they don't have to keep recalculating it...). This GitHub can be visited from the Pet's Book Lookup via the link under the pet picture. Opening this page from that link will generate the Unread Books and provide a minimal interface to see remaining books as well as SW links.
7. [DONE] In the TRADING POST, books your ACTIVE PET has read are grayed out. - Timing is not a question here. This is better to confirm that you need the book in question.
8. [DONE] In Auction House, books your ACTIVE PET has read are grayed out. - It's an auction, it'd be far better to look it up the item in other ways to determine its value rather than checking your pet's read status.

#### Potential Features

These are features that are not critical and may not be implemented.

The below have relatively difficult impementations that may prohibit feature creation.

1. [Low Priority - Not doing] Remember books in your Inventory, SDB, Shop Stock, Gallery and highlight these books differently (e.g. Books that your pet has not read but is in inventory are YELLOW instead of GRAY)
2. [REJECTED] Proposal 1 ~~Automated/Manual list of ALL books. Potentially opens a link to JellyNeo's most recent books and updates it?~~ Full automation rejected due to potential automated web-scraping.

  [REJECTED] Proposal 2: ~~Parses Unread Books from Jelly Neo's Book Checklist page after user loads into it (Requires full manual input of the Page Source). This is then kept up to date for that pet whenever viewing the Read Books page.~~

  Instead, Using a GitHub page that holds (most) books to calculate unread books - See Mainline Features [6].

3. [Low Priority - Not Doing] In your Pet Lookup, able to list UNREAD books, along with links to JellyNeo, Shop Wizard, Trading Post.

4. [POSSIBLE] When reading a book to your pet, auto-updates local DB of read and unread books.

These might be considered unfair for other players and are being reviewed.

1. [REJECTED] Proposal 1: ~~In PLAYER SHOPS, books your ACTIVE PET has read are grayed out. - No notable time-based advantage since player shops are already the market competition.~~

   [DONE] Proposal 2: Add a button that can be clicked to check an item's read status. This is equivalent to copying the item name and searching for it in a read/unread text file.

2. [REJECTED] ~~In NPC SHOPS, books your ACTIVE PET has read are grayed out.~~ This gives potential timing-based advantage if the player chooses only "cheap/common" books as their active pet.
