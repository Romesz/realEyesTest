/*
tesks:
a) Exchange facility between two arbitrary currencies using the latest rate
b) Make sure when using the exchange facility there is no page reload and currency is computed asynchronous AJAX calls
c) Historical data presentation for any selected currency using Rickshaw or with any other client side charting component with similar functionalities
(http://code.shutterstock.com/rickshaw/)
d) Make the historical currency representation interactive like in this example (http://code.shutterstock.com/rickshaw/examples/lines.html).
It’s possible that you might have some errors/problems with Rickshaw. In this case it’s also a part of the test to solve these problems.
*/

/* jshint esversion: 6 */
/* globals document, window, XMLHttpRequest, DOMParser, ActiveXObject, console, Rickshaw */

(function() {
  const xhttp = new XMLHttpRequest();
  let cubeTimes;
  let selects = document.querySelectorAll('select');

  xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      parseXML(xhttp.responseText);
    }

    // TODO : handle error branch
  };
  xhttp.open('GET', '//localhost:3000/data', true);
  xhttp.send();


  function parseXML(text) {
    let xmlDoc;

    if (window.DOMParser) {
      let parser = new DOMParser();
      xmlDoc = parser.parseFromString(text, 'text/xml');
    } else {
      xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
      xmlDoc.async = false;
      xmlDoc.loadXML(text);
    }

    cubeTimes = xmlDoc.querySelectorAll('Cube[time]');

    getFirstCurrencies(cubeTimes[0]);
  }

  function getFirstCurrencies(firstNode) {
    let currenciesObj = {};
    let firstCurr;
    for(let i in firstNode.childNodes) {
      if (firstNode.childNodes.hasOwnProperty(i)) {
        let childNode = firstNode.childNodes[i];
        currenciesObj[childNode.getAttribute('currency')] = childNode.getAttribute('rate');
        if (parseInt(i) === 0) {
          firstCurr = childNode.getAttribute('currency');
        }
      }
    }

    window.showGraph(firstCurr);

    selects = document.querySelectorAll('select');
    for(let s in selects) {
      if (selects.hasOwnProperty(s)) {
        let select = selects[s];
        for(let c in currenciesObj) {
          if (currenciesObj.hasOwnProperty(c)) {
            let currency = currenciesObj[c];
            let opt = document.createElement('option');
            opt.value = currency;
            opt.innerHTML = c;
            select.appendChild(opt);
          }
        }
      }
    }
  }

  window.submitCalc = function() {
    let ammount = parseInt(document.getElementById('ammount').value);
    let res = document.getElementById('res');
    if (isNaN(ammount)) {
      res.innerHTML = 'Provied a number';
      return;
    }
    let firstCurr = parseFloat(selects[0].value);
    let secondCurr = parseFloat(selects[1].value);
    res.innerHTML = `The result is ${ammount * secondCurr / firstCurr}`;
  };

  function fetchGraphData(currency) {
    let arrayToSort = [];
    for(let i in cubeTimes) {
      if (cubeTimes.hasOwnProperty(i)) {
        let time = cubeTimes[i].getAttribute('time');
        arrayToSort.push(time);
      }
    }
    arrayToSort = arrayToSort.sort();

    let grafArr = [];
    let counter = 0;
    for(let i in cubeTimes) {
      if (cubeTimes.hasOwnProperty(i)) {
        let cubeTime = cubeTimes[i];
        //let time = cubeTime.getAttribute('time');
        let time = arrayToSort[counter];
        counter++;
        let innerCube = cubeTime.querySelectorAll('Cube');
        for(let j in innerCube) {
          if (innerCube.hasOwnProperty(j)) {
            let currRate = innerCube[j];
            if (currRate.getAttribute && currency === currRate.getAttribute('currency')) {
              let obj = {};
              obj.y = parseFloat(currRate.getAttribute('rate'));
              obj.x = new Date(time).getTime() / 1000;
              grafArr.push(obj);
            }
          }
        }
      }
    }
    return grafArr;
  }

  window.showGraph = function(e) {
    let selectedCurr;
    if (e.options === undefined) {
      selectedCurr = e;
    } else {
      selectedCurr = e.options[e.selectedIndex].innerHTML;
    }
    let graph = new Rickshaw.Graph( {
      element: document.getElementById('chart'),
      width: window.innerWidth / 2,
      height: 500,
      renderer: 'line',
      series: [
        {
          color: "#c05020",
          data: fetchGraphData(selectedCurr),
          name: selectedCurr
        }
      ]
    } );
    graph.render();

    let hoverDetail = new Rickshaw.Graph.HoverDetail({
      graph: graph
    });
    let legend = new Rickshaw.Graph.Legend({
      graph: graph,
      element: document.getElementById('legend')

    });
    let shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
      graph: graph,
      legend: legend
    });
    let axes = new Rickshaw.Graph.Axis.Time({
      graph: graph
    });
    axes.render();
  };
})();