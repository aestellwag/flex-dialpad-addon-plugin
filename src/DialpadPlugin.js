import { FlexPlugin } from 'flex-plugin';

import registerCustomActions from './customActions';
import { loadExternalTransferInterface } from './components/ExternalTransfer';
import { loadInternalCallInterface } from './components/InternalCall';

// import the reducers
import reducers, { namespace } from './states';

/*

FIXME: Remove once done!
Summary:
  Work is complete on the first feature, ended up adding redux as well so we can possibly use that later with the features.

Feature List:
- Remove Ability for added agent to control the conferense
    (COMPLETE)
    -Enhancement - Takes a second for the disable to re-render, see about making this instant
    (COMPLETE)
- Add the endConferenceOnExit to false
- Add the Confirm End Call Dialog to general end call UI
- Add UI indication if a call fails when adding them to a conference/transferring to them
- If an ACN call, disable the Hold Button (will need to wait on task information, but can mock up a sample)

*/



const PLUGIN_NAME = 'DialpadPlugin';

export default class DialpadPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  init(flex, manager) {

    // Registering the custom reducer/redux store
    this.registerReducers(manager);
  
    loadExternalTransferInterface.bind(this)(flex, manager)

    loadInternalCallInterface.bind(this)(flex, manager)

    registerCustomActions(manager);
  }
  /**
  * Registers the plugin reducers
  *
  * @param manager { Flex.Manager }
  */
    registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
