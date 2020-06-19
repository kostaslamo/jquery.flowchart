/* global $ */
$(document).ready(function() {
  var $flowchart = $('#flowchartworkspace');
  var $container = $flowchart.parent();
  var inputIndex = 0;
  var outputIndex = 0;

  var cx = $flowchart.width() / 2;
  var cy = $flowchart.height() / 2;

  // Panzoom initialization...
  $flowchart.panzoom();

  // Centering panzoom
  $flowchart.panzoom('pan', -cx + $container.width() / 2, -cy + $container.height() / 2);

  // Panzoom zoom handling...
  var possibleZooms = [0.5, 0.75, 1, 2, 3];
  var currentZoom = 2;
  $container.on('mousewheel.focal', function(e) {
    e.preventDefault();
    var delta = e.delta || e.originalEvent.wheelDelta || e.originalEvent.detail;
    var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
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
  var operatorI = 0;
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
  $('#add-operator').click(function(ev) {
    ev.preventDefault();
    const newOperatorInput = $('#new-operator-input').val();
    const newOperatorOutput = $('#new-operator-output').val();
    const newOperatorName = $('#new-operator-name').val();
    console.log(`Input number: ${newOperatorInput}, output number: ${newOperatorOutput}, name: ${newOperatorName}`);
    const html = `\
  <div id="draggable-operator" class="draggable_operator" data-nb-inputs=${newOperatorInput} data-nb-outputs=${newOperatorOutput}>\
    ${newOperatorName}\
  </div>\
  `;
    $('#operators').append(html);
    // $("#draggable-operator").attr("data-nb-inputs", newOperatorInput);
    // $("#draggable-operator").attr("data-nb-outputs", newOperatorOutput);
    // $("div#draggable-operator").text(`${inputNumber} in & ${outputNumber} out`);
  });

  // On Key Change
  // $("#input-number").on("change paste keyup", (ev) => {
  // 	const inputNumber = $("#input-number").val();
  // 	$("#draggable-operator").attr("data-nb-inputs", inputNumber);
  // })
  // $("#output-number").on("change paste keyup", (ev) => {
  // 	const outputNumber = $("#output-number").val();
  // 	$("#draggable-operator").attr("data-nb-outputs", outputNumber);
  // })

  function getOperatorData($element) {
    var nbInputs = parseInt($element.data('nb-inputs'), 10);
    var nbOutputs = parseInt($element.data('nb-outputs'), 10);
    var data = {
      properties: {
        title: $element.text(),
        inputs: {},
        outputs: {},
      },
    };

    var i = 0;
    for (i = 0; i < nbInputs; i++) {
      data.properties.inputs['input_' + i] = {
        label: 'Input ' + (i + 1),
      };
    }
    for (i = 0; i < nbOutputs; i++) {
      data.properties.outputs['output_' + i] = {
        label: 'Output ' + (i + 1),
      };
    }

    return data;
  }

  //-----------------------------------------
  //--- operator and link properties
  //--- start
  var $operatorProperties = $('#operator_properties');
  $operatorProperties.hide();
  var $linkProperties = $('#link_properties');
  $linkProperties.hide();
  var $operatorTitle = $('#operator_title');
  var $linkColor = $('#link_color');

  $flowchart.flowchart({
    onOperatorSelect: function(operatorId) {
      $operatorProperties.show();
      $operatorTitle.val($flowchart.flowchart('getOperatorTitle', operatorId));
      return true;
    },
    onOperatorUnselect: function() {
      $operatorProperties.hide();
      return true;
    },
    onLinkSelect: function(linkId) {
      $linkProperties.show();
      $linkColor.val($flowchart.flowchart('getLinkMainColor', linkId));
      return true;
    },
    onLinkUnselect: function() {
      $linkProperties.hide();
      return true;
    },
  });

  $operatorTitle.keyup(function() {
    var selectedOperatorId = $flowchart.flowchart('getSelectedOperatorId');
    if (selectedOperatorId != null) {
      $flowchart.flowchart('setOperatorTitle', selectedOperatorId, $operatorTitle.val());
    }
  });

  $linkColor.change(function() {
    var selectedLinkId = $flowchart.flowchart('getSelectedLinkId');
    if (selectedLinkId != null) {
      $flowchart.flowchart('setLinkMainColor', selectedLinkId, $linkColor.val());
    }
  });
  //--- end
  //--- operator and link properties
  //-----------------------------------------

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
  //--- create operator button
  //--- start
  // var operatorI = 0;
  // $flowchart.parent().siblings('.create_operator').click(function () {
  // 	var operatorId = 'created_operator_' + operatorI;
  // 	var operatorData = {
  // 		top: ($flowchart.height() / 2) - 30,
  // 		left: ($flowchart.width() / 2) - 100 + (operatorI * 10),
  // 		properties: {
  // 			title: 'Operator ' + (operatorI + 3),
  // 			inputs: {
  // 				input_1: {
  // 					label: 'Input 1',
  // 				}
  // 			},
  // 			outputs: {
  // 				output_1: {
  // 					label: 'Output 1',
  // 				}
  // 			}
  // 		}
  // 	};
  // 	operatorI++;
  // 	$flowchart.flowchart('createOperator', operatorId, operatorData);
  // });
  //--- end
  //--- create operator button
  //-----------------------------------------

  //-----------------------------------------
  //--- draggable operators
  //--- start
  //var operatorId = 0;
  var $draggableOperators = $('.draggable_operator');
  $draggableOperators.draggable({
    cursor: 'move',
    opacity: 0.7,

    // helper: 'clone',
    appendTo: 'body',
    zIndex: 1000,

    helper: function(e) {
      var $this = $(this);
      var data = getOperatorData($this);
      return $flowchart.flowchart('getOperatorElement', data);
    },
    stop: function(e, ui) {
      var $this = $(this);
      var elOffset = ui.offset;
      var containerOffset = $container.offset();
      if (
        elOffset.left > containerOffset.left &&
        elOffset.top > containerOffset.top &&
        elOffset.left < containerOffset.left + $container.width() &&
        elOffset.top < containerOffset.top + $container.height()
      ) {
        var flowchartOffset = $flowchart.offset();

        var relativeLeft = elOffset.left - flowchartOffset.left;
        var relativeTop = elOffset.top - flowchartOffset.top;

        var positionRatio = $flowchart.flowchart('getPositionRatio');
        relativeLeft /= positionRatio;
        relativeTop /= positionRatio;

        var data = getOperatorData($this);
        data.left = relativeLeft;
        data.top = relativeTop;

        $flowchart.flowchart('addOperator', data);
      }
    },
  });
  //--- end
  //--- draggable operators
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

  /*global localStorage*/
  function SaveToLocalStorage() {
    if (typeof localStorage !== 'object') {
      alert('local storage not available');
      return;
    }
    Flow2Text();
    localStorage.setItem('stgLocalFlowChart', $('#flowchart_data').val());
  }
  $('#save_local').click(SaveToLocalStorage);

  function LoadFromLocalStorage() {
    if (typeof localStorage !== 'object') {
      alert('local storage not available');
      return;
    }
    var s = localStorage.getItem('stgLocalFlowChart');
    if (s != null) {
      $('#flowchart_data').val(s);
      Text2Flow();
    } else {
      alert('local storage empty');
    }
  }
  $('#load_local').click(LoadFromLocalStorage);
  //--- end
  //--- save and load
  //-----------------------------------------
});

var defaultFlowchartData = {
  // operators: {
  // 	operator1: {
  // 		top: 20,
  // 		left: 20,
  // 		properties: {
  // 			title: 'Operator 1',
  // 			inputs: {},
  // 			outputs: {
  // 				output_1: {
  // 					label: 'Output 1',
  // 				}
  // 			}
  // 		}
  // 	},
  // 	operator2: {
  // 		top: 80,
  // 		left: 300,
  // 		properties: {
  // 			title: 'Operator 2',
  // 			inputs: {
  // 				input_1: {
  // 					label: 'Input 1',
  // 				},
  // 				input_2: {
  // 					label: 'Input 2',
  // 				},
  // 			},
  // 			outputs: {}
  // 		}
  // 	},
  // },
  // links: {
  // 	link_1: {
  // 		fromOperator: 'operator1',
  // 		fromConnector: 'output_1',
  // 		toOperator: 'operator2',
  // 		toConnector: 'input_2',
  // 	},
  // }
};

if (false) console.log('remove lint unused warning', defaultFlowchartData);
