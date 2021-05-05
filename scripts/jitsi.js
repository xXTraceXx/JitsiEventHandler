let ownParticipantId;
let isJoined = false;
const localTracks = {};

const options = {
    hosts: {
        domain: 'meet.jitsi',
        muc: 'muc.meet.jitsi'
    },
    bosh: 'https://beamstream-nw.com/http-bind'
};

JitsiMeetJS.init();

JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
const jitsiConnect = new JitsiMeetJS.JitsiConnection(null, null, options);

function joinJitsiRoom(roomId, secret) {
    const confOptions = {
        openBridgeChannel: true,
        p2p: {
            enabled: false
        },
    }

    const onUserRoleChanged = () => {
        console.log('enter onUserRoleChanged');
        if (room.isModerator() && secret != undefined) {
            console.log(`locked with secret ${secret}`);
            room.lock(secret);
        }
    };

    room = jitsiConnect.initJitsiConference(roomId, confOptions);
    room.on(JitsiMeetJS.events.conference.USER_ROLE_CHANGED, onUserRoleChanged);

    ownParticipantId = room.myUserId();

    JitsiMeetJS.createLocalTracks(
        {
            devices: ['audio', 'video'],
        })
        .then(onLocalTracks)
        .catch(error => {
            console.log(error);
        });

    isJoined = true;

    room.join(secret);

    return room;
}

function connectJitsiServer(establishedEventHandler, failedEventHandler, disconnectedEventHanlder) {
    jitsiConnect.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, establishedEventHandler);
    jitsiConnect.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, failedEventHandler);
    jitsiConnect.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, disconnectedEventHanlder);

    jitsiConnect.connect();
}

function removeFromDom(){
    let videoElement = $('#localVideo');
    let audioElement = $('#localAudio');

    videoElement.remove();
    audioElement.remove();

    for (let index = 0; index < localTracks[ownParticipantId].length; index++) {
        let trackToDestroy = localTracks[ownParticipantId][index];

        if (trackToDestroy.getType() == "video") {
            trackToDestroy.detach($('#localVideo')[0]);
            trackToDestroy.dispose();
        } else {
            trackToDestroy.detach($('#localAudio')[0]);
            trackToDestroy.dispose();
        }
    }
}

function onLocalTracks(tracks) {
    lTracks = tracks;    

    for (let i = 0; i < lTracks.length; i++) {
        if (lTracks[i].getType() === 'video') {
            let video = `<video autoplay='1' id='localVideo' />`;
            $('#myWindow').append(video);
            lTracks[i].attach($(`#localVideo`)[0]);
        } else {
            let audio = `<audio autoplay='1' muted='true' id='localAudio' />`;
            $('#myWindow').append(audio);
            lTracks[i].attach($(`#localAudio`)[0]);
        }

        if (isJoined) {
            room.addTrack(lTracks[i]);
        }

        console.log('die lokalen tracks');
        console.log(localTracks);
    }

    localTracks[ownParticipantId] = lTracks;    
}