import * as React from 'react';
import ConferenceService from '../../helpers/ConferenceService';

class ConferenceMonitor extends React.Component {
  state = {
    liveParticipantCount: 0
  }

  componentDidUpdate() {
    const { task } = this.props;
    const conference = task && (task.conference || {});
    const {
      conferenceSid,
      liveParticipantCount,
      liveWorkerCount,
      participants = []
    } = conference;
    const liveParticipants = participants.filter(p => p.status === 'joined');

    if (liveParticipantCount > 2 && this.state.liveParticipantCount <= 2) {
      if (this.shouldUpdateParticipants(participants, liveWorkerCount)) {
        this.handleMoreThanTwoParticipants(conferenceSid, liveParticipants);
      }
    } else if (liveParticipantCount <= 2 && this.state.liveParticipantCount > 2) {
      if (this.shouldUpdateParticipants(participants, liveWorkerCount)) {
        this.handleOnlyTwoParticipants(conferenceSid, liveParticipants);
      }
    }

    if (liveParticipantCount !== this.state.liveParticipantCount) {
      this.setState({ liveParticipantCount });
    }
  }

  hasUnknownParticipant = (participants = []) => {
    return participants.some(p => p.participantType === 'unknown');
  }

  shouldUpdateParticipants = (participants, liveWorkerCount) => {
    console.debug(
      'dialpad-addon, ConferenceMonitor, shouldUpdateParticipants:',
      liveWorkerCount <= 1 && this.hasUnknownParticipant(participants)
    );
    return liveWorkerCount <= 1 && this.hasUnknownParticipant(participants);
  }

  handleMoreThanTwoParticipants = (conferenceSid, participants) => {
    console.log('More than two conference participants. Setting endConferenceOnExit to false for all participants.');
    this.setEndConferenceOnExit(conferenceSid, participants, false);
  }

  // For Toyota's Use Case - Updating this to false as we do not want to this for their use case
  // note that this logic can be removed/consolidated but for the purpose of their use case we are going to "patch" it
  // This could be enhanced to even be a selectable option by the agent/worker if that would make for a better scenario

  handleOnlyTwoParticipants = (conferenceSid, participants) => {
    console.log(`Conference participants dropped to two. Setting endConferenceOnExit to false for all participants.  This is specific to Toyotas Use Case`);
    this.setEndConferenceOnExit(conferenceSid, participants, false);
  }

  setEndConferenceOnExit = async (conferenceSid, participants, endConferenceOnExit) => {
    const promises = [];
    participants.forEach(p => {
      console.log(`setting endConferenceOnExit = ${endConferenceOnExit} for callSid: ${p.callSid} status: ${p.status}`);
      if (p.connecting) { return } //skip setting end conference on connecting parties as it will fail
      promises.push(
        ConferenceService.setEndConferenceOnExit(conferenceSid, p.callSid, endConferenceOnExit)
      );
    });

    try {
      await Promise.all(promises);
      console.log(`endConferenceOnExit set to ${endConferenceOnExit} for all participants`);
    } catch (error) {
      console.error(`Error setting endConferenceOnExit to ${endConferenceOnExit} for all participants\r\n`, error);
    }
  }

  render() {
    // This is a Renderless Component, only used for monitoring and taking action on conferences
    return null;
  }
}

export default ConferenceMonitor;
