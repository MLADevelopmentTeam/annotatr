'use strict';

import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';

import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
// import ngMessages from 'angular-messages';


import {
  routeConfig
} from './app.config';

import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import modal from '../components/modal/modal.service';
import main from './main/main.component';
import shell from './shell/shell.component';
import editor from './editor/editor.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../services/socket.service';

import './app.css';

var currentIdNum = 0;
angular.module('html5DragDrop', []);
angular.module('html5DragDrop').directive('html5Drag', ['$log', function($log) {
  return {
    restrict: 'A',
    scope: {
      dragData: '=',
      dragTemplate: '=',
      transferType: '=',
      transferData: '=',
      onDragStart: '&',
      onDrag: '&',
      onDragEnd: '&'
    },
    link(scope, element, attrs) {
      // Assign a unique id to the element if it has no id.
      if(!element.attr('id')) {
        element.attr('id', generateUniqueId());
      }

      // Ensure that the transferType and transferData are both set if either is set.
      if((scope.transferType && !scope.transferData) || (scope.transferData && !scope.transferType)) {
        $log.error('Transfer-type and transfer-data must both be provided. Ignoring both...');
        scope.transferType = 'text';
        scope.transferData = element.attr('id');
      }

      // Add attributes to the element to make it draggable.
      element.attr('draggable', true);

      element.on('dragstart', function(event) {
        var style = window.getComputedStyle(element[0], null);
        var data = {
          x: parseInt(style.getPropertyValue('left'), 10) - event.clientX,
          y: parseInt(style.getPropertyValue('top'), 10) - event.clientY,
          type: attrs.dragData,
          template: attrs.dragTemplate
        };
        scope.$parent.data = data;
        angular.element(document.getElementsByClassName('dragging')).removeClass('dragging');
        element.addClass('dragging');

        callDragFunction(event, scope, element, scope.onDragStart);
      });

      element.on('drag', function(event) {
        callDragFunction(event, scope, element, scope.onDrag);
      });

      element.on('dragend', function(event) {
        element.removeClass('dragging');

        callDragFunction(event, scope, element, scope.onDragEnd);
      });
    }
  };
}]);

function generateUniqueId() {
  if(!currentIdNum) {
    currentIdNum = 0;
  }

  currentIdNum += 1;
  return `draggable-id-${currentIdNum}`;
}

function callDragFunction(event, scope, element, func) {
  if(angular.isFunction(func)) {
    scope.$apply(() => {
      func({event, dragElement: element, data: element.data('dragData')});
    });
  }
}

function callDropFunction(event, scope, element, func) {
  event.preventDefault();

  if(angular.isFunction(func)) {
    var draggedNode = document.getElementsByClassName('dragging')[0];
    var draggedEl = angular.element(draggedNode);
    scope.$apply(() => {
      var data = (draggedEl.scope() || {}).data;
      func({event, dropZone: element, dragElement: draggedEl, data});
    });
  }
}

angular.module('html5DragDrop').directive('html5Drop', function() {
  return {
    restrict: 'A',
    scope: {
      onDragEnter: '&',
      onDragOver: '&',
      onDragLeave: '&',
      onDrop: '&'
    },
    link(scope, element, attrs) {
      element.on('dragenter', function(event) {
        callDropFunction(event, scope, element, scope.onDragEnter);
      });

      element.on('dragover', function(event) {
        callDropFunction(event, scope, element, scope.onDragOver);
      });

      element.on('dragleave', function(event) {
        callDropFunction(event, scope, element, scope.onDragLeave);
      });

      element.on('drop', function(event) {
        callDropFunction(event, scope, element, scope.onDrop);
      });
    }
  };
});

angular.module('annotatrApp', ['html5DragDrop', ngCookies, ngResource, ngSanitize, ngAnimate, uiRouter, uiBootstrap, navbar,
    footer, shell, main, modal, editor, constants, util, socket
  ])
  .directive('fileread', [() => {
    return {
      scope: {
        fileread: '&'
      },
      link: (scope, element, attributes) => {
        element.bind('change', changeEvent => {
          scope.$apply(() => {
            scope.fileread({file: changeEvent.target.files[0]});
          });
        });
      }
    };
  }])
  .config(routeConfig);

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['annotatrApp'], {
      strictDi: true
    });
  });
