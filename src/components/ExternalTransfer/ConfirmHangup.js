import * as React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import {
  IconButton,
  withTheme,
  TaskHelper,
  Actions
} from '@twilio/flex-ui';

class ConfirmHangup extends React.Component {
  
    #showConfirmation = false;

    // Used to clear confirmation render and reset to default hangup
    hideHangupConfirmation = () => {
        this.#showConfirmation = false;
        this.forceUpdate();
    }

    // Used to show confirmation render
    showHangupConfirmation = () => {
        this.#showConfirmation = true;
        this.forceUpdate();
    }

    // Used to end the call if the user confirms hangup
    onHangupParticipantConfirmClick = () => {

        const { task } = this.props;

        const { sid } = task;
        Actions.invokeAction("HangupCall", { sid: sid });

        this.hideHangupConfirmation();
    };
  
    // Confirmation buttons if user selects hangup
    renderHangupConfirmation = () => {

        return (
        <React.Fragment>
            <IconButton
            icon="Accept"
            className="HangupCanvas-AcceptAction"
            onClick={this.onHangupParticipantConfirmClick}
            style={{"color":"red"}}
            />
            <IconButton
            icon="Close"
            className="HangupCanvas-DeclineAction"
            onClick={this.hideHangupConfirmation}
            style={{"color":"black"}}
            />
        </React.Fragment>
        );
    }


    // Standard hangup button render
    renderDefault = () => {
        
        const { task } = this.props;
        // If the call isn't live any longer, reset confirmation 
        const isLiveCall = TaskHelper.isLiveCall(task);

        return (
            <IconButton
                icon="Hangup"
                className="HangupCanvas-DeclineAction"
                disabled={!isLiveCall}
                onClick={this.showHangupConfirmation}
                style={{"background":"#d32f2f","color":"#ffffff"}}
            />
        );
    }

    // Main render determined if confirmation show be shown or not
    render() {
    
        return (
            this.#showConfirmation 
                ? this.renderHangupConfirmation() 
                : this.renderDefault()
        );
    }
}

const mapStateToProps = (state) => {
    const view = state.flex.view;
  return {  
    view
  };
};

export default connect(mapStateToProps)(withTheme(ConfirmHangup));
