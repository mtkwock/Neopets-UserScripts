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

**Status:** `IN PROGRESS` - Designing features and trying to get approval before starting

This script keeps an internal memory of your books read for each of your pets. It also grays-out books that you have read in your SDB, Inventory, and Shop Stock/Gallery.

#### Critical Features

Mainline features

1. On visiting Pet Lookup, stores all of your pet's read books locally.

   Regular Books: `https://www.neopets.com/books_read.phtml?pet_name=`

   Booktastic: `https://www.neopets.com/moon/books_read.phtml?pet_name=`
2. In your (Inventory, SDB, Shop Stock, Item Gallery) books your ACTIVE PET has read are grayed out
3. In your Pet Lookup, able to list UNREAD books, along with links to JellyNeo, Shop Wizard, Trading Post.
4. Customizability of the GRAYING effect. e.g. Opacity, bg color
5. Able to toggle the graying effect in different locations (e.g. Do not display in Shop Stock)

#### Potential Features

These are features that are not critical and may not be implemented.

The below have relatively difficult impementations thata

1. Remember books in your Inventory, SDB, Shop Stock, Gallery and highlight these books differently (e.g. Books that your pet has not read but is in inventory are YELLOW instead of GRAY)
2. Automated/Manual list of ALL books. Potentially opens a link to JellyNeo's most recent books and updates it?
3. Books in available locations which your pet has NOT READ are highlighted (e.g. yellow outline, light yellow BG).

These might be considered unfair for other players

1. In the TRADING POST, books your ACTIVE PET has read are grayed out.
2. In PLAYER SHOPS, books your ACTIVE PET has read are grayed out.
3. In NPC SHOPS, books your ACTIVE PET has read are grayed out.
4. In Auction House, books your ACTIVE PET has read are grayed out.

