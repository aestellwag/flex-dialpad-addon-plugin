const ACTION_SET_DIAL_STATUS = 'SET_DIAL_STATUS';
// Set the initial state of the below that we will use to change the buttons and UI
export const initialState = {
    conferenceOwner: true,
};

export class Actions {
    static setDialStatus = (status) => ({ type: ACTION_SET_DIAL_STATUS, status });
  };

// Exporting and adding a reducer for the states we will use later for the buttons
export function reduce(state = initialState, action) {
    switch (action.type) {
        // Return the extended state and the specific status of the above states
        // it requires you pass the name/value for each you wish to update
        case ACTION_SET_DIAL_STATUS: {
            return {
                ...state,
                ...action.status
            }
        }
        // Default case if it doesn't meet the above action
        default:
            return state;
    }
};
  