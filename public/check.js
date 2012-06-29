var FIELDS = ['street1', 'street2', 'city', 'state', 'zip'];

function getFormAddress() {
  var fieldValues = $.map(FIELDS, function(fieldName) {
    var fieldId = '#shipping_' + fieldName;
    return $(fieldId).val();
  });
  fieldValues.push($('#shipping_country_id option:selected').text());
  return fieldValues.join(', ');
}

function checkAddress() {
}

$(function() {
  $('#check').click(function(e) {
    e.preventDefault();
    console.log(getFormAddress());
  });


  $('#fill').click(function(e) {
    e.preventDefault();
    $.each(FIELDS, function(index, fieldName) {
      $('#shipping_' + fieldName).val('field ' + index);
    });
  });
});
