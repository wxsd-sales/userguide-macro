/********************************************************
Copyright (c) 2022 Cisco and/or its affiliates.
This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.1 (the "License"). You may obtain a copy of the
License at https://developer.cisco.com/docs/licenses
All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.
*********************************************************
 * 
 * Macro Author:      	William Mills
 *                    	Technical Solutions Specialist 
 *                    	wimills@cisco.com
 *                    	Cisco Systems
 * 
 * Version: 1-0-0
 * Released: 11/29/22
 * 
 * This Webex Device macro enables you to display user guides as
 * webviews on your devices main display or Room Navigator.
 * 
 * Full Readme and source code availabel on Github:
 * https://github.com/wxsd-sales/userguide-macro
 * 
 ********************************************************/
import xapi from 'xapi';

/*********************************************************
 * Configure the settings below
**********************************************************/

const config = {
  buttonName: 'User Guide',
  target: 'OSD',
  content: [
    {
      title: 'Connect to an MS Teams Meeting',
      url: 'https://www.example.com'
    },
    {
      title: 'Connect to a Webex Meeting',
      url: 'https://www.example.com'
    },
    {
      title: 'Connecting your Device (BYOD)',
      url: 'https://www.example.com'
    },
    {
      title: 'Presentation Only',
      url: 'https://www.example.com'
    }
  ]
}

/*********************************************************
 * Below contains all the call event listeners
**********************************************************/

function main() {
  // set config
  xapi.Config.WebEngine.Mode.set('On');
  // create panel
  createPanel(config.content);
  // start listening
  xapi.Event.UserInterface.Extensions.Widget.Action.on(processWidget);
}

main();

function openWebview(url) {
  console.log('Opening url: ' + url);
  xapi.Command.UserInterface.WebView.Display({
    Mode: 'Fullscreen',
    Target: config.target,
    Url: url
  });
}

function closeWebview() {
  xapi.Command.UserInterface.WebView.Clear({ Target: config.target });
}

function processWidget(e) {
  console.log(e);
  console.log('Widget Event ' + e.WidgetId)
  if (e.Type != 'clicked' && !e.WidgetId.startsWith('userguide_option')) { return }

  openWebview(config.content[e.WidgetId.split('_').pop()].url);

}

function createPanel() {
  let rows = '';
  for (let i = 0; i < config.content.length; i++) {
    const row = `<Row>
        <Widget>
          <WidgetId>userguide_option_${i}</WidgetId>
          <Name>${config.content[i].title}</Name>
          <Type>Button</Type>
          <Options>size=4</Options>
        </Widget>
      </Row>`;
    rows = rows.concat(row);
  }

  const panel = `
    <Extensions>
    <Version>1.9</Version>
    <Panel>
      <Location>HomeScreen</Location>
      <Icon>Help</Icon>
      <Color>#FC5143</Color>
      <Name>${config.buttonName}</Name>
      <ActivityType>Custom</ActivityType>
      <Page>
        <Name>${config.buttonName}</Name>
        ${rows}
        <Options>hideRowNames=1</Options>
      </Page>
    </Panel>
  </Extensions>
  `;

  xapi.Command.UserInterface.Extensions.Panel.Save({ PanelId: 'userguide' }, panel);
} 
