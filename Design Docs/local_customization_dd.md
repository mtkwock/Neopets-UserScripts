# Neopets Local User Customization Design Doc

### Metadata

**Author:** mkwock

**Last Update:** Nov 1, 2024

**Status:** Draft

## Background

Neopets is a wonderful customization site with thousands of items that can be applied to dozens of different virtual pets. This allows players essentially endless options for changing their pet to each of their own liking.

However, just because there are numerous options, this does not mean that every single thing a player can imagine will be possible.

Some examples:
* Not every item can be used together. This is very noticeable with wigs, hats, horns, etc.
* Different items will restrict what parts of the pet appears (Removing wings, body, etc.) 
* Not every item appears how one would want. It's easy to see with various dresses on the Bori, for instance, that it just doesn't look quite right.
* Not every item exists! Thousands of items will never satiate the endless need for exact personal customizations.

## Proposal Overview

I propose making a browser (FireFox and possibly Chrome) extension which allows for users to take full control of their own Neopets personalizations. These changes would only be visible to themselves, but would allow their own full customization by giving them the ability to create their own items and apply them to their own Neopets.  Players could save and share these customized items with others who use the extension.

Longer term, it's possible that these items can be shared with TNT (The Neopets Team) with full examples of what the items would look like, to inspire user-submitted designs for TNT to use as official items!

## Scope

### Technology

#### Option 1: FireFox/Chrome extension

Being an extension allows the largest flexibility in applying updates.

 * This includes the ability to load in JavaScript like TamperMonkey
 * This also gives enables access to the FileSystem. This permission will be restricted to a file folder which users can update to include their items' pictures, or perhaps different item databases that users can more easily share with each other.
 * This will also likely be the easiest way to install large groups of differently working scripts and using them independently per page. Since this is expected to work across the site, it shouldn't need to inject the entire project on every single page (Could cause unnecessary slowdowns)
 * Can start as multiple files that are compiled down to minified JS for faster loads.
 * Can write the source in TypeScript... I like TypeScript... or use Templating engines to create better consistent interactions.

Downsides
 * Extensions are not as generally accepted by the community.
 * Making personal edits to the Extension will likely be more difficult since it's not a single script that someone would be able to easily parse, understand, and edit.
 * Extensions are nontrivial to build. I do not have much experience making them, so learning will be a larger process.

#### Option 2: (Large) TamperMonkey UserScript

UserScripts are the more generally used way that players customize their Neopets experience. Players are familiar with using these and moderators have an easier time handling this.

Upsides
 * Community-accepted way to change their site interactions
 * Fairly powerful in customizations. Easy installation for players
 * Easily changed by users to fit their needs.
 * Forced smaller script.

Downsides
 * Site-wide changes that are handled differently depending on page will become nontrivial, especially as pages get more complex
 * The script needs to be single file to hold all of the data. This could quite easily make a very very bulky file (1-2k lines) which is a nuisance to load and run on every single page.
 * Must be pure JS (With potential JQuery) to run. Compilation and optimization are nil. Types aren't going to happen.
 * Cannot access Filesystem. This is pretty big to enable sharing, or more local testing. Without a bit of access (or without being able to store images), the customization will be restricted to web pages or users learning how to transform pictures into blob format.

### Expected Features

#### Dynamically apply Items (pictures) onto Dynamic Pet Canvases

For certain pages, Neopets dynamically generates the pet's pictures. This can be seen anywhere there's animation, e.g. Customize! page and a Pet's specific page. These Neopets are built from overlaying image layers on top of each other to form the full picture. Notably, animations are more complex and are generated and animated via HTML5'd flash animations.

#### Create and Save Custom Items

This would entail making a basic UI which enables custom item creation along with previews on how it looks on your pet.

Potential item data example:
```js
{
    // Unique id used to distinguish and access items
    item_id: 'unique_item_id'

    // Item name to appear when selecting. This should be prettier.
    name: 'My Item',

    // For usage in combining multiple databases with possibly newer items. This solves the overlap
    version: 1

    // Optional description...
    description: 'An item that can only be used by Basic Kacheeks'
    // What the items will look like when selecting
    thumbnail: 'link/to/thumbnail.png',
    // The Image layers to be applied and how
    layers: [
      {
          src: 'file://path/to/my/image.png',
          layer: 25,
          opacity: 1.0,
      },
      {
          src: 'https://imgur.com/my/hosted/file.gif',
          layer: 50,
          opacity: 0.5,
      },
      {
          src: 'blob:type=png,AAARAWBLOBFILE',
          layer: 30,
          opacity: 1.0,
      },
    ],
    // What Neopet types can use this item. It's to allow users to
    // easily determine if the pet can use it when customizing.
    // Default should match whatever the user is customizing.
    restrict: [
      {
        pet: 'Kacheek',
        color: 'Basic',
      },
      {
        pet: '*',
        color: 'Maraquan',
      },
    ],
    remove_layer: [{
        layer: 25, // e.g. Head
    }],
}
```

UI mockup to be determined.

I expect this to either be its own window (usable in the extension as its own page) or an update to the Neopet Customization Page.

SAVING this data will either become a locally stored FILE which can be written to and updated manually or through the UI.

This file should be loadable, saveable, and combineable with others. Perhaps I use a .proto file?  Exact technology decision to be determined.

This will comprise the `User Item Database` and be shareable with others because it will be a single data file.

Questions
 * How to combine databases?
 * Perhaps ability to export selected single items/item groups?
 * How to sort items?

#### Use Custom Items through the Customize! page and save this

When entering the Customize! page, another UI will appear which allows players to add available Custom Items to the Neopet. These items will be restricted based on the aforementioned restricts.

A separate save function will be available which saves this.

This will comprise a separate data file which will be filled with the following approximate data type:

```js
{
    // Whenever this pet is seen, use the images
    pet_name: 'XxMy_Wonderful_PetxX',
    // List of custom items to apply
    applied_items: [
      'my_item_1',
      'my_item_2',
      'my_item_3',
    ],
    
    statics: [
      happy: 'path/to/generated/happy/static',
      sad: 'path/to/generated/sad/static',
    ]

    // When combining, use the latest ones.
    last_update: 123344555
}
```

This will be separately saved in a similar db. This should also be loadable and combineable. 

When saving this, it also needs to be able to generate static images for the pet (Happy, Sad, Angry, Sick) and store it locally.

Questions:
 * This may need to be combined with the DB if shareable with others?
 * Perhaps it can be autogenerated on the fly?  idk
 * How should these be generated? It's easy when on the custom page because you can just screenshot the node (replacing it with each of the faces) and store that.
 * Does this also need to store a different version for BattleDome?  Notably, there are versions of the image without background/foreground items.

#### Replace Neopets' static images with your own customizations whenever possible.

This can relatively easily be done by searching for all images containing the src `/MyPetName/` and replacing it with the local static images. This is a very small script that can be loaded and applied anywhere on the site. (And it'll load faster since it's local instead of pulling from Neopets' images)

#### (stretch) Community sharing

Making these custom items is great, but perhaps sharing them with friends could make it more fun!

Options to share:
1. Export Database of Custom Items/Pet customs as a single file
2. Import Database file using extension
3. (Stretch) Create centralized site where these are held and more easily displayed.


## Current Implementation Decisions

* Main: FireFox extension
* Language: TypeScript
* Database style: textproto file
