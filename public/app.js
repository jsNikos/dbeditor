var dbeditorApp = angular.module('dbeditorApp', [
    // 'ui.bootstrap',
    // 'ui.bootstrap.datetimepicker',
    'menuComponent'
    // 'dbEditorControllers'
  ])
  .config(function($locationProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  })
  .controller('appController', ['$scope', '$timeout', function($scope, $timeout) {
    $scope.handleTableSelect = function(managerClassName){
//TODO
    };
  }]);
