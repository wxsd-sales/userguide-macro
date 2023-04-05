# User Guide Macro
This Webex Device macro enables you to display user guides as webviews on your devices main display or Room Navigator

![ezgif com-gif-maker (3)](https://user-images.githubusercontent.com/21026209/208012076-694d40b2-f1e2-4f83-804a-62067069a8ce.gif)

## Features

1. Displays a list of locally configured or remotely fetched content in a Button / Panel on the Webex Device
2. Each URL content can be set to display on either the main OSD or an in room Navigator
  - If no navigator is present, the content will be opened on the OSD instead.
3. Each content can be set to auto close after a set time. So in the case where the content is an auto played video, once it has finished the content is closed without requiring the user to do so. Each content option can have its own auto close time set in the configuration.

## Requirements
1. RoomOS/CE 10.x or above Webex Device (10.18.x for Room Navigator web views).
2. Web admin access to the device to uplaod the macro.
3. Network connectivity for your Webex Device to open the webview content you want to display.

## Setup

1. Download the ``userguide-*-macro.js`` file and upload it to your Webex Room devices Macro editor via the web interface.
2. Configure the Macro by changing the initial values, there are comments explaining each one.
3. Enable the Macro on the editor.


## Validation

Validated Hardware:

* Room Kit Pro
* Desk Pro
* Room Kit

This macro should work on other Webex Devices but has not been validated at this time.

## Support

Please reach out to the WXSD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=userguide-macro).
