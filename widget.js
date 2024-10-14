
const cardsList =
  /*
  	To add more cards, copy and paste the first line below (with the curly braces and comma), then replace 
    the vaules inside the quotes "" with the new command name and URL. Save, export, and replace the
    source in OBS.
  */
[
  {cmd: "!lordspooky", url: "https://media.giphy.com/media/0wLcFJmHgH1aEeOBIn/giphy.gif"},
  {cmd: "!plateofmidchicken", url: "https://media.giphy.com/media/qWhCE6sHqTaLHj4alL/giphy.gif"},
  {cmd: "!overlordtrama", url: "https://media.giphy.com/media/RyVfTbmyuyun2L8FII/giphy.gif"}
];

const mainContainer = document.getElementById('main-container');
const mainImg = document.getElementById('main-image');

let fieldData;
let animationDuration;
let globalCooldownDuration;
let userCooldownDuration;
let globalCooldown
let userCooldownsList = [];

const checkPrivileges = (data, privileges) => {
  const {tags, userId} = data;
  const {mod, subscriber, badges} = tags;
  const required = privileges || fieldData.privileges;
  const isMod = parseInt(mod);
  const isSub = parseInt(subscriber);
  const isVip = (badges.indexOf("vip") !== -1);
  const isBroadcaster = (userId === tags['room-id']);
  if (isBroadcaster) return true;
  if (required === "justSubs" && isSub) return true;
  if (required === "mods" && isMod) return true;
  if (required === "vips" && (isMod || isVip)) return true;
  if (required === "subs" && (isMod || isVip || isSub)) return true;
  return required === "everybody";
};

const addGlobalCooldown = () => {
  globalCooldown = setTimeout(() => {
    globalCooldown = null;
  }, globalCooldownDuration*1000);
};

const addUserCooldown = (user) => {
  const userCooldown = setTimeout((user) => {
  	userCooldownsList.pop();
  }, userCooldownDuration*1000);
  const newUserCooldown = {username: user, cooldown: userCooldown};
  userCooldownsList.unshift(newUserCooldown);
};

const showCard = (card, user) => {
  mainImg.src = card.url;
  mainImg.classList.remove('hidden');
  const cardTimeout = setTimeout(() => {
    mainImg.src = '';
    mainImg.classList.add('hidden');
  }, animationDuration*1000);
};

const handleMessage = (obj) => {
  const data = obj.detail.event.data;
  if (!data) {
    return;
  }
  const {text, displayName} = data;
  const trimmedText = text.trim();
  if (!trimmedText.startsWith("!")) {
    return;
  }
  const card = cardsList.find((element) => {
    return element.cmd === trimmedText;
  });
  if (!card) {
    return;
  }
  const isUserCooldown = userCooldownsList.find((element) => {
    return element.username === displayName;
  });
  
  if (globalCooldown || isUserCooldown || !checkPrivileges(data)) {
    return;
  }
  addGlobalCooldown();
  addUserCooldown(displayName);
  showCard(card, displayName);
};

window.addEventListener('onEventReceived', function(obj) {
  if (obj.detail.listener !== "message") {
    return;
  }
  handleMessage(obj);
});

window.addEventListener('onWidgetLoad', function(obj) {
  fieldData = obj.detail.fieldData;
  globalCooldownDuration = fieldData.globalCooldown;
  userCooldownDuration = fieldData.userCooldown;
  animationDuration = fieldData.animationDuration;
});
