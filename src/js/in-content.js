/* global chrome */
/* in-content.js
*
* This file has an example on how to communicate with other parts of the extension through a long lived connection (port) and also through short lived connections (chrome.runtime.sendMessage).
*
* Note that in this scenario the port is open from the popup, but other extensions may open it from the background page or not even have either background.js or popup.js.
* */

// Extension port to communicate with the popup, also helps detecting when it closes
let port = null

// Send messages to the open port (Popup)
const sendPortMessage = data => port.postMessage(data)

const getDecimals = function (data) {
  if (Math.floor(parseFloat(data)) === parseFloat(data)) return 0

  const str = data
  if (str.indexOf('.') !== -1 && str.indexOf('-') !== -1) {
    return str.split('-')[1] || 0
  } else if (str.indexOf('.') !== -1) {
    return str.split('.')[1].length || 0
  }
  return str.split('-')[1] || 0
}

const formatNumber = function (numberToFormat, step) {
  const numberWithDot = numberToFormat.replace(/,/g, '.')
  return parseFloat(numberWithDot).toFixed(getDecimals(step))
}

// Handle incoming popup messages
// const popupMessageHandler = message => console.log(message)

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.name === 'insertPriceStopAndLimit') {
    if (!document.getElementById('FormRow-SELL-price') ||
    !document.getElementById('FormRow-SELL-stopPrice') ||
    !document.getElementById('FormRow-SELL-stopLimitPrice')) {
      console.log(document.getElementById('FormRow-SELL-price'), document.getElementById('FormRow-SELL-stopPrice'), document.getElementById('FormRow-SELL-stopLimitPrice'))
      sendResponse({ error: 'Abre a aba de OCO' })
      return
    }
    const step = document.getElementById('FormRow-SELL-price').step
    document.getElementById('FormRow-SELL-price').value = formatNumber(request.price, step)
    document.getElementById('FormRow-SELL-stopPrice').value = formatNumber(request.stopLoss, step)
    document.getElementById('FormRow-SELL-stopLimitPrice').value = formatNumber(request.stopLimit, step)
  }
  if (request.name === 'getBuyPriced') {
    if (!document.getElementsByClassName('css-1wbviym')[0]) {
      sendResponse({ error: 'Abre a aba "Histórico de ordens"' })
      return
    }
    const dataResponse = {
      buyPrice: document.getElementsByClassName('css-1wbviym')[0].nextSibling.innerText || false
    }
    sendResponse(dataResponse)
  }
})

// Start scripts after setting up the connection to popup
chrome.extension.onConnect.addListener(popupPort => {
  // Listen for popup messages
  // popupPort.onMessage.addListener(popupMessageHandler)
  // Set listener for disconnection (aka. popup closed)
  popupPort.onDisconnect.addListener(() => {
    console.log('in-content.js - disconnected from popup')
  })
  // Make popup port accessible to other methods
  port = popupPort
  // Perform any logic or set listeners
  sendPortMessage('message from in-content.js')
})

// Response handler for short lived messages
const handleBackgroundResponse = response =>
  console.log('in-content.js - Received response:', response)

// Send a message to background.js
chrome.runtime.sendMessage('Message from in-content.js!', handleBackgroundResponse)
