$(document).ready(function() {
  const $flowchart = $('#flowchartworkspace');
  const $container = $flowchart.parent();
  const cx = $flowchart.width() / 2;
  const cy = $flowchart.height() / 2;
  let inputIndex = 0;
  let outputIndex = 0;

  // Panzoom initialization...
  $flowchart.panzoom();

  // Centering panzoom
  $flowchart.panzoom('pan', -cx + $container.width() / 2, -cy + $container.height() / 2);

  // Panzoom zoom handling...
  const possibleZooms = [0.5, 0.75, 1, 2, 3];
  let currentZoom = 2;
  $container.on('mousewheel.focal', function(e) {
    e.preventDefault();
    const delta = e.delta || e.originalEvent.wheelDelta || e.originalEvent.detail;
    const zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
    currentZoom = Math.max(0, Math.min(possibleZooms.length - 1, currentZoom + (zoomOut * 2 - 1)));
    $flowchart.flowchart('setPositionRatio', possibleZooms[currentZoom]);
    $flowchart.panzoom('zoom', possibleZooms[currentZoom], {
      animate: false,
      focal: e,
    });
  });

  // Apply the plugin on a standard, empty div...
  $flowchart.flowchart({
    data: defaultFlowchartData,
    defaultSelectedLinkColor: '#000055',
    grid: 10,
    multipleLinksOnInput: true,
    multipleLinksOnOutput: true,
    // verticalConnection: true,
  });

  // Click Handlers
  let operatorI = 0;
  $('#add-new-operator').click(ev => {
    const operatorId = 'created_operator_' + operatorI;
    const operatorTitle = $('#operator-name').val();
    const inputNames = $('input[name^=inputs]')
      .map((idx, elem) => {
        return $(elem).val();
      })
      .get();
    const outputNames = $('input[name^=outputs]')
      .map((idx, elem) => {
        return $(elem).val();
      })
      .get();

    const inputs = inputNames.reduce((acc, cur, index) => {
      const inputProp = `input_${index}`;
      return Object.assign(acc, {
        [inputProp]: {
          label: cur,
        },
      });
    }, {});

    const outputs = outputNames.reduce((acc, cur, index) => {
      const outputProp = `output_${index}`;
      return Object.assign(acc, {
        [outputProp]: {
          label: cur,
        },
      });
    }, {});

    const properties = {
      title: operatorTitle,
      inputs,
      outputs,
    };

    const operatorData = {
      top: $flowchart.height() / 2 - 30,
      left: $flowchart.width() / 2 - 100 + operatorI * 10,
      properties,
    };

    operatorI++;
    $flowchart.flowchart('createOperator', operatorId, operatorData);
    $('#operator-outputs-fields').empty();
    $('#operator-inputs-fields').empty();
    $('#operator-name').val('');
  });

  $('#add-new-input').click(ev => {
    ev.preventDefault();
    inputIndex++;
    const html = `\
  <input id="input-${inputIndex}" class="custom-input-field new-operator-input" type="text" name="inputs[]" placeholder="Input Name">\
  `;
    $('#operator-inputs-fields').append(html);
  });

  $('#add-new-output').click(ev => {
    ev.preventDefault();
    outputIndex++;
    const html = `\
  <input id="output-${outputIndex}" class="custom-input-field new-operator-output" type="text" name="outputs[]" placeholder="Output Name">\
  `;
    $('#operator-outputs-fields').append(html);
  });

  //-----------------------------------------
  //--- delete operator / link button
  //--- start
  $flowchart
    .parent()
    .siblings('.delete_selected_button')
    .click(function() {
      $flowchart.flowchart('deleteSelected');
    });
  //--- end
  //--- delete operator / link button
  //-----------------------------------------

  //-----------------------------------------
  //--- save and load
  //--- start
  function Flow2Text() {
    var data = $flowchart.flowchart('getData');
    $('#flowchart_data').val(JSON.stringify(data, null, 2));
  }
  $('#get_data').click(Flow2Text);

  function Text2Flow() {
    var data = JSON.parse($('#flowchart_data').val());
    $flowchart.flowchart('setData', data);
  }
  $('#set_data').click(Text2Flow);

  //--- end
  //--- save and load
  //-----------------------------------------
});

const defaultFlowchartData = {};
if (false) console.log('remove lint unused warning', defaultFlowchartData);
