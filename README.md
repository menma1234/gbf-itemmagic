# Granblue Fantasy Item Magic

This extension for Chrome provides various tools for working with items in the mobile game [Granblue Fantasy](http://granbluefantasy.jp/). It currently uses a Developer Tools panel. This may be changed in the future depending on how lazy I am. There's no real reason why the interface is in the Developer Tools, other than it being easier for me.

There are currently three features that this extension provides:
* Buttons for one-click selling of weapons and summons (somewhat deprecated now due to the new functionality of the presents box, but still kept here in case you need to clear out your inventory)
* A button to automatically pull from the event gacha
* A button to move all angel weapons/summons from crate to inventory. The main point of this feature is to have an easy way of moving all angels of one type from your presents to your inventory by using the built-in presents management.

## Installation

Download a [ZIP of this repo](https://github.com/menma1234/gbf-itemmagic/archive/master.zip), unzip it, enable developer mode on the extensions page, hit "Load unpacked extension...", and find the directory you unzipped it to. I'm not providing a packed version of this.

## Usage

Open Developer Tools and switch to the GBF Item Magic panel.

For selling weapons and summons, select the options and click sell. A dialog box will appear in the browser asking you to confirm.

For pulling from the event gacha, click the corresponding button. You *must* be on the event page (or the gacha page for Guild Wars events) in order to use it. The script will stop once the SSR is pulled unless "Don't stop at SSR" is checked. The number of items pulled each time is dependent on your setting when you click the button (e.g. if you have it set to 100, then it will pull 100 at a time, if it's set to 50, it'll pull 50, etc.).

For moving angels, select either weapon or summon and the crate number, and then press the button. A dialog box will appear in the browser asking you to confirm.

## Important Notes

* When selling weapons, there is no check for whether or not a weapon has a skill. If you are using the autoselling feature, be sure that there are no weapons with skills in your inventory if you don't want those to be sold. The one exception is devil elements, which are always ignored.
* If you navigate away from the page while the extension is doing its thing, it will stop prematurely.

## How to Play with Developer Tools

1. Open Chrome and press F12 on your keyboard. Alternatively, open the Chrome menu and go to More tools -> Developer tools. This will open a new section.
2. If you do not see white bars around the webpage with some numbers at the top, in the new section that's opened, click the smartphone icon in the top left.
3. Navigate to http://gbf.game.mbga.jp/ in this tab. Resize the window as needed as the contents will fill the window.

Alternatively, with the new PC browser version, you can skip step 2. If the white bars are shown, click the smartphone icon to disable device mode and navigate to http://game.granbluefantasy.jp/ instead.

## Future

Stuff I plan to do if I'm not lazy, in no particular order:
* Make it a toolbar button instead
* More settings for ignoring weapons with skills/bonuses when feeding
* Add autofeed feature
* Do stuff with the items pulled from the gacha
