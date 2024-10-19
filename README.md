# Neopets-UserScripts
Fun or Small QoL scripts to improve Neopets Browsing Experience

## ABOUT

These are UserScripts that I've made for myself, but believe some others can make use of. Ideally, these scripts will still fall under the rules and guidelines set by TNT along with the mods of the Neopets Subreddit/Subreddit Discord. I will attempt to remove or edit scripts that have been rejected to keep compliance.

I currently make these scripts to be used in TamperMonkey. I also primarily use FireFox to do my development. If there are issues with other browsers, please raise an issue.

Do note that this is a personal project! It's a game after all, and this is merely to satiate my desire to improve my experience within Neopets while still having fun doing some programming.

## The scripts

### Bank Interest - Size Matters

**Status:** `PENDING` - Not (yet) deemed Approved by Reddit Mods

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
