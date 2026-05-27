chrome.action.onClicked.addListener(tab => {
  chrome.tabs.sendMessage(tab.id, { type: 'DOUMI_TOGGLE' })
})
