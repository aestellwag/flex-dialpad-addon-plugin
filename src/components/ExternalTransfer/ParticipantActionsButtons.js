import * as React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import {
  Actions,
  IconButton,
  TaskHelper,
  VERSION as FlexVersion,
  withTheme
} from '@twilio/flex-ui';

// Used for the custom redux state
import { bindActionCreators } from 'redux';
import { Actions as DialStatusAction, } from '../../states/DialStatusState';

const ActionsContainer = styled('div')`
  min-width: 88px;
  margin-top: 10px;
  button {
      width: 36px;
      height: 36px;
      margin-left: 6px;
      margin-right: 6px;
  }
`;

const ActionsContainerListItem = styled('div')`
  min-width: 88px;
  button {
    width: 32px;
    height: 32px;
    margin-left: 6px;
    margin-right: 6px;
  }
`;

class ParticipantActionsButtons extends React.Component {

  // Use to validate if the conferenceOwner was checked
  #conferenceOwnerCheck = false;

  componentWillUnmount() {

    const { participant } = this.props;
    if (participant.status === 'recently_left') {
      this.props.clearParticipantComponentState();
    }
  }

  showKickConfirmation = () => this.props.setShowKickConfirmation(true);

  hideKickConfirmation = () => this.props.setShowKickConfirmation(false);

  onHoldParticipantClick = () => {
    const { participant, task } = this.props;
    const { callSid, workerSid } = participant;
    const participantType = participant.participantType;
    Actions.invokeAction(participant.onHold ? 'UnholdParticipant' : 'HoldParticipant', {
      participantType,
      task,
      targetSid: participantType === 'worker' ? workerSid : callSid
    });
  };

  onKickParticipantConfirmClick = () => {
    const { participant, task } = this.props;
    const { callSid, workerSid } = participant;
    const { participantType } = participant;
    Actions.invokeAction('KickParticipant', {
      participantType,
      task,
      targetSid: participantType === 'worker' ? workerSid : callSid
    });
    this.hideKickConfirmation();
  };

  renderKickConfirmation() {
    return (
      <React.Fragment>
        <IconButton
          icon="Accept"
          className="ParticipantCanvas-AcceptAction"
          onClick={this.onKickParticipantConfirmClick}
          themeOverride={this.props.theme.ParticipantsCanvas.ParticipantCanvas.Button}
        />
        <IconButton
          icon="Close"
          className="ParticipantCanvas-DeclineAction"
          onClick={this.hideKickConfirmation}
          themeOverride={this.props.theme.ParticipantsCanvas.ParticipantCanvas.Button}
        />
      </React.Fragment>
    );
  }

  // Here we will be confirming who is the "owner" of the conference to limit the hold/end call buttons to only the primary worker
  // First we snag the task that the worker has selected in the UI and pull back the task object itself
  // From there we evaluate the live worker count > 1, meaning that if there is more than one, let's see who the primary agent is
  // by checking the incomingTransferObject (if it exists), we can see who orignated the transfer and disable the buttons for the non
  // primary worker(s) 
  confirmConferenceOwner = () => {

    // Special callout that we are using the TaskHelper library to pull back the Task
    // There are a decent amount of helper libraries that can make grabbing info a lot easier!
    const selectedTask = this.props.selectedTask;
    const incomingObjectSID = selectedTask.incomingTransferObject?.worker?.sid || null;
    const outgoingObject = selectedTask.outgoingTransferObject?.worker?.sid || null;

    if (incomingObjectSID == this.props.myWorkerSID || incomingObjectSID == null) {
      this.props.setDialStatus({ 
        conferenceOwner: true
      });
    } else if (outgoingObject != null){
      this.props.setDialStatus({ 
        conferenceOwner: true
      });
    } else {
      this.props.setDialStatus({ 
        conferenceOwner: false
      });
    }
  }

