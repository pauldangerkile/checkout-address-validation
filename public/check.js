var FIELDS = ['street1', 'street2', 'city', 'state', 'zip'],
    GOOGLE_MAP, MAP_MARKER;

function getFormAddress() {
  var fieldValues = $.map(FIELDS, function(fieldName) {
    var fieldId = '#shipping_' + fieldName;
    return $(fieldId).val();
  });
  fieldValues.push($('#shipping_country_id option:selected').text());
  return fieldValues.join(', ');
}

function showMap(location, showPin) {
  if (!GOOGLE_MAP) {
    var mapOptions = {
      center: location,
      zoom: 16,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    GOOGLE_MAP = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  } else {
    GOOGLE_MAP.panTo(location);
  }
  if (MAP_MARKER) {
    MAP_MARKER.setVisible(false);
  }
  if (showPin) {
    if (!MAP_MARKER) {
      MAP_MARKER = new google.maps.Marker({
        map: GOOGLE_MAP,
        position: location
      });
    } else {
      MAP_MARKER.setPosition(location);
      MAP_MARKER.setVisible(true);
    }
  }
  $('#map-canvas').show();
}

function onChangeRemoveQtipHandler(e) {
  $(e.currentTarget)
    .unbind('change', onChangeRemoveQtipHandler)
    .qtip('destroy');
}

function setErrorMessage($input, message) {
  $input
    .qtip('destroy')
    .qtip({
      content: { text: message },
      position: { my: 'bottom center', at: 'top center' },
      show: {
        event: 'focus',
        solo: true
      },  
      hide: { event: 'blur' },
      style: {
        classes: 'ui-tooltip-shadow'
      }   
    })  
    .bind('change', onChangeRemoveQtipHandler)
    .parent().addClass('invalid');
}

function clearErrorMessage($input) {
  $input
    .qtip('destroy')
    .unbind('change', onChangeRemoveQtipHandler)
    .parent().removeClass('invalid');
}

function setCorrectionTip(field, correction) {
  var $tip = $('<span>Did you mean <a href="#">' + correction + '</a>?</span>');
  $tip.click(function(e) {
    e.preventDefault();
    clearErrorMessage(field);
    field.val(correction);
  });
  setErrorMessage(field, $tip);
}

function setMapErrorMessage(text) {
  if (text) {
    $('#messages').text(text).show();
  } else {
    $('#messages').hide();
  }
}

function processResult(result) {
  $.each(FIELDS, function() {
    clearErrorMessage($('#shipping_' + this));
  });

  $.each(result.address_components, function() {
    var component = this;
    $.each(component.types, function() {
      var type = this;
      if (type == 'locality' && $('#shipping_city').val() != component.long_name) {
        setCorrectionTip($('#shipping_city'), component.short_name);
      }
      if (type == 'administrative_area_level_1' && $.inArray($('#shipping_state').val(), [component.short_name, component.long_name]) == -1) {
        setCorrectionTip($('#shipping_state'), component.short_name);
      }
      if (type == 'postal_code' && $('#shipping_zip').val() != component.short_name) {
        setCorrectionTip($('#shipping_zip'), component.short_name);
      }
      if (type == 'country' && $('#shipping_country_id option:selected').text() != component.long_name) {
        // We need ISO codes for country options
      }
    });
  });
  var validTypes = $.grep(result.types, function(type) { return (type == 'street_address' || type == 'subpremise') });
  if (!result || (validTypes.length == 0)) {
    setMapErrorMessage('Please double check your address.');
    showMap(result.geometry.location, false);
  } else {
    setMapErrorMessage();
    showMap(result.geometry.location, true);
  }
}

function checkAddress(address) {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ 'address': address }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      processResult(results[0]);
    } else if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
      setMapErrorMessage('Please double check your address.');
      $('#map-canvas').hide();
    } else {
      console.log('error', status, results);
      $('#map-canvas').hide();
    }
  });
}

$(function() {
  $('.field-with-placeholder label').inFieldLabels();

  $('#check').click(function(e) {
    e.preventDefault();
    checkAddress(getFormAddress());
  });

  $('#fill').click(function(e) {
    var address = ['180 Flinders St', '', 'Melborne', 'VIC', '3000'];
    e.preventDefault();
    $.each(FIELDS, function(index, fieldName) {
      $('#shipping_' + fieldName).val(address[index]);
    });
  });
});
