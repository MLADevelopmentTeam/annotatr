'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('shell.main', {
    url: '^/',
    template: '<main></main>'
  });
}