  renderActions() {
    const { participant, theme, task } = this.props;

    const holdParticipantTooltip = participant.onHold
      ? 'Unhold Participant' : 'Hold Participant';
    const kickParticipantTooltip = 'Remove Participant';

    // The name of the hold icons changed in Flex 1.11.0 to HoldOff.
    // Since the minimum requirement is 1.10.0 and there is no version between
    // 1.10.0 and 1.11.0, the check is only needed for version 1.10.0.
    const holdIcon = FlexVersion === '1.10.0' ? 'HoldLarge' : 'Hold';
    const unholdIcon = FlexVersion === '1.10.0' ? 'HoldLargeBold' : 'HoldOff';

    return (
      <React.Fragment>
        <IconButton
          icon={participant.onHold ? `${unholdIcon}` : `${holdIcon}`}
          className="ParticipantCanvas-HoldButton"
          disabled={!TaskHelper.canHold(task) || participant.status !== 'joined' || this.props.conferenceOwner != true || this.props.emergencyCall }
          onClick={this.onHoldParticipantClick}
          themeOverride={theme.ParticipantsCanvas.ParticipantCanvas.Button}
          title={this.props.emergencyCall ? "Disabled For Emergency Calls" : holdParticipantTooltip}
        />
        <IconButton
          icon="Hangup"
          className="ParticipantCanvas-HangupButton"
          disabled={this.props.conferenceOwner !== true}
          onClick={this.showKickConfirmation}
          themeOverride={theme.ParticipantsCanvas.ParticipantCanvas.HangUpButton}
          title={kickParticipantTooltip}
        />
      </React.Fragment>
    );
  }

  render() {

    if (this.props.view.activeView != 'teams') {

      // Calling to confirm if the worker is the owner of the conference if there are mulitple workers on the conference
      if (this.props.liveWorkerCount > 1 && this.#conferenceOwnerCheck != true) {
        this.confirmConferenceOwner();
        this.#conferenceOwnerCheck = true;
      } else if (this.props.liveWorkerCount == 1 && this.props.conferenceOwner !== true) {
        this.props.setDialStatus({ 
          conferenceOwner: true
        });
        this.#conferenceOwnerCheck = false;
      }

      return this.props.listMode
      ? (
        <ActionsContainerListItem className="ParticipantCanvas-Actions">
          {this.props.showKickConfirmation
            ? this.renderKickConfirmation()
            : this.renderActions()
          }
        </ActionsContainerListItem>
      ) : (
        <ActionsContainer className="ParticipantCanvas-Actions">
          {this.props.showKickConfirmation
            ? this.renderKickConfirmation()
            : this.renderActions()
          }
        </ActionsContainer>
      );
    } else {
      return (null);
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  const { participant } = ownProps;
  const view = state.flex.view;
  const componentViewStates = state.flex.view.componentViewStates;
  const customParticipants = componentViewStates.customParticipants || {};
  const participantState = customParticipants[participant.callSid] || {};
  const customParticipantsState = {};

  // Adding the workerSID as we will need to for the conference owner checks
  const myWorkerSID = state?.flex?.worker?.worker?.sid;

  // Also pulling back the states from the redux store as we will use those later
  // to manipulate the buttons
  const customReduxStore = state?.['dial-status'].dialstatus;
  const conferenceOwner = customReduxStore.conferenceOwner;
  const selectedTaskSID = state?.flex?.view?.selectedTaskSid;
  const selectedTask = TaskHelper.getTaskByTaskSid(selectedTaskSID);
  const liveWorkerCount = selectedTask.conference?.liveWorkerCount;
  let emergencyCall = false;
  
  // TC Specific Use Case - Change name to the ACN Queues, could also look at pulling in a task attribute if necessary
  // For this sample, we will simply go by queueName for the selected task
  if(selectedTask.queueName === "Everyone") {
    emergencyCall = true;
  }

  return {
    view,
    showKickConfirmation: participantState.showKickConfirmation,
    setShowKickConfirmation: value => {
      customParticipantsState[participant.callSid] = {
        ...participantState,
        showKickConfirmation: value
      };
      Actions.invokeAction('SetComponentState', {
        name: 'customParticipants',
        state: customParticipantsState
      });
    },
    clearParticipantComponentState: () => {
      customParticipantsState[participant.callSid] = undefined;
      Actions.invokeAction('SetComponentState', {
        name: 'customParticipants',
        state: customParticipantsState
      });
    },
    myWorkerSID,
    conferenceOwner,
    selectedTask,
    liveWorkerCount,
    emergencyCall
  };
};

// Mapping dispatch to props as I will leverage the setDialStatus
// to change the properties on the redux store, referenced above with this.props.setDialtatus
const mapDispatchToProps = (dispatch) => ({
  setDialStatus: bindActionCreators(DialStatusAction.setDialStatus, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(ParticipantActionsButtons));
