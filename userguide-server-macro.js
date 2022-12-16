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
 * Version: 1-0-1
 * Released: 11/29/22
 * 
 * This Webex Device macro enables you to display user guides as
 * webviews on your devices main display or Room Navigator.
 * 
 * Full Readme and source code available on Github:
 * https://github.com/wxsd-sales/userguide-macro
 * 
 ********************************************************/
import xapi from 'xapi';

/*********************************************************
 * Configure the settings below
**********************************************************/

const config = {
  buttonName: 'User Guide', // The main button name on the UI and its Panel Page Tile
  buttonColor: '#6F739E',
  showInCall: true,
  server: 'https://wxsd-sales.github.io/userguide-macro/content-examples/basics.json'
}

/*********************************************************
 * Below contains all the call event listeners
**********************************************************/

let timers = {};

let links = [];

async function main() {
  // Set config
  xapi.Config.WebEngine.Mode.set('On');
  // Create panel UI and update active
  createPanel(await getContent(config.server));
  updatedUI();
  // Start listening to Events and Statuses
  xapi.Event.UserInterface.Extensions.Widget.Action.on(processWidget);
  xapi.Status.UserInterface.WebView.on(updatedUI)
  xapi.Event.UserInterface.Extensions.Panel.Clicked.on(panelClicked);
}

setTimeout(main, 3000);

async function openWebview(content) {
  // Check if there are any inroom navagitors and if none change target to OSD
  if (content.target == 'Controller' && !await inRoomNavigators()) {
    content.target = 'OSD';
    console.log('No In Room Navigators changing target to OSD');
  }

  console.log('Active timers:' + JSON.stringify(timers))
  clearTimeout(timers[content.target])

  console.log('Opening: ' + content.title);
  xapi.Command.UserInterface.WebView.Display({
    Mode: content.mode,
    Title: content.title,
    Target: content.target,
    Url: content.url
  })
    .then(r => {
      if (!content.hasOwnProperty('autoclose') || content.autoclose == null) return;
      console.log('Auto closing content in: ' + content.autoclose + ' seconds')
      timers[content.target] = setTimeout(closeWebview, content.autoclose * 1000, content.target);
    })
    .catch(e => console.log('Error: ' + e))
}

// Close the Webview
async function closeWebview(target) {
  if (!await inRoomNavigators()) {
    target = 'OSD';
    console.log('No In Room Navigators changing to OSD');
  }
  console.log('Closing Webview on: ' + target);
  xapi.Command.UserInterface.WebView.Clear({ Target: target });
}

// Identify if there are any in room navigators
function inRoomNavigators() {
  return xapi.Status.Peripherals.ConnectedDevice.get()
    .then(devices => {
      return devices.filter(d => {
        return d.Name == 'Cisco Webex Room Navigator' && d.Location == 'InsideRoom'
      }).length > 0;
    })
    .catch(e => {
      console.log('No connected devices')
      return false
    })
}

// Process Widget Clicks
async function processWidget(e) {
  console.log('Widget Event ' + e.WidgetId)
  if (e.Type !== 'clicked' || !e.WidgetId.startsWith('userguide_option')) return
  const widgets = await xapi.Status.UserInterface.Extensions.Widget.get();
  const widget = widgets.filter(widget => widget.WidgetId == e.WidgetId);
  const num = e.WidgetId.split('_').pop();
  console.log('Button Clicked: ' + links[num].target)
  if (widget[0].Value == 'active') {
    closeWebview(links[num].target);
    return;
  }
  openWebview(links[num]);
}

// Updates the UI and show which content is visiable 
async function updatedUI() {
  console.log('Updating UI')
  const views = await xapi.Status.UserInterface.WebView.get()
  //console.log(views)
  links.forEach((content, index) => {
    const visiable = views.filter(e => e.URL.includes(content.url)).length > 0;
    xapi.Command.UserInterface.Extensions.Widget.SetValue({
      Value: visiable ? 'active' : 'inactive',
      WidgetId: 'userguide_option_' + index
    })
  })
}

async function panelClicked(event) {
  if(event.PanelId !== 'userguide') return;
  createPanel(await getContent(config.server))
}

function getContent(server){
  console.log('Checking server for new content');
  return xapi.Command.HttpClient.Get({ Url: server })
  .then(r=>{
    if(r.StatusCode != '200') return;
    return JSON.parse(r.Body)
  })
  .catch(e=>{
    console.log('Error getting content: ' + e.message)
    return links.length == 0 ? [] : links
  })
}

function createPanel(content) {
  links = content;
  console.log('Creating Panel')
  let rows = '';
  if(content == undefined || content.length < 0){
    console.log('No content');
    rows = `<Row>
        <Widget>
          <WidgetId>userguide_no_content</WidgetId>
          <Name>No Content Available</Name>
          <Type>Text</Type>
          <Options>size=4;fontSize=normal;align=center</Options>
        </Widget>
      </Row>`;
  } else {
    for (let i = 0; i < content.length; i++) {
      const row = `<Row>
          <Widget>
            <WidgetId>userguide_option_${i}</WidgetId>
            <Name>${content[i].title}</Name>
            <Type>Button</Type>
            <Options>size=4</Options>
          </Widget>
        </Row>`;
      rows = rows.concat(row);
    }
  }
  const panel = `
    <Extensions>
    <Version>1.9</Version>
    <Panel>
      <Location>${config.showInCall ? 'HomeScreenAndCallControls' : 'HomeScreen'}</Location>
      <Icon>Help</Icon>
      <Color>${config.buttonColor}</Color>
      <Name>${config.buttonName}</Name>
      <ActivityType>Custom</ActivityType>
      <Page>
        <Name>${config.buttonName}</Name>
        ${rows}
        <Options>hideRowNames=1</Options>
      </Page>
    </Panel>
  </Extensions>`;
  xapi.Command.UserInterface.Extensions.Panel.Save({ PanelId: 'userguide' }, panel);
} 
