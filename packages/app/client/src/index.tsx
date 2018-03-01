//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { Provider } from 'react-redux';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import interceptError from './interceptError';
import interceptHyperlink from './interceptHyperlink';
import Main from './ui/shell/main';
//import setupContextMenu from './setupContextMenu';
import store from './data/store';
import { CommandRegistry } from '@bfemulator/app-shared';
import { CommandService } from './platform/commands/commandService';
import { SettingsService } from './platform/settings/settingsService';
import { LogService } from './platform/log/logService';
import * as BotActions from './data/action/botActions';
import { showWelcomePage } from './data/editorHelpers';

CommandService.init();
SettingsService.init();
LogService.init();

interceptError();
interceptHyperlink();
//setupContextMenu();

const { webFrame } = window['require']('electron');

if (webFrame) {
  webFrame.setZoomLevel(1);
  webFrame.setZoomFactor(1);
  webFrame.registerURLSchemeAsPrivileged('emulator');
}

ReactDOM.render(
  React.createElement(Provider, { store }, React.createElement(Main as any)),
  document.getElementById('root')
);

//-----------------------------------------------------------------------------
// REGISTER COMMANDS (doesn't have to be done here exclusively, but no better
// place right now to ensure they're registered before main process might call
// one remotely)

CommandRegistry.registerCommand('welcome-page:show', () => {
  showWelcomePage();
});

//-----------------------------------------------------------------------------

// Tell the process we're loaded
CommandService.remoteCall('client:loaded')
  .then(() => {
    showWelcomePage();
  });

// Load bots from disk on app start-up
CommandService.remoteCall('bot:list:load')
  .then(payload => {
    store.dispatch(BotActions.load(payload.bots));
  })
  .catch(err => {
    console.error('Error during bot list load: ', err);
  });
