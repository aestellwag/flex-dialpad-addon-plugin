import { FlexPlugin } from 'flex-plugin';

import registerCustomActions from './customActions';
import { loadExternalTransferInterface } from './components/ExternalTransfer';
import { loadInternalCallInterface } from './components/InternalCall';

// import the reducers
import reducers, { namespace } from './states';

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
