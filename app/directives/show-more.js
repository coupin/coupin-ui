export class ShowMore {
  constructor($window) {
    'ngInject';
    this.restrict = 'A';
    this.$window = $window;
    this.scope = {
      showMore: '=showMore',
    };
  }

  link(scope, element) {
    element.addClass('shorten');
    element.css('cursor', 'pointer');

    if (scope.showMore === 'true') {
      element.on('click', (event) => {
        event.stopImmediatePropagation();
        element.toggleClass('shorten');
      });
    }
  }
}

