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
  chrome.storage.sync.get(['inputPricePurchased',
    'inputPercentGain',
    'inputPercentLoss',
    'inputPercentLimit',
    'inputPrice',
    'inputStop',
    'inputLimit'], function (result) {
    console.log('Value currently is ' + result.key)
    document.getElementById('input-price-purchased').value = result.inputPricePurchased
    document.getElementById('input-percent-gain').value = result.inputPercentGain
    document.getElementById('input-percent-loss').value = result.inputPercentLoss
    document.getElementById('input-percent-limit').value = result.inputPercentLimit
    document.getElementById('input-price').value = result.inputPrice
    document.getElementById('input-stop').value = result.inputStop
    document.getElementById('input-limit').value = result.inputLimit
  })
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
  document.getElementById('button05').addEventListener('click', addpercentage)
  document.getElementById('buttonMinus05').addEventListener('click', addpercentage)
  document.getElementById('input-price-purchased').addEventListener('change', onChangeInput)
  document.getElementById('input-percent-gain').addEventListener('change', onChangeInput)
  document.getElementById('input-percent-loss').addEventListener('change', onChangeInput)
  document.getElementById('input-percent-limit').addEventListener('change', onChangeInput)

  function insertValues () {
    const dataToSend = {
      name: 'insertPriceStopAndLimit',
      price: document.getElementById('input-price').value,
      stopLoss: document.getElementById('input-stop').value,
      stopLimit: document.getElementById('input-limit').value
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (activeTabs) {
      chrome.tabs.sendMessage(activeTabs[0].id, dataToSend, function (response) {
        if (response.error) {
          document.getElementById('errorText').innerHTML = response.error
          console.log('error ao inserir os valores')
        }
      })
    })
  }

  function uploadBuyPrice () {
    const dataToSend = {
      name: 'getBuyPriced'
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (activeTabs) {
      chrome.tabs.sendMessage(activeTabs[0].id, dataToSend, function (response) {
        if (!response) {
          document.getElementById('errorText').value = 'Erro ao se conectar com site da Binance'
          return
        }
        if (response.error) {
          document.getElementById('errorText').innerHTML = response.error
          console.log('error ao buscar os valores')
          return
        }
        if (response.buyPrice) {
          document.getElementById('input-price-purchased').value = parseFloat(response.buyPrice.replace(/,/g, ''))
          onChangeInput()
        }
      })
    })
  }
  function addpercentage () {
    // console.log(this.id === 'button05') true
    const isPlus = this.id === 'button05'
    const percentGain = document.getElementById('input-percent-gain').value
    const percentLoss = document.getElementById('input-percent-loss').value
    const percentLimit = document.getElementById('input-percent-limit').value
    document.getElementById('input-percent-gain').value = isPlus ? (parseFloat(percentGain) + 0.5).toFixed(2) : (parseFloat(percentGain) - 0.5).toFixed(2)
    document.getElementById('input-percent-loss').value = isPlus ? (parseFloat(percentLoss) - 0.5).toFixed(2) : (parseFloat(percentLoss) + 0.5).toFixed(2)
    document.getElementById('input-percent-limit').value = isPlus ? (parseFloat(percentLimit) - 0.5).toFixed(2) : (parseFloat(percentLimit) + 0.5).toFixed(2)
    onChangeInput()
  }

  function onChangeInput () {
    const pricePurchased = document.getElementById('input-price-purchased').value
    const percentGain = document.getElementById('input-percent-gain').value
    const percentLoss = document.getElementById('input-percent-loss').value
    const percentLimit = document.getElementById('input-percent-limit').value
    const priceValue = (parseFloat(pricePurchased) + (parseFloat(pricePurchased) * (parseFloat(percentGain) / 100))).toFixed(8)
    const stopValue = (parseFloat(pricePurchased) - (parseFloat(pricePurchased) * (parseFloat(percentLoss) / 100))).toFixed(8)
    const limitValue = (parseFloat(pricePurchased) - (parseFloat(pricePurchased) * (parseFloat(percentLimit) / 100))).toFixed(8)
    if (!pricePurchased) return
    document.getElementById('input-price').value = priceValue
    document.getElementById('input-stop').value = stopValue
    document.getElementById('input-limit').value = limitValue

    const dataToStorage = {
      inputPricePurchased: pricePurchased,
      inputPercentGain: percentGain,
      inputPercentLoss: percentLoss,
      inputPercentLimit: percentLimit,
      inputPrice: priceValue,
      inputStop: stopValue,
      inputLimit: limitValue
    }
    chrome.storage.sync.set(dataToStorage, function () {
      console.log('Save data successfully')
    })
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
