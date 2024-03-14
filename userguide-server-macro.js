/********************************************************
 * 
 * Macro Author:      	William Mills
 *                    	Technical Solutions Specialist 
 *                    	wimills@cisco.com
 *                    	Cisco Systems
 * 
 * Version: 1-0-3
 * Released: 04/02/23
 * 
 * This Webex Device macro enables you to display user guides as
 * webviews on your devices main display or Room Navigator.
 * 
 * Full Readme, source code and license details available here:
 * https://github.com/wxsd-sales/userguide-macro
 * 
 ********************************************************/
import xapi from 'xapi';

/*********************************************************
 * Configure the settings below
**********************************************************/

const config = {
  button: {
    name: 'User Guide', // The main button name on the UI and its Panel Page Tile
    color: '#6F739E',   // Color of the button
    icon: 'Help',       // Specify which prebuilt icon you want. eg. Concierge | Tv
    showInCall: true
  },
  contentServer: 'https://wxsd-sales.github.io/userguide-macro/content-examples/basics.json',
  panelId: 'userguide' // Modify if you have multiple copies of this marcro on a single device
}

/*********************************************************
 * Below contains all the call event listeners
**********************************************************/

let timers = {};
let links = [];

async function main() {
  // Set config
  xapi.Config.WebEngine.Mode.set('On');
  xapi.Config.HttpClient.Mode.set('On');
  // Create panel UI and update active
  await createPanel(config.button, await getContent(config.contentServer), config.panelId);
  updatedUI();
  // Start listening to Events and Statuses
  xapi.Event.UserInterface.Extensions.Widget.Action.on(processWidget);
  xapi.Event.UserInterface.Extensions.Panel.Clicked.on(panelClicked);
  xapi.Status.UserInterface.WebView.on(updatedUI);
  xapi.Config.WebEngine.Features.Peripherals.AudioOutput.set('On');
  
}

setTimeout(main, 1000);

async function openWebview(content) {
  // Convert Controller target to OSD if there are no navigators
  const target = await convertTarget(content.target)

  // Clear any auto close timers running for target
  clearTimeout(timers[target])

  console.log(`Opening [${content.title}] on [${target}]`);
  xapi.Command.UserInterface.WebView.Display({
    Mode: content.mode,
    Title: content.title,
    Target: target,
    Url: content.url
  })
    .then(result => {
      if (!content.hasOwnProperty('autoclose') || content.autoclose == null) return;
      console.log(`Auto closing content in [${content.autoclose}] seconds`)
      timers[target] = setTimeout(closeWebview, content.autoclose * 1000, target);
    })
    .catch(e => console.log('Error: ' + e.message))
}

// Close the Webview
async function closeWebview(target) {
  target = await convertTarget(target);
  console.log(`Closing Webview on [${target}]`);
  xapi.Command.UserInterface.WebView.Clear({ Target: target });
}

// Identify if there are any in room navigators
function convertTarget(target) {
  if(target === 'OSD') return 'OSD';
  return xapi.Status.Peripherals.ConnectedDevice.get()
    .then(devices => {
      const navigators = devices.filter(d => {
        return d.Name.endsWith('Room Navigator') && d.Location == 'InsideRoom'
      })
      if( navigators.length == 0){
        console.log(`No InsideRoom Navigators, changing WebView target to OSD`);
        return 'OSD';
      } else {
        return target;
      }
    })
    .catch(e => {
      console.log('No connected devices, changing WebView target to OSD`')
      return 'OSD'
    })
}

// Process Widget Clicks
async function processWidget(e) {
  if (e.Type !== 'clicked' || !e.WidgetId.startsWith(config.panelId+'-option')) return
  const widgets = await xapi.Status.UserInterface.Extensions.Widget.get();
  const widget = widgets.filter(widget => widget.WidgetId == e.WidgetId);
  const num = e.WidgetId.split('-').pop();
  console.log(`User Guide Button Clicked [${links[num].title}]`)
  if (widget[0].Value == 'active') {
    console.log(`Content [${links[num].title}] already active, closing`)
    closeWebview(links[num].target);
    return;
  }
  openWebview(links[num]);
}

// Updates the UI and show which content is visiable 
async function updatedUI() {
  console.log(`Updating UI for panel [${config.panelId}]`);
  const views = await xapi.Status.UserInterface.WebView.get();
  console.log(`Number of WebViews [${views.length}]`);
  links.forEach((content, index) => {
    const visiable = views.filter(view => {
      return view.URL.includes(content.url) && view.Type =='Integration' && view.Status == 'Visible'
      }).length > 0;
    xapi.Command.UserInterface.Extensions.Widget.SetValue({
      Value: visiable ? 'active' : 'inactive',
      WidgetId: config.panelId + '-option-' + index
    })
  })
}

async function panelClicked(event) {
  if(event.PanelId !== 'userguide') return;
  createPanel(config.button, await getContent(config.contentServer), config.panelId)
}

function getContent(server){
  console.log('Checking server URL: ' + server);
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

function createPanel(button, content, panelId) {
  links = content;
  console.log(`Creating Panel [${panelId}]`);
  let rows = '';
  if(content == undefined || content.length < 0){
    console.log(`No content available to show for [${panelId}]`);
    rows = `<Row><Widget>
            <WidgetId>${panelId}-no-content</WidgetId>
            <Name>No Content Available</Name>
            <Type>Text</Type>
            <Options>size=4;fontSize=normal;align=center</Options>
            </Widget></Row>`;
  } else {
    for (let i = 0; i < content.length; i++) {
      const row = `<Row><Widget>
                  <WidgetId>${panelId}-option-${i}</WidgetId>
                  <Name>${content[i].title}</Name>
                  <Type>Button</Type>
                  <Options>size=4</Options>
                  </Widget></Row>`;
      rows = rows.concat(row);
    }
  }
  const panel = `
    <Extensions><Panel>
      <Location>${button.showInCall ? 'HomeScreenAndCallControls' : 'HomeScreen'}</Location>
      <Type>${button.showInCall ? 'Statusbar' : 'Home'}</Type>
      <Icon>${button.icon}</Icon>
      <Color>${button.color}</Color>
      <Name>${button.name}</Name>
      <ActivityType>Custom</ActivityType>
      <Page>
        <Name>${button.name}</Name>
        ${rows}
        <Options>hideRowNames=1</Options>
      </Page>
    </Panel></Extensions>`;
  
  return xapi.Command.UserInterface.Extensions.Panel.Save({ PanelId: panelId }, panel);
} 
