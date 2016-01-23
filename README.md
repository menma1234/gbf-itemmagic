# Granblue Fantasy Item Magic

This extension for Chrome provides various tools for working with items in the mobile game [Granblue Fantasy](http://granbluefantasy.jp/). It currently uses a Developer Tools panel. This may be changed in the future depending on how lazy I am.

There are currently two features that this extension provides:
* Buttons for one-click selling of weapons and summons
* A button to automatically pull from the event gacha

## Installation

Download a [ZIP of this repo](https://github.com/menma1234/gbf-itemmagic/archive/master.zip), unzip it, enable developer mode on the extensions page, hit "Load unpacked extension...", and find the directory you unzipped it to. I'm not providing a packed version of this.

## Usage

Open Developer Tools, switch to the GBF Item Magic panel, and open the game. This is required to grab your user ID.

For selling weapons and summons, select the options and click sell. A dialog box will appear in the browser asking you to confirm.

For pulling from the event gacha, click the corresponding button. You *must* be on the event page in order to use it. If the "Empty current box" checkbox is not selected, the script will stop once the SSR is pulled.

## Important Notes

* When selling weapons, there is no check for whether or not a weapon has a skill. If you are using the autoselling feature, be sure that there are no weapons with skills in your inventory if you don't want those to be sold. The one exception is devil elements, which are always ignored.
* If you navigate away from the page while the extension is doing its thing, it will stop prematurely.

## How to Play with Developer Tools

1. Open Chrome and press F12 on your keyboard. Alternatively, open the Chrome menu and go to More tools -> Developer tools. This will open a new section.
2. In the new section that's opened, click the smartphone icon in the top left.
3. Click the three dots immediately to the left of the X in the top right and select "Show console". A new section will open at the bottom.
4. Select the emulation tab and select a mobile device in the model dropdown (preferably Google Nexus 4 or similar). If you don't see this tab, select the three dots beside "Console" and select Emulation from the dropdown.
5. Uncheck emulate screen resolution.
6. Navigate to http://gbf.game.mbga.jp/ in this tab. Resize the window as needed as the contents will fill the window.
7. From now on, all you need to do after opening Chrome is steps 1 and 6.

## Future

Stuff I plan to do if I'm not lazy, in no particular order:
* Make it a toolbar button instead
* More settings for ignoring weapons with skills/bonuses when feeding
* Add autofeed feature
* Do stuff with the items pulled from the gacha
