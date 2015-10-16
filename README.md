# Granblue Fantasy Autoseller

This extension for Chrome provides a button to sell all weapons/summons with one click for the mobile game [Granblue Fantasy](http://granbluefantasy.jp/). It currently uses a Developer Tools panel. This may be changed in the future depending on how lazy I am.

I don't expect anyone to actually derive any use from this and is merely for my own convenience.

## Installation

Download a [ZIP of this repo](https://github.com/menma1234/gbf-autosell/archive/master.zip), unzip it, enable developer mode on the extensions page, hit "Load unpacked extension...", and find the directory you unzipped it to. I'm not providing a packed version of this.

## Usage

Open Developer Tools, switch to the GBF Autosell panel, and open it game. This is required to grab your user ID. Select the options and click sell. A dialog box will appear in the browser asking you to confirm.

## How to Play with Developer Tools

1. Open Chrome and press F12 on your keyboard. Alternatively, open the Chrome menu and go to More tools -> Developer tools. This will open a new section.
2. In the new section that's opened, click the smartphone icon in the top left.
3. Click the three dots immediately to the left of the X in the top right and select "Show console". A new section will open at the bottom.
4. Select the emulation tab and select a mobile device in the model dropdown (preferably Google Nexus 4 or similar).
5. Uncheck emulate screen resolution.
6. Navigate to http://gbf.game.mbga.jp/ in this tab. Resize the window as needed as the contents will fill the window.
7. From now on, all you need to do after opening Chrome is steps 1 and 6.

## Future

Stuff I plan to do if I'm not lazy:
* Make it a toolbar button instead
* More settings for ignoring weapons with skills/bonuses
* Add autofeed feature
