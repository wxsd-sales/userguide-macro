# User Guide Macro
This Webex Device macro enables you to display user guides as webviews on your devices main display or Room Navigator

![ezgif com-gif-maker (3)](https://user-images.githubusercontent.com/21026209/208012076-694d40b2-f1e2-4f83-804a-62067069a8ce.gif)

## Features

- Displays a list of locally configured or remotely fetched content in a Button / Panel on the Webex Device
- Each URL content can be set to displayed on either the main OSD or a Webex Room Navigator
  - If no Navigator is present ( the user guide panel is open on a Touch 10 for example), the content will be opened on the OSD instead.
- Each content can be set to auto close after a set time. So in the case where the content is an auto played video, once it has finished the content is closed without requiring the user to do so. Each content option can have its own auto close timer set in the configuration.
   - At any time, the user can close the content by tapping on the same button they used to open it with


## Setup

## Requirements:

- RoomOS/CE 10.x or above Webex Device (10.18.x for Room Navigator web views).
- Web admin access to the device to uplaod the macro.
- Network connectivity for your Webex Device to open the webview content you want to display.

### Installation Steps:

1. Download the ``userguide-*-macro.js`` file and upload it to your Webex Room devices Macro editor via the web interface.
2. Configure the Macro by changing the initial values, there are comments explaining each one.
3. Enable the Macro on the editor.


## Validation

Validated Hardware:

* Room Kit Pro
* Desk Pro
* Room Kit

This macro should work on other Webex Devices with WebEngine support but has not been validated at this time.

## Demo

*For more demos & PoCs like this, check out our [Webex Labs site](https://collabtoolbox.cisco.com/webex-labs).

## License

All contents are licensed under the MIT license. Please see [license](LICENSE) for details.


## Disclaimer

Everything included is for demo and Proof of Concept purposes only. Use of the site is solely at your own risk. This site may contain links to third party content, which we do not warrant, endorse, or assume liability for. These demos are for Cisco Webex usecases, but are not Official Cisco Webex Branded demos.


## Questions

Please contact the WXSD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=userguide-macro) for questions. Or, if you're a Cisco internal employee, reach out to us on the Webex App via our bot (globalexpert@webex.bot). In the "Engagement Type" field, choose the "API/SDK Proof of Concept Integration Development" option to make sure you reach our team. 
