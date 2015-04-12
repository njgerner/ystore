$('.row[data-match-height]').each(function(){
  var self = $(this);
  self.find('.panel').height(self.height());
  $(window).on('resize', function(event) {
    var row_width = self.width();
    var panels = self.find('.panel');
    // Reset height of the panels
    console.log('in panel heights');
    panels.height('');
    var h = self.height();
    panels.each(function() {
      var panel = $(this);
      if ((row_width - panel.width()) > 40) {
        panel.height(h);
      }
    });
  });
});