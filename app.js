const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
let localTrack = null;
let isMuted = false;

async function joinChannel() {
    const uid = await client.join(config.appId, config.channel, config.token, null);
    document.getElementById("status").textContent = `Connected as UID: ${uid}`;
    document.getElementById("joinBtn").disabled = true;
    document.getElementById("leaveBtn").disabled = false;
    document.getElementById("muteBtn").disabled = false;

  localTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await client.publish([localTrack]);
    addUserToList("You (UID: " + uid + ")");

  client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "audio") {
                user.audioTrack.play();
                addUserToList("User: " + user.uid);
        }
  });

  client.on("user-unpublished", (user) => {
        removeUserFromList("User: " + user.uid);
  });
}

async function leaveChannel() {
    if (localTrack) { localTrack.close(); localTrack = null; }
    await client.leave();
    document.getElementById("status").textContent = "Disconnected";
    document.getElementById("joinBtn").disabled = false;
    document.getElementById("leaveBtn").disabled = true;
    document.getElementById("muteBtn").disabled = true;
    document.getElementById("userList").innerHTML = "";
}

async function toggleMute() {
    if (!localTrack) return;
    isMuted = !isMuted;
    await localTrack.setMuted(isMuted);
    document.getElementById("muteBtn").textContent = isMuted ? "Unmute" : "Mute";
}

function addUserToList(name) {
    const li = document.createElement("li");
    li.textContent = name;
    li.id = name;
    document.getElementById("userList").appendChild(li);
}

function removeUserFromList(name) {
    const el = document.getElementById(name);
    if (el) el.remove();
}
