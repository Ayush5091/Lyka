const fs = require('fs');
const path = 'n8n-workflow-updated.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Define the Google Calendar Trigger node
const calTrigger = {
    parameters: {
        pollTimes: {
            item: [{ mode: 'everyMinute' }]
        },
        calendar: {
            __rl: true,
            mode: 'list',
            value: 'primary'
        },
        triggerOn: 'eventStarted',
        eventStatus: ['confirmed'],
        options: {}
    },
    id: 'cal-trigger-id',
    name: 'Google Calendar Trigger',
    type: 'n8n-nodes-base.googleCalendarTrigger',
    typeVersion: 1,
    position: [-3600, 2100]
};

// 2. Define the Code node to extract the Meet link
const filterMeet = {
    parameters: {
        jsCode: `const event = $input.item.json;
const description = event.description || "";
const location = event.location || "";
const hangoutLink = event.hangoutLink || "";

let meetUrl = hangoutLink;
if (!meetUrl) {
  // More robust regex for meet links
  const match = (description + " " + location).match(/meet\\.google\\.com\\/[a-z0-9-]+/i);
  if (match) {
    let raw = match[0];
    // Clean up potential trailing punctuation or query params
    raw = raw.split('?')[0].split('#')[0].replace(/[.,;]$/, '');
    meetUrl = "https://" + raw;
  }
}

if (!meetUrl || meetUrl.length < 25) return []; // Basic sanity check

return [{ 
  json: { 
    meeting_url: meetUrl, 
    bot_name: "Meridian Assistant",
    body: { meeting_url: meetUrl } // Redundant for absolute safety
  } 
}];`
    },
    id: 'filter-meet-id',
    name: 'Extract Meet Link',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [-3360, 2100]
};

// 3. Find and Update the HTTP: Deploy Bot node to be more robust
const deployBotNode = data.nodes.find(n => n.name === 'HTTP: Deploy Bot');
if (deployBotNode) {
    const urlParam = deployBotNode.parameters.bodyParameters.parameters.find(p => p.name === 'meeting_url');
    if (urlParam) {
        // Robust expression that handles both Webhook (body.meeting_url) and Code node (meeting_url)
        // Avoids undefined.property errors in older n8n versions
        urlParam.value = "={{ $json.meeting_url || ($json.body ? $json.body.meeting_url : undefined) }}";
    }
}

// 4. Add nodes and create connections
data.nodes.push(calTrigger, filterMeet);

if (!data.connections) data.connections = {};

data.connections['Google Calendar Trigger'] = {
    main: [[{ node: 'Extract Meet Link', type: 'main', index: 0 }]]
};

data.connections['Extract Meet Link'] = {
    main: [[{ node: 'HTTP: Deploy Bot', type: 'main', index: 0 }]]
};

// 5. Save the new workflow
fs.writeFileSync('n8n-workflow-autojoin.json', JSON.stringify(data, null, 2));
console.log('Successfully updated n8n-workflow-autojoin.json with robust logic');
