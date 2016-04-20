angular.module('serverErrorComponent', ['ui.bootstrap'])
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push(function($q, $rootScope) {
      return {
        'responseError': function(rejection) {
          $rootScope.$emit('server-error', rejection);
          return $q.reject(rejection);
        }
      };
    });
  }])
  .component('servererror', {
    controller: function($rootScope, $uibModal, $location, editorService) {
      $rootScope.$on('server-error', function(event, rejection) {
        if (rejection.status === 401) {
          handleNotAuthenticated();
        } else if (rejection.status === 403) {
          handleNotAuthorized();
        } else {
          handleInternalError();
        }
      });

      function handleNotAuthenticated() {
        showPopup({
            title: 'Your are not logged in',
            msg: 'Please press OK to log in.'
          })
          .then(function() {
            document.location.replace('/ws/dbeditor/login/?' + jQuery.param({
              targetURI: $location.url()
            }));
          });
      }

      function handleInternalError() {
        showPopup({
          title: 'Internal Error',
          msg: 'Sorry, something went wrong.'
        });
      }

      function handleNotAuthorized() {
        showPopup({
          title: 'Not Authorized',
          msg: 'You have no permissions to see these data.'
        });
      }

      function showPopup(model) {
        editorService.hideLoading();
        return $uibModal
          .open({
            animation: true,
            templateUrl: 'servererror/errorPopup.html',
            controller: 'ErrorPopupController',
            size: 'sm',
            resolve: {
              model: function() {
                return model;
              }
            }
          })
          .result;
      }
    }
  })
  .controller('ErrorPopupController', function($scope, $uibModalInstance, model) {
    $scope.model = model;

    $scope.handleOk = function() {
      $uibModalInstance.close();
    };

  });
