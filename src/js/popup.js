/* global chrome */
/* popup.js
 *
 * This file initializes its scripts after the popup has loaded.
 *
 * It shows how to access global variables from background.js.
 * Note that getViews could be used instead to access other scripts.
 *
 * A port to the active tab is open to send messages to its in-content.js script.
 *
 */

// Start the popup script, this could be anything from a simple script to a webapp
const initPopupScript = () => {
  // Access the background window object
//   const backgroundWindow = chrome.extension.getBackgroundPage()
  // Do anything with the exposed variables from background.js

  // This port enables a long-lived connection to in-content.js
  // const port = null

  // Send messages to the open port
  // const sendPortMessage = message => port.postMessage(message)

  // Find the current active tab
  // const getTab = () =>
  //   new Promise(resolve => {
  //     chrome.tabs.query(
  //       {
  //         active: true,
  //         currentWindow: true
  //       },
  //       tabs => resolve(tabs[0])
  //     )
  //   })

  // Handle port messages
  // const messageHandler = message => {
  //   console.log('popup.js - received message:', message)
  // }

  //   // Find the current active tab, then open a port to it
  //   getTab().then(tab => {
  //     // Connects to tab port to enable communication with inContent.js
  //     port = chrome.tabs.connect(tab.id, { name: 'binance-tools' })
  //     // Set up the message listener
  //     port.onMessage.addListener(messageHandler)
  //     // Send a test message to in-content.js
  //     sendPortMessage('Message from popup!')
  //   })

  document.getElementById('add-values-in-fields').addEventListener('click', insertValues)
  document.getElementById('update-value-button').addEventListener('click', uploadBuyPrice)

  function insertValues () {
    const dataToSend = {
      name: 'insertPriceStopAndLimit',
      price: document.getElementById('input-price').value,
      stopLoss: document.getElementById('input-stop').value,
      stopLimit: document.getElementById('input-limit').value
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (activeTabs) {
      chrome.tabs.sendMessage(activeTabs[0].id, dataToSend)
    })
  }

  document.getElementById('input-price-purchased').addEventListener('change', onChangeInput)
  document.getElementById('input-percent-gain').addEventListener('change', onChangeInput)
  document.getElementById('input-percent-loss').addEventListener('change', onChangeInput)
  document.getElementById('input-percent-limit').addEventListener('change', onChangeInput)

  function uploadBuyPrice () {
    const dataToSend = {
      name: 'getBuyPriced'
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (activeTabs) {
      chrome.tabs.sendMessage(activeTabs[0].id, dataToSend, function (response) {
        if (response.buyPrice) {
          document.getElementById('input-price-purchased').value = parseFloat(response.buyPrice.replace(/,/g, ''))
          onChangeInput()
        }
      })
    })
  }

  function onChangeInput () {
    const pricePurchased = document.getElementById('input-price-purchased').value
    const percentGain = document.getElementById('input-percent-gain').value
    const percentLoss = document.getElementById('input-percent-loss').value
    const percentLimit = document.getElementById('input-percent-limit').value
    if (!pricePurchased) return
    document.getElementById('input-price').value = (parseFloat(pricePurchased) + (parseFloat(pricePurchased) * (parseFloat(percentGain) / 100))).toFixed(8)
    document.getElementById('input-stop').value = (parseFloat(pricePurchased) - (parseFloat(pricePurchased) * (parseFloat(percentLoss) / 100))).toFixed(8)
    document.getElementById('input-limit').value = (parseFloat(pricePurchased) - (parseFloat(pricePurchased) * (parseFloat(percentLimit) / 100))).toFixed(8)
  }
}

// pricePurchased
// percentGain
// percentLoss
// percentLimit
// price
// stop
// limit

// input-percent-gain
// input-percent-loss
// input-percent-limit
// input-price
// input-stop
// input-limit

// Fire scripts after page has loaded
document.addEventListener('DOMContentLoaded', initPopupScript)
