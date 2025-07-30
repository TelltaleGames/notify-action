// Copyright (c) 2021 Telltale Games. All rights reserved.
// See LICENSE for usage, modification, and distribution terms.
const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');
const mustache = require('mustache');

// Disable Mustache escaping.
mustache.escape = function(text) {return text;};

// Environment seems to be where everything useful is passed in, perhaps process everything starting with INPUT_?
const notification_data = process.env;

notification_data.BUILD_URL = `${notification_data.GITHUB_SERVER_URL}/${notification_data.GITHUB_REPOSITORY}/actions/runs/${notification_data.GITHUB_RUN_ID}`;

async function notify(notification) {
    try {
        const method = notification.method || 'POST';
        const headers = notification.headers || { 'Content-Type': 'application/json' }
        const filters = notification.filters || [];
        // TODO: Support filters tags from the workflow.
        if(notification.filters.length > 0) {
            // If we have any filters, skip this notification
            return;
        }
        const response = await fetch(notification.url, {
            method: method,
            body: mustache.render(notification.body, notification_data),
            headers: headers
        });
        console.log(mustache.render(notification.body, notification_data));
        if(!response.ok) {
            throw Error(response.statusText);
        }
    } catch(error) {
        core.setFailed(error.message);
    }
}

try {
    const notifications_text = core.getInput('notifications');
    const notifications = JSON.parse(notifications_text);
    for(const notification of notifications.notifications) {
        notify(notification);
    }
} catch(error) {
    core.setFailed(error.message);
}
